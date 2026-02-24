import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#090e0a', minHeight: '100vh', color: '#e8f5ec', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Use your existing index.html content will live here */}
      <div style={{ textAlign: 'center', paddingTop: '40vh' }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '3rem', fontWeight: 800 }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </h1>
        <p style={{ color: '#6b9178', marginTop: '1rem' }}>Secure Escrow powered by M-Pesa</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.9rem 2rem', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            Get Started Free
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', color: '#e8f5ec', border: '1px solid rgba(0,197,102,0.3)', padding: '0.9rem 2rem', borderRadius: '50px', fontWeight: 500, fontSize: '1rem', cursor: 'pointer' }}>
            Log In
          </button>
        </div>
      </div>
    </div>
  )
}