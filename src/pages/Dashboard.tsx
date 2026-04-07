import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import EditListingModal from '../components/EditListingModal'
import type { SavedListingData } from '../components/EditListingModal'
import AppFooter from '../components/AppFooter'
import PaywallBanner from '../components/PaywallBanner'
import Logo from '../components/Logo'
import FeedbackButton from '../components/FeedbackButton'

interface Listing {
  id: string
  address: string
  price: number
  bedrooms: number
  bathrooms: number
  property_type: string
  created_at: string
  image_url: string | null
  status: string
}

export default function Dashboard() {
  const { user, credits } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [editingListingId, setEditingListingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'active' | 'sold' | 'inactive'>('active')

  const displayName = user?.user_metadata?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there'

  useEffect(() => {
    document.title = 'ListingIgnite — Dashboard'
  }, [])

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()
      .then(({ data }) => setAvatarUrl(data?.avatar_url ?? null))
  }, [user])

  useEffect(() => {
    if (!user) return

    async function fetchListings() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, address, price, bedrooms, bathrooms, property_type, created_at, image_url, status')
          .eq('user_id', user!.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setListings((data as Listing[]) ?? [])
      } catch {
        setFetchError('Failed to load your listings. Please refresh the page.')
      } finally {
        setLoadingListings(false)
      }
    }

    fetchListings()
  }, [user])

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  function handleListingSaved(updated: SavedListingData) {
    setListings(prev => prev.map(l =>
      l.id === updated.id
        ? { ...l, address: updated.address, price: updated.price, bedrooms: updated.bedrooms, bathrooms: updated.bathrooms, property_type: updated.property_type, image_url: updated.image_url }
        : l
    ))
  }

  function handleStatusChanged(id: string, newStatus: 'active' | 'sold' | 'inactive') {
    setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l))
  }

  const filteredListings = listings.filter(l => l.status === statusFilter)
  const counts = {
    active: listings.filter(l => l.status === 'active').length,
    sold: listings.filter(l => l.status === 'sold').length,
    inactive: listings.filter(l => l.status === 'inactive').length,
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Top nav */}
        <div style={s.nav}>
          <Logo />
          <div style={s.navRight}>
            {credits !== null && (
              <div style={credits > 0 ? s.creditBadge : { ...s.creditBadge, ...s.creditBadgeEmpty }}>
                {credits} credit{credits !== 1 ? 's' : ''} remaining
              </div>
            )}
            <Link to="/profile" style={s.avatarLink} title="Account settings">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={s.avatarImg} />
              ) : (
                (() => {
                  const name = user?.user_metadata?.full_name ?? ''
                  const parts = name.trim().split(' ').filter(Boolean)
                  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                  if (parts.length === 1) return parts[0][0].toUpperCase()
                  return user?.email?.[0].toUpperCase() ?? '?'
                })()
              )}
            </Link>
            <button style={s.signOutBtn} onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        {/* Header row */}
        <div style={s.header}>
          <div>
            <h1 style={s.heading}>Welcome back, {displayName}</h1>
            <p style={s.subheading}>All your generated marketing content, saved automatically.</p>
          </div>
          <Link
            to="/new-listing"
            style={credits === 0 ? { ...s.newBtn, ...s.newBtnDisabled } : s.newBtn}
            onClick={e => { if (credits === 0) e.preventDefault() }}
          >
            ✦ New Listing
          </Link>
        </div>

        {/* Paywall notice */}
        {credits === 0 && <PaywallBanner />}

        {/* Status filter tabs */}
        {!loadingListings && !fetchError && listings.length > 0 && (
          <div style={s.filterBar}>
            {(['active', 'sold', 'inactive'] as const).map(tab => (
              <button
                key={tab}
                style={statusFilter === tab ? { ...s.filterTab, ...s.filterTabActive } : s.filterTab}
                onClick={() => setStatusFilter(tab)}
              >
                {tab === 'active' ? 'Active' : tab === 'sold' ? '🎉 Sold' : 'Inactive'}
                <span style={statusFilter === tab ? { ...s.filterCount, ...s.filterCountActive } : s.filterCount}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loadingListings ? (
          <div style={s.stateBox}>
            <span className="generating-pulse" style={s.stateSparkle}>✦</span>
            <p style={s.stateText}>Loading your listings…</p>
          </div>
        ) : fetchError ? (
          <div style={s.errorBox}>
            <p style={s.errorText}>{fetchError}</p>
            <button style={s.retryBtn} onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState creditsLeft={credits ?? 0} />
        ) : filteredListings.length === 0 ? (
          <div style={s.stateBox}>
            <p style={s.stateText}>
              {statusFilter === 'sold' ? 'No sold listings yet.' : 'No inactive listings.'}
            </p>
          </div>
        ) : (
          <div className="card-grid">
            {filteredListings.map(listing => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onEdit={() => setEditingListingId(listing.id)}
              />
            ))}
          </div>
        )}

      </div>

      {/* Edit modal */}
      {editingListingId && (
        <EditListingModal
          listingId={editingListingId}
          onClose={() => setEditingListingId(null)}
          onSaved={updated => { handleListingSaved(updated); setEditingListingId(null) }}
          onStatusChanged={status => handleStatusChanged(editingListingId, status)}
        />
      )}

      <AppFooter />
      <FeedbackButton />
    </div>
  )
}

// ─── Empty state ────────────────────────────────────────────────────────────

function EmptyState({ creditsLeft }: { creditsLeft: number }) {
  return (
    <div style={e.wrap}>
      <div style={e.iconRing}>🏡</div>
      <h2 style={e.heading}>No listings yet</h2>
      <p style={e.body}>
        Create your first listing and get a complete set of marketing content — MLS description,
        social posts, email blast, flyer copy, video script, and SEO page — in seconds.
      </p>
      <Link
        to="/new-listing"
        style={creditsLeft === 0 ? { ...e.cta, ...e.ctaDisabled } : e.cta}
        onClick={evt => { if (creditsLeft === 0) evt.preventDefault() }}
      >
        ✦ Create Your First Listing
      </Link>
      <div style={e.pillsRow}>
        {['MLS Description', 'Social Posts', 'Email Blast', 'Flyer Copy', 'Video Script', 'SEO Page'].map(label => (
          <span key={label} style={e.pill}>{label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── Listing card ────────────────────────────────────────────────────────────

function ListingCard({
  listing,
  onEdit,
}: {
  listing: Listing
  onEdit: () => void
}) {
  function formatPrice(price: number) {
    return '$' + price.toLocaleString()
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={c.card}>
      {/* Image */}
      <div style={c.imageWrap}>
        {listing.image_url ? (
          <img src={listing.image_url} alt={listing.address} style={c.image} />
        ) : (
          <div style={c.imagePlaceholder}>
            <span style={c.placeholderIcon}>🏡</span>
          </div>
        )}
        <button style={c.editIconBtn} onClick={e => { e.preventDefault(); onEdit() }} title="Edit listing">
          ✎
        </button>
        {listing.status === 'sold' && (
          <div style={c.statusBadgeSold}>🎉 Sold!</div>
        )}
        {listing.status === 'inactive' && (
          <div style={c.statusBadgeInactive}>Inactive</div>
        )}
      </div>

      {/* Body */}
      <div style={c.body}>
        <div style={c.typeBadge}>{listing.property_type}</div>
        <p style={c.address}>{listing.address}</p>
        <p style={c.price}>{formatPrice(listing.price)}</p>
        <div style={c.stats}>
          <span style={c.stat}>{listing.bedrooms} bd</span>
          <span style={c.statDot}>·</span>
          <span style={c.stat}>{listing.bathrooms} ba</span>
          <span style={c.statDot}>·</span>
          <span style={c.statDate}>{formatDate(listing.created_at)}</span>
        </div>
        <Link to={`/listing/${listing.id}`} style={c.viewBtn}>
          View Marketing Content →
        </Link>
      </div>
    </div>
  )
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    color: '#f3f4f6',
    padding: '0 0 80px',
  },
  container: {
    maxWidth: '1160px',
    margin: '0 auto',
    padding: '0 24px',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    borderBottom: '1px solid #2e2e3a',
    marginBottom: '48px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  navBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navSparkle: {
    fontSize: '18px',
    color: '#a855f7',
  },
  navTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f3f4f6',
    letterSpacing: '-0.3px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    flexWrap: 'wrap',
  },
  creditBadge: {
    padding: '5px 12px',
    background: 'rgba(168, 85, 247, 0.15)',
    border: '1px solid rgba(168, 85, 247, 0.4)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#c084fc',
  },
  creditBadgeEmpty: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  avatarLink: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    textDecoration: 'none',
    flexShrink: 0,
    letterSpacing: '-0.3px',
    overflow: 'hidden',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  signOutBtn: {
    padding: '7px 16px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#a0a8b8',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  subheading: {
    fontSize: '14px',
    color: '#a0a8b8',
    margin: 0,
  },
  newBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(139, 47, 232, 0.4)',
    whiteSpace: 'nowrap',
  },
  newBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
    gap: '16px',
  },
  stateSparkle: {
    fontSize: '28px',
    color: '#a855f7',
  },
  stateText: {
    fontSize: '15px',
    color: '#6b7280',
    margin: 0,
  },
  errorBox: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
  },
  errorText: {
    fontSize: '14px',
    color: '#fca5a5',
    margin: '0 0 16px',
  },
  retryBtn: {
    padding: '9px 20px',
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '7px',
    color: '#fca5a5',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  filterBar: {
    display: 'flex',
    gap: '6px',
    marginBottom: '28px',
  },
  filterTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #2e2e3a',
    borderRadius: '8px',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  filterTabActive: {
    background: 'rgba(168, 85, 247, 0.1)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    color: '#c084fc',
  },
  filterCount: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '18px',
    height: '18px',
    padding: '0 5px',
    background: '#2e2e3a',
    borderRadius: '9px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
  },
  filterCountActive: {
    background: 'rgba(168, 85, 247, 0.2)',
    color: '#c084fc',
  },
}

const e: Record<string, React.CSSProperties> = {
  wrap: {
    textAlign: 'center',
    padding: '80px 24px',
    maxWidth: '520px',
    margin: '0 auto',
  },
  iconRing: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    margin: '0 auto 20px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 10px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  body: {
    fontSize: '14px',
    color: '#a0a8b8',
    lineHeight: '1.65',
    margin: '0 0 28px',
  },
  cta: {
    display: 'inline-block',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(139, 47, 232, 0.4)',
    marginBottom: '32px',
  },
  ctaDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  pillsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    justifyContent: 'center',
  },
  pill: {
    padding: '4px 12px',
    background: 'rgba(168, 85, 247, 0.08)',
    border: '1px solid rgba(168, 85, 247, 0.2)',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#7c3aed',
    fontWeight: '500',
  },
}

const c: Record<string, React.CSSProperties> = {
  card: {
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  imageWrap: {
    position: 'relative' as const,
  },
  image: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
    display: 'block',
  },
  editIconBtn: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    width: '30px',
    height: '30px',
    borderRadius: '6px',
    background: 'rgba(0,0,0,0.6)',
    border: '1px solid rgba(255,255,255,0.15)',
    color: '#f3f4f6',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(4px)',
    fontFamily: 'inherit',
    lineHeight: 1,
  },
  imagePlaceholder: {
    width: '100%',
    height: '180px',
    background: 'linear-gradient(135deg, rgba(139,47,232,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    fontSize: '36px',
    opacity: 0.4,
  },
  statusBadgeSold: {
    position: 'absolute' as const,
    bottom: '8px',
    left: '8px',
    padding: '4px 10px',
    background: 'rgba(234, 179, 8, 0.9)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#1a1025',
    backdropFilter: 'blur(4px)',
  },
  statusBadgeInactive: {
    position: 'absolute' as const,
    bottom: '8px',
    left: '8px',
    padding: '4px 10px',
    background: 'rgba(75, 85, 99, 0.85)',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#d1d5db',
    backdropFilter: 'blur(4px)',
  },
  body: {
    padding: '18px 20px 20px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  typeBadge: {
    display: 'inline-block',
    padding: '2px 9px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '600',
    color: '#c084fc',
    letterSpacing: '0.3px',
    textTransform: 'uppercase',
    marginBottom: '8px',
    alignSelf: 'flex-start',
  },
  address: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f3f4f6',
    margin: '0 0 4px',
    lineHeight: '1.35',
  },
  price: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#a855f7',
    margin: '0 0 10px',
    letterSpacing: '-0.3px',
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '16px',
    flex: 1,
  },
  stat: {
    fontSize: '12px',
    color: '#a0a8b8',
    fontWeight: '500',
  },
  statDot: {
    color: '#3a3a4a',
    fontSize: '12px',
  },
  statDate: {
    fontSize: '12px',
    color: '#4b5563',
  },
  viewBtn: {
    display: 'block',
    padding: '10px 16px',
    background: 'rgba(168, 85, 247, 0.1)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '8px',
    color: '#c084fc',
    fontSize: '13px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center',
    marginTop: 'auto',
  },
}
