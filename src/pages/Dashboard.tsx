import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import GeneratedOutput from '../components/GeneratedOutput'
import type { GeneratedOutputs } from '../lib/generateContent'

interface Listing {
  id: string
  address: string
  price: number
  property_type: string
  created_at: string
  generated_outputs: GeneratedOutputs[]
}

export default function Dashboard() {
  const { user, credits } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState<Listing[]>([])
  const [loadingListings, setLoadingListings] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'ListingIgnite — Dashboard'
  }, [])

  useEffect(() => {
    if (!user) return

    async function fetchListings() {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('id, address, price, property_type, created_at, generated_outputs(*)')
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

  function formatPrice(price: number) {
    return '$' + price.toLocaleString()
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Top nav */}
        <div style={s.nav}>
          <div style={s.navBrand}>
            <span style={s.navSparkle}>✦</span>
            <span style={s.navTitle}>ListingIgnite</span>
          </div>
          <div style={s.navRight}>
            {credits !== null && (
              <div style={credits > 0 ? s.creditBadge : { ...s.creditBadge, ...s.creditBadgeEmpty }}>
                {credits} credit{credits !== 1 ? 's' : ''} remaining
              </div>
            )}
            <span style={s.navEmail}>{user?.email}</span>
            <button style={s.signOutBtn} onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>

        {/* Header row */}
        <div style={s.header}>
          <div>
            <h1 style={s.heading}>Your Listings</h1>
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
        {credits === 0 && (
          <div style={s.paywall}>
            <strong style={{ color: '#f3f4f6' }}>You've used all your free credits.</strong>
            {' '}Paid plans are coming soon — you'll be notified when they're available.
          </div>
        )}

        {/* Listings */}
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
          <div style={s.emptyCard}>
            <div style={s.emptyIcon}>🏡</div>
            <h2 style={s.emptyHeading}>No listings yet</h2>
            <p style={s.emptyText}>Create your first listing and generate all your marketing content in seconds.</p>
            <Link to="/new-listing" style={s.newBtn}>✦ Create Your First Listing</Link>
          </div>
        ) : (
          <div>
            {listings.map(listing => {
              const isExpanded = expandedId === listing.id
              const outputs = listing.generated_outputs?.[0] ?? null

              return (
                <div key={listing.id} style={s.listingCard}>
                  <div style={s.listingCardTop}>
                    <div style={s.listingMeta}>
                      <h2 style={s.listingAddress}>{listing.address}</h2>
                      <div style={s.listingPills}>
                        <span style={s.pill}>{formatPrice(listing.price)}</span>
                        <span style={s.pill}>{listing.property_type}</span>
                        <span style={{ ...s.pill, ...s.pillMuted }}>{formatDate(listing.created_at)}</span>
                      </div>
                    </div>
                    <button
                      style={isExpanded ? { ...s.viewBtn, ...s.viewBtnActive } : s.viewBtn}
                      onClick={() => setExpandedId(isExpanded ? null : listing.id)}
                    >
                      {isExpanded ? 'Collapse ↑' : 'View Content ↓'}
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={s.outputWrapper}>
                      {outputs
                        ? <GeneratedOutput outputs={outputs} noTopMargin />
                        : <p style={s.noOutputs}>No generated content found for this listing.</p>
                      }
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

      </div>
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

  // Nav
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 0',
    borderBottom: '1px solid #2e2e3a',
    marginBottom: '40px',
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
  navEmail: {
    fontSize: '13px',
    color: '#6b7280',
  },
  signOutBtn: {
    padding: '7px 16px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Header
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '28px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 6px',
    letterSpacing: '-0.5px',
  },
  subheading: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: 0,
  },
  newBtn: {
    display: 'inline-block',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    borderRadius: '9px',
    fontSize: '14px',
    fontWeight: '700',
    textDecoration: 'none',
    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
    whiteSpace: 'nowrap',
  },
  newBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },

  // Paywall
  paywall: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '10px',
    padding: '14px 20px',
    fontSize: '14px',
    color: '#fca5a5',
    marginBottom: '28px',
    lineHeight: '1.5',
    textAlign: 'left',
  },

  // Loading / error states
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

  // Empty state
  emptyCard: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  emptyHeading: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f3f4f6',
    margin: '0 0 10px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '0 0 28px',
    lineHeight: '1.6',
  },

  // Listing cards
  listingCard: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '12px',
    marginBottom: '16px',
    overflow: 'hidden',
  },
  listingCardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  listingMeta: {
    flex: 1,
    minWidth: 0,
  },
  listingAddress: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#f3f4f6',
    margin: '0 0 8px',
    textAlign: 'left',
  },
  listingPills: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  pill: {
    padding: '3px 10px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.25)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    color: '#c084fc',
  },
  pillMuted: {
    background: '#16161e',
    border: '1px solid #2e2e3a',
    color: '#6b7280',
  },
  viewBtn: {
    flexShrink: 0,
    padding: '9px 18px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  viewBtnActive: {
    border: '1px solid #a855f7',
    color: '#a855f7',
    background: 'rgba(168, 85, 247, 0.08)',
  },
  outputWrapper: {
    padding: '0 24px 24px',
    borderTop: '1px solid #2e2e3a',
  },
  noOutputs: {
    textAlign: 'left',
    fontSize: '14px',
    color: '#6b7280',
    padding: '16px 0',
    margin: 0,
  },
}
