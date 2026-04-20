import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'

export default function ChecklistThankYou() {
  useEffect(() => {
    document.title = 'Your Checklist Is Ready — ListingIgnite'
  }, [])

  return (
    <div style={s.page}>
      {/* Top bar */}
      <div style={s.topBar}>
        <Link to="/" style={s.logoLink}>
          <Logo size="md" />
        </Link>
      </div>

      {/* Content */}
      <div style={s.content}>
        <div style={s.pill}>✓ YOU'RE ON THE LIST</div>

        <h1 style={s.heading}>Your checklist is ready.</h1>

        <p style={s.body}>
          Click below to download your free copy of the{' '}
          <strong style={{ color: '#f3f4f6' }}>Listing Marketing Checklist</strong> —
          the same workflow used to take a listing from photos to fully marketed in under 30 minutes.
        </p>

        <a
          href="/downloads/listing-marketing-checklist.pdf"
          target="_blank"
          rel="noopener noreferrer"
          style={s.downloadBtn}
        >
          ↓ Download Your Free Checklist (PDF)
        </a>

        <p style={s.spamNote}>
          We also sent a copy to your inbox. Check your spam folder if you don't see it within a few minutes.
        </p>

        <div style={s.divider} />

        <p style={s.ctaTeaser}>
          Want to skip the checklist entirely?{' '}
          <Link to="/login" style={s.ctaLink}>
            Try ListingIgnite free →
          </Link>
          {' '}Paste in a listing and get all your marketing content in 30 seconds.
        </p>
      </div>

      {/* Footer */}
      <div style={s.footer}>
        <span style={s.footerText}>© {new Date().getFullYear()} ListingIgnite</span>
        <span style={s.footerDot}>·</span>
        <Link to="/privacy" style={s.footerLink}>Privacy</Link>
        <span style={s.footerDot}>·</span>
        <Link to="/terms" style={s.footerLink}>Terms</Link>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#a0a8b8',
  },
  topBar: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  logoLink: {
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '640px',
    width: '100%',
    padding: '72px 24px 48px',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '100px',
    background: 'rgba(74, 222, 128, 0.12)',
    border: '1px solid rgba(74, 222, 128, 0.3)',
    color: '#4ade80',
    fontSize: '12px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    marginBottom: '28px',
  },
  heading: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 20px',
    letterSpacing: '-1px',
    lineHeight: '1.1',
    fontFamily: 'inherit',
  },
  body: {
    fontSize: '17px',
    lineHeight: '1.7',
    color: '#a0a8b8',
    margin: '0 0 36px',
  },
  downloadBtn: {
    display: 'inline-block',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 20px rgba(139,47,232,0.45)',
    marginBottom: '20px',
  },
  spamNote: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '0 0 40px',
  },
  divider: {
    width: '48px',
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    margin: '0 0 40px',
  },
  ctaTeaser: {
    fontSize: '15px',
    lineHeight: '1.7',
    color: '#6b7280',
    margin: 0,
  },
  ctaLink: {
    color: '#a855f7',
    fontWeight: '600',
    textDecoration: 'none',
  },
  footer: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  footerText: {
    fontSize: '13px',
    color: '#4b5563',
  },
  footerDot: {
    fontSize: '13px',
    color: '#374151',
  },
  footerLink: {
    fontSize: '13px',
    color: '#4b5563',
    textDecoration: 'none',
  },
}
