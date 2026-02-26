export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div 
      onClick={onClose}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        background: 'rgba(0,0,0,0.75)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        zIndex: 1000,
        padding: '1rem'
      }}>
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          background: '#0f1a12', 
          border: '1px solid rgba(0,197,102,0.2)', 
          borderRadius: '16px', 
          padding: '1.8rem', 
          maxWidth: '500px', 
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1.3rem', color: '#e8f5ec', margin: 0 }}>
            {title}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#6b9178', 
              fontSize: '1.5rem', 
              cursor: 'pointer',
              padding: '0.2rem 0.5rem',
              lineHeight: 1
            }}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
