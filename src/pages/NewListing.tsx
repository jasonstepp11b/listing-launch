import { useState } from 'react'
import { Link } from 'react-router-dom'
import { generateContent } from '../lib/generateContent'

const PROPERTY_TYPES = [
  'Single Family',
  'Condo',
  'Townhouse',
  'Multi-Family',
  'Land',
  'Commercial',
] as const

const TARGET_BUYERS = [
  'Any',
  'First-Time Buyer',
  'Family',
  'Investor',
  'Luxury',
  'Downsizer',
  'Out-of-State Buyer',
  'Tax Incentive Buyer',
  'Retiree Buyer',
] as const

const FEATURE_OPTIONS = [
  'Pool',
  'Garage',
  'Renovated Kitchen',
  'Waterfront',
  'Hardwood Floors',
  'Fireplace',
  'Open Floor Plan',
  'Smart Home',
  'Mountain Views',
  'Backyard',
  'Home Office',
  'New Roof',
] as const

interface FormState {
  address: string
  price: string
  bedrooms: string
  bathrooms: string
  sqft: string
  propertyType: string
  features: string[]
  neighborhoodHighlights: string
  targetBuyer: string
  additionalNotes: string
}

const EMPTY_FORM: FormState = {
  address: '',
  price: '',
  bedrooms: '',
  bathrooms: '',
  sqft: '',
  propertyType: '',
  features: [],
  neighborhoodHighlights: '',
  targetBuyer: '',
  additionalNotes: '',
}

function isFormValid(form: FormState): boolean {
  return (
    form.address.trim() !== '' &&
    form.price !== '' &&
    form.bedrooms !== '' &&
    form.bathrooms !== '' &&
    form.sqft !== '' &&
    form.propertyType !== ''
  )
}

export default function NewListing() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleFeature(feature: string) {
    setForm(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature],
    }))
  }

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const outputs = await generateContent(form)
      console.log('Generated outputs:', outputs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const valid = isFormValid(form)

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <Link to="/dashboard" style={s.backLink}>← Dashboard</Link>
          <div>
            <h1 style={s.heading}>New Listing</h1>
            <p style={s.subheading}>Fill in the property details and we'll generate all your marketing content.</p>
          </div>
        </div>

        <form onSubmit={e => e.preventDefault()}>

          {/* Section: Property Details */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Property Details</h2>

            <div style={s.field}>
              <label style={s.label}>Property Address <span style={s.required}>*</span></label>
              <input
                style={s.input}
                type="text"
                placeholder="123 Maple Street, Austin, TX 78701"
                value={form.address}
                onChange={e => set('address', e.target.value)}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Listing Price <span style={s.required}>*</span></label>
              <div style={s.prefixWrap}>
                <span style={s.prefix}>$</span>
                <input
                  style={{ ...s.input, paddingLeft: '32px' }}
                  type="number"
                  placeholder="450000"
                  min={0}
                  value={form.price}
                  onChange={e => set('price', e.target.value)}
                />
              </div>
            </div>

            <div style={s.row3}>
              <div style={s.field}>
                <label style={s.label}>Bedrooms <span style={s.required}>*</span></label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="3"
                  min={0}
                  value={form.bedrooms}
                  onChange={e => set('bedrooms', e.target.value)}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Bathrooms <span style={s.required}>*</span></label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="2"
                  min={0}
                  step={0.5}
                  value={form.bathrooms}
                  onChange={e => set('bathrooms', e.target.value)}
                />
              </div>
              <div style={s.field}>
                <label style={s.label}>Sq. Footage <span style={s.required}>*</span></label>
                <input
                  style={s.input}
                  type="number"
                  placeholder="1850"
                  min={0}
                  value={form.sqft}
                  onChange={e => set('sqft', e.target.value)}
                />
              </div>
            </div>

            <div style={s.row2}>
              <div style={s.field}>
                <label style={s.label}>Property Type <span style={s.required}>*</span></label>
                <select
                  style={s.select}
                  value={form.propertyType}
                  onChange={e => set('propertyType', e.target.value)}
                >
                  <option value="">Select type…</option>
                  {PROPERTY_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={s.field}>
                <label style={s.label}>Target Buyer</label>
                <select
                  style={s.select}
                  value={form.targetBuyer}
                  onChange={e => set('targetBuyer', e.target.value)}
                >
                  <option value="">Select buyer…</option>
                  {TARGET_BUYERS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Section: Key Features */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Key Features</h2>
            <p style={s.sectionHint}>Select all that apply — these shape the tone and focus of your content.</p>
            <div style={s.tagGrid}>
              {FEATURE_OPTIONS.map(feature => {
                const active = form.features.includes(feature)
                return (
                  <button
                    key={feature}
                    type="button"
                    style={active ? { ...s.tag, ...s.tagActive } : s.tag}
                    onClick={() => toggleFeature(feature)}
                  >
                    {active && <span style={s.tagCheck}>✓ </span>}
                    {feature}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Section: Context & Notes */}
          <section style={s.section}>
            <h2 style={s.sectionTitle}>Context & Notes</h2>

            <div style={s.field}>
              <label style={s.label}>Neighborhood Highlights</label>
              <input
                style={s.input}
                type="text"
                placeholder="Top-rated schools, walkable to downtown, near Barton Creek Greenbelt"
                value={form.neighborhoodHighlights}
                onChange={e => set('neighborhoodHighlights', e.target.value)}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Additional Notes / Highlights</label>
              <p style={s.fieldHint}>Anything else that makes this property special — agent personality, seller story, unique details.</p>
              <textarea
                style={s.textarea}
                rows={5}
                placeholder="e.g. Motivated seller, recently updated HVAC, backs up to a greenbelt with no rear neighbors, master bath fully renovated in 2023…"
                value={form.additionalNotes}
                onChange={e => set('additionalNotes', e.target.value)}
              />
            </div>
          </section>

          {/* Footer */}
          {error && <p style={s.errorMsg}>{error}</p>}
          <div style={s.footer}>
            <p style={s.requiredNote}><span style={s.required}>*</span> Required fields</p>
            <button
              type="button"
              style={valid && !loading ? s.generateBtn : { ...s.generateBtn, ...s.generateBtnDisabled }}
              disabled={!valid || loading}
              onClick={handleGenerate}
            >
              {loading ? 'Generating…' : '✦ Generate Marketing Content'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    padding: '40px 24px 80px',
    color: '#f3f4f6',
  },
  container: {
    maxWidth: '720px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '40px',
  },
  backLink: {
    display: 'inline-block',
    fontSize: '14px',
    color: '#9ca3af',
    textDecoration: 'none',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 8px',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '15px',
    color: '#9ca3af',
    margin: 0,
  },

  // Sections
  section: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '12px',
    padding: '28px 32px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: '0 0 20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2e2e3a',
  },
  sectionHint: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '-12px 0 16px',
  },

  // Fields
  field: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: '7px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  fieldHint: {
    fontSize: '13px',
    color: '#6b7280',
    margin: '-4px 0 8px',
  },
  required: {
    color: '#a855f7',
  },
  requiredNote: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    appearance: 'auto',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    lineHeight: '1.6',
    fontFamily: 'inherit',
  },
  prefixWrap: {
    position: 'relative',
  },
  prefix: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '15px',
    pointerEvents: 'none',
  },

  // Grids
  row2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
  },

  // Feature tags
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  tag: {
    padding: '8px 16px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '20px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  tagActive: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid #a855f7',
    color: '#c084fc',
  },
  tagCheck: {
    color: '#a855f7',
  },

  errorMsg: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '14px',
    padding: '12px 16px',
    marginBottom: '16px',
    lineHeight: '1.5',
  },

  // Footer / CTA
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '8px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  generateBtn: {
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.2px',
    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
  },
  generateBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}
