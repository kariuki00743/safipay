export default function TransactionTimeline({ transaction }) {
  const events = []

  // Created
  if (transaction.created_at) {
    events.push({
      date: transaction.created_at,
      title: 'Transaction Created',
      description: 'Escrow transaction initiated',
      icon: '📋',
      color: '#ffc107'
    })
  }

  // Payment pending
  if (transaction.mpesa_code && transaction.status === 'pending_payment') {
    events.push({
      date: transaction.created_at,
      title: 'Payment Requested',
      description: 'STK push sent to buyer',
      icon: '📲',
      color: '#ff9800'
    })
  }

  // Paid
  if (transaction.paid_at) {
    events.push({
      date: transaction.paid_at,
      title: 'Payment Received',
      description: `M-Pesa Receipt: ${transaction.mpesa_receipt}`,
      icon: '💳',
      color: '#0096ff'
    })
  }

  // Disputed
  if (transaction.disputed_at) {
    events.push({
      date: transaction.disputed_at,
      title: 'Dispute Raised',
      description: transaction.dispute_reason,
      icon: '⚠️',
      color: '#e0132e'
    })
  }

  // Refunded
  if (transaction.refunded_at) {
    events.push({
      date: transaction.refunded_at,
      title: 'Refund Processed',
      description: 'Funds returned to buyer',
      icon: '💰',
      color: '#ff9800'
    })
  }

  // Completed
  if (transaction.completed_at) {
    events.push({
      date: transaction.completed_at,
      title: 'Transaction Complete',
      description: 'Funds released to seller',
      icon: '✅',
      color: '#00c566'
    })
  }

  // Sort by date
  events.sort((a, b) => new Date(a.date) - new Date(b.date))

  return (
    <div style={{ padding: '1.5rem 0' }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#e8f5ec' }}>
        Transaction Timeline
      </h3>
      
      <div style={{ position: 'relative', paddingLeft: '2.5rem' }}>
        {/* Timeline line */}
        <div style={{ 
          position: 'absolute', 
          left: '0.75rem', 
          top: '0.5rem', 
          bottom: '0.5rem', 
          width: '2px', 
          background: 'rgba(0,197,102,0.2)' 
        }} />

        {events.map((event, index) => (
          <div key={index} style={{ position: 'relative', marginBottom: '1.5rem' }}>
            {/* Icon */}
            <div style={{ 
              position: 'absolute', 
              left: '-2.5rem', 
              top: '0', 
              width: '2rem', 
              height: '2rem', 
              borderRadius: '50%', 
              background: event.color + '20',
              border: `2px solid ${event.color}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem'
            }}>
              {event.icon}
            </div>

            {/* Content */}
            <div style={{ 
              background: '#152019', 
              border: '1px solid rgba(0,197,102,0.1)', 
              borderRadius: '10px', 
              padding: '1rem' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ fontWeight: 600, color: '#e8f5ec' }}>{event.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#6b9178' }}>
                  {new Date(event.date).toLocaleString('en-KE', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#6b9178' }}>{event.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
