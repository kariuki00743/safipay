import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(21,32,25,0.5)',
    border: '1px solid rgba(0,197,102,0.2)',
    borderRadius: '12px',
    padding: '1rem 1.2rem',
    color: '#e8f5ec',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s'
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0f0b 0%, #0f1a12 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ background: 'rgba(15,26,18,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,197,102,0.2)', borderRadius: '24px', padding: 'clamp(2rem, 5vw, 3rem)', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 800, fontSize: '1.5rem', color: '#e8f5ec', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>

        <h2 style={{ color: '#e8f5ec', fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ color: '#8ba896', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Log in to your SafiPay account</p>

        {error && (
          <div style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'rgba(255,107,107,0.1)', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(255,107,107,0.2)' }}>
            {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#8ba896' }}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            onKeyPress={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {/* Password with toggle */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#8ba896' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '3.5rem' }}
              onKeyPress={e => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8ba896', fontSize: '1.2rem', padding: 0, display: 'flex', alignItems: 'center' }}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: '#00c566', color: '#000', border: 'none', borderRadius: '12px', padding: '1rem', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#8ba896', fontSize: '0.9rem' }}>
          No account?{' '}
          <span onClick={() => navigate('/signup')} style={{ color: '#00c566', cursor: 'pointer', fontWeight: 500 }}>Sign up free</span>
        </p>
      </div>
    </div>
  )
}
