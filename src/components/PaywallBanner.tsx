import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callEdgeFunction } from '../lib/edgeFunction'
import { useAuth } from '../context/AuthContext'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function PaywallBanner() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')
  const [checkingWaitlist, setCheckingWaitlist] = useState(true)
  const [alreadyJoined, setAlreadyJoined] = useState(false)

  // On mount, check if this user is already on the waitlist (by user_id)
  useEffect(() => {
    if (!user?.id) {
      setCheckingWaitlist(false)
      return
    }
    supabase
      .from('waitlist')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        setAlreadyJoined(!!data)
        setCheckingWaitlist(false)
      })
  }, [user?.id])

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitState('submitting')

    // Save to Supabase waitlist — source of truth
    const { error } = await supabase.from('waitlist').insert({
      email: email.trim(),
      user_id: user?.id ?? null,
    })

    if (error && error.code !== '23505') {
      // 23505 = unique violation — already on the list, treat as success
      setSubmitState('error')
      return
    }

    // Also add to Kit — awaited but never blocks success state on failure
    try {
      console.log('[PaywallBanner] Fetching profile for Kit sync — user id:', user?.id)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id ?? '')
        .single()

      if (profileError) {
        console.warn('[PaywallBanner] Profile fetch failed (non-blocking):', profileError.message)
      }

      const fullName = profile?.full_name ?? ''
      const firstName = fullName.split(' ')[0] ?? ''
      console.log('[PaywallBanner] Calling add-to-kit — email:', email.trim(), '| firstName:', firstName)

      const { data: kitData, error: kitError } = await callEdgeFunction('add-to-kit', {
        email: email.trim(),
        firstName,
      })

      if (kitError) {
        console.error('[PaywallBanner] add-to-kit returned error (non-blocking):', kitError)
      } else {
        console.log('[PaywallBanner] add-to-kit success:', kitData)
      }
    } catch (err) {
      console.error('[PaywallBanner] add-to-kit threw unexpectedly (non-blocking):', err)
    }

    setSubmitState('success')
  }

  const showSuccess = alreadyJoined || submitState === 'success'

  return (
    <div style={s.banner}>
      <div style={s.icon}>✦</div>
      <h2 style={s.heading}>You've used your free credits!</h2>

      {checkingWaitlist ? null : showSuccess ? (
        <div style={s.joinedBox}>
          <div style={s.joinedCheck}>✓</div>
          <p style={s.joinedHeading}>You're on the list.</p>
          <p style={s.joinedBody}>
            We'll notify you when pricing launches. You'll get first access and bonus credits.
          </p>
        </div>
      ) : (
        <>
          <p style={s.body}>
            Pricing is coming soon. Join the waitlist to get notified and receive
            bonus credits when we launch.
          </p>
          <form onSubmit={handleWaitlist} style={s.form}>
            <input
              style={s.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              disabled={submitState === 'submitting'}
            />
            <button
              style={submitState === 'submitting' ? { ...s.joinBtn, ...s.joinBtnLoading } : s.joinBtn}
              type="submit"
              disabled={submitState === 'submitting'}
            >
              {submitState === 'submitting' ? 'Joining…' : 'Join Waitlist'}
            </button>
            {submitState === 'error' && (
              <p style={s.errorMsg}>Something went wrong. Please try again.</p>
            )}
          </form>
        </>
      )}

      <div style={s.divider} />

      <button type="button" style={s.upgradeBtn} disabled>
        Upgrade Plan — Coming Soon
      </button>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  banner: {
    background: 'linear-gradient(135deg, rgba(139,47,232,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    borderRadius: '14px',
    padding: '40px 32px 32px',
    textAlign: 'center',
    marginTop: '32px',
    marginBottom: '32px',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  icon: {
    fontSize: '32px',
    marginBottom: '12px',
    color: '#a855f7',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 10px',
    letterSpacing: '-0.3px',
  },
  body: {
    fontSize: '15px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: '0 0 28px',
    maxWidth: '420px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  joinedBox: {
    margin: '4px auto 0',
    maxWidth: '380px',
  },
  joinedCheck: {
    fontSize: '28px',
    color: '#4ade80',
    fontWeight: '700',
    marginBottom: '8px',
  },
  joinedHeading: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 6px',
    letterSpacing: '-0.2px',
  },
  joinedBody: {
    fontSize: '14px',
    color: '#a0a8b8',
    lineHeight: '1.6',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '10px',
    maxWidth: '380px',
    margin: '0 auto',
  },
  input: {
    width: '100%',
    padding: '11px 16px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
    outline: 'none',
  },
  joinBtn: {
    width: '100%',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(139, 47, 232, 0.4)',
    boxSizing: 'border-box' as const,
  },
  joinBtnLoading: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'default',
  },
  errorMsg: {
    fontSize: '13px',
    color: '#fca5a5',
    margin: 0,
  },
  divider: {
    height: '1px',
    background: 'rgba(168, 85, 247, 0.15)',
    margin: '28px auto',
    maxWidth: '320px',
  },
  upgradeBtn: {
    padding: '10px 24px',
    background: 'transparent',
    border: '1px solid #3a3a4a',
    borderRadius: '8px',
    color: '#4b5563',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'not-allowed',
    fontFamily: 'inherit',
  },
}
