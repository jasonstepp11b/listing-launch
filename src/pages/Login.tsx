import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

type Mode = 'login' | 'signup' | 'confirmed'

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = mode === 'signup'
      ? 'ListingIgnite — Create Account'
      : 'ListingIgnite — Sign In'
  }, [mode])

  useEffect(() => {
    if (!loading && session) navigate('/dashboard', { replace: true })
  }, [session, loading, navigate])

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
    setPassword('')
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────

  async function handleGoogleSignIn() {
    setSubmitting(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setError('Google sign-in failed. Please try again.')
      setSubmitting(false)
    }
    // On success the browser redirects — no need to reset submitting
  }

  // ── Email sign-in ──────────────────────────────────────────────────────────

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(
        error.message.toLowerCase().includes('invalid')
          ? 'Incorrect email or password. Please try again.'
          : error.message,
      )
      setSubmitting(false)
    }
    // On success, AuthContext detects the session and the useEffect above redirects
  }

  // ── Email sign-up ──────────────────────────────────────────────────────────

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) { setError('Please enter your full name.'); return }
    if (!email) { setError('Please enter your email address.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setSubmitting(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Passed into raw_user_meta_data — picked up by the handle_new_user trigger
        data: { full_name: fullName.trim() },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    } else {
      setMode('confirmed')
    }
  }

  // ── Confirmed state ────────────────────────────────────────────────────────

  if (mode === 'confirmed') {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <div style={s.logoMark}>✦</div>
          <div style={s.confirmedIcon}>✉️</div>
          <h1 style={s.heading}>Check your email</h1>
          <p style={s.subheading}>
            We sent a confirmation link to <strong style={{ color: '#f3f4f6' }}>{email}</strong>.
            Click the link in that email to activate your account and get started.
          </p>
          <p style={s.fine}>
            Didn't receive it? Check your spam folder, or{' '}
            <button style={s.textBtn} onClick={() => switchMode('signup')}>try again</button>.
          </p>
        </div>
      </div>
    )
  }

  // ── Sign-in / Sign-up form ─────────────────────────────────────────────────

  const isSignup = mode === 'signup'

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logoMark}>✦</div>
        <h1 style={s.heading}>ListingIgnite</h1>
        <p style={s.subheading}>
          {isSignup
            ? 'Create your free account — no credit card required.'
            : 'Instant marketing content for every listing.'}
        </p>

        {error && <div style={s.error}>{error}</div>}

        {/* Google OAuth */}
        <button
          style={submitting ? { ...s.googleBtn, ...s.googleBtnLoading } : s.googleBtn}
          onClick={handleGoogleSignIn}
          disabled={submitting}
          type="button"
        >
          {submitting ? (
            <span style={{ color: '#6b7280' }}>Redirecting…</span>
          ) : (
            <>
              <GoogleIcon />
              {isSignup ? 'Sign up with Google' : 'Sign in with Google'}
            </>
          )}
        </button>

        {/* Divider */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>or</span>
          <div style={s.dividerLine} />
        </div>

        {/* Email/password form */}
        <form onSubmit={isSignup ? handleEmailSignUp : handleEmailSignIn} noValidate>
          {isSignup && (
            <div style={s.field}>
              <label style={s.label}>Full Name</label>
              <input
                style={s.input}
                type="text"
                placeholder="Jane Smith"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                autoComplete="name"
                disabled={submitting}
              />
            </div>
          )}

          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete={isSignup ? 'email' : 'username'}
              disabled={submitting}
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password {isSignup && <span style={s.labelHint}>min. 8 characters</span>}</label>
            <input
              style={s.input}
              type="password"
              placeholder={isSignup ? 'Create a password' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              disabled={submitting}
            />
          </div>

          <button
            style={submitting ? { ...s.submitBtn, ...s.submitBtnLoading } : s.submitBtn}
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? (isSignup ? 'Creating account…' : 'Signing in…')
              : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        {/* Mode toggle */}
        <p style={s.toggle}>
          {isSignup ? (
            <>Already have an account?{' '}
              <button style={s.textBtn} onClick={() => switchMode('login')}>Sign in</button>
            </>
          ) : (
            <>Don't have an account?{' '}
              <button style={s.textBtn} onClick={() => switchMode('signup')}>Sign up free</button>
            </>
          )}
        </p>

        <p style={s.fine}>
          By continuing, you agree to our{' '}
          <Link to="/terms" style={s.fineLink} target="_blank" rel="noopener noreferrer">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" style={s.fineLink} target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" />
    </svg>
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
  confirmedIcon: {
    fontSize: '40px',
    marginBottom: '12px',
  },
  heading: {
    fontSize: '28px',
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
  googleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '13px 20px',
    background: '#fff',
    color: '#1f2937',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  googleBtnLoading: {
    background: '#e5e7eb',
    cursor: 'default',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: '#2e2e3a',
  },
  dividerText: {
    fontSize: '12px',
    color: '#4b5563',
    fontWeight: '500',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
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
  toggle: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#a0a8b8',
  },
  textBtn: {
    background: 'none',
    border: 'none',
    color: '#a855f7',
    fontSize: 'inherit',
    fontWeight: '600',
    cursor: 'pointer',
    padding: 0,
    fontFamily: 'inherit',
  },
  fine: {
    marginTop: '16px',
    fontSize: '12px',
    color: '#4b5563',
    lineHeight: '1.5',
  },
  fineLink: {
    color: '#6b7280',
    textDecoration: 'underline',
  },
}
