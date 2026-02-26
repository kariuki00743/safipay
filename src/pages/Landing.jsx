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
    <div style={{ background: 'linear-gradient(135deg, #0a0f0b 0%, #0f1a12 100%)', minHeight: '100vh', color: '#e8f5ec', fontFamily: 'Inter, sans-serif' }}>
      
      {/* NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 5%', borderBottom: '1px solid rgba(0,197,102,0.1)', position: 'sticky', top: 0, background: 'rgba(10,15,11,0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
        <div style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>
        <button onClick={() => navigate('/signup')}
          style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.7rem 1.6rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: 'clamp(4rem, 10vh, 8rem) 5% 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,197,102,0.1)', border: '1px solid rgba(0,197,102,0.2)', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem', color: '#00c566', fontWeight: 500, marginBottom: '2rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00c566', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}></span>
          Instant M-Pesa Integration
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: '900px', margin: '0 auto', marginBottom: '1.5rem' }}>
          Transact with <span style={{ background: 'linear-gradient(135deg, #00c566 0%, #00ff88 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Zero Risk</span>
          <br />Settle with Confidence
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#8ba896', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: 1.7, fontWeight: 400 }}>
          Kenya's next-generation escrow platform. We hold your M-Pesa funds safely until both parties are satisfied.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#00c566', color: '#000', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}>
            <span>📱</span> Get Started Free
          </button>
          <button onClick={() => navigate('/login')}
            style={{ background: 'rgba(0,197,102,0.1)', color: '#e8f5ec', border: '1px solid rgba(0,197,102,0.3)', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: 500, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            Log In
          </button>
        </div>

        {/* FEATURES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '5rem', textAlign: 'left' }}>
          {[
            { icon: '🔒', title: 'Secure Escrow', desc: 'Funds held safely until both parties confirm' },
            { icon: '⚡', title: 'Instant M-Pesa', desc: 'Direct integration with M-Pesa STK Push' },
            { icon: '🛡️', title: 'Dispute Protection', desc: 'Built-in dispute resolution system' }
          ].map((feature, i) => (
            <div key={i} style={{ background: 'rgba(15,26,18,0.5)', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '16px', padding: '2rem', transition: 'all 0.3s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#e8f5ec' }}>{feature.title}</h3>
              <p style={{ color: '#8ba896', fontSize: '0.95rem', lineHeight: 1.6 }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}