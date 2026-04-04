import { Link } from 'react-router-dom'

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
    desc: 'A 60–90 second script with scene directions for Reels, TikTok, or YouTube.',
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
    desc: 'Enter the address, price, features, and anything that makes the property special.',
  },
  {
    number: '02',
    title: 'AI generates everything',
    desc: 'In under 30 seconds, Claude produces all 6 formats in a single request — no waiting, no prompting.',
  },
  {
    number: '03',
    title: 'Copy and use instantly',
    desc: 'Highlight any section and paste directly into your MLS, email tool, or social platform.',
  },
]

export default function Landing() {
  return (
    <div style={s.page}>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand}>
            <span style={s.brandSparkle}>✦</span>
            <span style={s.brandName}>ListingIgnite</span>
          </div>
          <Link to="/login" style={s.navSignIn}>Sign In</Link>
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
          <Link to="/login" style={s.heroCta}>Get Started Free →</Link>
          <p style={s.heroNoCc}>No credit card required · 3 free listings included</p>
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
                {i < STEPS.length - 1 && <div style={s.stepArrow} aria-hidden>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────── */}
      <section style={s.cta}>
        <div style={s.ctaInner}>
          <div style={s.ctaGlow} aria-hidden />
          <h2 style={s.ctaHeadline}>Ready to get your first listing done in seconds?</h2>
          <p style={s.ctaSub}>Start for free. No credit card required.</p>
          <Link to="/login" style={s.ctaBtn}>Get Started Free →</Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer style={s.footer}>
        <div style={s.footerInner}>
          <div style={s.footerBrand}>
            <span style={s.brandSparkle}>✦</span>
            <span style={s.brandName}>ListingIgnite</span>
          </div>
          <p style={s.footerCopy}>© {new Date().getFullYear()} ListingIgnite. All rights reserved.</p>
          <Link to="/login" style={s.footerLink}>Sign In</Link>
        </div>
      </footer>

    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #0f0f14 0%, #150e1f 60%, #0f0f14 100%)',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    color: '#f3f4f6',
    overflowX: 'hidden',
  },

  // ── Nav
  nav: {
    position: 'sticky' as const,
    top: 0,
    zIndex: 100,
    background: 'rgba(15, 15, 20, 0.85)',
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
  navSignIn: {
    padding: '8px 20px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#d1d5db',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    transition: 'border-color 0.15s',
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
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  heroHeadlineAccent: {
    background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    fontSize: '18px',
    color: '#9ca3af',
    lineHeight: '1.65',
    margin: '0 0 40px',
    maxWidth: '580px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  heroCta: {
    display: 'inline-block',
    padding: '16px 36px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.45)',
    letterSpacing: '-0.2px',
  },
  heroNoCc: {
    fontSize: '13px',
    color: '#4b5563',
    margin: '16px 0 0',
  },
  heroGlow: {
    position: 'absolute' as const,
    top: '10%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '400px',
    background: 'radial-gradient(ellipse at center, rgba(147,51,234,0.18) 0%, transparent 70%)',
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
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  sectionSub: {
    fontSize: '16px',
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 52px',
    maxWidth: '540px',
  },

  // ── Problem
  problem: {
    padding: '80px 24px',
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
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  problemAccent: {
    color: '#a855f7',
  },
  problemSub: {
    fontSize: '16px',
    color: '#9ca3af',
    lineHeight: '1.7',
    margin: 0,
  },

  // ── Features
  features: {
    padding: '96px 24px',
    borderTop: '1px solid #1e1e28',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
  featureCard: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    padding: '28px 24px',
  },
  featureIcon: {
    fontSize: '28px',
    marginBottom: '14px',
    display: 'block',
  },
  featureTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 8px',
    letterSpacing: '-0.2px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  featureDesc: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: 0,
  },

  // ── How it works
  howItWorks: {
    padding: '96px 24px',
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
    background: '#1c1c24',
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
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
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

  // ── Final CTA
  cta: {
    padding: '96px 24px',
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
    background: 'radial-gradient(ellipse at center, rgba(147,51,234,0.2) 0%, transparent 70%)',
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
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    position: 'relative' as const,
    zIndex: 1,
  },
  ctaSub: {
    fontSize: '16px',
    color: '#6b7280',
    margin: '0 0 36px',
    position: 'relative' as const,
    zIndex: 1,
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '16px 40px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.45)',
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
  footerLink: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
  },
}
