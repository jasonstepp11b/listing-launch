import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

interface ProfileData {
  full_name: string | null
  created_at: string
}

export default function Profile() {
  const { user, credits } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Edit state
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    document.title = 'ListingIgnite — Account'
  }, [])

  useEffect(() => {
    if (!user) return

    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, created_at')
        .eq('id', user!.id)
        .single()
      setProfile(data ?? null)
      setLoadingProfile(false)
    }

    fetchProfile()
  }, [user])

  function startEditName() {
    setNameInput(profile?.full_name ?? '')
    setSaveError(null)
    setEditingName(true)
  }

  function cancelEditName() {
    setEditingName(false)
    setSaveError(null)
  }

  async function saveName() {
    if (!user) return
    const trimmed = nameInput.trim()
    if (!trimmed) {
      setSaveError('Name cannot be blank.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: trimmed })
        .eq('id', user.id)
      if (error) throw error
      setProfile(prev => prev ? { ...prev, full_name: trimmed } : prev)
      setEditingName(false)
      setSavedOk(true)
      setTimeout(() => setSavedOk(false), 3000)
    } catch {
      setSaveError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const initials = (() => {
    const name = profile?.full_name ?? user?.user_metadata?.full_name ?? ''
    const parts = name.trim().split(' ').filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return user?.email?.[0].toUpperCase() ?? '?'
  })()

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Nav */}
        <div style={s.nav}>
          <div style={s.navBrand}>
            <span style={s.navSparkle}>✦</span>
            <span style={s.navTitle}>ListingIgnite</span>
          </div>
          <Link to="/dashboard" style={s.backLink}>← Dashboard</Link>
        </div>

        {/* Page header */}
        <div style={s.pageHeader}>
          <div style={s.avatarLg}>{initials}</div>
          <div>
            <h1 style={s.heading}>Account Settings</h1>
            <p style={s.subheading}>Manage your profile and subscription.</p>
          </div>
        </div>

        {/* Success toast */}
        {savedOk && (
          <div style={s.successToast}>✓ Name updated successfully</div>
        )}

        {loadingProfile ? (
          <div style={s.stateBox}>
            <span className="generating-pulse" style={s.stateSparkle}>✦</span>
            <p style={s.stateText}>Loading your profile…</p>
          </div>
        ) : (
          <>
            {/* ── Profile section ────────────────────────────────────── */}
            <section style={s.card}>
              <h2 style={s.cardTitle}>Profile</h2>

              {/* Full name */}
              <div style={s.row}>
                <div style={s.rowLabel}>Full Name</div>
                <div style={s.rowValue}>
                  {editingName ? (
                    <div style={s.inlineEdit}>
                      <input
                        style={s.input}
                        type="text"
                        value={nameInput}
                        onChange={e => setNameInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') cancelEditName() }}
                        autoFocus
                        placeholder="Your full name"
                      />
                      {saveError && <p style={s.fieldError}>{saveError}</p>}
                      <div style={s.inlineActions}>
                        <button
                          style={saving ? { ...s.saveBtn, ...s.saveBtnDisabled } : s.saveBtn}
                          onClick={saveName}
                          disabled={saving}
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button style={s.cancelBtn} onClick={cancelEditName} disabled={saving}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={s.rowValueRow}>
                      <span style={s.valueText}>
                        {profile?.full_name ?? <span style={s.valueMuted}>Not set</span>}
                      </span>
                      <button style={s.editLink} onClick={startEditName}>Edit</button>
                    </div>
                  )}
                </div>
              </div>

              <div style={s.divider} />

              {/* Email */}
              <div style={s.row}>
                <div style={s.rowLabel}>Email Address</div>
                <div style={s.rowValue}>
                  <div style={s.rowValueRow}>
                    <span style={s.valueText}>{user?.email}</span>
                    <span style={s.readOnlyTag}>Managed by Google</span>
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              {/* Member since */}
              <div style={s.row}>
                <div style={s.rowLabel}>Member Since</div>
                <div style={s.rowValue}>
                  <span style={s.valueText}>
                    {profile?.created_at ? formatDate(profile.created_at) : '—'}
                  </span>
                </div>
              </div>
            </section>

            {/* ── Credits section ────────────────────────────────────── */}
            <section style={s.card}>
              <h2 style={s.cardTitle}>Credits</h2>

              <div style={s.row}>
                <div style={s.rowLabel}>Credits Remaining</div>
                <div style={s.rowValue}>
                  <div style={credits !== null && credits > 0 ? s.creditDisplay : { ...s.creditDisplay, ...s.creditDisplayEmpty }}>
                    <span style={s.creditNumber}>{credits ?? '—'}</span>
                    <span style={s.creditLabel}>
                      {credits === 1 ? 'credit remaining' : 'credits remaining'}
                    </span>
                  </div>
                </div>
              </div>

              {credits === 0 && (
                <>
                  <div style={s.divider} />
                  <p style={s.creditNote}>
                    You've used all your free credits. Paid plans are coming soon — you'll be notified when they're available.
                  </p>
                </>
              )}
            </section>

            {/* ── Subscription section ───────────────────────────────── */}
            <section style={s.card}>
              <h2 style={s.cardTitle}>Subscription</h2>

              <div style={s.row}>
                <div style={s.rowLabel}>Current Plan</div>
                <div style={s.rowValue}>
                  <div style={s.rowValueRow}>
                    <span style={s.planBadge}>Free Trial</span>
                  </div>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.row}>
                <div style={s.rowLabel}>Includes</div>
                <div style={s.rowValue}>
                  <ul style={s.featureList}>
                    <li style={s.featureItem}>3 listing generations</li>
                    <li style={s.featureItem}>All 6 output types per listing</li>
                    <li style={s.featureItem}>Saved listing history</li>
                  </ul>
                </div>
              </div>

              <div style={s.divider} />

              <div style={s.upgradeRow}>
                <div>
                  <p style={s.upgradeTitle}>Ready for more?</p>
                  <p style={s.upgradeSubtitle}>Paid plans with unlimited listings are coming soon.</p>
                </div>
                <button style={s.upgradeBtn} disabled>
                  Upgrade Plan — Coming Soon
                </button>
              </div>
            </section>

            {/* ── Danger zone ────────────────────────────────────────── */}
            <section style={{ ...s.card, ...s.dangerCard }}>
              <h2 style={{ ...s.cardTitle, ...s.dangerTitle }}>Account Actions</h2>

              <div style={s.row}>
                <div style={s.rowLabel}>
                  <span style={s.valueText}>Sign out of ListingIgnite</span>
                  <p style={s.rowHint}>You can sign back in anytime with your Google account.</p>
                </div>
                <div style={s.rowValue}>
                  <button style={s.signOutBtn} onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              </div>
            </section>
          </>
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
    maxWidth: '680px',
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

  // Page header
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '32px',
  },
  avatarLg: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
    letterSpacing: '-0.5px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 4px',
    letterSpacing: '-0.4px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  subheading: { fontSize: '14px', color: '#9ca3af', margin: 0 },

  // Toast
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

  // Loading
  stateBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '80px 0',
    gap: '16px',
  },
  stateSparkle: { fontSize: '28px', color: '#a855f7' },
  stateText: { fontSize: '15px', color: '#6b7280', margin: 0 },

  // Cards
  card: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '14px',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    margin: 0,
    padding: '16px 24px',
    borderBottom: '1px solid #2e2e3a',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },

  // Rows
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '18px 24px',
    gap: '24px',
  },
  rowLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#d1d5db',
    width: '160px',
    flexShrink: 0,
    paddingTop: '2px',
  },
  rowHint: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '4px 0 0',
    fontWeight: '400',
  },
  rowValue: { flex: 1, minWidth: 0 },
  rowValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  valueText: { fontSize: '14px', color: '#f3f4f6' },
  valueMuted: { color: '#4b5563', fontStyle: 'italic' },
  readOnlyTag: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    padding: '2px 8px',
    background: '#16161e',
    border: '1px solid #2e2e3a',
    borderRadius: '20px',
    letterSpacing: '0.2px',
  },

  divider: {
    height: '1px',
    background: '#2e2e3a',
    margin: '0 24px',
  },

  // Inline name edit
  inlineEdit: { width: '100%' },
  input: {
    width: '100%',
    padding: '9px 13px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    marginBottom: '8px',
  },
  fieldError: { fontSize: '13px', color: '#fca5a5', margin: '0 0 8px' },
  inlineActions: { display: 'flex', gap: '8px' },
  saveBtn: {
    padding: '8px 20px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.35)',
  },
  saveBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  cancelBtn: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#9ca3af',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  editLink: {
    padding: '4px 12px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '6px',
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },

  // Credits
  creditDisplay: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '20px',
  },
  creditDisplayEmpty: {
    background: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.25)',
  },
  creditNumber: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#c084fc',
    letterSpacing: '-0.3px',
  },
  creditLabel: { fontSize: '13px', color: '#9ca3af' },
  creditNote: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: '0',
    padding: '14px 24px',
    lineHeight: '1.55',
  },

  // Subscription
  planBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    background: 'rgba(168, 85, 247, 0.12)',
    border: '1px solid rgba(168, 85, 247, 0.3)',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#c084fc',
    letterSpacing: '0.2px',
  },
  featureList: {
    margin: 0,
    padding: '0 0 0 16px',
    listStyle: 'disc',
  },
  featureItem: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '4px',
    lineHeight: '1.5',
  },
  upgradeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  upgradeTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#d1d5db',
    margin: '0 0 3px',
  },
  upgradeSubtitle: { fontSize: '13px', color: '#6b7280', margin: 0 },
  upgradeBtn: {
    padding: '10px 20px',
    background: '#2e2e3a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#4b5563',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'not-allowed',
    fontFamily: 'inherit',
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },

  // Danger zone
  dangerCard: {
    border: '1px solid rgba(239, 68, 68, 0.2)',
  },
  dangerTitle: {
    color: '#ef4444',
    borderBottom: '1px solid rgba(239, 68, 68, 0.15)',
  },
  signOutBtn: {
    padding: '9px 20px',
    background: 'transparent',
    border: '1px solid rgba(239, 68, 68, 0.4)',
    borderRadius: '7px',
    color: '#fca5a5',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    flexShrink: 0,
  },
}
