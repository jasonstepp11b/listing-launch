import { useState } from 'react'
import type { GeneratedOutputs } from '../lib/generateContent'

interface Props {
  outputs: GeneratedOutputs
}

type TabKey = 'mls' | 'social' | 'email' | 'flyer' | 'video' | 'seo'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'mls',    label: 'MLS Description' },
  { key: 'social', label: 'Social Media' },
  { key: 'email',  label: 'Email Blast' },
  { key: 'flyer',  label: 'Flyer Copy' },
  { key: 'video',  label: 'Video Script' },
  { key: 'seo',    label: 'SEO Landing Page' },
]

export default function GeneratedOutput({ outputs }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('mls')
  const [copied, setCopied] = useState<Record<string, boolean>>({})

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopied(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setCopied(prev => ({ ...prev, [key]: false })), 2000)
  }

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.sparkle}>✦</span>
        <div>
          <h2 style={s.heading}>Your Marketing Content is Ready</h2>
          <p style={s.subheading}>6 formats generated — click any tab to view and copy.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            style={activeTab === tab.key ? { ...s.tab, ...s.tabActive } : s.tab}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={s.body}>

        {activeTab === 'mls' && (
          <Section
            title="MLS Description"
            hint="Ready to paste into your MLS system."
            content={outputs.mls_description}
            copyKey="mls"
            copied={!!copied['mls']}
            onCopy={() => copy('mls', outputs.mls_description)}
          />
        )}

        {activeTab === 'social' && (
          <div>
            <Section
              title="Facebook"
              hint="Conversational and engaging — ideal for Facebook posts and boosted ads."
              content={outputs.social_facebook}
              copyKey="facebook"
              copied={!!copied['facebook']}
              onCopy={() => copy('facebook', outputs.social_facebook)}
            />
            <Section
              title="Instagram"
              hint="Punchy caption with hashtags — paste directly into Instagram."
              content={outputs.social_instagram}
              copyKey="instagram"
              copied={!!copied['instagram']}
              onCopy={() => copy('instagram', outputs.social_instagram)}
            />
            <Section
              title="X (Twitter)"
              hint="Under 280 characters — ready to post."
              content={outputs.social_x}
              copyKey="x"
              copied={!!copied['x']}
              onCopy={() => copy('x', outputs.social_x)}
            />
          </div>
        )}

        {activeTab === 'email' && (
          <Section
            title="Email Blast"
            hint="Subject line on the first line. Paste into Mailchimp, Constant Contact, or your email tool."
            content={outputs.email_blast}
            copyKey="email"
            copied={!!copied['email']}
            onCopy={() => copy('email', outputs.email_blast)}
          />
        )}

        {activeTab === 'flyer' && (
          <Section
            title="Flyer Copy"
            hint="Headline, bullet points, and CTA — drop into Canva or your design tool."
            content={outputs.flyer_copy}
            copyKey="flyer"
            copied={!!copied['flyer']}
            onCopy={() => copy('flyer', outputs.flyer_copy)}
          />
        )}

        {activeTab === 'video' && (
          <Section
            title="Video Script"
            hint="60–90 second script with scene directions. Suitable for Reels, TikTok, or YouTube."
            content={outputs.video_script}
            copyKey="video"
            copied={!!copied['video']}
            onCopy={() => copy('video', outputs.video_script)}
          />
        )}

        {activeTab === 'seo' && (
          <Section
            title="SEO Landing Page"
            hint="Headline, subheadline, body copy, and CTA — paste into your property page builder."
            content={outputs.seo_landing_page}
            copyKey="seo"
            copied={!!copied['seo']}
            onCopy={() => copy('seo', outputs.seo_landing_page)}
          />
        )}

      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  hint: string
  content: string
  copyKey: string
  copied: boolean
  onCopy: () => void
}

function Section({ title, hint, content, copied, onCopy }: SectionProps) {
  return (
    <div style={ss.section}>
      <div style={ss.sectionHeader}>
        <div>
          <h3 style={ss.title}>{title}</h3>
          <p style={ss.hint}>{hint}</p>
        </div>
        <button
          style={copied ? { ...ss.copyBtn, ...ss.copyBtnDone } : ss.copyBtn}
          onClick={onCopy}
        >
          {copied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={ss.content}>{content}</pre>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    overflow: 'hidden',
    marginTop: '40px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '28px 32px 24px',
    borderBottom: '1px solid #2e2e3a',
    background: 'linear-gradient(135deg, rgba(147,51,234,0.12) 0%, rgba(124,58,237,0.06) 100%)',
  },
  sparkle: {
    fontSize: '28px',
    color: '#a855f7',
    flexShrink: 0,
  },
  heading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 4px',
    letterSpacing: '-0.3px',
  },
  subheading: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  tabBar: {
    display: 'flex',
    overflowX: 'auto',
    borderBottom: '1px solid #2e2e3a',
    background: '#16161e',
    padding: '0 32px',
    gap: '0',
  },
  tab: {
    padding: '14px 18px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 0.15s',
    fontFamily: 'inherit',
  },
  tabActive: {
    color: '#a855f7',
    borderBottomColor: '#a855f7',
  },
  body: {
    padding: '28px 32px',
  },
}

const ss: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '28px',
    paddingBottom: '28px',
    borderBottom: '1px solid #2e2e3a',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '12px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: '0 0 3px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  hint: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0,
  },
  copyBtn: {
    flexShrink: 0,
    padding: '7px 16px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'inherit',
  },
  copyBtnDone: {
    borderColor: '#a855f7',
    color: '#a855f7',
    background: 'rgba(168, 85, 247, 0.08)',
  },
  content: {
    background: '#13131a',
    border: '1px solid #2e2e3a',
    borderRadius: '8px',
    padding: '16px 20px',
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.7',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    margin: 0,
    fontFamily: 'inherit',
    overflowX: 'auto',
  },
}
