import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import GeneratedOutput from '../components/GeneratedOutput'
import type { GeneratedOutputs } from '../lib/generateContent'

// ─── Constants (mirrors NewListing) ──────────────────────────────────────────

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

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// ─── Types ────────────────────────────────────────────────────────────────────

interface ListingData {
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
  created_at: string
  generated_outputs: GeneratedOutputs[]
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

function listingToEditForm(l: ListingData): EditForm {
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Edit mode
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState<EditForm | null>(null)
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null)
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'ListingIgnite — Listing Detail'
  }, [])

  useEffect(() => {
    if (!user || !id) return

    async function fetchListing() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*, generated_outputs(*)')
          .eq('id', id)
          .eq('user_id', user!.id)
          .single()

        if (error) throw error
        setListing(data as ListingData)
        if (data?.address) document.title = `ListingIgnite — ${data.address}`
      } catch {
        setError('Could not load this listing. It may not exist or you may not have access.')
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [user, id])

  // ── Edit helpers ──────────────────────────────────────────────────────────

  function enterEditMode() {
    if (!listing) return
    setEditForm(listingToEditForm(listing))
    setNewImageFile(null)
    setNewImagePreview(null)
    setRemoveExistingImage(false)
    setSaveError(null)
    setSavedOk(false)
    setEditMode(true)
  }

  function cancelEdit() {
    if (newImagePreview) URL.revokeObjectURL(newImagePreview)
    setEditMode(false)
    setEditForm(null)
    setNewImageFile(null)
    setNewImagePreview(null)
    setRemoveExistingImage(false)
    setSaveError(null)
  }

  function setField(field: keyof EditForm, value: string) {
    setEditForm(prev => prev ? { ...prev, [field]: value } : prev)
  }

  function toggleFeature(feature: string) {
    setEditForm(prev => {
      if (!prev) return prev
      const has = prev.features.includes(feature)
      return { ...prev, features: has ? prev.features.filter(f => f !== feature) : [...prev.features, feature] }
    })
  }

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

  async function handleSave() {
    if (!listing || !editForm || !user) return
    setSaving(true)
    setSaveError(null)

    try {
      let newImageUrl: string | null | undefined = undefined // undefined = no change

      if (newImageFile) {
        const ext = newImageFile.name.split('.').pop()
        // Include a timestamp in the path so replacements always produce a new URL.
        // Reusing the same path yields the same public URL, which browsers serve from
        // cache and which the DB update ignores (same string = no visible change).
        const storagePath = `${user.id}/${listing.id}/photo.${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(storagePath, newImageFile)

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`)

        const { data: { publicUrl } } = supabase.storage
          .from('property-images')
          .getPublicUrl(storagePath)
        newImageUrl = publicUrl
      } else if (removeExistingImage) {
        newImageUrl = null
      }

      const updatePayload: Record<string, unknown> = {
        address: editForm.address.trim(),
        price: Number(editForm.price),
        bedrooms: Number(editForm.bedrooms),
        bathrooms: Number(editForm.bathrooms),
        sqft: editForm.sqft ? Number(editForm.sqft) : null,
        property_type: editForm.propertyType,
        features: editForm.features,
        neighborhood_highlights: editForm.neighborhoodHighlights.trim() || null,
        target_buyer: editForm.targetBuyer || null,
        additional_notes: editForm.additionalNotes.trim() || null,
      }
      if (newImageUrl !== undefined) updatePayload.image_url = newImageUrl

      const { error: updateError } = await supabase
        .from('listings')
        .update(updatePayload)
        .eq('id', listing.id)
        .eq('user_id', user.id)

      if (updateError) throw new Error(updateError.message)

      // Update local state immediately — no refetch needed
      setListing(prev => prev ? {
        ...prev,
        address: String(updatePayload.address),
        price: Number(updatePayload.price),
        bedrooms: Number(updatePayload.bedrooms),
        bathrooms: Number(updatePayload.bathrooms),
        sqft: updatePayload.sqft != null ? Number(updatePayload.sqft) : null,
        property_type: String(updatePayload.property_type),
        features: editForm.features,
        neighborhood_highlights: updatePayload.neighborhood_highlights as string | null,
        target_buyer: updatePayload.target_buyer as string | null,
        additional_notes: updatePayload.additional_notes as string | null,
        image_url: newImageUrl !== undefined ? (newImageUrl ?? null) : prev.image_url,
      } : prev)

      if (newImagePreview) URL.revokeObjectURL(newImagePreview)
      setEditMode(false)
      setEditForm(null)
      setNewImageFile(null)
      setNewImagePreview(null)
      setRemoveExistingImage(false)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── View helpers ──────────────────────────────────────────────────────────

  function formatPrice(price: number) {
    return '$' + price.toLocaleString()
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const outputs = listing?.generated_outputs?.[0] ?? null

  // ── Derived image state for edit mode ──────────────────────────────────────
  // What image to show in the edit image panel:
  //   - newImagePreview  → user just picked a new file
  //   - listing.image_url && !removeExistingImage → existing image
  //   - otherwise → drop zone
  const editImageSrc = newImagePreview ?? (removeExistingImage ? null : listing?.image_url ?? null)

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Nav */}
        <div style={s.nav}>
          <div style={s.navBrand}>
            <span style={s.navSparkle}>✦</span>
            <span style={s.navTitle}>ListingIgnite</span>
          </div>
          <Link to="/dashboard" style={s.backLink}>← Back to Dashboard</Link>
        </div>

        {loading ? (
          <div style={s.stateBox}>
            <span className="generating-pulse" style={s.stateSparkle}>✦</span>
            <p style={s.stateText}>Loading listing…</p>
          </div>
        ) : error ? (
          <div style={s.errorBox}>
            <p style={s.errorText}>{error}</p>
            <Link to="/dashboard" style={s.errorLink}>← Back to Dashboard</Link>
          </div>
        ) : listing ? (
          <>
            {/* ── View mode ─────────────────────────────────────────────── */}
            {!editMode && (
              <>
                {/* Success toast */}
                {savedOk && (
                  <div style={s.successToast}>
                    ✓ Listing updated successfully
                  </div>
                )}

                <div style={s.headerCard}>
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.address} style={s.headerImage} />
                  ) : (
                    <div style={s.headerImagePlaceholder}>
                      <span style={s.headerImageIcon}>🏡</span>
                    </div>
                  )}
                  <div style={s.headerInfo}>
                    <div style={s.headerInfoTop}>
                      <div style={s.propertyTypeBadge}>{listing.property_type}</div>
                      <button style={s.editBtn} onClick={enterEditMode}>Edit Listing</button>
                    </div>
                    <h1 style={s.address}>{listing.address}</h1>
                    <div style={s.statsRow}>
                      <span style={s.price}>{formatPrice(listing.price)}</span>
                      <span style={s.statDivider}>·</span>
                      <span style={s.stat}>{listing.bedrooms} bd</span>
                      <span style={s.statDivider}>·</span>
                      <span style={s.stat}>{listing.bathrooms} ba</span>
                      {listing.sqft && (
                        <>
                          <span style={s.statDivider}>·</span>
                          <span style={s.stat}>{listing.sqft.toLocaleString()} sqft</span>
                        </>
                      )}
                    </div>
                    {listing.features && listing.features.length > 0 && (
                      <div style={s.featuresRow}>
                        {listing.features.map(f => (
                          <span key={f} style={s.featurePill}>{f}</span>
                        ))}
                      </div>
                    )}
                    <p style={s.dateLabel}>Generated {formatDate(listing.created_at)}</p>
                  </div>
                </div>

                {outputs ? (
                  <GeneratedOutput outputs={outputs} />
                ) : (
                  <div style={s.noOutputsBox}>
                    <p style={s.noOutputsText}>No generated content found for this listing.</p>
                  </div>
                )}
              </>
            )}

            {/* ── Edit mode ─────────────────────────────────────────────── */}
            {editMode && editForm && (
              <div style={f.wrap}>
                <div style={f.header}>
                  <h1 style={f.heading}>Edit Listing</h1>
                  <p style={f.subheading}>Update property details — no credits used, no content regenerated.</p>
                </div>

                {/* Property Details */}
                <section style={f.section} className="form-section-pad">
                  <h2 style={f.sectionTitle}>Property Details</h2>

                  <div style={f.field}>
                    <label style={f.label}>Property Address <span style={f.required}>*</span></label>
                    <input
                      style={f.input}
                      type="text"
                      value={editForm.address}
                      onChange={e => setField('address', e.target.value)}
                      placeholder="123 Maple Street, Austin, TX 78701"
                    />
                  </div>

                  <div style={f.field}>
                    <label style={f.label}>Listing Price <span style={f.required}>*</span></label>
                    <div style={f.prefixWrap}>
                      <span style={f.prefix}>$</span>
                      <input
                        style={{ ...f.input, paddingLeft: '32px' }}
                        type="number"
                        min={0}
                        value={editForm.price}
                        onChange={e => setField('price', e.target.value)}
                        placeholder="450000"
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div style={f.field}>
                      <label style={f.label}>Bedrooms <span style={f.required}>*</span></label>
                      <input style={f.input} type="number" min={0} value={editForm.bedrooms} onChange={e => setField('bedrooms', e.target.value)} placeholder="3" />
                    </div>
                    <div style={f.field}>
                      <label style={f.label}>Bathrooms <span style={f.required}>*</span></label>
                      <input style={f.input} type="number" min={0} step={0.5} value={editForm.bathrooms} onChange={e => setField('bathrooms', e.target.value)} placeholder="2" />
                    </div>
                    <div style={f.field}>
                      <label style={f.label}>Sq. Footage</label>
                      <input style={f.input} type="number" min={0} value={editForm.sqft} onChange={e => setField('sqft', e.target.value)} placeholder="1850" />
                    </div>
                  </div>

                  <div className="form-grid-2">
                    <div style={f.field}>
                      <label style={f.label}>Property Type <span style={f.required}>*</span></label>
                      <select style={f.select} value={editForm.propertyType} onChange={e => setField('propertyType', e.target.value)}>
                        <option value="">Select type…</option>
                        {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div style={f.field}>
                      <label style={f.label}>Target Buyer</label>
                      <select style={f.select} value={editForm.targetBuyer} onChange={e => setField('targetBuyer', e.target.value)}>
                        <option value="">Select buyer…</option>
                        {TARGET_BUYERS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                </section>

                {/* Key Features */}
                <section style={f.section} className="form-section-pad">
                  <h2 style={f.sectionTitle}>Key Features</h2>
                  <div style={f.tagGrid}>
                    {FEATURE_OPTIONS.map(feature => {
                      const active = editForm.features.includes(feature)
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
                  <h2 style={f.sectionTitle}>Context & Notes</h2>

                  <div style={f.field}>
                    <label style={f.label}>Neighborhood Highlights</label>
                    <input
                      style={f.input}
                      type="text"
                      value={editForm.neighborhoodHighlights}
                      onChange={e => setField('neighborhoodHighlights', e.target.value)}
                      placeholder="Top-rated schools, walkable to downtown…"
                    />
                  </div>

                  <div style={f.field}>
                    <label style={f.label}>Additional Notes / Highlights</label>
                    <textarea
                      style={f.textarea}
                      rows={4}
                      value={editForm.additionalNotes}
                      onChange={e => setField('additionalNotes', e.target.value)}
                      placeholder="Anything else that makes this property special…"
                    />
                  </div>
                </section>

                {/* Property Photo */}
                <section style={f.section} className="form-section-pad">
                  <h2 style={f.sectionTitle}>
                    Property Photo <span style={f.optional}>(Optional)</span>
                  </h2>

                  {editImageSrc ? (
                    <div style={f.previewWrap}>
                      <img src={editImageSrc} alt="Property" style={f.previewImg} />
                      <div style={f.previewOverlay}>
                        <button
                          type="button"
                          style={f.removeBtn}
                          onClick={() => {
                            if (newImageFile) {
                              clearNewImage()
                            } else {
                              setRemoveExistingImage(true)
                            }
                          }}
                        >
                          ✕ Remove photo
                        </button>
                        <button
                          type="button"
                          style={{ ...f.removeBtn, marginLeft: '8px' }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          ↑ Replace
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          style={{ display: 'none' }}
                          onChange={e => { const file = e.target.files?.[0]; if (file) handleImageFile(file) }}
                        />
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
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        style={{ display: 'none' }}
                        onChange={e => { const file = e.target.files?.[0]; if (file) handleImageFile(file) }}
                      />
                    </div>
                  )}
                </section>

                {/* Save / Cancel */}
                {saveError && <p style={f.errorMsg}>{saveError}</p>}
                <div style={f.footer}>
                  <button type="button" style={f.cancelBtn} onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </button>
                  <button
                    type="button"
                    style={saving ? { ...f.saveBtn, ...f.saveBtnDisabled } : f.saveBtn}
                    onClick={handleSave}
                    disabled={saving || !editForm.address.trim() || !editForm.price || !editForm.bedrooms || !editForm.bathrooms || !editForm.propertyType}
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : null}

      </div>
    </div>
  )
}

// ─── View mode styles ─────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
    color: '#f3f4f6',
    padding: '0 0 80px',
  },
  container: {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '0 24px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    borderBottom: '1px solid #2e2e3a',
    marginBottom: '40px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navSparkle: { fontSize: '18px', color: '#a855f7' },
  navTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: '-0.3px',
  },
  backLink: {
    fontSize: '13px',
    color: '#9ca3af',
    textDecoration: 'none',
    padding: '7px 16px',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    fontWeight: '500',
  },
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
    gap: '16px',
  },
  stateSparkle: { fontSize: '28px', color: '#a855f7' },
  stateText: { fontSize: '15px', color: '#6b7280', margin: 0 },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
  },
  errorText: { fontSize: '15px', color: '#fca5a5', margin: '0 0 20px' },
  errorLink: { fontSize: '13px', color: '#9ca3af', textDecoration: 'none' },
  successToast: {
    background: 'rgba(34, 197, 94, 0.1)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    color: '#86efac',
    marginBottom: '20px',
    fontWeight: '500',
  },
  headerCard: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    overflow: 'hidden',
    marginBottom: '32px',
  },
  headerImage: {
    width: '100%',
    height: '280px',
    objectFit: 'cover',
    display: 'block',
  },
  headerImagePlaceholder: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(124,58,237,0.08) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImageIcon: { fontSize: '48px', opacity: 0.5 },
  headerInfo: { padding: '24px 28px 28px' },
  headerInfoTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    gap: '12px',
  },
  propertyTypeBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#c084fc',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
  },
  editBtn: {
    padding: '7px 16px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
  address: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 12px',
    letterSpacing: '-0.3px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '14px',
  },
  price: { fontSize: '20px', fontWeight: '700', color: '#a855f7', letterSpacing: '-0.3px' },
  statDivider: { color: '#3a3a4a', fontSize: '16px' },
  stat: { fontSize: '14px', color: '#9ca3af', fontWeight: '500' },
  featuresRow: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' },
  featurePill: {
    padding: '3px 10px',
    background: '#16161e',
    border: '1px solid #2e2e3a',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
    color: '#6b7280',
  },
  dateLabel: { fontSize: '12px', color: '#4b5563', margin: 0 },
  noOutputsBox: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
  },
  noOutputsText: { fontSize: '14px', color: '#6b7280', margin: 0 },
}

// ─── Edit mode styles ─────────────────────────────────────────────────────────

const f: Record<string, React.CSSProperties> = {
  wrap: {
    paddingBottom: '40px',
  },
  header: {
    marginBottom: '28px',
  },
  heading: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 6px',
    letterSpacing: '-0.4px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  subheading: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  section: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '12px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#e5e7eb',
    margin: '0 0 20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #2e2e3a',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  field: { marginBottom: '20px' },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#d1d5db',
    marginBottom: '7px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  required: { color: '#a855f7' },
  optional: {
    fontWeight: '400',
    color: '#6b7280',
    fontSize: '13px',
    letterSpacing: '0',
    textTransform: 'none' as const,
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
    fontFamily: 'inherit',
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
    fontFamily: 'inherit',
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
  prefixWrap: { position: 'relative' },
  prefix: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    fontSize: '15px',
    pointerEvents: 'none',
  },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px' },
  tag: {
    padding: '8px 16px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '20px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  tagActive: {
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid #a855f7',
    color: '#c084fc',
  },
  tagCheck: { color: '#a855f7' },
  dropZone: {
    border: '2px dashed #3a3a4a',
    borderRadius: '10px',
    padding: '36px 24px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    background: '#13131a',
  },
  dropZoneActive: {
    borderColor: '#a855f7',
    background: 'rgba(168, 85, 247, 0.06)',
  },
  dropIcon: { fontSize: '32px', marginBottom: '12px' },
  dropPrimary: { fontSize: '14px', color: '#d1d5db', margin: '0 0 4px' },
  dropLink: { color: '#a855f7', fontWeight: '600' },
  dropSecondary: { fontSize: '12px', color: '#6b7280', margin: 0 },
  previewWrap: {
    position: 'relative' as const,
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #3a3a4a',
    lineHeight: 0,
  },
  previewImg: {
    width: '100%',
    maxHeight: '280px',
    objectFit: 'cover' as const,
    display: 'block',
  },
  previewOverlay: {
    position: 'absolute' as const,
    top: '12px',
    right: '12px',
    display: 'flex',
    gap: '0',
  },
  removeBtn: {
    padding: '7px 14px',
    background: 'rgba(0,0,0,0.65)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: '#f3f4f6',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    backdropFilter: 'blur(4px)',
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
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelBtn: {
    padding: '11px 24px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  saveBtn: {
    padding: '11px 28px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
    fontFamily: 'inherit',
  },
  saveBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
}
