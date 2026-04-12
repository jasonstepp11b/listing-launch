import { useState } from 'react'
import { Link } from 'react-router-dom'
import Logo from '../components/Logo'
import { useAuth } from '../context/AuthContext'

const FEATURES = [
  {
    icon: '📋',
    title: 'MLS Description',
    desc: 'Professionally written property descriptions optimized for MLS submission — ready to paste.',
  },
  {
    icon: '📱',
    title: 'Social Media Posts',
    desc: 'Separate posts for Facebook, Instagram, and X — each tailored to the platform\'s style.',
  },
  {
    icon: '✉️',
    title: 'Email Blast',
    desc: 'A ready-to-send email to your buyer list with subject line and full body copy included.',
  },
  {
    icon: '🖨️',
    title: 'Flyer Copy',
    desc: 'Headline, bullet points, and CTA — drop it straight into Canva or your design tool.',
  },
  {
    icon: '🎬',
    title: 'Video Script',
    desc: 'A 60–90 second script for Reels, TikTok, or YouTube — plus an optimized YouTube title, description, and tags.',
  },
  {
    icon: '🔍',
    title: 'SEO Landing Page',
    desc: 'Headline, subheadline, body copy, and CTA built for your property\'s web page.',
  },
]

const STEPS = [
  {
    number: '01',
    title: 'Fill in your listing details',
    desc: 'Address, price, bedrooms, key features, and anything that makes the property special — structured fields make it fast.',
  },
  {
    number: '02',
    title: 'AI generates everything',
    desc: 'Claude AI produces all 6 formats simultaneously in a single request — no waiting, no back and forth, no prompting required.',
  },
  {
    number: '03',
    title: 'Copy and use instantly',
    desc: 'Highlight any section and paste directly into your MLS system, email tool, social scheduler, or design app.',
  },
]

const FAQ = [
  {
    q: 'Is it really free to start?',
    a: 'Yes — every new account includes 3 free listing generations. No credit card required. Paid plans are coming soon.',
  },
  {
    q: 'Will the content sound generic?',
    a: 'ListingIgnite tailors every output to your specific property details, features, neighborhood, and target buyer. The more detail you provide, the better the results.',
  },
  {
    q: 'What platforms does the social media content work for?',
    a: 'We generate separate posts optimized for Facebook, Instagram, and X (Twitter) — each written in the style that performs best on that platform.',
  },
  {
    q: 'Do I need to edit the output?',
    a: 'Most agents use the output with minor tweaks. We always recommend reviewing AI-generated content before publishing to make sure it matches your voice and complies with your local MLS rules.',
  },
  {
    q: 'Is my listing data private?',
    a: 'Yes. Your data is stored securely and never shared or sold. See our Privacy Policy for full details.',
  },
]

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const { session } = useAuth()

  return (
    <div style={s.page}>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <Logo />
          {session ? (
            <Link to="/dashboard" style={s.navGetStarted}>Dashboard →</Link>
          ) : (
            <div style={s.navRight}>
              <Link to="/blog" style={s.navLink}>Blog</Link>
              <Link to="/pricing" style={s.navLink}>Pricing</Link>
              <Link to="/login" style={s.navSignIn}>Sign In</Link>
              <Link to="/login" style={s.navGetStarted}>Get Started Free →</Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroBadge}>✦ AI-powered marketing for real estate agents</div>
          <h1 style={s.heroHeadline}>
            Your listing.<br />
            Fully marketed.<br />
            <span style={s.heroHeadlineAccent}>In seconds.</span>
          </h1>
          <p style={s.heroSub}>
            Paste in your listing details and get a complete marketing package — MLS description,
            social posts, email blast, flyer copy, video script, and SEO page — all at once.
          </p>
          <div style={s.ctaStack}>
            <Link to="/login" style={s.heroCta}>Get Started Free →</Link>
            <p style={s.heroNoCc}>Start free — includes 3 listings. No credit card required.</p>
          </div>
        </div>

        {/* Decorative glow */}
        <div style={s.heroGlow} aria-hidden />
      </section>

      {/* ── Problem ───────────────────────────────────────────── */}
      <section style={s.problem}>
        <div style={s.sectionInner}>
          <div style={s.problemCard}>
            <div style={s.problemIcon}>⏱</div>
            <h2 style={s.problemHeadline}>
              Agents spend <span style={s.problemAccent}>1–3 hours</span> per listing
              creating marketing content manually.
            </h2>
            <p style={s.problemSub}>
              Writing an MLS description. Drafting social captions. Setting up an email. Creating flyer copy.
              Scripting a video. Repeating all of it for the next listing.
              <br /><br />
              <strong style={{ color: '#f3f4f6' }}>ListingIgnite eliminates that entirely.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section style={s.features}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>What you get</p>
          <h2 style={s.sectionHeadline}>6 formats. One click.</h2>
          <p style={s.sectionSub}>
            Every piece of marketing content a listing needs — generated together in a single AI request.
          </p>

          <div style={s.featureGrid} className="landing-feature-grid">
            {FEATURES.map(f => (
              <div key={f.title} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <h3 style={s.featureTitle}>{f.title}</h3>
                <p style={s.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section style={s.howItWorks}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>How it works</p>
          <h2 style={s.sectionHeadline}>Three steps. That's it.</h2>

          <div style={s.stepsRow} className="landing-steps-row">
            {STEPS.map((step, i) => (
              <div key={step.number} style={s.stepCard}>
                <div style={s.stepNumber}>{step.number}</div>
                <h3 style={s.stepTitle}>{step.title}</h3>
                <p style={s.stepDesc}>{step.desc}</p>
                {i < STEPS.length - 1 && (
                  <div style={s.stepArrow} className="landing-step-arrow" aria-hidden>→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section style={s.faq}>
        <div style={s.sectionInner}>
          <p style={s.sectionEyebrow}>FAQ</p>
          <h2 style={s.sectionHeadline}>Common questions</h2>
          <div style={s.faqList}>
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={item.q} style={s.faqItem}>
                  <button
                    style={s.faqBtn}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    type="button"
                  >
                    <span style={s.faqQ}>{item.q}</span>
                    <span style={isOpen ? { ...s.faqChevron, ...s.faqChevronOpen } : s.faqChevron}>
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && <p style={s.faqA}>{item.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <div style={s.ctaGlow} aria-hidden />
          <h2 style={s.ctaHeadline}>Stop spending hours on marketing. Start in seconds.</h2>
          <p style={s.ctaSub}>Join real estate agents who are already saving time on every listing.</p>
          <div style={s.ctaStack}>
            <Link to="/login" style={s.ctaBtn}>Get Started Free →</Link>
            <p style={s.ctaNoCc}>Start free — includes 3 listings. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <Logo size="sm" />
          <p style={s.footerCopy}>© {new Date().getFullYear()} ListingIgnite. All rights reserved.</p>
          <div style={s.footerLinks}>
            <Link to="/blog" style={s.footerLink}>Blog</Link>
            <Link to="/privacy" style={s.footerLink} target="_blank" rel="noopener noreferrer">Privacy Policy</Link>
            <Link to="/terms" style={s.footerLink} target="_blank" rel="noopener noreferrer">Terms of Service</Link>
            <Link to="/login" style={s.footerLink}>Sign In</Link>
          </div>
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

  // ── Nav
  nav: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    background: 'rgba(12, 12, 18, 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(46, 46, 58, 0.6)',
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
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  brandSparkle: {
    fontSize: '18px',
    color: '#a855f7',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: '-0.3px',
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
    border: 'none',
    borderRadius: '7px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(139,47,232,0.35)',
  },

  // ── Hero
  hero: {
    position: 'relative' as const,
    padding: '100px 24px 120px',
    textAlign: 'center',
    overflow: 'hidden',
  },
  heroInner: {
    maxWidth: '760px',
    margin: '0 auto',
    position: 'relative' as const,
    zIndex: 1,
  },
  heroBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#c084fc',
    marginBottom: '32px',
    letterSpacing: '0.2px',
  },
  heroHeadline: {
    fontSize: '64px',
    fontWeight: '800',
    color: '#f3f4f6',
    lineHeight: '1.08',
    letterSpacing: '-2px',
    margin: '0 0 28px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  heroHeadlineAccent: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '18px',
    color: '#a0a8b8',
    lineHeight: '1.65',
    margin: '0 0 40px',
    maxWidth: '580px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroCta: {
    display: 'inline-block',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 8px 32px rgba(139, 47, 232, 0.45)',
    letterSpacing: '-0.2px',
  },
  ctaStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  },
  heroNoCc: {
    display: 'inline-block',
    padding: '7px 16px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#c084fc',
    margin: 0,
  },
  heroGlow: {
    position: 'absolute' as const,
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse at center, rgba(139,47,232,0.18) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },

  // ── Section shared
  sectionInner: {
    maxWidth: '1120px',
    margin: '0 auto',
    padding: '0 24px',
  },
  sectionEyebrow: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a855f7',
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
    margin: '0 0 12px',
  },
  sectionHeadline: {
    fontSize: '40px',
    fontWeight: '800',
    color: '#f3f4f6',
    letterSpacing: '-1px',
    margin: '0 0 16px',
    lineHeight: '1.1',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  sectionSub: {
    fontSize: '16px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: '0 0 52px',
    maxWidth: '540px',
  },

  // ── Problem
  problem: {
    padding: '60px 24px',
    borderTop: '1px solid #1e1e28',
  },
  problemCard: {
    maxWidth: '760px',
    margin: '0 auto',
    textAlign: 'center',
    background: 'rgba(168, 85, 247, 0.05)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    borderRadius: '20px',
    padding: '56px 48px',
  },
  problemIcon: {
    fontSize: '40px',
    marginBottom: '24px',
    display: 'block',
  },
  problemHeadline: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f3f4f6',
    lineHeight: '1.35',
    letterSpacing: '-0.5px',
    margin: '0 0 20px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  problemAccent: {
    color: '#a855f7',
  },
  problemSub: {
    fontSize: '16px',
    color: '#a0a8b8',
    lineHeight: '1.7',
    margin: 0,
  },

  // ── Features
  features: {
    padding: '72px 24px',
    borderTop: '1px solid #1e1e28',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
  },
  featureCard: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '36px 28px',
  },
  featureIcon: {
    fontSize: '36px',
    marginBottom: '18px',
    display: 'block',
  },
  featureTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.2px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  featureDesc: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.65',
    margin: 0,
  },

  // ── How it works
  howItWorks: {
    padding: '72px 24px',
    borderTop: '1px solid #1e1e28',
  },
  stepsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0',
    position: 'relative' as const,
  },
  stepCard: {
    position: 'relative' as const,
    padding: '36px 32px',
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    margin: '0 10px',
  },
  stepNumber: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#a855f7',
    letterSpacing: '1.5px',
    marginBottom: '14px',
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.2px',
    lineHeight: '1.3',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  stepDesc: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.65',
    margin: 0,
  },
  stepArrow: {
    position: 'absolute' as const,
    right: '-22px',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: '18px',
    color: '#3a3a4a',
    zIndex: 1,
    pointerEvents: 'none',
  },

  // ── FAQ
  faq: {
    padding: '72px 24px',
    borderTop: '1px solid #1e1e28',
  },
  faqList: {
    maxWidth: '760px',
    marginTop: '48px',
    borderTop: '1px solid #2e2e3a',
  },
  faqItem: {
    borderBottom: '1px solid #2e2e3a',
  },
  faqBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '22px 4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    fontFamily: 'inherit',
  },
  faqQ: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f3f4f6',
    lineHeight: '1.4',
    letterSpacing: '-0.2px',
  },
  faqChevron: {
    fontSize: '20px',
    fontWeight: '400',
    color: '#6b7280',
    flexShrink: 0,
    lineHeight: 1,
  },
  faqChevronOpen: {
    color: '#a855f7',
  },
  faqA: {
    fontSize: '15px',
    color: '#a0a8b8',
    lineHeight: '1.7',
    margin: '0 0 22px',
    paddingRight: '40px',
  },

  // ── Final CTA
  cta: {
    padding: '72px 24px',
    borderTop: '1px solid #1e1e28',
  },
  ctaInner: {
    maxWidth: '640px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative' as const,
  },
  ctaGlow: {
    position: 'absolute' as const,
    top: '-40px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '400px',
    height: '200px',
    background: 'radial-gradient(ellipse at center, rgba(139,47,232,0.2) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  ctaHeadline: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f3f4f6',
    letterSpacing: '-1px',
    margin: '0 0 16px',
    lineHeight: '1.2',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    position: 'relative' as const,
    zIndex: 1,
  },
  ctaSub: {
    fontSize: '17px',
    color: '#a0a8b8',
    margin: '0 0 36px',
    lineHeight: '1.6',
    position: 'relative' as const,
    zIndex: 1,
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 8px 32px rgba(139, 47, 232, 0.45)',
    position: 'relative' as const,
    zIndex: 1,
  },
  ctaNoCc: {
    display: 'inline-block',
    padding: '7px 16px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#c084fc',
    margin: 0,
    position: 'relative' as const,
    zIndex: 1,
  },

  // ── Footer
  footer: {
    borderTop: '1px solid #1e1e28',
    padding: '32px 24px',
  },
  footerInner: {
    maxWidth: '1120px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  footerCopy: {
    fontSize: '13px',
    color: '#4b5563',
    margin: 0,
  },
  footerLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
  },
  footerLink: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
  },
}
