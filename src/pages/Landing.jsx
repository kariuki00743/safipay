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
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={() => navigate('/login')}
            style={{ background: 'transparent', color: '#e8f5ec', border: 'none', padding: '0.7rem 1.2rem', fontWeight: 500, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            Log In
          </button>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#00c566', color: '#000', border: 'none', padding: '0.7rem 1.6rem', borderRadius: '12px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: 'clamp(4rem, 10vh, 8rem) 5% 4rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(0,197,102,0.1)', border: '1px solid rgba(0,197,102,0.2)', padding: '0.5rem 1.2rem', borderRadius: '50px', fontSize: '0.85rem', color: '#00c566', fontWeight: 500, marginBottom: '2rem' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00c566', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }}></span>
          Trusted by Kenyans Nationwide
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', maxWidth: '900px', margin: '0 auto', marginBottom: '1.5rem' }}>
          Buy & Sell Online with <span style={{ background: 'linear-gradient(135deg, #00c566 0%, #00ff88 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Complete Safety</span>
        </h1>

        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#8ba896', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: 1.7, fontWeight: 400 }}>
          SafiPay protects your M-Pesa transactions. We hold funds in escrow until both buyer and seller confirm the deal. No more scams, no more worries.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/signup')}
            style={{ background: '#00c566', color: '#000', border: 'none', padding: '1.1rem 2.5rem', borderRadius: '12px', fontWeight: 600, fontSize: '1.05rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,197,102,0.3)' }}>
            <span>🚀</span> Start Free Today
          </button>
          <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
            style={{ background: 'rgba(0,197,102,0.1)', color: '#e8f5ec', border: '1px solid rgba(0,197,102,0.3)', padding: '1.1rem 2.5rem', borderRadius: '12px', fontWeight: 500, fontSize: '1.05rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            See How It Works
          </button>
        </div>

        {/* TRUST INDICATORS */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap', marginTop: '4rem', opacity: 0.7 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00c566' }}>100%</div>
            <div style={{ fontSize: '0.85rem', color: '#8ba896' }}>Secure</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00c566' }}>24/7</div>
            <div style={{ fontSize: '0.85rem', color: '#8ba896' }}>Support</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#00c566' }}>KES 0</div>
            <div style={{ fontSize: '0.85rem', color: '#8ba896' }}>Setup Fee</div>
          </div>
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <div style={{ background: 'rgba(15,26,18,0.3)', padding: '5rem 5%', borderTop: '1px solid rgba(0,197,102,0.1)', borderBottom: '1px solid rgba(0,197,102,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
            Tired of Online Transaction Scams?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '😰', title: 'Buyer Worries', desc: 'Send M-Pesa but never receive the item' },
              { icon: '😤', title: 'Seller Concerns', desc: 'Ship goods but payment never arrives' },
              { icon: '💔', title: 'No Protection', desc: 'No way to get your money back if scammed' }
            ].map((problem, i) => (
              <div key={i} style={{ background: 'rgba(224,19,46,0.05)', border: '1px solid rgba(224,19,46,0.2)', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{problem.icon}</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem', color: '#ff6b6b' }}>{problem.title}</h3>
                <p style={{ color: '#8ba896', fontSize: '0.95rem' }}>{problem.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{ padding: '5rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            How SafiPay Works
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#8ba896', maxWidth: '600px', margin: '0 auto' }}>
            Simple, secure, and trusted by Kenyans
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
          {[
            { num: '1', icon: '📝', title: 'Create Transaction', desc: 'Buyer and seller agree on terms. Create an escrow transaction on SafiPay.' },
            { num: '2', icon: '💳', title: 'Buyer Pays', desc: 'Buyer sends M-Pesa payment. Funds are held securely in escrow.' },
            { num: '3', icon: '📦', title: 'Seller Delivers', desc: 'Seller ships the item or provides the service as agreed.' },
            { num: '4', icon: '✅', title: 'Release Funds', desc: 'Buyer confirms receipt. Funds are released to seller instantly.' }
          ].map((step, i) => (
            <div key={i} style={{ position: 'relative', background: 'rgba(15,26,18,0.5)', border: '1px solid rgba(0,197,102,0.2)', borderRadius: '16px', padding: '2rem', transition: 'all 0.3s' }}>
              <div style={{ position: 'absolute', top: '-1rem', left: '1.5rem', background: '#00c566', color: '#000', width: '2.5rem', height: '2.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.2rem' }}>
                {step.num}
              </div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', marginTop: '1rem' }}>{step.icon}</div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', color: '#e8f5ec' }}>{step.title}</h3>
              <p style={{ color: '#8ba896', fontSize: '0.95rem', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ background: 'rgba(15,26,18,0.3)', padding: '5rem 5%', borderTop: '1px solid rgba(0,197,102,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
            Why Choose SafiPay?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { icon: '🔒', title: 'Bank-Level Security', desc: 'Your funds are protected with enterprise-grade encryption and secure M-Pesa integration' },
              { icon: '⚡', title: 'Instant M-Pesa', desc: 'Direct STK Push integration. No manual payments, no delays, no hassle' },
              { icon: '🛡️', title: 'Dispute Resolution', desc: 'Built-in dispute system. Our team reviews and resolves issues within 48 hours' },
              { icon: '💰', title: 'No Hidden Fees', desc: 'Transparent pricing. Only pay when you transact. No setup or monthly fees' },
              { icon: '📱', title: 'Mobile First', desc: 'Works perfectly on your phone. Manage transactions anywhere, anytime' },
              { icon: '🇰🇪', title: 'Made for Kenya', desc: 'Built specifically for Kenyan market with M-Pesa at its core' }
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

      {/* USE CASES */}
      <div style={{ padding: '5rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
          Perfect For
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {[
            { icon: '📱', title: 'Electronics', desc: 'Phones, laptops, gadgets' },
            { icon: '👕', title: 'Fashion', desc: 'Clothes, shoes, accessories' },
            { icon: '🏠', title: 'Furniture', desc: 'Home & office items' },
            { icon: '🎮', title: 'Gaming', desc: 'Consoles, games, accounts' },
            { icon: '🚗', title: 'Vehicles', desc: 'Cars, bikes, spare parts' },
            { icon: '💼', title: 'Services', desc: 'Freelance work, gigs' }
          ].map((useCase, i) => (
            <div key={i} style={{ background: 'rgba(15,26,18,0.5)', border: '1px solid rgba(0,197,102,0.1)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center', transition: 'all 0.3s' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{useCase.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.3rem', color: '#e8f5ec' }}>{useCase.title}</h3>
              <p style={{ color: '#8ba896', fontSize: '0.85rem' }}>{useCase.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div style={{ background: 'rgba(15,26,18,0.3)', padding: '5rem 5%', borderTop: '1px solid rgba(0,197,102,0.1)', borderBottom: '1px solid rgba(0,197,102,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 700, textAlign: 'center', marginBottom: '3rem', letterSpacing: '-0.02em' }}>
            What Kenyans Are Saying
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {[
              { name: 'James M.', location: 'Nairobi', text: 'Sold my iPhone 13 safely. Buyer paid through SafiPay and I shipped with confidence. Got my money instantly!' },
              { name: 'Grace K.', location: 'Mombasa', text: 'Finally bought a laptop online without fear. SafiPay held the payment until I confirmed everything was perfect.' },
              { name: 'David O.', location: 'Kisumu', text: 'As a freelancer, SafiPay protects my payments. Clients pay upfront, I deliver work, then funds are released. Perfect!' }
            ].map((testimonial, i) => (
              <div key={i} style={{ background: 'rgba(15,26,18,0.5)', border: '1px solid rgba(0,197,102,0.2)', borderRadius: '16px', padding: '2rem' }}>
                <div style={{ color: '#00c566', fontSize: '2rem', marginBottom: '1rem' }}>★★★★★</div>
                <p style={{ color: '#e8f5ec', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>"{testimonial.text}"</p>
                <div>
                  <div style={{ fontWeight: 600, color: '#e8f5ec' }}>{testimonial.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#8ba896' }}>{testimonial.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div style={{ padding: '5rem 5%', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: 800, marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
          Ready to Transact Safely?
        </h2>
        <p style={{ fontSize: '1.2rem', color: '#8ba896', marginBottom: '2.5rem', lineHeight: 1.7 }}>
          Join thousands of Kenyans who trust SafiPay for secure online transactions
        </p>
        <button onClick={() => navigate('/signup')}
          style={{ background: '#00c566', color: '#000', border: 'none', padding: '1.2rem 3rem', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,197,102,0.3)' }}>
          Get Started Free - No Credit Card Required
        </button>
        <p style={{ fontSize: '0.9rem', color: '#8ba896', marginTop: '1.5rem' }}>
          🔒 Your data is protected. 🇰🇪 Made in Kenya, for Kenyans
        </p>
      </div>

      {/* FOOTER */}
      <div style={{ background: 'rgba(15,26,18,0.5)', borderTop: '1px solid rgba(0,197,102,0.1)', padding: '3rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Safi<span style={{ color: '#00c566' }}>Pay</span>
            </div>
            <p style={{ color: '#8ba896', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Secure M-Pesa escrow for safe online transactions in Kenya
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#e8f5ec' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#how-it-works" style={{ color: '#8ba896', fontSize: '0.9rem' }}>How It Works</a>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>Pricing</a>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>Security</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#e8f5ec' }}>Support</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>Help Center</a>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>Contact Us</a>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>FAQs</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem', color: '#e8f5ec' }}>Legal</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>Terms of Service</a>
              <a href="#" style={{ color: '#8ba896', fontSize: '0.9rem' }}>Privacy Policy</a>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(0,197,102,0.1)', color: '#8ba896', fontSize: '0.85rem' }}>
          © 2026 SafiPay. All rights reserved. Made with 💚 in Kenya
        </div>
      </div>

    </div>
  )
}