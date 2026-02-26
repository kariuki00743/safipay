import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSignup = async () => {
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { phone } }
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('✅ Check your email to confirm your account!')
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

  const eyeBtn = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#8ba896',
    fontSize: '1.2rem',
    padding: 0,
    display: 'flex',
    alignItems: 'center'
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #0a0f0b 0%, #0f1a12 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '2rem 1rem' }}>
      <div style={{ background: 'rgba(15,26,18,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(0,197,102,0.2)', borderRadius: '24px', padding: 'clamp(2rem, 5vw, 3rem)', width: '100%', maxWidth: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 800, fontSize: '1.5rem', color: '#e8f5ec', marginBottom: '2rem', letterSpacing: '-0.02em' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>

        <h2 style={{ color: '#e8f5ec', fontWeight: 700, fontSize: '2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Create account
        </h2>
        <p style={{ color: '#8ba896', marginBottom: '2.5rem', fontSize: '0.95rem' }}>Start transacting safely with M-Pesa</p>

        {error && <div style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'rgba(255,107,107,0.1)', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(255,107,107,0.2)' }}>{error}</div>}
        {message && <div style={{ color: '#00c566', fontSize: '0.9rem', marginBottom: '1.5rem', background: 'rgba(0,197,102,0.1)', padding: '1rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(0,197,102,0.2)' }}>{message}</div>}

        {/* Email */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#8ba896' }}>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            onKeyPress={e => e.key === 'Enter' && handleSignup()}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#8ba896' }}>Phone</label>
          <input
            type="tel"
            placeholder="0712345678"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            style={inputStyle}
            onKeyPress={e => e.key === 'Enter' && handleSignup()}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '1.2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#8ba896' }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '3.5rem' }}
              onKeyPress={e => e.key === 'Enter' && handleSignup()}
            />
            <button style={eyeBtn} onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500, color: '#8ba896' }}>Confirm Password</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              style={{ ...inputStyle, paddingRight: '3.5rem',
                borderColor: confirmPassword && password !== confirmPassword ? 'rgba(255,107,107,0.5)' : 'rgba(0,197,102,0.2)'
              }}
              onKeyPress={e => e.key === 'Enter' && handleSignup()}
            />
            <button style={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem' }}>Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && password.length >= 6 && (
            <p style={{ color: '#00c566', fontSize: '0.85rem', marginTop: '0.5rem' }}>✓ Passwords match</p>
          )}
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ width: '100%', background: '#00c566', color: '#000', border: 'none', borderRadius: '12px', padding: '1rem', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: 'Inter, sans-serif' }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#8ba896', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: '#00c566', cursor: 'pointer', fontWeight: 500 }}>Log in</span>
        </p>
      </div>
    </div>
  )
}
