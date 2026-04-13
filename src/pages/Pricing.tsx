import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import AppFooter from '../components/AppFooter'
import { supabase } from '../lib/supabase'
import { callEdgeFunction } from '../lib/edgeFunction'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function Pricing() {
  const [email, setEmail] = useState('')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitState('submitting')

    const { error } = await supabase.from('waitlist').insert({
      email: email.trim(),
      user_id: null,
    })

    if (error && error.code !== '23505') {
      setSubmitState('error')
      return
    }

    try {
      await callEdgeFunction('add-to-kit', { email: email.trim(), firstName: '' })
    } catch {
      // non-blocking
    }

    setSubmitState('success')
  }

  return (
    <div style={s.page}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo />
          </Link>
          <div style={s.navRight} className="landing-nav-desktop">
            <Link to="/blog" style={s.navLink}>Blog</Link>
            <Link to="/login" style={s.navSignIn}>Sign In</Link>
            <Link to="/login" style={s.navGetStarted}>Get Started Free →</Link>
          </div>
          <button
            style={s.hamburger}
            className="landing-nav-mobile"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            type="button"
          >
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
            <span style={s.hamburgerLine} />
          </button>
        </div>
        {menuOpen && (
          <div style={s.mobileMenu} className="landing-nav-mobile">
            <Link to="/blog" style={s.mobileLink} onClick={() => setMenuOpen(false)}>Blog</Link>
            <Link to="/login" style={s.mobileLinkSignIn} onClick={() => setMenuOpen(false)}>Sign In</Link>
            <Link to="/login" style={s.mobileLinkCta} onClick={() => setMenuOpen(false)}>Get Started Free →</Link>
          </div>
        )}
      </nav>

      {/* Content */}
      <div style={s.content}>
        <div style={s.inner}>
          <p style={s.eyebrow}>Pricing</p>
          <h1 style={s.headline}>Simple, transparent pricing.</h1>
          <p style={s.sub}>
            Plans are coming soon. Join the waitlist to be first to know — and get bonus
            credits when we launch.
          </p>

          <div style={s.card}>
            {submitState === 'success' ? (
              <div style={s.successBox}>
                <div style={s.successCheck}>✓</div>
                <p style={s.successHeading}>You're on the list.</p>
                <p style={s.successBody}>
                  We'll notify you when pricing launches. You'll get first access and bonus credits.
                </p>
              </div>
            ) : (
              <>
                <p style={s.cardLabel}>Get notified when plans launch</p>
                <form onSubmit={handleSubmit} style={s.form}>
                  <input
                    style={s.input}
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    disabled={submitState === 'submitting'}
                  />
                  <button
                    type="submit"
                    style={submitState === 'submitting' ? { ...s.btn, ...s.btnLoading } : s.btn}
                    disabled={submitState === 'submitting'}
                  >
                    {submitState === 'submitting' ? 'Joining…' : 'Join Waitlist →'}
                  </button>
                  {submitState === 'error' && (
                    <p style={s.errorMsg}>Something went wrong. Please try again.</p>
                  )}
                </form>
                <p style={s.cardNote}>Free to join. Unsubscribe anytime.</p>
              </>
            )}
          </div>

          <p style={s.startFree}>
            Want to try it now?{' '}
            <Link to="/login" style={s.startFreeLink}>Start free — 3 listings included.</Link>
          </p>
        </div>
      </div>

      <AppFooter />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#f3f4f6',
    display: 'flex',
    flexDirection: 'column',
  },
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(12,12,18,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(46,46,58,0.6)',
  },
  navInner: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  navLink: {
    fontSize: '14px',
    color: '#a0a8b8',
    textDecoration: 'none',
    fontWeight: '500',
  },
  navSignIn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#a0a8b8',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
  },
  navGetStarted: {
    padding: '8px 18px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    borderRadius: '7px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(139,47,232,0.35)',
  },
  hamburger: {
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
    width: '36px',
    height: '36px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    cursor: 'pointer',
    padding: '0',
  },
  hamburgerLine: {
    display: 'block',
    width: '16px',
    height: '2px',
    background: '#a0a8b8',
    borderRadius: '2px',
  },
  mobileMenu: {
    flexDirection: 'column' as const,
    padding: '12px 24px 20px',
    borderTop: '1px solid rgba(46,46,58,0.6)',
    background: 'rgba(12,12,18,0.97)',
    gap: '4px',
  },
  mobileLink: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#a0a8b8',
    textDecoration: 'none',
    padding: '12px 0',
    borderBottom: '1px solid rgba(46,46,58,0.4)',
  },
  mobileLinkSignIn: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#a0a8b8',
    textDecoration: 'none',
    padding: '12px 0',
    borderBottom: '1px solid rgba(46,46,58,0.4)',
  },
  mobileLinkCta: {
    display: 'block',
    marginTop: '12px',
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    textAlign: 'center' as const,
    boxShadow: '0 4px 14px rgba(139,47,232,0.4)',
  },
  content: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
  },
  inner: {
    maxWidth: '520px',
    width: '100%',
    textAlign: 'center',
  },
  eyebrow: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#a855f7',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    margin: '0 0 16px',
  },
  headline: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 16px',
    letterSpacing: '-1px',
    lineHeight: '1.1',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  sub: {
    fontSize: '17px',
    color: '#a0a8b8',
    lineHeight: '1.65',
    margin: '0 0 40px',
  },
  card: {
    background: 'linear-gradient(135deg, rgba(139,47,232,0.10) 0%, rgba(124,58,237,0.05) 100%)',
    border: '1px solid rgba(168,85,247,0.30)',
    borderRadius: '16px',
    padding: '36px 32px',
    marginBottom: '28px',
  },
  cardLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#d1d5db',
    margin: '0 0 20px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%',
    padding: '13px 24px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(139,47,232,0.4)',
    boxSizing: 'border-box',
  },
  btnLoading: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'default',
  },
  cardNote: {
    fontSize: '12px',
    color: '#4b5563',
    margin: '12px 0 0',
  },
  errorMsg: {
    fontSize: '13px',
    color: '#fca5a5',
    margin: 0,
  },
  successBox: {
    padding: '8px 0',
  },
  successCheck: {
    fontSize: '32px',
    color: '#4ade80',
    fontWeight: '700',
    marginBottom: '10px',
  },
  successHeading: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 8px',
    letterSpacing: '-0.3px',
  },
  successBody: {
    fontSize: '14px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: 0,
  },
  startFree: {
    fontSize: '14px',
    color: '#6b7280',
  },
  startFreeLink: {
    color: '#a855f7',
    textDecoration: 'none',
    fontWeight: '500',
  },
}
