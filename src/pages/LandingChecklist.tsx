import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import { callEdgeFunction } from '../lib/edgeFunction'


export default function LandingChecklist() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setSubmitting(true)
    setError(null)

    const { error: apiError } = await callEdgeFunction('add-to-kit', {
      email: trimmed,
      firstName: '',
      formId: 'checklist',
    })

    if (apiError) {
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
      return
    }

    // Fire GA4 lead event — non-blocking
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).gtag?.('event', 'lead_magnet_signup', { form_id: 'checklist' })
    } catch {}

    navigate('/checklist/thank-you')
  }

  function scrollToForm() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => emailRef.current?.focus(), 600)
  }

  return (
    <div style={s.page}>

      {/* ── Top bar ───────────────────────────────────────────────── */}
      <header style={s.topBar}>
        <div style={s.topBarInner}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Logo size="md" />
          </Link>
        </div>
      </header>

      {/* ── Section 1: Hero ──────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.sectionInner}>
          <div className="checklist-hero-grid">

            {/* Left column — copy + form */}
            <div>
              <p style={s.eyebrow}>FREE CHECKLIST · FOR REAL ESTATE AGENTS</p>
              <h1 style={s.h1} className="checklist-h1">
                47 things to market every listing.<br />
                <span style={s.gradientText}>Eleven of them, automated.</span>
              </h1>
              <p style={s.heroSub}>
                The print-and-check-off list every serious agent needs. Plus the six-page breakdown of exactly which steps you can stop doing by hand.
              </p>

              <form onSubmit={handleSubmit} noValidate style={s.form}>
                <input
                  ref={emailRef}
                  style={s.emailInput}
                  type="email"
                  placeholder="you@realestate.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={submitting}
                  autoComplete="email"
                />
                <button
                  style={submitting ? { ...s.submitBtn, ...s.submitBtnDisabled } : s.submitBtn}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Sending...' : 'Send me the checklist →'}
                </button>
              </form>

              {error && <p style={s.errorMsg}>{error}</p>}

              <p style={s.microcopy}>Free. No spam. Unsubscribe anytime.</p>
              <p style={s.proofStrip}>47 items · Print-ready PDF · Built for agents who move fast</p>
            </div>

            {/* Right column — CSS PDF cover mockup (desktop only) */}
            <div className="checklist-pdf-visual">
              <div style={s.pdfOuter}>
                <div style={s.pdfGlow} aria-hidden />
                <div style={s.pdfCard}>
                  <div>
                    <div style={{ marginBottom: '28px' }}>
                      <Logo size="sm" />
                    </div>
                    <p style={s.pdfEyebrow}>THE FREE GUIDE FOR SERIOUS AGENTS</p>
                    <h2 style={s.pdfHeadline}>
                      The Listing Marketing<br />
                      <span style={s.gradientText}>Checklist.</span>
                    </h2>
                    <p style={s.pdfSub}>
                      Everything a listing needs to be fully marketed — in one place.
                    </p>
                  </div>
                  <div style={s.pdfTags}>
                    <span style={s.pdfTag}>47 ITEMS</span>
                    <span style={s.pdfTag}>PRINT & CHECK OFF</span>
                    <span style={s.pdfTag}>FOR EVERY LISTING</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: What's Inside ─────────────────────────────── */}
      <section style={s.section}>
        <div style={s.sectionInner}>
          <p style={s.eyebrow}>WHAT'S IN THE CHECKLIST</p>
          <h2 style={s.h2} className="checklist-h2">Two parts. One printable PDF.</h2>
          <p style={s.sectionBody}>
            Most listing-marketing guides read like a textbook. This one doesn't. It's split into the physical work only you can do, and the marketing content that eats your afternoon — with every automated piece clearly marked.
          </p>
          <div className="checklist-cards-grid" style={{ marginTop: '40px' }}>
            <div style={s.card}>
              <p style={s.cardEyebrow}>PART ONE</p>
              <h3 style={s.cardTitle}>The Logistics Checklist</h3>
              <p style={s.cardBody}>
                20 hands-on items — photos, signage, paperwork, showings, closing logistics. The work that can't be automated.
              </p>
              <p style={s.cardStat}>20 ITEMS · ON YOU</p>
            </div>
            <div style={s.cardAccent}>
              <p style={s.cardEyebrow}>PART TWO</p>
              <h3 style={s.cardTitle}>The Marketing Content Checklist</h3>
              <p style={s.cardBody}>
                27 content pieces — every MLS description, social post, email, script, and landing page. Includes 11 items ListingIgnite generates automatically.
              </p>
              <p style={s.cardStat}>27 ITEMS · 11 AUTOMATED</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Founder Note ──────────────────────────────── */}
      <section style={s.sectionTinted}>
        <div style={{ ...s.sectionInner, maxWidth: '720px' }}>
          <p style={s.eyebrow}>FROM THE FOUNDER</p>
          <h2 style={s.h2} className="checklist-h2">Why this exists.</h2>
          <p style={s.founderPara}>
            Agents spend 1–3 hours per listing writing marketing content. MLS description. Social posts. Email blast. Flyer. Video script. Landing page. Every single listing. That's thousands of hours a year for a busy agent.
          </p>
          <p style={s.founderPara}>
            I built ListingIgnite to take that work down to a fraction of the time. This checklist shows you everything a listing actually needs — so you can see for yourself where the time goes, and where it doesn't have to.
          </p>
          <p style={s.signature}>— Jason Stepp, Founder</p>
        </div>
      </section>

      {/* ── Section 4: Bottom CTA ────────────────────────────────── */}
      <section style={s.ctaSection}>
        <div style={s.sectionInner}>
          <div style={s.ctaCard} className="checklist-cta-card">
            <h2 style={s.ctaHeadline}>Get the checklist.</h2>
            <p style={s.ctaSub}>Printable PDF. Delivered instantly.</p>
            <button style={s.ctaBtn} type="button" onClick={scrollToForm}>
              Send me the checklist →
            </button>
            <p style={s.ctaSecondary}>
              Already downloaded it?{' '}
              <Link to="/login" style={s.ctaLink}>Start your free trial →</Link>
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div className="checklist-footer-row">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Logo size="sm" />
            </Link>
            <div style={s.footerRight}>
              <span style={s.footerCopy}>© {new Date().getFullYear()} ListingIgnite</span>
              <span style={s.footerDot}>·</span>
              <Link to="/privacy" style={s.footerLink}>Privacy</Link>
              <span style={s.footerDot}>·</span>
              <Link to="/terms" style={s.footerLink}>Terms</Link>
            </div>
          </div>
          <p style={s.footerTagline}>LIST IT. IGNITE IT.</p>
        </div>
      </footer>

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0c0c12 0%, #150e1f 60%, #0c0c12 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#f3f4f6',
    overflowX: 'hidden',
  },

  // ── Top bar
  topBar: {
    borderBottom: '1px solid #1e1e28',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
  },
  topBarInner: {
    maxWidth: '1120px',
    width: '100%',
    margin: '0 auto',
    padding: '0 24px',
  },

  // ── Section shells
  hero: {
    padding: '80px 24px 96px',
  },
  section: {
    padding: '72px 24px',
  },
  sectionTinted: {
    padding: '72px 24px',
    background: 'rgba(139,47,232,0.03)',
  },
  sectionInner: {
    maxWidth: '1120px',
    margin: '0 auto',
  },

  // ── Typography
  eyebrow: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a855f7',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    margin: '0 0 20px',
  },
  h1: {
    fontSize: '52px',
    fontWeight: '800',
    letterSpacing: '-1.5px',
    color: '#f3f4f6',
    lineHeight: '1.1',
    margin: '0 0 24px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  gradientText: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
  },
  heroSub: {
    fontSize: '18px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    maxWidth: '520px',
    margin: '0 0 32px',
  },
  h2: {
    fontSize: '28px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: '#f3f4f6',
    margin: '0 0 20px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  sectionBody: {
    fontSize: '16px',
    color: '#a0a8b8',
    lineHeight: '1.7',
    maxWidth: '600px',
    margin: '0',
  },

  // ── Form
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
    maxWidth: '380px',
  },
  emailInput: {
    width: '100%',
    padding: '14px 16px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '16px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box' as const,
  },
  submitBtn: {
    width: '100%',
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 8px 32px rgba(139,47,232,0.45)',
    boxSizing: 'border-box' as const,
  },
  submitBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed' as const,
  },
  errorMsg: {
    fontSize: '13px',
    color: '#fca5a5',
    margin: '8px 0 0',
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.10)',
    border: '1px solid rgba(239,68,68,0.30)',
    borderRadius: '8px',
    maxWidth: '380px',
    boxSizing: 'border-box' as const,
  },
  microcopy: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '14px 0 0',
  },
  proofStrip: {
    fontSize: '13px',
    color: '#a0a8b8',
    margin: '20px 0 0',
  },

  // ── PDF cover mockup
  pdfOuter: {
    position: 'relative' as const,
    display: 'flex',
    justifyContent: 'center',
  },
  pdfGlow: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '140%',
    height: '140%',
    background: 'radial-gradient(ellipse at center, rgba(139,47,232,0.22) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  pdfCard: {
    position: 'relative' as const,
    zIndex: 1,
    width: '380px',
    minHeight: '500px',
    background: 'linear-gradient(160deg, #0c0c12 0%, #150e1f 60%, #0c0c12 100%)',
    border: '1px solid rgba(168,85,247,0.35)',
    borderRadius: '14px',
    padding: '40px',
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
    transform: 'rotate(-2deg)',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
  },
  pdfEyebrow: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#a855f7',
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const,
    margin: '0 0 16px',
  },
  pdfHeadline: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#f3f4f6',
    letterSpacing: '-0.5px',
    lineHeight: '1.2',
    margin: '0 0 14px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  pdfSub: {
    fontSize: '13px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: '0',
  },
  pdfTags: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
  },
  pdfTag: {
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.8px',
    textTransform: 'uppercase' as const,
    padding: '5px 10px',
    background: 'rgba(168,85,247,0.12)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: '20px',
    color: '#c084fc',
  },

  // ── Cards (What's Inside)
  card: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardAccent: {
    background: 'linear-gradient(135deg, rgba(139,47,232,0.08) 0%, rgba(124,58,237,0.04) 100%)',
    border: '1px solid rgba(168,85,247,0.25)',
    borderRadius: '14px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  cardEyebrow: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#a855f7',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    margin: '0 0 12px',
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: '-0.3px',
    margin: '0 0 12px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  cardBody: {
    fontSize: '14px',
    color: '#a0a8b8',
    lineHeight: '1.65',
    margin: '0',
    flex: 1,
  },
  cardStat: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#c084fc',
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
    marginTop: '24px',
  },

  // ── Founder note
  founderPara: {
    fontSize: '15px',
    color: '#a0a8b8',
    lineHeight: '1.7',
    margin: '0 0 20px',
  },
  signature: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '8px 0 0',
  },

  // ── Bottom CTA
  ctaSection: {
    padding: '96px 24px 72px',
  },
  ctaCard: {
    background: 'linear-gradient(135deg, rgba(139,47,232,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    border: '1px solid rgba(168,85,247,0.35)',
    borderRadius: '20px',
    padding: '48px 40px',
    maxWidth: '640px',
    margin: '0 auto',
    textAlign: 'center' as const,
  },
  ctaHeadline: {
    fontSize: '36px',
    fontWeight: '800',
    letterSpacing: '-1px',
    color: '#f3f4f6',
    margin: '0 0 12px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  ctaSub: {
    fontSize: '17px',
    color: '#a0a8b8',
    margin: '0 0 32px',
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 8px 32px rgba(139,47,232,0.45)',
  },
  ctaSecondary: {
    fontSize: '14px',
    color: '#a0a8b8',
    marginTop: '20px',
  },
  ctaLink: {
    color: '#a855f7',
    textDecoration: 'none',
    fontWeight: '600',
  },

  // ── Footer
  footer: {
    borderTop: '1px solid #1e1e28',
    padding: '32px 24px',
  },
  footerInner: {
    maxWidth: '1120px',
    margin: '0 auto',
  },
  footerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap' as const,
  },
  footerCopy: {
    fontSize: '13px',
    color: '#4b5563',
  },
  footerDot: {
    fontSize: '13px',
    color: '#3a3a4a',
  },
  footerLink: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
  },
  footerTagline: {
    fontSize: '12px',
    color: '#6b7280',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    textAlign: 'center' as const,
    marginTop: '20px',
  },
}
