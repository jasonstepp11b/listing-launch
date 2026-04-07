import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import AppFooter from '../components/AppFooter'
import Logo from '../components/Logo'
import FeedbackButton from '../components/FeedbackButton'

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface ProfileData {
  full_name: string | null
  avatar_url: string | null
  created_at: string
}

export default function Profile() {
  const { user, credits } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // Name edit
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [savedOk, setSavedOk] = useState(false)

  // Avatar
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const [avatarHover, setAvatarHover] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'ListingIgnite — Account'
  }, [])

  useEffect(() => {
    if (!user) return
    async function fetchProfile() {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, created_at')
        .eq('id', user!.id)
        .single()
      setProfile(data ?? null)
      setLoadingProfile(false)
    }
    fetchProfile()
  }, [user])

  // ── Name editing ─────────────────────────────────────────────────────────

  function startEditName() {
    setNameInput(profile?.full_name ?? '')
    setNameError(null)
    setEditingName(true)
  }

  function cancelEditName() {
    setEditingName(false)
    setNameError(null)
  }

  async function saveName() {
    if (!user) return
    const trimmed = nameInput.trim()
    if (!trimmed) { setNameError('Name cannot be blank.'); return }
    setNameSaving(true)
    setNameError(null)
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
      setNameError('Failed to save. Please try again.')
    } finally {
      setNameSaving(false)
    }
  }

  // ── Avatar upload ─────────────────────────────────────────────────────────

  async function handleAvatarFile(file: File) {
    if (!user) return
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setAvatarError('Please select a JPG, PNG, or WEBP image.')
      return
    }
    setAvatarUploading(true)
    setAvatarError(null)
    try {
      const ext = file.name.split('.').pop()
      // Timestamp in path ensures a fresh URL on every upload (avoids browser caching)
      const storagePath = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(storagePath, file)
      if (uploadError) throw new Error(uploadError.message)

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(storagePath)

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (dbError) throw new Error(dbError.message)

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev)
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setAvatarUploading(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  async function removeAvatar() {
    if (!user) return
    setAvatarUploading(true)
    setAvatarError(null)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id)
      if (error) throw error
      setProfile(prev => prev ? { ...prev, avatar_url: null } : prev)
    } catch {
      setAvatarError('Failed to remove photo. Please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }

  // ── Misc ─────────────────────────────────────────────────────────────────

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

  const avatarUrl = profile?.avatar_url ?? null

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Nav */}
        <div style={s.nav}>
          <Logo />
          <Link to="/dashboard" style={s.backLink}>← Dashboard</Link>
        </div>

        {/* Page header with avatar upload */}
        <div style={s.pageHeader}>
          <div style={s.avatarWrap}>
            {/* Clickable avatar circle */}
            <div
              style={s.avatarCircle}
              onClick={() => !avatarUploading && avatarInputRef.current?.click()}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              title="Click to upload a photo"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Profile" style={s.avatarImg} />
              ) : (
                <span style={s.avatarInitials}>{initials}</span>
              )}

              {/* Hover / uploading overlay */}
              {(avatarHover || avatarUploading) && (
                <div style={s.avatarOverlay}>
                  {avatarUploading
                    ? <span style={s.avatarOverlayText}>…</span>
                    : <span style={s.avatarOverlayText}>📷</span>
                  }
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatarFile(f) }}
            />

            {/* Remove link — only shown when avatar exists */}
            {avatarUrl && !avatarUploading && (
              <button style={s.removeAvatarBtn} onClick={removeAvatar}>
                Remove photo
              </button>
            )}
            {avatarError && <p style={s.avatarError}>{avatarError}</p>}
          </div>

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
                      {nameError && <p style={s.fieldError}>{nameError}</p>}
                      <div style={s.inlineActions}>
                        <button
                          style={nameSaving ? { ...s.saveBtn, ...s.saveBtnDisabled } : s.saveBtn}
                          onClick={saveName}
                          disabled={nameSaving}
                        >
                          {nameSaving ? 'Saving…' : 'Save'}
                        </button>
                        <button style={s.cancelBtn} onClick={cancelEditName} disabled={nameSaving}>
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
                  <span style={s.planBadge}>Free Trial</span>
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
                  <button style={s.signOutBtn} onClick={handleSignOut}>Sign Out</button>
                </div>
              </div>
            </section>
          </>
        )}

      </div>

      <AppFooter />
      <FeedbackButton />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c0c12 0%, #1a1025 100%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
    color: '#a0a8b8',
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
    gap: '24px',
    marginBottom: '32px',
  },

  // Avatar upload area
  avatarWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid #3a3a4a',
    flexShrink: 0,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  avatarInitials: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px',
    userSelect: 'none',
  },
  avatarOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  avatarOverlayText: {
    fontSize: '20px',
    lineHeight: 1,
  },
  removeAvatarBtn: {
    padding: '0',
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '11px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
    textUnderlineOffset: '2px',
  },
  avatarError: {
    fontSize: '11px',
    color: '#fca5a5',
    margin: 0,
    textAlign: 'center',
    maxWidth: '80px',
  },

  heading: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 4px',
    letterSpacing: '-0.4px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  subheading: { fontSize: '14px', color: '#a0a8b8', margin: 0 },

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
    background: '#1a1a22',
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
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
  rowHint: { fontSize: '12px', color: '#6b7280', margin: '4px 0 0', fontWeight: '400' },
  rowValue: { flex: 1, minWidth: 0 },
  rowValueRow: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
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
  divider: { height: '1px', background: '#2e2e3a', margin: '0 24px' },

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
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 2px 8px rgba(139, 47, 232, 0.35)',
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
    color: '#a0a8b8',
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
    color: '#a0a8b8',
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
  creditNumber: { fontSize: '18px', fontWeight: '700', color: '#c084fc', letterSpacing: '-0.3px' },
  creditLabel: { fontSize: '13px', color: '#a0a8b8' },
  creditNote: { fontSize: '13px', color: '#a0a8b8', margin: '0', padding: '14px 24px', lineHeight: '1.55' },

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
  featureList: { margin: 0, padding: '0 0 0 16px', listStyle: 'disc' },
  featureItem: { fontSize: '14px', color: '#a0a8b8', marginBottom: '4px', lineHeight: '1.5' },
  upgradeRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 24px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  upgradeTitle: { fontSize: '14px', fontWeight: '600', color: '#d1d5db', margin: '0 0 3px' },
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
  dangerCard: { border: '1px solid rgba(239, 68, 68, 0.2)' },
  dangerTitle: { color: '#ef4444', borderBottom: '1px solid rgba(239, 68, 68, 0.15)' },
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
