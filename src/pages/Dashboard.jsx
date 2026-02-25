import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ buyer_email: '', seller_email: '', amount: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      fetchTransactions(user.id)
    })
  }, [])

  const fetchTransactions = async (userId) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (!error) setTransactions(data)
    setLoading(false)
  }

  const handleCreate = async () => {
    setError('')
    if (!form.buyer_email || !form.seller_email || !form.amount || !form.description) {
      setError('Please fill in all fields.')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('transactions').insert([{
      ...form,
      amount: parseFloat(form.amount),
      status: 'held',
      user_id: user.id
    }])
    if (error) {
      setError(error.message)
    } else {
      setShowForm(false)
      setForm({ buyer_email: '', seller_email: '', amount: '', description: '' })
      fetchTransactions(user.id)
    }
    setSubmitting(false)
  }

  const handlePayment = async (tx) => {
    const phone = prompt('Enter buyer M-Pesa phone number (e.g. 0712345678):')
    if (!phone) return
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stkpush`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, amount: tx.amount, description: tx.description, transactionId: tx.id })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ STK Push sent! Check your phone for the M-Pesa prompt.')
        fetchTransactions(user.id)
      } else {
        alert('❌ Payment failed: ' + JSON.stringify(data.error))
      }
    } catch (err) {
      alert('❌ Could not connect to payment server.')
    }
  }

  const handleRelease = async (tx) => {
    if (!window.confirm(`Release KES ${Number(tx.amount).toLocaleString()} to seller?`)) return
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx.id })
      })
      const data = await res.json()
      if (data.success) {
        alert('✅ Funds released to seller!')
        fetchTransactions(user.id)
      } else {
        alert('❌ Failed to release funds.')
      }
    } catch (err) {
      alert('❌ Could not connect to server.')
    }
  }

  const handleDispute = async (tx) => {
    const reason = prompt('Describe the issue with this transaction:')
    if (!reason) return
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx.id, reason })
      })
      const data = await res.json()
      if (data.success) {
        alert('⚠️ Dispute raised. Our team will review within 48 hours.')
        fetchTransactions(user.id)
      } else {
        alert('❌ Failed to raise dispute.')
      }
    } catch (err) {
      alert('❌ Could not connect to server.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const statusColor = (status) => {
    if (status === 'held') return { bg: 'rgba(255,193,7,0.12)', color: '#ffc107', label: '● In Escrow' }
    if (status === 'paid') return { bg: 'rgba(0,150,255,0.12)', color: '#0096ff', label: '💳 Paid' }
    if (status === 'complete') return { bg: 'rgba(0,197,102,0.12)', color: '#00c566', label: '✓ Complete' }
    if (status === 'disputed') return { bg: 'rgba(224,19,46,0.12)', color: '#e0132e', label: '⚠ Disputed' }
    return { bg: 'rgba(255,255,255,0.05)', color: '#6b9178', label: status }
  }

  const inputStyle = {
    width: '100%', background: '#152019',
    border: '1px solid rgba(0,197,102,0.15)',
    borderRadius: '10px', padding: '0.85rem 1rem',
    color: '#e8f5ec', fontSize: '0.9rem',
    outline: 'none', boxSizing: 'border-box',
    marginBottom: '1rem'
  }

  return (
    <div style={{ background: '#090e0a', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif', color: '#e8f5ec' }}>

      {/* TOP NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 5%', borderBottom: '1px solid rgba(0,197,102,0.12)', background: 'rgba(9,14,10,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.4rem' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#6b9178', fontSize: '0.85rem' }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(224,19,46,0.3)', color: '#e0132e', padding: '0.5rem 1.2rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 5%' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.2rem' }}>Dashboard</h1>
            <p style={{ color: '#6b9178', fontSize: '0.9rem' }}>Manage your escrow transactions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer' }}>
            + New Transaction
          </button>
        </div>

        {/* FORM */}
        {showForm && (
          <div style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.2)', borderRadius: '16px', padding: '1.8rem', marginBottom: '2rem' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, marginBottom: '1.5rem', fontSize: '1.1rem' }}>New Escrow Transaction</h3>
            {error && (
              <p style={{ color: '#e0132e', fontSize: '0.85rem', marginBottom: '1rem', background: 'rgba(224,19,46,0.1)', padding: '0.7rem 1rem', borderRadius: '8px' }}>{error}</p>
            )}
            <input placeholder="Buyer email" value={form.buyer_email} onChange={e => setForm({ ...form, buyer_email: e.target.value })} style={inputStyle} />
            <input placeholder="Seller email" value={form.seller_email} onChange={e => setForm({ ...form, seller_email: e.target.value })} style={inputStyle} />
            <input placeholder="Amount (KES)" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} style={inputStyle} />
            <input placeholder="Description (e.g. iPhone 14 Pro)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={inputStyle} />
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleCreate} disabled={submitting} style={{ flex: 1, background: '#00c566', color: '#000', border: 'none', borderRadius: '10px', padding: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                {submitting ? 'Creating...' : 'Create Transaction'}
              </button>
              <button onClick={() => setShowForm(false)} style={{ flex: 1, background: 'transparent', color: '#6b9178', border: '1px solid rgba(0,197,102,0.15)', borderRadius: '10px', padding: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Transactions', value: transactions.length },
            { label: 'In Escrow', value: transactions.filter(t => t.status === 'held' || t.status === 'paid').length },
            { label: 'Completed', value: transactions.filter(t => t.status === 'complete').length }
          ].map((stat, i) => (
            <div key={i} style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.12)', borderRadius: '14px', padding: '1.2rem 1.5rem' }}>
              <div style={{ color: '#6b9178', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{stat.label}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, color: '#00c566' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* TRANSACTIONS */}
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Your Transactions</h2>

        {loading ? (
          <p style={{ color: '#6b9178', textAlign: 'center', padding: '3rem' }}>Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <div style={{ background: '#0f1a12', border: '1px dashed rgba(0,197,102,0.2)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: '#6b9178', marginBottom: '1rem' }}>No transactions yet</p>
            <button onClick={() => setShowForm(true)} style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}>
              Create your first transaction
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {transactions.map(tx => {
              const s = statusColor(tx.status)
              const canAct = tx.status === 'held' || tx.status === 'paid'
              return (
                <div key={tx.id} style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.12)', borderRadius: '14px', padding: '1.3rem 1.5rem' }}>

                  {/* TOP ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{tx.description}</div>
                      <div style={{ color: '#6b9178', fontSize: '0.8rem' }}>{tx.buyer_email} → {tx.seller_email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.3rem' }}>
                        KES {Number(tx.amount).toLocaleString()}
                      </div>
                      <span style={{ background: s.bg, color: s.color, padding: '0.2rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {s.label}
                      </span>
                    </div>
                  </div>

                  {/* RECEIPT */}
                  {tx.mpesa_receipt && (
                    <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#00c566', background: 'rgba(0,197,102,0.06)', padding: '0.4rem 0.8rem', borderRadius: '6px', display: 'inline-block' }}>
                      M-Pesa Receipt: {tx.mpesa_receipt}
                    </div>
                  )}

                  {/* BOTTOM ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ color: '#4a7a58', fontSize: '0.75rem' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {tx.status === 'held' && (
                        <button onClick={() => handlePayment(tx)} style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          📲 Pay with M-Pesa
                        </button>
                      )}
                      {canAct && (
                        <button onClick={() => handleRelease(tx)} style={{ background: 'transparent', color: '#00c566', border: '1px solid rgba(0,197,102,0.4)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          ✅ Release Funds
                        </button>
                      )}
                      {canAct && (
                        <button onClick={() => handleDispute(tx)} style={{ background: 'transparent', color: '#e0132e', border: '1px solid rgba(224,19,46,0.3)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          ⚠️ Raise Dispute
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
