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
  try {
    const auth = Buffer.from(
      `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64')

    console.log('🔑 Requesting M-Pesa access token...')
    const res = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      { headers: { Authorization: `Basic ${auth}` } }
    )
    console.log('✅ Access token received')
    return res.data.access_token
  } catch (error) {
    console.error('❌ Failed to get M-Pesa access token:', error.response?.data || error.message)
    throw new Error('Failed to authenticate with M-Pesa: ' + (error.response?.data?.errorMessage || error.message))
  }
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

    console.log('📲 STK Push request received:', { phone, amount, transactionId })

    // Validate inputs
    if (!phone || !amount || !transactionId) {
      console.log('❌ Missing required fields')
      return res.status(400).json({ success: false, error: 'Missing required fields' })
    }

    if (amount < 1) {
      console.log('❌ Invalid amount:', amount)
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
      console.log('❌ Transaction not found:', txError)
      return res.status(404).json({ success: false, error: 'Transaction not found' })
    }

    if (transaction.status !== 'held') {
      console.log('❌ Invalid transaction status:', transaction.status)
      return res.status(400).json({ success: false, error: 'Transaction is not in held status' })
    }

    // Validate and format phone
    console.log('📱 Validating phone number:', phone)
    const formattedPhone = validatePhone(phone)
    console.log('✅ Phone validated:', formattedPhone)

    console.log('🔑 Getting M-Pesa access token...')
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

    console.log('📤 Sending STK push to M-Pesa...')
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    console.log('✅ M-Pesa response:', response.data)

    // Only store the checkout ID, don't mark as paid yet (wait for callback)
    await supabase
      .from('transactions')
      .update({
        status: 'pending_payment',
        mpesa_code: response.data.CheckoutRequestID
      })
      .eq('id', transactionId)

    console.log('✅ Transaction updated to pending_payment')
    res.json({ success: true, data: response.data })
  } catch (err) {
    console.error('❌ STK Push error:', err.response?.data || err.message)
    console.error('Full error:', err)
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Payment request failed. Please try again.',
      details: err.response?.data || null
    })
  }
})

// M-Pesa callback from Safaricom
app.post('/api/callback', async (req, res) => {
  try {
    const body = req.body
    const result = body.Body?.stkCallback

    console.log('📞 M-Pesa callback received:', JSON.stringify(body, null, 2))

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
          paid_at: new Date().toISOString(),
          payment_error: null
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
      const errorMessage = result.ResultDesc || 'Payment failed or cancelled by user'
      
      console.log(`❌ Payment failed/cancelled for ${checkoutId}: ${errorMessage}`)
      
      await supabase
        .from('transactions')
        .update({
          status: 'held', // Revert to held so user can retry
          payment_error: errorMessage,
          mpesa_code: null // Clear the checkout ID so they can try again
        })
        .eq('mpesa_code', checkoutId)

      console.log(`🔄 Transaction reverted to 'held' status for retry`)
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

// Raise dispute with enhanced evidence
app.post('/api/dispute', verifyAuth, async (req, res) => {
  try {
    const { transactionId, reason, itemDescription, evidenceImages } = req.body

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

    // Create dispute record with evidence
    const { error: disputeError } = await supabase
      .from('disputes')
      .insert({
        transaction_id: transactionId,
        raised_by: req.user.email,
        reason: reason,
        item_description: itemDescription || null,
        evidence_images: evidenceImages || [],
        status: 'pending'
      })

    if (disputeError) {
      console.error('Error creating dispute:', disputeError)
      throw disputeError
    }

    // Update transaction status
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
    
    console.log(`⚠️ Dispute raised for transaction ${transactionId} with ${evidenceImages?.length || 0} evidence images`)
    
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

// Manual payment confirmation (fallback if callback doesn't arrive)
app.post('/api/confirm-payment', verifyAuth, async (req, res) => {
  try {
    const { transactionId, mpesaReceipt } = req.body

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

    // Can only confirm pending_payment transactions
    if (transaction.status !== 'pending_payment') {
      return res.status(400).json({ 
        success: false, 
        error: 'Can only confirm pending payments' 
      })
    }

    // Update transaction to paid
    const { data: updatedTransaction, error } = await supabase
      .from('transactions')
      .update({
        status: 'paid',
        mpesa_receipt: mpesaReceipt || 'MANUAL_CONFIRMATION',
        paid_at: new Date().toISOString(),
        payment_error: null
      })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) throw error
    
    console.log(`✅ Payment manually confirmed for transaction ${transactionId}`)
    
    // Send email notifications
    try {
      await notifyPaymentReceived(updatedTransaction)
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError)
    }
    
    res.json({ success: true, message: 'Payment confirmed successfully' })
  } catch (err) {
    console.error('Confirm payment error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Cancel pending payment
app.post('/api/cancel-payment', verifyAuth, async (req, res) => {
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

    // Can only cancel pending_payment transactions
    if (transaction.status !== 'pending_payment') {
      return res.status(400).json({ 
        success: false, 
        error: 'Can only cancel pending payments' 
      })
    }

    // Revert to held status
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'held',
        mpesa_code: null,
        payment_error: 'Payment cancelled by user'
      })
      .eq('id', transactionId)

    if (error) throw error
    
    console.log(`🔄 Payment cancelled for transaction ${transactionId}`)
    
    res.json({ success: true, message: 'Payment cancelled successfully' })
  } catch (err) {
    console.error('Cancel payment error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Health check
app.get('/', (req, res) => res.json({ status: 'SafiPay backend running ✅' }))

// Test endpoint to verify M-Pesa credentials
app.get('/api/test-mpesa', async (req, res) => {
  try {
    console.log('🧪 Testing M-Pesa connection...')
    const token = await getAccessToken()
    res.json({ 
      success: true, 
      message: 'M-Pesa credentials are valid ✅',
      tokenReceived: !!token 
    })
  } catch (error) {
    console.error('❌ M-Pesa test failed:', error.message)
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.response?.data || null
    })
  }
})

const PORT = process.env.PORT || 3001

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SafiPay Backend API',
    timestamp: new Date().toISOString()
  })
})

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    environment: {
      supabase: !!process.env.SUPABASE_URL,
      mpesa: !!process.env.MPESA_CONSUMER_KEY
    }
  })
})

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`)
  console.log(`🔗 Backend URL: ${process.env.MPESA_CALLBACK_URL?.replace('/api/callback', '') || 'http://localhost:' + PORT}`)
})