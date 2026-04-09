import logoIconUrl from '../assets/logo-icon.svg'

export default function BlogCTA() {
  return (
    <div style={s.banner}>
      <div style={s.inner}>
        <img src={logoIconUrl} alt="" aria-hidden="true" style={s.icon} />
        <h2 style={s.headline}>Your next listing is waiting.</h2>
        <p style={s.subheadline}>
          Get your full marketing kit — MLS copy, social posts, email blast, and more — in seconds.
        </p>
        <a href="https://listingignite.com/login" style={s.button}>
          Get Started Free →
        </a>
        <p style={s.note}>3 free listings. No credit card required.</p>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  banner: {
    background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 60%, #5b21b6 100%)',
    borderRadius: '16px',
    padding: '56px 32px',
    textAlign: 'center',
    margin: '48px 0',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 40px rgba(124,58,237,0.45)',
  },
  inner: {
    maxWidth: '540px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  icon: {
    width: '48px',
    height: '48px',
    opacity: 0.9,
    filter: 'brightness(0) invert(1)',
  },
  headline: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '-0.5px',
    lineHeight: '1.2',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  subheadline: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: '1.65',
    margin: 0,
  },
  button: {
    display: 'inline-block',
    marginTop: '8px',
    padding: '14px 32px',
    background: '#ffffff',
    color: '#7c3aed',
    textDecoration: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '-0.1px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
  },
  note: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.6)',
    margin: 0,
  },
}
