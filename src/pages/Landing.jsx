import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Landing() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate('/dashboard')
    })
  }, [])

  return (
    <div style={{ background: '#090e0a', minHeight: '100vh', color: '#e8f5ec', fontFamily: 'DM Sans, sans-serif' }}>
      
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 5%', borderBottom: '1px solid rgba(0,197,102,0.12)', position: 'sticky', top: 0, background: 'rgba(9,14,10,0.95)', zIndex: 10 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.5rem' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>
        <button onClick={() => navigate('/signup')}
          style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.6rem 1.4rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
          Get Started Free
        </button>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '8rem 5% 4rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,197,102,0.1)', border: '1px solid rgba(0,197,102,0.2)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', color: '#00c566', fontWeight: 500, marginBottom: '2rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00c566', display: 'inline-block' }}></span>
          Now with instant M-Pesa integration
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(2.8rem, 7vw, 5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.04em', maxWidth: 800, margin: '0 auto' }}>
          Transact with <span style={{ color: '#00c566' }}>Zero Risk.</span> Settle with Confidence.
        </h1>

        <p style={{ marginTop: '1.5rem', fontSize: '1.1rem', color: '#6b9178', maxWidth: 500, margin: '1.5rem auto 0', lineHeight: 1.7 }}>
          Kenya's next-generation escrow platform. We hold your M-Pesa funds safely until both parties are satisfied.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.9rem 2rem', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}>
            📱 Get Started Free
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