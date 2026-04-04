import { useState } from 'react'
import type { GeneratedOutputs } from '../lib/generateContent'

interface Props {
  outputs: GeneratedOutputs
  noTopMargin?: boolean
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

export default function GeneratedOutput({ outputs, noTopMargin }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('mls')

  return (
    <div style={noTopMargin ? { ...s.wrapper, marginTop: 0 } : s.wrapper}>
      <div className="output-header">
        <span style={s.sparkle}>✦</span>
        <div>
          <h2 style={s.heading}>Your Marketing Content is Ready</h2>
          <p style={s.subheading}>6 formats generated — click any tab to view.</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="output-tab-bar">
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
      <div className="output-body">

        <p style={s.selectTip}>✦ Highlight any text below to copy it into your marketing tools.</p>

        {activeTab === 'mls' && (
          <Section
            title="MLS Description"
            hint="Ready to paste into your MLS system."
            content={outputs.mls_description}
          />
        )}

        {activeTab === 'social' && (
          <div>
            <Section
              title="Facebook"
              hint="Conversational and engaging — ideal for Facebook posts and boosted ads."
              content={outputs.social_facebook}
            />
            <Section
              title="Instagram"
              hint="Punchy caption with hashtags — paste directly into Instagram."
              content={outputs.social_instagram}
            />
            <Section
              title="X (Twitter)"
              hint="Under 280 characters — ready to post."
              content={outputs.social_x}
            />
          </div>
        )}

        {activeTab === 'email' && (
          <Section
            title="Email Blast"
            hint="Subject line on the first line. Paste into Mailchimp, Constant Contact, or your email tool."
            content={outputs.email_blast}
          />
        )}

        {activeTab === 'flyer' && (
          <Section
            title="Flyer Copy"
            hint="Headline, bullet points, and CTA — drop into Canva or your design tool."
            content={outputs.flyer_copy}
          />
        )}

        {activeTab === 'video' && (
          <Section
            title="Video Script"
            hint="60–90 second script with scene directions. Suitable for Reels, TikTok, or YouTube."
            content={outputs.video_script}
          />
        )}

        {activeTab === 'seo' && (
          <Section
            title="SEO Landing Page"
            hint="Headline, subheadline, body copy, and CTA — paste into your property page builder."
            content={outputs.seo_landing_page}
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
}

function Section({ title, hint, content }: SectionProps) {
  return (
    <div style={ss.section}>
      <div style={ss.sectionHeader}>
        <h3 style={ss.title}>{title}</h3>
        <p style={ss.hint}>{hint}</p>
      </div>
      <div style={ss.content}>
        {content.split('\n').flatMap((line, i, arr) =>
          i < arr.length - 1 ? [line, <br key={i} />] : [line]
        )}
      </div>
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
  header: {},  // layout handled by .output-header CSS class
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
  tabBar: {},  // layout handled by .output-tab-bar CSS class
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
  body: {},  // layout handled by .output-body CSS class
  selectTip: {
    fontSize: '14px',
    color: '#a855f7',
    margin: '0 0 20px',
    fontStyle: 'italic',
    fontWeight: '400',
  },
}

const ss: Record<string, React.CSSProperties> = {
  section: {
    marginBottom: '28px',
    paddingBottom: '28px',
    borderBottom: '1px solid #2e2e3a',
    textAlign: 'left',
  },
  sectionHeader: {
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
  content: {
    background: '#13131a',
    border: '1px solid #2e2e3a',
    borderRadius: '8px',
    padding: '16px 20px',
    color: '#d1d5db',
    fontSize: '14px',
    lineHeight: '1.7',
    wordBreak: 'break-word',
    textAlign: 'left',
    margin: 0,
    fontFamily: 'inherit',
    overflowX: 'auto',
  },
}
