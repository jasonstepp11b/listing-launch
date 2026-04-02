const s: Record<string, React.CSSProperties> = {
  banner: {
    background: 'linear-gradient(135deg, rgba(147,51,234,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    borderRadius: '14px',
    padding: '32px',
    textAlign: 'center',
    marginTop: '32px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  icon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  heading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.3px',
  },
  body: {
    fontSize: '14px',
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 24px',
  },
  cta: {
    display: 'inline-block',
    padding: '13px 28px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
    cursor: 'default',
    opacity: 0.85,
  },
  note: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#6b7280',
  },
}

export default function PaywallBanner() {
  return (
    <div style={s.banner}>
      <div style={s.icon}>✦</div>
      <h2 style={s.heading}>You've used your 3 free listings</h2>
      <p style={s.body}>
        You've already seen what ListingIgnite can do — MLS copy, social posts,
        email blasts, flyer copy, video scripts, and an SEO landing page, all in seconds.
        <br /><br />
        Paid plans are on the way. Be first in line and get early-access pricing.
      </p>
      <span style={s.cta}>Get More Credits — Coming Soon</span>
      <p style={s.note}>No payment required now. We'll notify you when plans are available.</p>
    </div>
  )
}
