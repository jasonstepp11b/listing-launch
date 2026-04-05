import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export default function PaywallBanner() {
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email ?? '')
  const [submitState, setSubmitState] = useState<SubmitState>('idle')

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitState('submitting')

    const { error } = await supabase.from('waitlist').insert({
      email: email.trim(),
      user_id: user?.id ?? null,
    })

    if (error && error.code !== '23505') {
      // 23505 = unique violation — already on the list, treat as success
      setSubmitState('error')
    } else {
      setSubmitState('success')
    }
  }

  return (
    <div style={s.banner}>
      <div style={s.icon}>✦</div>
      <h2 style={s.heading}>You've used your free credits!</h2>
      <p style={s.body}>
        Pricing is coming soon. Join the waitlist to get notified and receive
        bonus credits when we launch.
      </p>

      {submitState === 'success' ? (
        <div style={s.successBox}>
          You're on the list! We'll be in touch soon. 🎉
        </div>
      ) : (
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
    background: 'linear-gradient(135deg, rgba(147,51,234,0.12) 0%, rgba(124,58,237,0.06) 100%)',
    border: '1px solid rgba(168, 85, 247, 0.35)',
    borderRadius: '14px',
    padding: '40px 32px 32px',
    textAlign: 'center',
    marginTop: '32px',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
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
    color: '#9ca3af',
    lineHeight: '1.6',
    margin: '0 0 28px',
    maxWidth: '420px',
    marginLeft: 'auto',
    marginRight: 'auto',
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
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
    boxSizing: 'border-box' as const,
  },
  joinBtnLoading: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'default',
  },
  successBox: {
    display: 'inline-block',
    background: 'rgba(34, 197, 94, 0.08)',
    border: '1px solid rgba(34, 197, 94, 0.25)',
    borderRadius: '10px',
    color: '#86efac',
    fontSize: '15px',
    fontWeight: '500',
    padding: '14px 24px',
    margin: '0 auto',
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
