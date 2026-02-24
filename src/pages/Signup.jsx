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
    background: '#152019',
    border: '1px solid rgba(0,197,102,0.15)',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    color: '#e8f5ec',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const eyeBtn = {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b9178',
    fontSize: '1.1rem',
    padding: 0
  }

  return (
    <div style={{ background: '#090e0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.15)', borderRadius: '20px', padding: '2.5rem', width: '100%', maxWidth: '420px' }}>
        
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', color: '#e8f5ec', marginBottom: '1.5rem' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', color: '#e8f5ec', fontWeight: 800, fontSize: '1.8rem', marginBottom: '0.3rem' }}>
          Create account
        </h2>
        <p style={{ color: '#6b9178', marginBottom: '2rem', fontSize: '0.9rem' }}>Start transacting safely with M-Pesa</p>

        {error && <p style={{ color: '#e0132e', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(224,19,46,0.1)', padding: '0.7rem 1rem', borderRadius: '8px' }}>{error}</p>}
        {message && <p style={{ color: '#00c566', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(0,197,102,0.1)', padding: '0.7rem 1rem', borderRadius: '8px' }}>{message}</p>}

        {/* Email */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: '1rem' }}
        />

        {/* Phone */}
        <input
          type="tel"
          placeholder="Phone number (e.g. 0712345678)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          style={{ ...inputStyle, marginBottom: '1rem' }}
        />

        {/* Password */}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: '3rem' }}
          />
          <button style={eyeBtn} onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* Confirm Password */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <input
            type={showConfirm ? 'text' : 'password'}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{ ...inputStyle, paddingRight: '3rem',
              borderColor: confirmPassword && password !== confirmPassword ? 'rgba(224,19,46,0.5)' : 'rgba(0,197,102,0.15)'
            }}
          />
          <button style={eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
            {showConfirm ? '🙈' : '👁️'}
          </button>
          {confirmPassword && password !== confirmPassword && (
            <p style={{ color: '#e0132e', fontSize: '0.75rem', marginTop: '0.4rem' }}>Passwords do not match</p>
          )}
          {confirmPassword && password === confirmPassword && (
            <p style={{ color: '#00c566', fontSize: '0.75rem', marginTop: '0.4rem' }}>✓ Passwords match</p>
          )}
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{ width: '100%', background: '#00c566', color: '#000', border: 'none', borderRadius: '10px', padding: '0.9rem', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#6b9178', fontSize: '0.85rem' }}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} style={{ color: '#00c566', cursor: 'pointer' }}>Log in</span>
        </p>
      </div>
    </div>
  )
}
