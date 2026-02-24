const express = require('express')
const cors = require('cors')
const axios = require('axios')
require('dotenv').config()

const app = express()
app.use(cors())
app.use(express.json())

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

// STK Push endpoint
app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount, description, transactionId } = req.body

    const token = await getAccessToken()

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)
    const password = Buffer.from(
      `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString('base64')

    // Format phone: 0712345678 → 254712345678
    const formattedPhone = phone.startsWith('0')
      ? `254${phone.slice(1)}`
      : phone

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

    res.json({ success: true, data: response.data })
  } catch (err) {
    console.error(err.response?.data || err.message)
    res.status(500).json({ success: false, error: err.response?.data || err.message })
  }
})

// M-Pesa callback
app.post('/api/callback', (req, res) => {
  const body = req.body
  console.log('M-Pesa Callback:', JSON.stringify(body, null, 2))
  res.json({ ResultCode: 0, ResultDesc: 'Success' })
})

// Health check
app.get('/', (req, res) => res.json({ status: 'SafiPay backend running ✅' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))