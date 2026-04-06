/**
 * STYLE GUIDE — DEV ONLY
 *
 * This page is a living reference for the ListingIgnite design system.
 * It is not linked from any navigation and is intended for development use only.
 * Route: /style-guide
 */

import { useEffect } from 'react'

export default function StyleGuide() {
  useEffect(() => {
    document.title = 'Style Guide — ListingIgnite (Dev Only)'
  }, [])

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.devBanner}>
          ⚠️ DEV ONLY — This page is not linked in production. Route: /style-guide
        </div>

        <h1 style={s.pageTitle}>ListingIgnite Design System</h1>
        <p style={s.pageSubtitle}>
          Living reference for colors, typography, components, and spacing used throughout the app.
          Do not ship UI changes that deviate from these tokens without updating this guide.
        </p>

        <hr style={s.rule} />

        {/* ── COLORS ─────────────────────────────────────────────── */}
        <Section title="Colors">

          <SubSection title="Backgrounds">
            <SwatchRow>
              <Swatch bg="#0c0c12" label="#0c0c12" desc="Page background (dark)" light />
              <Swatch bg="#150e1f" label="#150e1f" desc="Landing bg (purple-tint)" light />
              <Swatch bg="#1a1025" label="#1a1025" desc="Page bg variant" light />
              <Swatch bg="#1a1a22" label="#1a1a22" desc="Card / surface" light />
              <Swatch bg="#13131a" label="#13131a" desc="Input background" light />
              <Swatch bg="#16161e" label="#16161e" desc="Hover surface" light />
            </SwatchRow>
          </SubSection>

          <SubSection title="Purple Accent (Brand)">
            <SwatchRow>
              <Swatch bg="#8b2fe8" label="#8b2fe8" desc="Accent primary" light />
              <Swatch bg="#7c3aed" label="#7c3aed" desc="Accent dark" light />
              <Swatch bg="#a855f7" label="#a855f7" desc="Accent light" light />
              <Swatch bg="#c084fc" label="#c084fc" desc="Accent muted" light />
              <Swatch bg="rgba(168,85,247,0.15)" label="rgba(168,85,247,0.15)" desc="Purple tint" light />
              <Swatch bg="rgba(168,85,247,0.08)" label="rgba(168,85,247,0.08)" desc="Purple subtle" light />
            </SwatchRow>
          </SubSection>

          <SubSection title="Text">
            <SwatchRow>
              <Swatch bg="#f3f4f6" label="#f3f4f6" desc="Primary text" />
              <Swatch bg="#e5e7eb" label="#e5e7eb" desc="Secondary text" />
              <Swatch bg="#d1d5db" label="#d1d5db" desc="Label text" />
              <Swatch bg="#a0a8b8" label="#a0a8b8" desc="Muted text" />
              <Swatch bg="#6b7280" label="#6b7280" desc="Placeholder / hint" />
              <Swatch bg="#4b5563" label="#4b5563" desc="Disabled / fine print" />
            </SwatchRow>
          </SubSection>

          <SubSection title="Borders">
            <SwatchRow>
              <Swatch bg="#2e2e3a" label="#2e2e3a" desc="Primary border" light />
              <Swatch bg="#3a3a4a" label="#3a3a4a" desc="Input border" light />
              <Swatch bg="#1e1e28" label="#1e1e28" desc="Section divider" light />
              <Swatch bg="rgba(168,85,247,0.35)" label="rgba(168,85,247,0.35)" desc="Purple border" light />
              <Swatch bg="rgba(168,85,247,0.2)" label="rgba(168,85,247,0.2)" desc="Purple border subtle" light />
            </SwatchRow>
          </SubSection>

          <SubSection title="Semantic — Status">
            <SwatchRow>
              <Swatch bg="rgba(34,197,94,0.1)" label="Success bg" desc="Active / success bg" light border="rgba(34,197,94,0.3)" />
              <Swatch bg="#86efac" label="#86efac" desc="Success text (green)" />
              <Swatch bg="rgba(234,179,8,0.12)" label="Sold bg" desc="Sold bg" light border="rgba(234,179,8,0.35)" />
              <Swatch bg="#fde047" label="#fde047" desc="Sold text (gold)" />
              <Swatch bg="rgba(75,85,99,0.2)" label="Inactive bg" desc="Inactive bg" light border="#3a3a4a" />
              <Swatch bg="#a0a8b8" label="#a0a8b8" desc="Inactive text (grey)" />
            </SwatchRow>
            <SwatchRow>
              <Swatch bg="rgba(239,68,68,0.1)" label="Error bg" desc="Error / danger bg" light border="rgba(239,68,68,0.3)" />
              <Swatch bg="#fca5a5" label="#fca5a5" desc="Error text (red)" />
              <Swatch bg="rgba(251,191,36,0.08)" label="Warning bg" desc="Warning / fallback bg" light border="rgba(251,191,36,0.2)" />
              <Swatch bg="#fbbf24" label="#fbbf24" desc="Warning text (amber)" />
            </SwatchRow>
          </SubSection>

          <SubSection title="Gradients">
            <div style={s.gradientGrid}>
              <GradientSwatch gradient="linear-gradient(135deg, #8b2fe8, #7c3aed)" label="Primary CTA button" />
              <GradientSwatch gradient="linear-gradient(90deg, #8b2fe8, #a855f7)" label="Progress bar" />
              <GradientSwatch gradient="linear-gradient(135deg, #a855f7, #7c3aed)" label="Text accent (hero)" />
              <GradientSwatch gradient="linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)" label="Page background" />
              <GradientSwatch gradient="linear-gradient(135deg, rgba(139,47,232,0.12) 0%, rgba(124,58,237,0.06) 100%)" label="Paywall / highlight bg" />
              <GradientSwatch gradient="radial-gradient(ellipse at center, rgba(139,47,232,0.2) 0%, transparent 70%)" label="Decorative glow" />
            </div>
          </SubSection>
        </Section>

        {/* ── TYPOGRAPHY ─────────────────────────────────────────── */}
        <Section title="Typography">
          <p style={s.tokenNote}>Font family: <code style={s.code}>'Plus Jakarta Sans', system-ui, sans-serif</code></p>

          <SubSection title="Headings">
            <div style={s.typeStack}>
              <TypeRow label="Hero / Display" size="64px" weight="800" tracking="-2px" lh="1.08">
                <span style={{ fontSize: '64px', fontWeight: '800', letterSpacing: '-2px', lineHeight: '1.08', color: '#f3f4f6' }}>The Quick Brown Fox</span>
              </TypeRow>
              <TypeRow label="H1 / Page Title" size="36–40px" weight="800" tracking="-1px" lh="1.1">
                <span style={{ fontSize: '36px', fontWeight: '800', letterSpacing: '-1px', lineHeight: '1.1', color: '#f3f4f6' }}>Page Title Heading</span>
              </TypeRow>
              <TypeRow label="H2 / Section" size="28px" weight="700" tracking="-0.5px" lh="1.35">
                <span style={{ fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', lineHeight: '1.35', color: '#f3f4f6' }}>Section Heading</span>
              </TypeRow>
              <TypeRow label="H3 / Card Title" size="20px" weight="700" tracking="-0.3px" lh="1.4">
                <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px', color: '#f3f4f6' }}>Card Title</span>
              </TypeRow>
              <TypeRow label="H4 / Subsection" size="16px" weight="700" tracking="-0.2px" lh="1.4">
                <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.2px', color: '#f3f4f6' }}>Subsection Heading</span>
              </TypeRow>
            </div>
          </SubSection>

          <SubSection title="Body & UI Text">
            <div style={s.typeStack}>
              <TypeRow label="Body Large" size="18px" weight="400" tracking="0" lh="1.65">
                <span style={{ fontSize: '18px', color: '#a0a8b8', lineHeight: '1.65' }}>The quick brown fox jumps over the lazy dog. Used for hero subtext and intro copy.</span>
              </TypeRow>
              <TypeRow label="Body Default" size="15px" weight="400" tracking="0" lh="1.7">
                <span style={{ fontSize: '15px', color: '#a0a8b8', lineHeight: '1.7' }}>The quick brown fox jumps over the lazy dog. Standard body copy for cards, descriptions, and paragraphs.</span>
              </TypeRow>
              <TypeRow label="Body Small" size="14px" weight="400" tracking="0" lh="1.65">
                <span style={{ fontSize: '14px', color: '#a0a8b8', lineHeight: '1.65' }}>The quick brown fox jumps over the lazy dog. Used in output content areas and secondary descriptions.</span>
              </TypeRow>
              <TypeRow label="Small / Hint" size="13px" weight="400" tracking="0" lh="1.6">
                <span style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>Helper text, fine print, timestamps, and secondary metadata.</span>
              </TypeRow>
              <TypeRow label="Micro / Note" size="12px" weight="400" tracking="0" lh="1.5">
                <span style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.5' }}>Micro text — copyright notices, required field markers, footnotes.</span>
              </TypeRow>
              <TypeRow label="Label (uppercase)" size="12px" weight="600" tracking="0.5px" lh="1">
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Form Label / Section Eyebrow</span>
              </TypeRow>
              <TypeRow label="Eyebrow (purple)" size="12px" weight="600" tracking="1px" lh="1">
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '1px' }}>What you get</span>
              </TypeRow>
            </div>
          </SubSection>
        </Section>

        {/* ── BUTTONS ────────────────────────────────────────────── */}
        <Section title="Buttons">
          <SubSection title="Variants">
            <div style={s.buttonRow}>
              <div style={s.buttonGroup}>
                <button style={btn.primary}>Get Started Free →</button>
                <span style={s.variantLabel}>Primary</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.secondary}>Save Changes</button>
                <span style={s.variantLabel}>Secondary</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.outline}>Cancel</button>
                <span style={s.variantLabel}>Outline</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.ghost}>Copy</button>
                <span style={s.variantLabel}>Ghost</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.destructive}>Delete</button>
                <span style={s.variantLabel}>Destructive</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.disabled} disabled>No Credits</button>
                <span style={s.variantLabel}>Disabled</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.comingSoon} disabled>Coming Soon</button>
                <span style={s.variantLabel}>Coming Soon</span>
              </div>
            </div>
          </SubSection>

          <SubSection title="Sizes">
            <div style={s.buttonRow}>
              <div style={s.buttonGroup}>
                <button style={btn.primaryLg}>Large CTA →</button>
                <span style={s.variantLabel}>Large (16px / 16px 40px)</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.primary}>Default (15px / 13px 24px)</button>
                <span style={s.variantLabel}>Default</span>
              </div>
              <div style={s.buttonGroup}>
                <button style={btn.sm}>Small (13px / 9px 20px)</button>
                <span style={s.variantLabel}>Small</span>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── CARDS ──────────────────────────────────────────────── */}
        <Section title="Cards">
          <div style={s.cardGrid}>

            <div>
              <div style={card.standard}>
                <h3 style={card.title}>Standard Card</h3>
                <p style={card.body}>bg: #1a1a22 · border: #2e2e3a · radius: 14px · padding: 24px</p>
              </div>
              <span style={s.variantLabel}>Standard (used in dashboard, detail pages)</span>
            </div>

            <div>
              <div style={card.section}>
                <h3 style={card.title}>Section Card</h3>
                <p style={card.body}>bg: #1a1a22 · border: #2e2e3a · radius: 16px · padding: 28px 32px</p>
              </div>
              <span style={s.variantLabel}>Section / Profile card</span>
            </div>

            <div>
              <div style={card.purple}>
                <h3 style={card.title}>Purple Highlight Card</h3>
                <p style={card.body}>bg: rgba(168,85,247,0.05) · border: rgba(168,85,247,0.15) · radius: 20px</p>
              </div>
              <span style={s.variantLabel}>Problem / paywall card</span>
            </div>

            <div>
              <div style={card.feature}>
                <div style={{ fontSize: '36px', marginBottom: '18px' }}>📋</div>
                <h3 style={card.title}>Feature Card</h3>
                <p style={card.body}>bg: #1a1a22 · border: #2e2e3a · radius: 16px · padding: 36px 28px</p>
              </div>
              <span style={s.variantLabel}>Landing page feature card</span>
            </div>

          </div>
        </Section>

        {/* ── BADGES ─────────────────────────────────────────────── */}
        <Section title="Badges">
          <SubSection title="Status Badges">
            <div style={s.badgeRow}>
              <div style={s.badgeGroup}>
                <div style={badge.active}>Active</div>
                <span style={s.variantLabel}>Active</span>
              </div>
              <div style={s.badgeGroup}>
                <div style={badge.sold}>🎉 Sold</div>
                <span style={s.variantLabel}>Sold</span>
              </div>
              <div style={s.badgeGroup}>
                <div style={badge.inactive}>Inactive</div>
                <span style={s.variantLabel}>Inactive</span>
              </div>
            </div>
          </SubSection>

          <SubSection title="Property Type Badge">
            <div style={s.badgeRow}>
              <div style={s.badgeGroup}>
                <div style={badge.propType}>Single Family</div>
                <span style={s.variantLabel}>Property type</span>
              </div>
              <div style={s.badgeGroup}>
                <div style={badge.propType}>Condo</div>
                <span style={s.variantLabel}>Property type</span>
              </div>
            </div>
          </SubSection>

          <SubSection title="UI Badges">
            <div style={s.badgeRow}>
              <div style={s.badgeGroup}>
                <div style={badge.heroBadge}>✦ AI-powered marketing</div>
                <span style={s.variantLabel}>Hero badge</span>
              </div>
              <div style={s.badgeGroup}>
                <div style={badge.noCcBadge}>Start free — includes 3 listings</div>
                <span style={s.variantLabel}>Free credits callout</span>
              </div>
              <div style={s.badgeGroup}>
                <div style={badge.creditBadge}>3 credits remaining</div>
                <span style={s.variantLabel}>Credit badge (positive)</span>
              </div>
              <div style={s.badgeGroup}>
                <div style={badge.creditBadgeEmpty}>0 credits remaining</div>
                <span style={s.variantLabel}>Credit badge (empty)</span>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* ── FORM ELEMENTS ──────────────────────────────────────── */}
        <Section title="Form Elements">
          <div style={s.formGrid}>

            <div style={s.formField}>
              <label style={form.label}>Text Input</label>
              <input style={form.input} type="text" placeholder="e.g. 123 Main Street" readOnly />
            </div>

            <div style={s.formField}>
              <label style={form.label}>Email Input</label>
              <input style={form.input} type="email" placeholder="you@example.com" readOnly />
            </div>

            <div style={s.formField}>
              <label style={form.label}>Disabled Input</label>
              <input style={{ ...form.input, opacity: 0.5, cursor: 'not-allowed' }} type="text" placeholder="Disabled" disabled readOnly />
            </div>

            <div style={s.formField}>
              <label style={form.label}>Select / Dropdown</label>
              <select style={form.select}>
                <option>Single Family</option>
                <option>Condo</option>
                <option>Townhouse</option>
              </select>
            </div>

            <div style={{ ...s.formField, gridColumn: '1 / -1' }}>
              <label style={form.label}>Textarea</label>
              <textarea style={form.textarea} placeholder="Enter additional notes or highlights about this property…" rows={4} readOnly />
            </div>

            <div style={{ ...s.formField, gridColumn: '1 / -1' }}>
              <label style={form.label}>Tag / Feature Multi-Select</label>
              <div style={form.tagContainer}>
                {['Pool', 'Garage', 'Renovated Kitchen', 'Waterfront', 'Mountain View'].map(tag => (
                  <div key={tag} style={form.tagActive}>{tag} ✕</div>
                ))}
                {['Fireplace', 'Smart Home'].map(tag => (
                  <div key={tag} style={form.tagInactive}>{tag}</div>
                ))}
              </div>
            </div>

          </div>
        </Section>

        {/* ── SPACING ────────────────────────────────────────────── */}
        <Section title="Spacing Scale">
          <p style={s.tokenNote}>All spacing values used in the app. Pixel-based, no design tokens library — use these values consistently.</p>
          <div style={s.spacingGrid}>
            {[4, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 80, 96].map(n => (
              <div key={n} style={s.spacingRow}>
                <div style={{ ...s.spacingBar, width: `${Math.min(n * 2.5, 240)}px` }} />
                <span style={s.spacingLabel}>{n}px</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── BORDER RADIUS ──────────────────────────────────────── */}
        <Section title="Border Radius">
          <div style={s.radiusGrid}>
            {[
              { r: '3px',  use: 'kbd / inline elements' },
              { r: '6px',  use: 'Chips / small tags' },
              { r: '7px',  use: 'Small buttons' },
              { r: '8px',  use: 'Buttons, inputs' },
              { r: '10px', use: 'Medium cards, modal inner' },
              { r: '12px', use: 'FAQ items, medium cards' },
              { r: '14px', use: 'Standard card' },
              { r: '16px', use: 'Large cards, feature cards' },
              { r: '20px', use: 'Highlight card, pills/badges' },
              { r: '50%',  use: 'Avatar / circle elements' },
            ].map(({ r, use }) => (
              <div key={r} style={s.radiusItem}>
                <div style={{ width: '64px', height: '64px', background: '#2e2e3a', border: '1px solid #3a3a4a', borderRadius: r }} />
                <span style={s.radiusLabel}>{r}</span>
                <span style={s.radiusUse}>{use}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── SHADOWS ────────────────────────────────────────────── */}
        <Section title="Shadows & Elevation">
          <div style={s.shadowGrid}>
            {[
              { shadow: '0 4px 14px rgba(139,47,232,0.4)',  label: 'Button shadow (purple)' },
              { shadow: '0 8px 32px rgba(139,47,232,0.45)', label: 'CTA button shadow (large)' },
              { shadow: '0 24px 48px rgba(0,0,0,0.4)',      label: 'Card / modal shadow' },
              { shadow: '0 24px 64px rgba(0,0,0,0.6)',      label: 'Modal shadow (heavy)' },
            ].map(({ shadow, label }) => (
              <div key={label} style={s.shadowItem}>
                <div style={{ width: '120px', height: '60px', background: '#1a1a22', borderRadius: '12px', boxShadow: shadow }} />
                <span style={s.radiusLabel}>{label}</span>
                <code style={s.shadowCode}>{shadow}</code>
              </div>
            ))}
          </div>
        </Section>

        <div style={s.footer}>
          <p>ListingIgnite Style Guide · Dev Only · /style-guide</p>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={s.section}>
      <h2 style={s.sectionTitle}>{title}</h2>
      {children}
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={s.subSection}>
      <h3 style={s.subSectionTitle}>{title}</h3>
      {children}
    </div>
  )
}

function SwatchRow({ children }: { children: React.ReactNode }) {
  return <div style={s.swatchRow}>{children}</div>
}

function Swatch({ bg, label, desc, light, border }: { bg: string; label: string; desc: string; light?: boolean; border?: string }) {
  return (
    <div style={s.swatch}>
      <div style={{ width: '100%', height: '64px', background: bg, borderRadius: '8px', border: `1px solid ${border ?? (light ? '#3a3a4a' : 'rgba(255,255,255,0.08)')}` }} />
      <code style={s.swatchLabel}>{label}</code>
      <span style={s.swatchDesc}>{desc}</span>
    </div>
  )
}

function GradientSwatch({ gradient, label }: { gradient: string; label: string }) {
  return (
    <div style={s.gradientItem}>
      <div style={{ height: '48px', borderRadius: '8px', background: gradient, border: '1px solid #3a3a4a' }} />
      <span style={s.swatchDesc}>{label}</span>
      <code style={{ ...s.swatchLabel, wordBreak: 'break-all' as const }}>{gradient}</code>
    </div>
  )
}

function TypeRow({ label, size, weight, tracking, lh, children }: {
  label: string; size: string; weight: string; tracking: string; lh: string; children: React.ReactNode
}) {
  return (
    <div style={s.typeRow}>
      <div style={s.typeMeta}>
        <span style={s.typeLabel}>{label}</span>
        <span style={s.typeSpec}>{size} · {weight} · tracking {tracking} · lh {lh}</span>
      </div>
      <div style={s.typeSample}>{children}</div>
    </div>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0c0c12',
    color: '#f3f4f6',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    padding: '40px 24px 80px',
  },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  devBanner: {
    background: 'rgba(251,191,36,0.08)',
    border: '1px solid rgba(251,191,36,0.25)',
    borderRadius: '8px',
    color: '#fbbf24',
    fontSize: '13px',
    fontWeight: '600',
    padding: '10px 16px',
    marginBottom: '32px',
    letterSpacing: '0.2px',
  },
  pageTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f3f4f6',
    letterSpacing: '-1px',
    margin: '0 0 8px',
  },
  pageSubtitle: {
    fontSize: '15px',
    color: '#6b7280',
    margin: '0 0 40px',
    lineHeight: '1.6',
    maxWidth: '680px',
  },
  rule: {
    border: 'none',
    borderTop: '1px solid #2e2e3a',
    margin: '0 0 48px',
  },
  section: {
    marginBottom: '64px',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: '-0.3px',
    margin: '0 0 24px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2e2e3a',
  },
  subSection: {
    marginBottom: '32px',
  },
  subSectionTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#a855f7',
    textTransform: 'uppercase' as const,
    letterSpacing: '1px',
    margin: '0 0 16px',
  },
  tokenNote: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '0 0 24px',
    lineHeight: '1.6',
  },
  code: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '13px',
    color: '#c084fc',
    fontFamily: 'monospace',
  },

  // Swatches
  swatchRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '16px',
  },
  swatch: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  swatchLabel: {
    fontSize: '11px',
    color: '#a0a8b8',
    fontFamily: 'monospace',
  },
  swatchDesc: {
    fontSize: '11px',
    color: '#4b5563',
  },

  // Gradients
  gradientGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  gradientItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },

  // Typography
  typeStack: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0',
  },
  typeRow: {
    display: 'grid',
    gridTemplateColumns: '200px 1fr',
    gap: '24px',
    alignItems: 'center',
    padding: '20px 0',
    borderBottom: '1px solid #1e1e28',
  },
  typeMeta: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  typeLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  typeSpec: {
    fontSize: '11px',
    color: '#4b5563',
    fontFamily: 'monospace',
  },
  typeSample: {
    overflow: 'hidden',
  },

  // Buttons
  buttonRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '24px',
    alignItems: 'flex-start',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '8px',
  },
  variantLabel: {
    fontSize: '11px',
    color: '#4b5563',
    fontFamily: 'monospace',
  },

  // Cards
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '24px',
  },

  // Badges
  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '24px',
    alignItems: 'flex-start',
  },
  badgeGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'flex-start',
    gap: '8px',
  },

  // Forms
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },

  // Spacing
  spacingGrid: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  spacingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  spacingBar: {
    height: '20px',
    background: 'linear-gradient(90deg, #8b2fe8, #a855f7)',
    borderRadius: '4px',
    flexShrink: 0,
  },
  spacingLabel: {
    fontSize: '12px',
    color: '#6b7280',
    fontFamily: 'monospace',
    width: '40px',
  },

  // Border radius
  radiusGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '24px',
    alignItems: 'flex-end',
  },
  radiusItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '8px',
  },
  radiusLabel: {
    fontSize: '12px',
    color: '#a0a8b8',
    fontFamily: 'monospace',
  },
  radiusUse: {
    fontSize: '11px',
    color: '#4b5563',
    textAlign: 'center' as const,
    maxWidth: '80px',
  },

  // Shadows
  shadowGrid: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '32px',
    alignItems: 'flex-start',
  },
  shadowItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    maxWidth: '200px',
  },
  shadowCode: {
    fontSize: '10px',
    color: '#4b5563',
    fontFamily: 'monospace',
    lineHeight: '1.5',
    wordBreak: 'break-all' as const,
  },

  footer: {
    marginTop: '64px',
    paddingTop: '24px',
    borderTop: '1px solid #1e1e28',
    fontSize: '12px',
    color: '#4b5563',
    textAlign: 'center' as const,
  },
}

// ── Button style tokens ────────────────────────────────────────────────────────

const btnBase: React.CSSProperties = {
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  fontWeight: '600',
  fontSize: '15px',
  padding: '10px 20px',
  whiteSpace: 'nowrap',
}

const btn: Record<string, React.CSSProperties> = {
  primary: {
    ...btnBase,
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(139,47,232,0.4)',
  },
  primaryLg: {
    ...btnBase,
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    fontSize: '16px',
    padding: '16px 40px',
    boxShadow: '0 8px 32px rgba(139,47,232,0.45)',
  },
  secondary: {
    ...btnBase,
    background: 'rgba(168,85,247,0.1)',
    color: '#c084fc',
    border: '1px solid rgba(168,85,247,0.25)',
  },
  outline: {
    ...btnBase,
    background: 'transparent',
    color: '#d1d5db',
    border: '1px solid #3a3a4a',
  },
  ghost: {
    ...btnBase,
    background: 'transparent',
    color: '#a0a8b8',
    border: '1px solid #3a3a4a',
    fontSize: '13px',
    padding: '6px 14px',
    borderRadius: '6px',
  },
  destructive: {
    ...btnBase,
    background: 'transparent',
    color: '#fca5a5',
    border: '1px solid rgba(239,68,68,0.4)',
  },
  disabled: {
    ...btnBase,
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  comingSoon: {
    ...btnBase,
    background: 'transparent',
    color: '#4b5563',
    border: '1px solid #3a3a4a',
    cursor: 'not-allowed',
  },
  sm: {
    ...btnBase,
    fontSize: '13px',
    padding: '9px 20px',
    borderRadius: '7px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(139,47,232,0.4)',
  },
}

// ── Card style tokens ──────────────────────────────────────────────────────────

const card: Record<string, React.CSSProperties> = {
  standard: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    padding: '24px',
  },
  section: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '28px 32px',
  },
  purple: {
    background: 'rgba(168,85,247,0.05)',
    border: '1px solid rgba(168,85,247,0.15)',
    borderRadius: '20px',
    padding: '40px 36px',
    textAlign: 'center' as const,
  },
  feature: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '36px 28px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 8px',
    letterSpacing: '-0.2px',
  },
  body: {
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.6',
    margin: 0,
  },
}

// ── Badge style tokens ─────────────────────────────────────────────────────────

const badgeBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 12px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '600',
  letterSpacing: '0.3px',
  textTransform: 'uppercase' as const,
  whiteSpace: 'nowrap',
}

const badge: Record<string, React.CSSProperties> = {
  active: {
    ...badgeBase,
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.3)',
    color: '#86efac',
  },
  sold: {
    ...badgeBase,
    background: 'rgba(234,179,8,0.12)',
    border: '1px solid rgba(234,179,8,0.35)',
    color: '#fde047',
    textTransform: 'none' as const,
    fontSize: '13px',
  },
  inactive: {
    ...badgeBase,
    background: 'rgba(75,85,99,0.2)',
    border: '1px solid #3a3a4a',
    color: '#a0a8b8',
  },
  propType: {
    ...badgeBase,
    background: 'rgba(168,85,247,0.1)',
    border: '1px solid rgba(168,85,247,0.25)',
    color: '#c084fc',
  },
  heroBadge: {
    display: 'inline-block',
    padding: '6px 16px',
    background: 'rgba(168,85,247,0.12)',
    border: '1px solid rgba(168,85,247,0.3)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#c084fc',
    letterSpacing: '0.2px',
  },
  noCcBadge: {
    display: 'inline-block',
    padding: '7px 16px',
    background: 'rgba(168,85,247,0.08)',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#c084fc',
  },
  creditBadge: {
    ...badgeBase,
    background: 'rgba(168,85,247,0.1)',
    border: '1px solid rgba(168,85,247,0.3)',
    color: '#c084fc',
    textTransform: 'none' as const,
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0',
    padding: '6px 14px',
    borderRadius: '20px',
  },
  creditBadgeEmpty: {
    ...badgeBase,
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    color: '#fca5a5',
    textTransform: 'none' as const,
    fontSize: '13px',
    fontWeight: '500',
    letterSpacing: '0',
    padding: '6px 14px',
    borderRadius: '20px',
  },
}

// ── Form style tokens ──────────────────────────────────────────────────────────

const form: Record<string, React.CSSProperties> = {
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#d1d5db',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical' as const,
    lineHeight: '1.6',
  },
  tagContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    padding: '12px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
  },
  tagActive: {
    padding: '4px 10px',
    background: 'rgba(168,85,247,0.15)',
    border: '1px solid rgba(168,85,247,0.4)',
    borderRadius: '6px',
    color: '#c084fc',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  tagInactive: {
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
}
