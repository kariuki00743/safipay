const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')
const {
  notifyTransactionCreated,
  notifyPaymentReceived,
  notifyFundsReleased,
  notifyDisputeRaised,
  notifyRefundProcessed
} = require('./services/emailService')

const app = express()
app.use(cors())
app.use(express.json())

// Validate required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_KEY',
  'MPESA_CONSUMER_KEY',
  'MPESA_CONSUMER_SECRET',
  'MPESA_SHORTCODE',
  'MPESA_PASSKEY',
  'MPESA_CALLBACK_URL'
]

const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '))
  process.exit(1)
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Generate M-Pesa access token
const getAccessToken = async () => {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64')

  const res = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  )
  return res.data.access_token
}

// Middleware to verify Supabase JWT
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ success: false, error: 'No authorization token provided' })
    }

    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token' })
    }

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ success: false, error: 'Authentication failed' })
  }
}

// Validate phone number format
const validatePhone = (phone) => {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Check if it matches Kenyan format
  const kenyaRegex = /^(?:254|\+254|0)?([17]\d{8})$/
  const match = cleaned.match(kenyaRegex)
  
  if (!match) {
    throw new Error('Invalid Kenyan phone number. Use format: 0712345678 or 254712345678')
  }
  
  return `254${match[1]}`
}

// STK Push
app.post('/api/stkpush', verifyAuth, async (req, res) => {
  try {
    const { phone, amount, description, transactionId } = req.body

    // Validate inputs
    if (!phone || !amount || !transactionId) {
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }

    if (amount < 1) {
      return res.status(400).json({ success: false, error: 'Amount must be at least KES 1' })
    }

    // Verify transaction belongs to user and is in correct state
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', req.user.id)
      .single()

    if (txError || !transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    if (transaction.status !== 'held') {
      return res.status(400).json({ success: false, error: 'Transaction is not in held status' })
    }

    // Validate and format phone
    const formattedPhone = validatePhone(phone)

    const token = await getAccessToken()
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    const payload = {
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: `SafiPay-${transactionId}`,
      TransactionDesc: description
    }

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    // Only store the checkout ID, don't mark as paid yet (wait for callback)
    await supabase
      .from('transactions')
      .update({
        status: 'pending_payment',
        mpesa_code: response.data.CheckoutRequestID
      })
      .eq('id', transactionId)

    res.json({ success: true, data: response.data })
  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message)
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Payment request failed. Please try again.' 
    })
  }
})

// M-Pesa callback from Safaricom
app.post('/api/callback', async (req, res) => {
  try {
    const body = req.body
    const result = body.Body?.stkCallback

    if (!result) {
      console.warn('Invalid callback format:', body)
      return res.json({ ResultCode: 0, ResultDesc: 'Success' })
    }

    const checkoutId = result.CheckoutRequestID

    if (result.ResultCode === 0) {
      // Payment successful
      const items = result.CallbackMetadata?.Item || []
      const get = (name) => items.find(i => i.Name === name)?.Value

      const receipt = get('MpesaReceiptNumber')
      const phone = get('PhoneNumber')
      const amount = get('Amount')

      // Update transaction with receipt and mark as paid
      const { data: transaction, error } = await supabase
        .from('transactions')
        .update({
          status: 'paid',
          mpesa_receipt: receipt,
          paid_at: new Date().toISOString()
        })
        .eq('mpesa_code', checkoutId)
        .select()
        .single()

      if (error) {
        console.error('Failed to update transaction:', error)
      } else {
        console.log(`✅ Payment confirmed: ${receipt} for KES ${amount} from ${phone}`)
        
        // Send email notifications
        try {
          await notifyPaymentReceived(transaction)
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError)
        }
      }
    } else {
      // Payment failed or cancelled
      const errorMessage = result.ResultDesc || 'Payment failed'
      
      await supabase
        .from('transactions')
        .update({
          status: 'held', // Revert to held so user can retry
          payment_error: errorMessage
        })
        .eq('mpesa_code', checkoutId)

      console.log(`❌ Payment failed for ${checkoutId}: ${errorMessage}`)
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (err) {
    console.error('Callback error:', err.message)
    res.json({ ResultCode: 0, ResultDesc: 'Success' })
  }
})

// Release funds — mark as complete
app.post('/api/release', verifyAuth, async (req, res) => {
  try {
    const { transactionId } = req.body

    if (!transactionId) {
      return res.status(400).json({ success: false, error: 'Transaction ID is required' })
    }

    // Verify transaction belongs to user and is paid
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', req.user.id)
      .single()

    if (txError || !transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    if (transaction.status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        error: 'Can only release funds from paid transactions' 
      })
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'complete',
        completed_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    
    console.log(`✅ Funds released for transaction ${transactionId}`)
    
    // Send email notifications
    try {
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()
      
      if (transaction) {
        await notifyFundsReleased(transaction)
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('Release error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Raise dispute
app.post('/api/dispute', verifyAuth, async (req, res) => {
  try {
    const { transactionId, reason } = req.body

    if (!transactionId || !reason) {
      return res.status(400).json({ success: false, error: 'Transaction ID and reason are required' })
    }

    if (reason.trim().length < 10) {
      return res.status(400).json({ success: false, error: 'Dispute reason must be at least 10 characters' })
    }

    // Verify transaction belongs to user and is in valid state
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', req.user.id)
      .single()

    if (txError || !transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    if (transaction.status === 'complete' || transaction.status === 'disputed') {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot dispute ${transaction.status} transactions` 
      })
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'disputed',
        disputed_at: new Date().toISOString(),
        dispute_reason: reason
      })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    
    console.log(`⚠️ Dispute raised for transaction ${transactionId}`)
    
    // Send email notifications
    try {
      const { data: transaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()
      
      if (transaction) {
        await notifyDisputeRaised(transaction)
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }
    
    res.json({ success: true })
  } catch (err) {
    console.error('Dispute error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Refund transaction (admin or after dispute resolution)
app.post('/api/refund', verifyAuth, async (req, res) => {
  try {
    const { transactionId } = req.body

    if (!transactionId) {
      return res.status(400).json({ success: false, error: 'Transaction ID is required' })
    }

    // Verify transaction belongs to user
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', req.user.id)
      .single()

    if (txError || !transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    // Can only refund paid or disputed transactions
    if (transaction.status !== 'paid' && transaction.status !== 'disputed') {
      return res.status(400).json({ 
        success: false, 
        error: 'Can only refund paid or disputed transactions' 
      })
    }

    // Update transaction status to refunded
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'refunded',
        refunded_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (error) throw error
    
    console.log(`💰 Refund processed for transaction ${transactionId}`)
    
    // Send email notifications
    try {
      const { data: updatedTransaction } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .single()
      
      if (updatedTransaction) {
        await notifyRefundProcessed(updatedTransaction)
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }
    
    res.json({ success: true, message: 'Refund processed successfully' })
  } catch (err) {
    console.error('Refund error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Health check
app.get('/', (req, res) => res.json({ status: 'SafiPay backend running ✅' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))