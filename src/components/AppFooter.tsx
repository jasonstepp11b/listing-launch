import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function AppFooter() {
  return (
    <footer style={s.footer}>
      <div style={s.inner}>
        <Logo size="sm" />
        <p style={s.copy}>© {new Date().getFullYear()} ListingIgnite. All rights reserved.</p>
        <div style={s.links}>
          <Link to="/privacy" style={s.link} target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
          <Link to="/terms" style={s.link} target="_blank" rel="noopener noreferrer">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}

const s: Record<string, React.CSSProperties> = {
  footer: {
    borderTop: '1px solid #1e1e28',
    padding: '32px 24px',
    marginTop: '64px',
  },
  inner: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sparkle: {
    fontSize: '18px',
    color: '#a855f7',
  },
  name: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: '-0.3px',
  },
  copy: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0,
  },
  links: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  link: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
  },
}
