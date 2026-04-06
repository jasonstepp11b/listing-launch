import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    document.title = 'ListingIgnite — Reset Password'
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)

    // Fire and forget — we never reveal whether the email exists
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setSent(true)
    setSubmitting(false)
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoMark}>✦</div>

        {sent ? (
          <>
            <div style={s.sentIcon}>✉️</div>
            <h1 style={s.heading}>Check your inbox</h1>
            <p style={s.message}>
              If an account exists for this email, you'll receive a reset link shortly.
              Note: if you originally signed up with Google, please use the{' '}
              <strong style={{ color: '#f3f4f6', fontWeight: '600' }}>Sign in with Google</strong>{' '}
              button instead.
            </p>
            <Link to="/login" style={s.backLink}>← Back to Sign In</Link>
          </>
        ) : (
          <>
            <h1 style={s.heading}>Reset your password</h1>
            <p style={s.subheading}>Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={s.field}>
                <label style={s.label}>Email</label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  disabled={submitting}
                />
              </div>

              <button
                style={submitting ? { ...s.submitBtn, ...s.submitBtnLoading } : s.submitBtn}
                type="submit"
                disabled={submitting || !email.trim()}
              >
                {submitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <Link to="/login" style={s.backLink}>← Back to Sign In</Link>
          </>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    padding: '24px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  card: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
  },
  logoMark: {
    fontSize: '28px',
    color: '#a855f7',
    marginBottom: '16px',
  },
  sentIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
    fontFamily: 'inherit',
  },
  subheading: {
    fontSize: '15px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: '0 0 28px',
  },
  message: {
    fontSize: '14px',
    color: '#a0a8b8',
    lineHeight: '1.7',
    margin: '0 0 28px',
    textAlign: 'left',
  },
  field: {
    marginBottom: '16px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  },
  submitBtn: {
    width: '100%',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(139, 47, 232, 0.4)',
    marginTop: '4px',
  },
  submitBtnLoading: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'default',
  },
  backLink: {
    display: 'inline-block',
    marginTop: '24px',
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
    fontWeight: '500',
  },
}
