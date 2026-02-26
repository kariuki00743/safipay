import { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [message, duration, onClose])

  if (!message) return null

  const colors = {
    success: { bg: 'rgba(0,197,102,0.15)', border: '#00c566', icon: '✅' },
    error: { bg: 'rgba(224,19,46,0.15)', border: '#e0132e', icon: '❌' },
    warning: { bg: 'rgba(255,193,7,0.15)', border: '#ffc107', icon: '⚠️' },
    info: { bg: 'rgba(0,150,255,0.15)', border: '#0096ff', icon: 'ℹ️' }
  }

  const style = colors[type] || colors.info

  return (
    <div style={{
      position: 'fixed',
      top: '2rem',
      right: '2rem',
      background: style.bg,
      border: `1px solid ${style.border}`,
      borderRadius: '12px',
      padding: '1rem 1.5rem',
      color: '#e8f5ec',
      fontSize: '0.9rem',
      zIndex: 2000,
      maxWidth: '400px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      animation: 'slideIn 0.3s ease-out',
      display: 'flex',
      alignItems: 'center',
      gap: '0.8rem'
    }}>
      <span style={{ fontSize: '1.2rem' }}>{style.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button 
        onClick={onClose}
        style={{ 
          background: 'transparent', 
          border: 'none', 
          color: '#6b9178', 
          cursor: 'pointer',
          fontSize: '1.2rem',
          padding: 0,
          lineHeight: 1
        }}>
        ×
      </button>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
