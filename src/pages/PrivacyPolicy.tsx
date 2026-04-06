import { Link } from 'react-router-dom'
import { useEffect } from 'react'

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Privacy Policy — ListingIgnite'
    window.scrollTo(0, 0)
  }, [])

  return (
    <div style={s.page}>
      <div style={s.container}>

        <Link to="/" style={s.backLink}>← Back to Home</Link>

        <header style={s.header}>
          <div style={s.sparkle}>✦</div>
          <h1 style={s.pageTitle}>Privacy Policy</h1>
          <p style={s.lastUpdated}>Last Updated: April 5, 2026</p>
          <p style={s.disclaimer}>
            Note: This privacy policy was prepared using AI assistance and has not been reviewed by a licensed attorney.
            We recommend consulting legal counsel before scaling to a large user base.
          </p>
        </header>

        <div style={s.body}>

          <Section title="1. Introduction">
            <p>ListingIgnite ("we," "us," or "our") operates listingignite.com. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>
          </Section>

          <Section title="2. Information We Collect">
            <ul style={s.list}>
              <li><strong style={s.strong}>Account Information:</strong> When you sign up via Google OAuth or email/password, we collect your name and email address</li>
              <li><strong style={s.strong}>Listing Data:</strong> Property details, descriptions, and images you submit to generate marketing content</li>
              <li><strong style={s.strong}>Generated Content:</strong> The AI-generated marketing outputs we create for your listings</li>
              <li><strong style={s.strong}>Usage Data:</strong> Credits used, login timestamps, and general app activity</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul style={s.list}>
              <li>To provide and improve the ListingIgnite service</li>
              <li>To generate AI-powered marketing content from your listing data</li>
              <li>To send transactional emails related to your account</li>
              <li>To send product updates and marketing communications to users who have opted in</li>
              <li>To track credit usage and manage your account</li>
            </ul>
          </Section>

          <Section title="4. Data Storage">
            <p>Your data is stored securely using Supabase (PostgreSQL database) and Supabase Storage for images. All data is encrypted in transit via HTTPS.</p>
          </Section>

          <Section title="5. Third-Party Services">
            <p>We use the following third-party services:</p>
            <ul style={s.list}>
              <li><strong style={s.strong}>Supabase</strong> — database, authentication, and file storage</li>
              <li><strong style={s.strong}>Anthropic</strong> — AI content generation (your listing data is sent to Anthropic's API to generate marketing content)</li>
              <li><strong style={s.strong}>Vercel</strong> — website hosting</li>
              <li><strong style={s.strong}>Resend</strong> — transactional and notification emails</li>
              <li><strong style={s.strong}>Google</strong> — OAuth authentication (if you sign in with Google)</li>
            </ul>
          </Section>

          <Section title="6. Data Sharing">
            <p>We do not sell your personal data. We only share data with the third-party services listed above as necessary to provide the service.</p>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain your data for as long as your account is active. You may request deletion of your account and associated data by contacting us at <a href="mailto:jason@listingignite.com" style={s.link}>jason@listingignite.com</a>.</p>
          </Section>

          <Section title="8. Your Rights">
            <p>You have the right to access, correct, or delete your personal data. Contact us at <a href="mailto:jason@listingignite.com" style={s.link}>jason@listingignite.com</a> for any data requests.</p>
          </Section>

          <Section title="9. Cookies">
            <p>We use essential cookies to maintain your login session. We do not use advertising or tracking cookies.</p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>ListingIgnite is not intended for users under 18 years of age. We do not knowingly collect data from minors.</p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>We may update this Privacy Policy from time to time. We will notify users of significant changes via email or an in-app notice.</p>
          </Section>

          <Section title="12. Contact" last>
            <p>For privacy-related questions, contact us at <a href="mailto:jason@listingignite.com" style={s.link}>jason@listingignite.com</a>.</p>
          </Section>

        </div>
      </div>
    </div>
  )
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section style={last ? { ...s.section, borderBottom: 'none', marginBottom: 0, paddingBottom: 0 } : s.section}>
      <h2 style={s.sectionTitle}>{title}</h2>
      <div style={s.sectionBody}>{children}</div>
    </section>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    padding: '48px 24px 80px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  container: {
    maxWidth: '760px',
    margin: '0 auto',
  },
  backLink: {
    display: 'inline-block',
    color: '#a855f7',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    marginBottom: '36px',
  },
  header: {
    marginBottom: '48px',
    paddingBottom: '36px',
    borderBottom: '1px solid #2e2e3a',
  },
  sparkle: {
    fontSize: '28px',
    color: '#a855f7',
    marginBottom: '16px',
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f3f4f6',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  lastUpdated: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 16px',
  },
  disclaimer: {
    fontSize: '13px',
    color: '#6b7280',
    background: 'rgba(168, 85, 247, 0.06)',
    border: '1px solid rgba(168, 85, 247, 0.15)',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: 0,
    lineHeight: '1.6',
    fontStyle: 'italic',
  },
  body: {},
  section: {
    marginBottom: '36px',
    paddingBottom: '36px',
    borderBottom: '1px solid #1e1e28',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#e5e7eb',
    margin: '0 0 12px',
    letterSpacing: '-0.2px',
  },
  sectionBody: {
    fontSize: '15px',
    color: '#a0a8b8',
    lineHeight: '1.7',
  },
  list: {
    margin: '0',
    paddingLeft: '20px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  strong: {
    color: '#d1d5db',
    fontWeight: '600',
  },
  link: {
    color: '#a855f7',
    textDecoration: 'none',
  },
}
