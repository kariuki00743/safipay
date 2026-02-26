// Email notification service
// Using a simple email template system

const sendEmail = async (to, subject, htmlContent) => {
  // In production, integrate with services like:
  // - SendGrid
  // - AWS SES
  // - Resend
  // - Mailgun
  
  // For now, we'll log emails (you can integrate your preferred service)
  console.log('\n📧 EMAIL NOTIFICATION')
  console.log('To:', to)
  console.log('Subject:', subject)
  console.log('Content:', htmlContent)
  console.log('---\n')
  
  // TODO: Replace with actual email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail')
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
  // await sgMail.send({ to, from: 'noreply@safipay.com', subject, html: htmlContent })
  
  return { success: true }
}

const emailTemplates = {
  transactionCreated: (transaction) => ({
    subject: `SafiPay: New Escrow Transaction - KES ${Number(transaction.amount).toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: #090e0a; color: #e8f5ec; padding: 30px; border-radius: 10px;">
          <h1 style="color: #00c566; margin: 0 0 20px 0;">SafiPay Escrow</h1>
          <h2 style="margin: 0 0 20px 0;">New Transaction Created</h2>
          
          <div style="background: #152019; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b9178;">Transaction Details:</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${Number(transaction.amount).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Buyer:</strong> ${transaction.buyer_email}</p>
            <p style="margin: 5px 0;"><strong>Seller:</strong> ${transaction.seller_email}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> In Escrow</p>
          </div>
          
          <p style="color: #6b9178; margin: 20px 0;">The funds are now held securely in escrow. The buyer can proceed with payment via M-Pesa.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background: #00c566; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Transaction
          </a>
        </div>
      </div>
    `
  }),

  paymentReceived: (transaction) => ({
    subject: `SafiPay: Payment Received - KES ${Number(transaction.amount).toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: #090e0a; color: #e8f5ec; padding: 30px; border-radius: 10px;">
          <h1 style="color: #00c566; margin: 0 0 20px 0;">SafiPay Escrow</h1>
          <h2 style="margin: 0 0 20px 0;">💳 Payment Received!</h2>
          
          <div style="background: #152019; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b9178;">Transaction Details:</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${Number(transaction.amount).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>M-Pesa Receipt:</strong> ${transaction.mpesa_receipt}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Paid</p>
          </div>
          
          <p style="color: #6b9178; margin: 20px 0;">The payment has been confirmed and funds are held securely. The buyer can release funds once satisfied with the goods/services.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background: #00c566; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Transaction
          </a>
        </div>
      </div>
    `
  }),

  fundsReleased: (transaction) => ({
    subject: `SafiPay: Funds Released - KES ${Number(transaction.amount).toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: #090e0a; color: #e8f5ec; padding: 30px; border-radius: 10px;">
          <h1 style="color: #00c566; margin: 0 0 20px 0;">SafiPay Escrow</h1>
          <h2 style="margin: 0 0 20px 0;">✅ Funds Released!</h2>
          
          <div style="background: #152019; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b9178;">Transaction Details:</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${Number(transaction.amount).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Complete</p>
          </div>
          
          <p style="color: #6b9178; margin: 20px 0;">The transaction has been completed successfully. Funds have been released to the seller.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background: #00c566; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Transaction
          </a>
        </div>
      </div>
    `
  }),

  disputeRaised: (transaction) => ({
    subject: `SafiPay: Dispute Raised - Action Required`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: #090e0a; color: #e8f5ec; padding: 30px; border-radius: 10px;">
          <h1 style="color: #00c566; margin: 0 0 20px 0;">SafiPay Escrow</h1>
          <h2 style="margin: 0 0 20px 0;">⚠️ Dispute Raised</h2>
          
          <div style="background: #152019; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b9178;">Transaction Details:</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${Number(transaction.amount).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Reason:</strong> ${transaction.dispute_reason}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Under Review</p>
          </div>
          
          <p style="color: #6b9178; margin: 20px 0;">A dispute has been raised for this transaction. Our team will review and respond within 48 hours.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background: #00c566; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Transaction
          </a>
        </div>
      </div>
    `
  }),

  refundProcessed: (transaction) => ({
    subject: `SafiPay: Refund Processed - KES ${Number(transaction.amount).toLocaleString()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f5f5f5; padding: 20px;">
        <div style="background: #090e0a; color: #e8f5ec; padding: 30px; border-radius: 10px;">
          <h1 style="color: #00c566; margin: 0 0 20px 0;">SafiPay Escrow</h1>
          <h2 style="margin: 0 0 20px 0;">💰 Refund Processed</h2>
          
          <div style="background: #152019; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #6b9178;">Transaction Details:</p>
            <p style="margin: 5px 0;"><strong>Description:</strong> ${transaction.description}</p>
            <p style="margin: 5px 0;"><strong>Amount:</strong> KES ${Number(transaction.amount).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> Refunded</p>
          </div>
          
          <p style="color: #6b9178; margin: 20px 0;">Your refund has been processed. The funds will be returned to the buyer's M-Pesa account.</p>
          
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="display: inline-block; background: #00c566; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0;">
            View Transaction
          </a>
        </div>
      </div>
    `
  })
}

const notifyTransactionCreated = async (transaction) => {
  const template = emailTemplates.transactionCreated(transaction)
  await sendEmail(transaction.buyer_email, template.subject, template.html)
  await sendEmail(transaction.seller_email, template.subject, template.html)
}

const notifyPaymentReceived = async (transaction) => {
  const template = emailTemplates.paymentReceived(transaction)
  await sendEmail(transaction.buyer_email, template.subject, template.html)
  await sendEmail(transaction.seller_email, template.subject, template.html)
}

const notifyFundsReleased = async (transaction) => {
  const template = emailTemplates.fundsReleased(transaction)
  await sendEmail(transaction.buyer_email, template.subject, template.html)
  await sendEmail(transaction.seller_email, template.subject, template.html)
}

const notifyDisputeRaised = async (transaction) => {
  const template = emailTemplates.disputeRaised(transaction)
  await sendEmail(transaction.buyer_email, template.subject, template.html)
  await sendEmail(transaction.seller_email, template.subject, template.html)
}

const notifyRefundProcessed = async (transaction) => {
  const template = emailTemplates.refundProcessed(transaction)
  await sendEmail(transaction.buyer_email, template.subject, template.html)
}

module.exports = {
  notifyTransactionCreated,
  notifyPaymentReceived,
  notifyFundsReleased,
  notifyDisputeRaised,
  notifyRefundProcessed
}
