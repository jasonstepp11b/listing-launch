import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    document.title = 'ListingIgnite — Set New Password'

    // Supabase parses the hash token in the URL and fires PASSWORD_RECOVERY
    // when a valid recovery session is detected.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setSuccess(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), 3000)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoMark}>✦</div>

        {success ? (
          <>
            <div style={s.successIcon}>✓</div>
            <h1 style={s.heading}>Password updated</h1>
            <p style={s.subheading}>
              Your password has been updated. Redirecting you to the dashboard…
            </p>
          </>
        ) : !ready ? (
          <>
            <h1 style={s.heading}>Verifying your link…</h1>
            <p style={s.subheading}>
              If nothing happens, your reset link may have expired.{' '}
              <Link to="/forgot-password" style={s.inlineLink}>Request a new one →</Link>
            </p>
            <Link to="/login" style={s.backLink}>← Back to Sign In</Link>
          </>
        ) : (
          <>
            <h1 style={s.heading}>Set new password</h1>
            <p style={s.subheading}>Choose a strong password for your account.</p>

            {error && <div style={s.error}>{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              <div style={s.field}>
                <label style={s.label}>New Password <span style={s.labelHint}>min. 8 characters</span></label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Create a new password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  disabled={submitting}
                />
              </div>

              <div style={s.field}>
                <label style={s.label}>Confirm New Password</label>
                <input
                  style={s.input}
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </div>

              <button
                style={submitting ? { ...s.submitBtn, ...s.submitBtnLoading } : s.submitBtn}
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'Updating…' : 'Update Password'}
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
  successIcon: {
    fontSize: '36px',
    color: '#4ade80',
    fontWeight: '700',
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
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '13px',
    padding: '10px 14px',
    marginBottom: '16px',
    textAlign: 'left',
  },
  field: {
    marginBottom: '14px',
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
  labelHint: {
    fontWeight: '400',
    color: '#6b7280',
    textTransform: 'none',
    letterSpacing: '0',
    fontSize: '11px',
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
  inlineLink: {
    color: '#a855f7',
    textDecoration: 'none',
    fontWeight: '500',
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
