const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
app.use(express.json())

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

// STK Push
app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount, description, transactionId } = req.body
    const token = await getAccessToken()

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    const formattedPhone = phone.startsWith('0') ? `254${phone.slice(1)}` : phone

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

    // Update transaction status to 'paid' in Supabase
    await supabase
      .from('transactions')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        mpesa_code: response.data.CheckoutRequestID
      })
      .eq('id', transactionId)

    res.json({ success: true, data: response.data })
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).json({ success: false, error: err.response?.data || err.message })
  }
})

// M-Pesa callback from Safaricom
app.post('/api/callback', async (req, res) => {
  try {
    const body = req.body
    const result = body.Body?.stkCallback

    if (result?.ResultCode === 0) {
      const items = result.CallbackMetadata?.Item || []
      const get = (name) => items.find(i => i.Name === name)?.Value

      const receipt = get('MpesaReceiptNumber')
      const phone = get('PhoneNumber')
      const amount = get('Amount')
      const checkoutId = result.CheckoutRequestID

      // Update transaction with receipt
      await supabase
        .from('transactions')
        .update({
          status: 'paid',
          mpesa_receipt: receipt,
          paid_at: new Date().toISOString()
        })
        .eq('mpesa_code', checkoutId)

      console.log(`✅ Payment confirmed: ${receipt} for KES ${amount} from ${phone}`)
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' })
  } catch (err) {
    console.error('Callback error:', err.message)
    res.json({ ResultCode: 0, ResultDesc: 'Success' })
  }
})

// Release funds — mark as complete
app.post('/api/release', async (req, res) => {
  try {
    const { transactionId } = req.body
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'complete',
        completed_at: new Date().toISOString()
      })
      .eq('id', transactionId)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Raise dispute
app.post('/api/dispute', async (req, res) => {
  try {
    const { transactionId, reason } = req.body
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'disputed',
        disputed_at: new Date().toISOString(),
        dispute_reason: reason
      })
      .eq('id', transactionId)

    if (error) throw error
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// Health check
app.get('/', (req, res) => res.json({ status: 'SafiPay backend running ✅' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))