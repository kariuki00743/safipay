import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login')
      } else {
        setLoading(false)
      }
    })
  }, [])

  if (loading) return (
    <div style={{ background: '#090e0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#00c566', fontFamily: 'Syne, sans-serif', fontSize: '1.2rem' }}>Loading...</div>
    </div>
  )

  return children
}