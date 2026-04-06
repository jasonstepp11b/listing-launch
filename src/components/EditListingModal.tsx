import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────

const PROPERTY_TYPES = [
  'Single Family', 'Condo', 'Townhouse', 'Multi-Family', 'Land', 'Commercial',
] as const

const TARGET_BUYERS = [
  'Any', 'First-Time Buyer', 'Family', 'Investor', 'Luxury', 'Downsizer',
  'Out-of-State Buyer', 'Tax Incentive Buyer', 'Retiree Buyer',
] as const

const FEATURE_OPTIONS = [
  'Pool', 'Garage', 'Renovated Kitchen', 'Waterfront', 'Hardwood Floors',
  'Fireplace', 'Open Floor Plan', 'Smart Home', 'Mountain Views',
  'Backyard', 'Home Office', 'New Roof',
] as const

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ─── Types ────────────────────────────────────────────────────────────────────

interface FullListing {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number | null
  property_type: string
  features: string[] | null
  neighborhood_highlights: string | null
  target_buyer: string | null
  additional_notes: string | null
  image_url: string | null
  status: string
}

interface EditForm {
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

// What onSaved gives back to the parent so it can update state immediately.
export interface SavedListingData {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number | null
  property_type: string
  features: string[] | null
  neighborhood_highlights: string | null
  target_buyer: string | null
  additional_notes: string | null
  image_url: string | null
}

interface Props {
  listingId: string
  onClose: () => void
  onSaved: (data: SavedListingData) => void
  onStatusChanged?: (status: 'active' | 'sold' | 'inactive') => void
}

function listingToForm(l: FullListing): EditForm {
  return {
    address: l.address,
    price: String(l.price),
    bedrooms: String(l.bedrooms),
    bathrooms: String(l.bathrooms),
    sqft: l.sqft != null ? String(l.sqft) : '',
    propertyType: l.property_type,
    features: l.features ?? [],
    neighborhoodHighlights: l.neighborhood_highlights ?? '',
    targetBuyer: l.target_buyer ?? '',
    additionalNotes: l.additional_notes ?? '',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditListingModal({ listingId, onClose, onSaved, onStatusChanged }: Props) {
  const { user } = useAuth()

  const [loadingListing, setLoadingListing] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [form, setForm] = useState<EditForm | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [originalStatus, setOriginalStatus] = useState<'active' | 'sold' | 'inactive'>('active')
  const [listingStatus, setListingStatus] = useState<'active' | 'sold' | 'inactive'>('active')

  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  // Fetch full listing on mount
  useEffect(() => {
    if (!user) return
    supabase
      .from('listings')
      .select('id, address, price, bedrooms, bathrooms, sqft, property_type, features, neighborhood_highlights, target_buyer, additional_notes, image_url, status')
      .eq('id', listingId)
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setFetchError('Could not load listing data.')
        } else {
          const l = data as FullListing
          setForm(listingToForm(l))
          setExistingImageUrl(l.image_url)
          const s = l.status as 'active' | 'sold' | 'inactive'
          setOriginalStatus(s)
          setListingStatus(s)
        }
        setLoadingListing(false)
      })
  }, [listingId, user])

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Form helpers ──────────────────────────────────────────────────────────

  function setField(field: keyof EditForm, value: string) {
    setForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function toggleFeature(feature: string) {
    setForm(prev => {
      if (!prev) return prev
      const has = prev.features.includes(feature)
      return { ...prev, features: has ? prev.features.filter(f => f !== feature) : [...prev.features, feature] }
    })
  }

  // ── Image helpers ─────────────────────────────────────────────────────────

  function handleImageFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSaveError('Please select a JPG, PNG, or WEBP image.')
      return
    }
    if (newImagePreview) URL.revokeObjectURL(newImagePreview)
    setNewImageFile(file)
    setNewImagePreview(URL.createObjectURL(file))
    setRemoveExistingImage(false)
    setSaveError(null)
  }

  function clearNewImage() {
    if (newImagePreview) URL.revokeObjectURL(newImagePreview)
    setNewImageFile(null)
    setNewImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleImageFile(file)
  }

  // ── Status change (pending — saved with the form on Save Changes) ──────────

  function handleStatusChange(newStatus: 'active' | 'sold' | 'inactive') {
    setListingStatus(newStatus)
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!form || !user) return
    setSaving(true)
    setSaveError(null)

    try {
      let newImageUrl: string | null | undefined = undefined // undefined = no change

      if (newImageFile) {
        const ext = newImageFile.name.split('.').pop()
        // Timestamp in path guarantees a new URL on every upload (prevents browser cache hits)
        const storagePath = `${user.id}/${listingId}/photo.${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(storagePath, newImageFile)
        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)
        const { data: { publicUrl } } = supabase.storage.from('property-images').getPublicUrl(storagePath)
        newImageUrl = publicUrl
      } else if (removeExistingImage) {
        newImageUrl = null
      }

      const payload: Record<string, unknown> = {
        address: form.address.trim(),
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        sqft: form.sqft ? Number(form.sqft) : null,
        property_type: form.propertyType,
        features: form.features,
        neighborhood_highlights: form.neighborhoodHighlights.trim() || null,
        target_buyer: form.targetBuyer || null,
        additional_notes: form.additionalNotes.trim() || null,
        status: listingStatus,
      }
      if (newImageUrl !== undefined) payload.image_url = newImageUrl

      const { error: updateError } = await supabase
        .from('listings')
        .update(payload)
        .eq('id', listingId)
        .eq('user_id', user.id)
      if (updateError) throw new Error(updateError.message)

      const finalImageUrl = newImageUrl !== undefined
        ? (newImageUrl ?? null)
        : existingImageUrl

      setSavedOk(true)
      if (listingStatus !== originalStatus) onStatusChanged?.(listingStatus)

      // Give the user a moment to see the success state, then close
      setTimeout(() => {
        if (newImagePreview) URL.revokeObjectURL(newImagePreview)
        onSaved({
          id: listingId,
          address: String(payload.address),
          price: Number(payload.price),
          bedrooms: Number(payload.bedrooms),
          bathrooms: Number(payload.bathrooms),
          sqft: payload.sqft != null ? Number(payload.sqft) : null,
          property_type: String(payload.property_type),
          features: form.features,
          neighborhood_highlights: payload.neighborhood_highlights as string | null,
          target_buyer: payload.target_buyer as string | null,
          additional_notes: payload.additional_notes as string | null,
          image_url: finalImageUrl,
        })
        onClose()
      }, 1000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
      setSaving(false)
    }
  }

  // ── Derived image display ─────────────────────────────────────────────────

  const displayImageSrc = newImagePreview ?? (removeExistingImage ? null : existingImageUrl)

  const canSave = form
    && form.address.trim() !== ''
    && form.price !== ''
    && form.bedrooms !== ''
    && form.bathrooms !== ''
    && form.propertyType !== ''
    && !saving
    && !savedOk

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={m.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={m.panel}>

        {/* Header */}
        <div style={m.header}>
          <div>
            <h2 style={m.title}>Edit Listing</h2>
            <p style={m.subtitle}>No credits used — editing is always free.</p>
          </div>
          <button style={m.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={m.body}>
          {loadingListing ? (
            <div style={m.stateBox}>
              <span className="generating-pulse" style={m.stateSparkle}>✦</span>
              <p style={m.stateText}>Loading listing…</p>
            </div>
          ) : fetchError ? (
            <div style={m.errorBox}>
              <p style={m.errorText}>{fetchError}</p>
            </div>
          ) : savedOk ? (
            <div style={m.successBox}>
              <span style={m.successIcon}>✓</span>
              <p style={m.successText}>Listing updated successfully!</p>
            </div>
          ) : form ? (
            <>
              {/* Listing Status */}
              <section style={f.section} className="form-section-pad">
                <h3 style={f.sectionTitle}>Listing Status</h3>
                <div style={f.statusBadgeRow}>
                  {listingStatus === 'active' && <span style={{ ...f.statusBadge, ...f.statusBadgeActive }}>● Active</span>}
                  {listingStatus === 'sold' && <span style={{ ...f.statusBadge, ...f.statusBadgeSold }}>🎉 Sold</span>}
                  {listingStatus === 'inactive' && <span style={{ ...f.statusBadge, ...f.statusBadgeInactive }}>● Inactive</span>}
                  {listingStatus !== originalStatus && (
                    <span style={f.unsavedPill}>unsaved</span>
                  )}
                </div>
                <div style={f.statusActions}>
                  {listingStatus === 'active' ? (
                    <>
                      <button style={{ ...f.statusBtn, ...f.statusBtnSold }} onClick={() => handleStatusChange('sold')}>
                        Mark as Sold 🎉
                      </button>
                      <button style={f.statusBtn} onClick={() => handleStatusChange('inactive')}>
                        Mark as Inactive
                      </button>
                    </>
                  ) : (
                    <button style={{ ...f.statusBtn, ...f.statusBtnReactivate }} onClick={() => handleStatusChange('active')}>
                      Reactivate Listing
                    </button>
                  )}
                </div>
              </section>

              {/* Property Details */}
              <section style={f.section} className="form-section-pad">
                <h3 style={f.sectionTitle}>Property Details</h3>

                <div style={f.field}>
                  <label style={f.label}>Property Address <span style={f.req}>*</span></label>
                  <input style={f.input} type="text" value={form.address} onChange={e => setField('address', e.target.value)} placeholder="123 Maple Street, Austin, TX 78701" />
                </div>

                <div style={f.field}>
                  <label style={f.label}>Listing Price <span style={f.req}>*</span></label>
                  <div style={f.prefixWrap}>
                    <span style={f.prefix}>$</span>
                    <input style={{ ...f.input, paddingLeft: '32px' }} type="number" min={0} value={form.price} onChange={e => setField('price', e.target.value)} placeholder="450000" />
                  </div>
                </div>

                <div className="form-grid-3">
                  <div style={f.field}>
                    <label style={f.label}>Bedrooms <span style={f.req}>*</span></label>
                    <input style={f.input} type="number" min={0} value={form.bedrooms} onChange={e => setField('bedrooms', e.target.value)} placeholder="3" />
                  </div>
                  <div style={f.field}>
                    <label style={f.label}>Bathrooms <span style={f.req}>*</span></label>
                    <input style={f.input} type="number" min={0} step={0.5} value={form.bathrooms} onChange={e => setField('bathrooms', e.target.value)} placeholder="2" />
                  </div>
                  <div style={f.field}>
                    <label style={f.label}>Sq. Footage</label>
                    <input style={f.input} type="number" min={0} value={form.sqft} onChange={e => setField('sqft', e.target.value)} placeholder="1850" />
                  </div>
                </div>

                <div className="form-grid-2">
                  <div style={f.field}>
                    <label style={f.label}>Property Type <span style={f.req}>*</span></label>
                    <select style={f.select} value={form.propertyType} onChange={e => setField('propertyType', e.target.value)}>
                      <option value="">Select type…</option>
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div style={f.field}>
                    <label style={f.label}>Target Buyer</label>
                    <select style={f.select} value={form.targetBuyer} onChange={e => setField('targetBuyer', e.target.value)}>
                      <option value="">Select buyer…</option>
                      {TARGET_BUYERS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
              </section>

              {/* Key Features */}
              <section style={f.section} className="form-section-pad">
                <h3 style={f.sectionTitle}>Key Features</h3>
                <div style={f.tagGrid}>
                  {FEATURE_OPTIONS.map(feature => {
                    const active = form.features.includes(feature)
                    return (
                      <button
                        key={feature}
                        type="button"
                        style={active ? { ...f.tag, ...f.tagActive } : f.tag}
                        onClick={() => toggleFeature(feature)}
                      >
                        {active && <span style={f.tagCheck}>✓ </span>}
                        {feature}
                      </button>
                    )
                  })}
                </div>
              </section>

              {/* Context & Notes */}
              <section style={f.section} className="form-section-pad">
                <h3 style={f.sectionTitle}>Context & Notes</h3>

                <div style={f.field}>
                  <label style={f.label}>Neighborhood Highlights</label>
                  <input style={f.input} type="text" value={form.neighborhoodHighlights} onChange={e => setField('neighborhoodHighlights', e.target.value)} placeholder="Top-rated schools, walkable to downtown…" />
                </div>

                <div style={f.field}>
                  <label style={f.label}>Additional Notes / Highlights</label>
                  <textarea style={f.textarea} rows={4} value={form.additionalNotes} onChange={e => setField('additionalNotes', e.target.value)} placeholder="Anything else that makes this property special…" />
                </div>
              </section>

              {/* Property Photo */}
              <section style={f.section} className="form-section-pad">
                <h3 style={f.sectionTitle}>Property Photo <span style={f.optional}>(Optional)</span></h3>

                {displayImageSrc ? (
                  <div style={f.previewWrap}>
                    <img src={displayImageSrc} alt="Property" style={f.previewImg} />
                    <div style={f.previewOverlay}>
                      <button type="button" style={f.overlayBtn}
                        onClick={() => { if (newImageFile) { clearNewImage() } else { setRemoveExistingImage(true) } }}
                      >
                        ✕ Remove
                      </button>
                      <button type="button" style={{ ...f.overlayBtn, marginLeft: '8px' }} onClick={() => fileInputRef.current?.click()}>
                        ↑ Replace
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                        onChange={e => { const file = e.target.files?.[0]; if (file) handleImageFile(file) }} />
                    </div>
                  </div>
                ) : (
                  <div
                    style={dragOver ? { ...f.dropZone, ...f.dropZoneActive } : f.dropZone}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    <div style={f.dropIcon}>🏠</div>
                    <p style={f.dropPrimary}>Drop a photo here, or <span style={f.dropLink}>click to browse</span></p>
                    <p style={f.dropSecondary}>JPG, PNG, or WEBP</p>
                    <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
                      onChange={e => { const file = e.target.files?.[0]; if (file) handleImageFile(file) }} />
                  </div>
                )}
              </section>
            </>
          ) : null}
        </div>

        {/* Footer */}
        {!loadingListing && !fetchError && !savedOk && form && (
          <div style={m.footer}>
            {saveError && <p style={m.saveError}>{saveError}</p>}
            <div style={m.footerActions}>
              <button style={m.cancelBtn} onClick={onClose} disabled={saving}>Cancel</button>
              <button
                style={canSave ? m.saveBtn : { ...m.saveBtn, ...m.saveBtnDisabled }}
                onClick={handleSave}
                disabled={!canSave}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Modal chrome styles ──────────────────────────────────────────────────────

const m: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '40px 16px',
    overflowY: 'auto',
  },
  panel: {
    background: '#16171d',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '720px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: '24px 28px 20px',
    borderBottom: '1px solid #2e2e3a',
    gap: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 3px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  closeBtn: {
    padding: '6px 10px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#a0a8b8',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
    lineHeight: 1,
  },
  body: {
    padding: '4px 0',
    overflowY: 'auto',
  },
  footer: {
    padding: '16px 28px',
    borderTop: '1px solid #2e2e3a',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  saveError: {
    fontSize: '13px',
    color: '#fca5a5',
    margin: 0,
    padding: '10px 14px',
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.25)',
    borderRadius: '7px',
  },
  footerActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  cancelBtn: {
    padding: '10px 22px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#a0a8b8',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveBtn: {
    padding: '10px 28px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(139,47,232,0.4)',
    fontFamily: 'inherit',
  },
  saveBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
    gap: '16px',
  },
  stateSparkle: { fontSize: '28px', color: '#a855f7' },
  stateText: { fontSize: '15px', color: '#6b7280', margin: 0 },
  errorBox: {
    padding: '40px 28px',
    textAlign: 'center',
  },
  errorText: { fontSize: '14px', color: '#fca5a5', margin: 0 },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
    gap: '14px',
  },
  successIcon: {
    fontSize: '36px',
    color: '#86efac',
    lineHeight: 1,
  },
  successText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#86efac',
    margin: 0,
  },
}

// ─── Form field styles ────────────────────────────────────────────────────────

const f: Record<string, React.CSSProperties> = {
  section: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '10px',
    marginBottom: '16px',
    marginLeft: '20px',
    marginRight: '20px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: '0 0 18px',
    paddingBottom: '10px',
    borderBottom: '1px solid #2e2e3a',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  field: { marginBottom: '18px' },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  req: { color: '#a855f7' },
  optional: { fontWeight: '400', color: '#6b7280', fontSize: '12px', letterSpacing: '0', textTransform: 'none' as const },
  input: {
    width: '100%',
    padding: '9px 13px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '9px 13px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    appearance: 'auto',
    fontFamily: 'inherit',
  },
  textarea: {
    width: '100%',
    padding: '9px 13px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'vertical',
    lineHeight: '1.6',
    fontFamily: 'inherit',
  },
  prefixWrap: { position: 'relative' },
  prefix: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '14px',
    pointerEvents: 'none',
  },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  tag: {
    padding: '7px 14px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '20px',
    color: '#a0a8b8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  tagActive: {
    background: 'rgba(168,85,247,0.15)',
    border: '1px solid #a855f7',
    color: '#c084fc',
  },
  tagCheck: { color: '#a855f7' },
  dropZone: {
    border: '2px dashed #3a3a4a',
    borderRadius: '9px',
    padding: '32px 20px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: '#13131a',
  },
  dropZoneActive: { borderColor: '#a855f7', background: 'rgba(168,85,247,0.06)' },
  dropIcon: { fontSize: '28px', marginBottom: '10px' },
  dropPrimary: { fontSize: '14px', color: '#d1d5db', margin: '0 0 4px' },
  dropLink: { color: '#a855f7', fontWeight: '600' },
  dropSecondary: { fontSize: '12px', color: '#6b7280', margin: 0 },
  previewWrap: {
    position: 'relative' as const,
    borderRadius: '9px',
    overflow: 'hidden',
    border: '1px solid #3a3a4a',
    lineHeight: 0,
  },
  previewImg: { width: '100%', maxHeight: '260px', objectFit: 'cover' as const, display: 'block' },
  previewOverlay: { position: 'absolute' as const, top: '10px', right: '10px', display: 'flex' },
  overlayBtn: {
    padding: '6px 12px',
    background: 'rgba(0,0,0,0.65)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#f3f4f6',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    backdropFilter: 'blur(4px)',
  },
  statusBadgeRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' },
  unsavedPill: {
    display: 'inline-block',
    padding: '2px 8px',
    background: 'rgba(251, 191, 36, 0.1)',
    border: '1px solid rgba(251, 191, 36, 0.25)',
    borderRadius: '20px',
    fontSize: '10px',
    fontWeight: '600',
    color: '#fbbf24',
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid transparent',
  },
  statusBadgeActive: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
  },
  statusBadgeSold: {
    background: 'rgba(234, 179, 8, 0.12)',
    border: '1px solid rgba(234, 179, 8, 0.35)',
    color: '#fde047',
  },
  statusBadgeInactive: {
    background: 'rgba(75, 85, 99, 0.2)',
    border: '1px solid #3a3a4a',
    color: '#a0a8b8',
  },
  statusActions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  statusBtn: {
    padding: '7px 14px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#a0a8b8',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  statusBtnSold: {
    border: '1px solid rgba(234, 179, 8, 0.4)',
    color: '#fde047',
  },
  statusBtnReactivate: {
    border: '1px solid rgba(34, 197, 94, 0.4)',
    color: '#86efac',
  },
}
