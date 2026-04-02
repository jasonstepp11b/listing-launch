import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'ListingIgnite — Sign In'
  }, [])

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, loading, navigate])

  async function handleGoogleSignIn() {
    setSigningIn(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      setError('Sign-in failed. Please try again.')
      setSigningIn(false)
    }
    // On success the browser redirects — no need to reset signingIn
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoMark}>✦</div>
        <h1 style={styles.heading}>ListingIgnite</h1>
        <p style={styles.subheading}>
          Instant marketing content for every listing.<br />
          MLS copy, social posts, email blasts, and more — in seconds.
        </p>

        {error && <p style={styles.error}>{error}</p>}

        <button
          style={signingIn ? { ...styles.googleButton, ...styles.googleButtonLoading } : styles.googleButton}
          onClick={handleGoogleSignIn}
          disabled={signingIn}
        >
          {signingIn ? (
            <span style={styles.signingInText}>Redirecting to Google…</span>
          ) : (
            <>
              <GoogleIcon />
              Sign in with Google
            </>
          )}
        </button>

        <p style={styles.fine}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
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

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
    padding: '24px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: '#1c1c24',
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
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '15px',
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 36px',
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '13px',
    padding: '10px 14px',
    marginBottom: '16px',
    margin: '0 0 16px',
  },
  googleButton: {
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
  googleButtonLoading: {
    background: '#e5e7eb',
    cursor: 'default',
  },
  signingInText: {
    color: '#6b7280',
  },
  fine: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
}
