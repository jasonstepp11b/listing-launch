import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import GeneratedOutput from '../components/GeneratedOutput'
import EditListingModal from '../components/EditListingModal'
import type { SavedListingData } from '../components/EditListingModal'
import type { GeneratedOutputs } from '../lib/generateContent'
import AppFooter from '../components/AppFooter'

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
  status: string
  created_at: string
  generated_outputs: GeneratedOutputs[]
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()

  const [listing, setListing] = useState<ListingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [savedOk, setSavedOk] = useState(false)

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

  function handleSaved(updated: SavedListingData) {
    setListing(prev => prev ? { ...prev, ...updated } : prev)
    setSavedOk(true)
    setTimeout(() => setSavedOk(false), 3000)
  }

  function formatPrice(price: number) {
    return '$' + price.toLocaleString()
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const outputs = listing?.generated_outputs?.[0] ?? null

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
            {savedOk && (
              <div style={s.successToast}>✓ Listing updated successfully</div>
            )}

            {/* Property header card */}
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
                  <div style={s.badgeRow}>
                    <div style={s.propertyTypeBadge}>{listing.property_type}</div>
                    {listing.status === 'active' && <div style={{ ...s.statusBadge, ...s.statusBadgeActive }}>Active</div>}
                    {listing.status === 'sold' && <div style={{ ...s.statusBadge, ...s.statusBadgeSold }}>🎉 Sold</div>}
                    {listing.status === 'inactive' && <div style={{ ...s.statusBadge, ...s.statusBadgeInactive }}>Inactive</div>}
                  </div>
                  <button style={s.editBtn} onClick={() => setEditOpen(true)}>Edit Listing</button>
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

            {/* Generated content */}
            {outputs ? (
              <GeneratedOutput outputs={outputs} />
            ) : (
              <div style={s.noOutputsBox}>
                <p style={s.noOutputsText}>No generated content found for this listing.</p>
              </div>
            )}

            {/* Edit modal */}
            {editOpen && (
              <EditListingModal
                listingId={listing.id}
                onClose={() => setEditOpen(false)}
                onSaved={handleSaved}
                onStatusChanged={status => setListing(prev => prev ? { ...prev, status } : prev)}
              />
            )}
          </>
        ) : null}

      </div>

      <AppFooter />
    </div>
  )
}

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
  navBrand: { display: 'flex', alignItems: 'center', gap: '8px' },
  navSparkle: { fontSize: '18px', color: '#a855f7' },
  navTitle: { fontSize: '16px', fontWeight: '700', color: '#f3f4f6', letterSpacing: '-0.3px' },
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
  headerImage: { width: '100%', height: '280px', objectFit: 'cover', display: 'block' },
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
  statsRow: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' },
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
  badgeRow: { display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' as const },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    letterSpacing: '0.3px',
    textTransform: 'uppercase' as const,
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
    color: '#9ca3af',
  },
}
