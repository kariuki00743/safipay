import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import TransactionTimeline from '../components/TransactionTimeline'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ buyer_email: '', seller_email: '', amount: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  
  // Modal states
  const [paymentModal, setPaymentModal] = useState({ open: false, transaction: null, phone: '', loading: false })
  const [releaseModal, setReleaseModal] = useState({ open: false, transaction: null, loading: false })
  const [disputeModal, setDisputeModal] = useState({ open: false, transaction: null, reason: '', loading: false })
  const [detailsModal, setDetailsModal] = useState({ open: false, transaction: null })
  const [refundModal, setRefundModal] = useState({ open: false, transaction: null, loading: false })
  
  // Toast notification
  const [toast, setToast] = useState({ message: '', type: 'info' })
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Polling for payment status
  const [pollingTxId, setPollingTxId] = useState(null)

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type })
  }, [])

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      fetchTransactions(user.id)
    })
  }, [])

  // Filter transactions when search or status filter changes
  useEffect(() => {
    let filtered = transactions

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(query) ||
        tx.buyer_email.toLowerCase().includes(query) ||
        tx.seller_email.toLowerCase().includes(query) ||
        tx.mpesa_receipt?.toLowerCase().includes(query)
      )
    }

    setFilteredTransactions(filtered)
  }, [transactions, searchQuery, statusFilter])

  // Poll for payment status updates
  useEffect(() => {
    if (!pollingTxId) return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('transactions')
        .select('status, mpesa_receipt')
        .eq('id', pollingTxId)
        .single()

      if (data && data.status === 'paid') {
        showToast('Payment confirmed! 🎉', 'success')
        setPollingTxId(null)
        fetchTransactions(user.id)
      }
    }, 3000) // Poll every 3 seconds

    // Stop polling after 5 minutes
    const timeout = setTimeout(() => {
      setPollingTxId(null)
    }, 300000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [pollingTxId, user])

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
      showToast('Transaction created successfully!', 'success')
      fetchTransactions(user.id)
    }
    setSubmitting(false)
  }

  const handlePayment = async () => {
    const { transaction, phone } = paymentModal
    
    if (!phone.trim()) {
      showToast('Please enter a phone number', 'error')
      return
    }

    setPaymentModal(prev => ({ ...prev, loading: true }))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Session expired. Please log in again.', 'error')
        navigate('/login')
        return
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stkpush`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          phone, 
          amount: transaction.amount, 
          description: transaction.description, 
          transactionId: transaction.id 
        })
      })
      const data = await res.json()
      
      if (data.success) {
        showToast('STK Push sent! Check your phone 📱', 'success')
        setPaymentModal({ open: false, transaction: null, phone: '', loading: false })
        setPollingTxId(transaction.id) // Start polling for status
        fetchTransactions(user.id)
      } else {
        showToast(data.error || 'Payment failed', 'error')
        setPaymentModal(prev => ({ ...prev, loading: false }))
      }
    } catch (err) {
      console.error(err)
      showToast('Could not connect to payment server', 'error')
      setPaymentModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleRelease = async () => {
    const { transaction } = releaseModal
    setReleaseModal(prev => ({ ...prev, loading: true }))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Session expired. Please log in again.', 'error')
        navigate('/login')
        return
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/release`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ transactionId: transaction.id })
      })
      const data = await res.json()
      
      if (data.success) {
        showToast('Funds released to seller! ✅', 'success')
        setReleaseModal({ open: false, transaction: null, loading: false })
        fetchTransactions(user.id)
      } else {
        showToast(data.error || 'Failed to release funds', 'error')
        setReleaseModal(prev => ({ ...prev, loading: false }))
      }
    } catch (err) {
      console.error(err)
      showToast('Could not connect to server', 'error')
      setReleaseModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleDispute = async () => {
    const { transaction, reason } = disputeModal
    
    if (!reason.trim() || reason.trim().length < 10) {
      showToast('Please provide a detailed reason (at least 10 characters)', 'error')
      return
    }

    setDisputeModal(prev => ({ ...prev, loading: true }))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Session expired. Please log in again.', 'error')
        navigate('/login')
        return
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dispute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ transactionId: transaction.id, reason })
      })
      const data = await res.json()
      
      if (data.success) {
        showToast('Dispute raised. Our team will review within 48 hours.', 'warning')
        setDisputeModal({ open: false, transaction: null, reason: '', loading: false })
        fetchTransactions(user.id)
      } else {
        showToast(data.error || 'Failed to raise dispute', 'error')
        setDisputeModal(prev => ({ ...prev, loading: false }))
      }
    } catch (err) {
      console.error(err)
      showToast('Could not connect to server', 'error')
      setDisputeModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleRefund = async () => {
    const { transaction } = refundModal
    setRefundModal(prev => ({ ...prev, loading: true }))
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        showToast('Session expired. Please log in again.', 'error')
        navigate('/login')
        return
      }

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/refund`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ transactionId: transaction.id })
      })
      const data = await res.json()
      
      if (data.success) {
        showToast('Refund processed successfully! 💰', 'success')
        setRefundModal({ open: false, transaction: null, loading: false })
        fetchTransactions(user.id)
      } else {
        showToast(data.error || 'Failed to process refund', 'error')
        setRefundModal(prev => ({ ...prev, loading: false }))
      }
    } catch (err) {
      console.error(err)
      showToast('Could not connect to server', 'error')
      setRefundModal(prev => ({ ...prev, loading: false }))
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const statusColor = (status) => {
    if (status === 'held') return { bg: 'rgba(255,193,7,0.12)', color: '#ffc107', label: '● In Escrow' }
    if (status === 'pending_payment') return { bg: 'rgba(255,152,0,0.12)', color: '#ff9800', label: '⏳ Awaiting Payment' }
    if (status === 'paid') return { bg: 'rgba(0,150,255,0.12)', color: '#0096ff', label: '💳 Paid' }
    if (status === 'complete') return { bg: 'rgba(0,197,102,0.12)', color: '#00c566', label: '✓ Complete' }
    if (status === 'disputed') return { bg: 'rgba(224,19,46,0.12)', color: '#e0132e', label: '⚠ Disputed' }
    if (status === 'refunded') return { bg: 'rgba(255,152,0,0.12)', color: '#ff9800', label: '💰 Refunded' }
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

      {/* Toast Notification */}
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'info' })} 
      />

      {/* TOP NAV */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 5%', borderBottom: '1px solid rgba(0,197,102,0.12)', background: 'rgba(9,14,10,0.95)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(1.2rem, 4vw, 1.4rem)' }}>
          Safi<span style={{ color: '#00c566' }}>Pay</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ color: '#6b9178', fontSize: '0.85rem', display: 'none', '@media (min-width: 640px)': { display: 'inline' } }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(224,19,46,0.3)', color: '#e0132e', padding: '0.5rem 1.2rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
            Logout
          </button>
        </div>
      </nav>

      {/* MAIN */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 5%' }}>

        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 1.8rem)', fontWeight: 800, marginBottom: '0.2rem' }}>Dashboard</h1>
            <p style={{ color: '#6b9178', fontSize: '0.9rem' }}>Manage your escrow transactions</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Transactions', value: transactions.length },
            { label: 'In Escrow', value: transactions.filter(t => t.status === 'held' || t.status === 'paid' || t.status === 'pending_payment').length },
            { label: 'Completed', value: transactions.filter(t => t.status === 'complete').length }
          ].map((stat, i) => (
            <div key={i} style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.12)', borderRadius: '14px', padding: '1.2rem 1.5rem' }}>
              <div style={{ color: '#6b9178', fontSize: '0.8rem', marginBottom: '0.4rem' }}>{stat.label}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.5rem, 5vw, 1.8rem)', fontWeight: 800, color: '#00c566' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input 
            type="text"
            placeholder="🔍 Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              flex: '1 1 250px',
              background: '#152019',
              border: '1px solid rgba(0,197,102,0.15)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#e8f5ec',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ 
              background: '#152019',
              border: '1px solid rgba(0,197,102,0.15)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#e8f5ec',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer',
              minWidth: '150px'
            }}>
            <option value="all">All Status</option>
            <option value="held">In Escrow</option>
            <option value="pending_payment">Awaiting Payment</option>
            <option value="paid">Paid</option>
            <option value="complete">Complete</option>
            <option value="disputed">Disputed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        {/* TRANSACTIONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.1rem', fontWeight: 700 }}>Your Transactions</h2>
          {filteredTransactions.length !== transactions.length && (
            <span style={{ color: '#6b9178', fontSize: '0.85rem' }}>
              Showing {filteredTransactions.length} of {transactions.length}
            </span>
          )}
        </div>

        {loading ? (
          <p style={{ color: '#6b9178', textAlign: 'center', padding: '3rem' }}>Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <div style={{ background: '#0f1a12', border: '1px dashed rgba(0,197,102,0.2)', borderRadius: '16px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📋</div>
            <p style={{ color: '#6b9178', marginBottom: '1rem' }}>
              {transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
            </p>
            {transactions.length === 0 && (
              <button onClick={() => setShowForm(true)} style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '50px', fontWeight: 700, cursor: 'pointer' }}>
                Create your first transaction
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTransactions.map(tx => {
              const s = statusColor(tx.status)
              const canPay = tx.status === 'held'
              const canRelease = tx.status === 'paid'
              const canDispute = tx.status === 'held' || tx.status === 'pending_payment' || tx.status === 'paid'
              const canRefund = tx.status === 'paid' || tx.status === 'disputed'
              return (
                <div key={tx.id} style={{ background: '#0f1a12', border: '1px solid rgba(0,197,102,0.12)', borderRadius: '14px', padding: '1.3rem 1.5rem' }}>

                  {/* TOP ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
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

                  {/* ERROR MESSAGE */}
                  {tx.payment_error && (
                    <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#e0132e', background: 'rgba(224,19,46,0.06)', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
                      Payment failed: {tx.payment_error}
                    </div>
                  )}

                  {/* BOTTOM ROW */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ color: '#4a7a58', fontSize: '0.75rem' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button 
                        onClick={() => setDetailsModal({ open: true, transaction: tx })}
                        style={{ background: 'transparent', color: '#6b9178', border: '1px solid rgba(0,197,102,0.2)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                        📋 Details
                      </button>
                      {canPay && (
                        <button 
                          onClick={() => setPaymentModal({ open: true, transaction: tx, phone: '', loading: false })} 
                          style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          📲 Pay with M-Pesa
                        </button>
                      )}
                      {pollingTxId === tx.id && (
                        <span style={{ color: '#ff9800', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>⏳</span> Checking payment...
                        </span>
                      )}
                      {canRelease && (
                        <button 
                          onClick={() => setReleaseModal({ open: true, transaction: tx, loading: false })} 
                          style={{ background: 'transparent', color: '#00c566', border: '1px solid rgba(0,197,102,0.4)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          ✅ Release Funds
                        </button>
                      )}
                      {canRefund && (
                        <button 
                          onClick={() => setRefundModal({ open: true, transaction: tx, loading: false })} 
                          style={{ background: 'transparent', color: '#ff9800', border: '1px solid rgba(255,152,0,0.4)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                          💰 Refund
                        </button>
                      )}
                      {canDispute && (
                        <button 
                          onClick={() => setDisputeModal({ open: true, transaction: tx, reason: '', loading: false })} 
                          style={{ background: 'transparent', color: '#e0132e', border: '1px solid rgba(224,19,46,0.3)', padding: '0.4rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
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

      {/* PAYMENT MODAL */}
      <Modal 
        isOpen={paymentModal.open} 
        onClose={() => !paymentModal.loading && setPaymentModal({ open: false, transaction: null, phone: '', loading: false })}
        title="Pay with M-Pesa">
        <div>
          <p style={{ color: '#6b9178', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Enter the buyer's M-Pesa phone number to send an STK push prompt.
          </p>
          <div style={{ background: '#152019', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Transaction</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{paymentModal.transaction?.description}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#00c566' }}>
              KES {Number(paymentModal.transaction?.amount || 0).toLocaleString()}
            </div>
          </div>
          <input 
            type="tel"
            placeholder="e.g. 0712345678 or 254712345678"
            value={paymentModal.phone}
            onChange={(e) => setPaymentModal(prev => ({ ...prev, phone: e.target.value }))}
            disabled={paymentModal.loading}
            style={{ 
              width: '100%',
              background: '#152019',
              border: '1px solid rgba(0,197,102,0.15)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              color: '#e8f5ec',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '1.5rem'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handlePayment}
              disabled={paymentModal.loading}
              style={{ 
                flex: 1,
                background: '#00c566',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 700,
                cursor: paymentModal.loading ? 'not-allowed' : 'pointer',
                opacity: paymentModal.loading ? 0.6 : 1
              }}>
              {paymentModal.loading ? 'Sending...' : '📲 Send STK Push'}
            </button>
            <button 
              onClick={() => setPaymentModal({ open: false, transaction: null, phone: '', loading: false })}
              disabled={paymentModal.loading}
              style={{ 
                flex: 1,
                background: 'transparent',
                color: '#6b9178',
                border: '1px solid rgba(0,197,102,0.15)',
                borderRadius: '10px',
                padding: '0.85rem',
                cursor: 'pointer'
              }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* RELEASE MODAL */}
      <Modal 
        isOpen={releaseModal.open} 
        onClose={() => !releaseModal.loading && setReleaseModal({ open: false, transaction: null, loading: false })}
        title="Release Funds">
        <div>
          <p style={{ color: '#6b9178', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Are you sure you want to release the funds to the seller? This action cannot be undone.
          </p>
          <div style={{ background: '#152019', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Transaction</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{releaseModal.transaction?.description}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.5rem' }}>
              {releaseModal.transaction?.buyer_email} → {releaseModal.transaction?.seller_email}
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#00c566' }}>
              KES {Number(releaseModal.transaction?.amount || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleRelease}
              disabled={releaseModal.loading}
              style={{ 
                flex: 1,
                background: '#00c566',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 700,
                cursor: releaseModal.loading ? 'not-allowed' : 'pointer',
                opacity: releaseModal.loading ? 0.6 : 1
              }}>
              {releaseModal.loading ? 'Releasing...' : '✅ Confirm Release'}
            </button>
            <button 
              onClick={() => setReleaseModal({ open: false, transaction: null, loading: false })}
              disabled={releaseModal.loading}
              style={{ 
                flex: 1,
                background: 'transparent',
                color: '#6b9178',
                border: '1px solid rgba(0,197,102,0.15)',
                borderRadius: '10px',
                padding: '0.85rem',
                cursor: 'pointer'
              }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* DISPUTE MODAL */}
      <Modal 
        isOpen={disputeModal.open} 
        onClose={() => !disputeModal.loading && setDisputeModal({ open: false, transaction: null, reason: '', loading: false })}
        title="Raise Dispute">
        <div>
          <p style={{ color: '#6b9178', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Describe the issue with this transaction. Our team will review and respond within 48 hours.
          </p>
          <div style={{ background: '#152019', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Transaction</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{disputeModal.transaction?.description}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#00c566' }}>
              KES {Number(disputeModal.transaction?.amount || 0).toLocaleString()}
            </div>
          </div>
          <textarea 
            placeholder="Describe the issue in detail (minimum 10 characters)..."
            value={disputeModal.reason}
            onChange={(e) => setDisputeModal(prev => ({ ...prev, reason: e.target.value }))}
            disabled={disputeModal.loading}
            rows={4}
            style={{ 
              width: '100%',
              background: '#152019',
              border: '1px solid rgba(0,197,102,0.15)',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              color: '#e8f5ec',
              fontSize: '0.95rem',
              outline: 'none',
              boxSizing: 'border-box',
              marginBottom: '1.5rem',
              fontFamily: 'DM Sans, sans-serif',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleDispute}
              disabled={disputeModal.loading}
              style={{ 
                flex: 1,
                background: '#e0132e',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 700,
                cursor: disputeModal.loading ? 'not-allowed' : 'pointer',
                opacity: disputeModal.loading ? 0.6 : 1
              }}>
              {disputeModal.loading ? 'Submitting...' : '⚠️ Submit Dispute'}
            </button>
            <button 
              onClick={() => setDisputeModal({ open: false, transaction: null, reason: '', loading: false })}
              disabled={disputeModal.loading}
              style={{ 
                flex: 1,
                background: 'transparent',
                color: '#6b9178',
                border: '1px solid rgba(0,197,102,0.15)',
                borderRadius: '10px',
                padding: '0.85rem',
                cursor: 'pointer'
              }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* TRANSACTION DETAILS MODAL */}
      <Modal 
        isOpen={detailsModal.open} 
        onClose={() => setDetailsModal({ open: false, transaction: null })}
        title="Transaction Details">
        {detailsModal.transaction && (
          <div>
            <div style={{ background: '#152019', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Description</div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{detailsModal.transaction.description}</div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Buyer</div>
                  <div style={{ fontSize: '0.9rem' }}>{detailsModal.transaction.buyer_email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Seller</div>
                  <div style={{ fontSize: '0.9rem' }}>{detailsModal.transaction.seller_email}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Amount</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#00c566' }}>
                  KES {Number(detailsModal.transaction.amount).toLocaleString()}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Status</div>
                <span style={{ 
                  background: statusColor(detailsModal.transaction.status).bg, 
                  color: statusColor(detailsModal.transaction.status).color, 
                  padding: '0.3rem 1rem', 
                  borderRadius: '50px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600,
                  display: 'inline-block'
                }}>
                  {statusColor(detailsModal.transaction.status).label}
                </span>
              </div>
            </div>

            <TransactionTimeline transaction={detailsModal.transaction} />
          </div>
        )}
      </Modal>

      {/* REFUND MODAL */}
      <Modal 
        isOpen={refundModal.open} 
        onClose={() => !refundModal.loading && setRefundModal({ open: false, transaction: null, loading: false })}
        title="Process Refund">
        <div>
          <p style={{ color: '#6b9178', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Are you sure you want to refund this transaction? The funds will be returned to the buyer's M-Pesa account.
          </p>
          <div style={{ background: '#152019', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.3rem' }}>Transaction</div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{refundModal.transaction?.description}</div>
            <div style={{ fontSize: '0.85rem', color: '#6b9178', marginBottom: '0.5rem' }}>
              {refundModal.transaction?.buyer_email} → {refundModal.transaction?.seller_email}
            </div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.3rem', fontWeight: 800, color: '#ff9800' }}>
              KES {Number(refundModal.transaction?.amount || 0).toLocaleString()}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={handleRefund}
              disabled={refundModal.loading}
              style={{ 
                flex: 1,
                background: '#ff9800',
                color: '#000',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem',
                fontWeight: 700,
                cursor: refundModal.loading ? 'not-allowed' : 'pointer',
                opacity: refundModal.loading ? 0.6 : 1
              }}>
              {refundModal.loading ? 'Processing...' : '💰 Confirm Refund'}
            </button>
            <button 
              onClick={() => setRefundModal({ open: false, transaction: null, loading: false })}
              disabled={refundModal.loading}
              style={{ 
                flex: 1,
                background: 'transparent',
                color: '#6b9178',
                border: '1px solid rgba(0,197,102,0.15)',
                borderRadius: '10px',
                padding: '0.85rem',
                cursor: 'pointer'
              }}>
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
