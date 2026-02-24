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
    background: '#152019',
    border: '1px solid rgba(0,197,102,0.15)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    color: '#e8f5ec',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  }

  return (
    <div style={{ background: '#090e0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.15)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#e8f5ec', marginBottom: '1.5rem' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#e8f5ec', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.3rem' }}>
          Welcome back
        </h2>
        <p style={{ color: '#6b9178', marginBottom: '2rem', fontSize: '0.9rem' }}>Log in to your SafiPay account</p>

        {error && (
          <p style={{ color: '#e0132e', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(224,19,46,0.1)', padding: '0.7rem 1rem', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: '1rem' }}
        />

        {/* Password with toggle */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: '3rem' }}
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b9178', fontSize: '1.1rem', padding: 0 }}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: '100%', background: '#00c566', color: '#000', border: 'none', borderRadius: '10px', padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b9178', fontSize: '0.85rem' }}>
          No account?{' '}
          <span onClick={() => navigate('/signup')} style={{ color: '#00c566', cursor: 'pointer' }}>Sign up free</span>
        </p>
      </div>
    </div>
  )
}
