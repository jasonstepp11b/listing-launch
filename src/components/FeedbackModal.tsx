import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { callEdgeFunction } from '../lib/edgeFunction'
import { useAuth } from '../context/AuthContext'

const TOPICS = [
  'General Feedback',
  'Bug Report',
  'Feature Request',
  'Other',
]

interface Props {
  open: boolean
  onClose: () => void
}

export default function FeedbackModal({ open, onClose }: Props) {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Fetch the user's display name from profiles
  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setFullName(data?.full_name ?? user.email ?? '')
      })
  }, [user])

  // Focus textarea when modal opens; reset state
  useEffect(() => {
    if (open) {
      setTopic(TOPICS[0])
      setMessage('')
      setStatus('idle')
      setTimeout(() => textareaRef.current?.focus(), 50)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (message.trim().length < 10) return

    setSubmitting(true)
    const name = fullName || user?.email || 'Unknown user'
    const email = user?.email ?? ''

    const html = `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
  <div style="background: #7c3aed; padding: 20px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="color: #fff; margin: 0; font-size: 18px; font-weight: 700;">ListingIgnite Feedback</h2>
  </div>
  <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;">
      <tr>
        <td style="padding: 6px 16px 6px 0; color: #6b7280; font-size: 13px; font-weight: 600; white-space: nowrap; vertical-align: top;">From</td>
        <td style="padding: 6px 0; font-size: 14px; color: #111827;">${name} &lt;${email}&gt;</td>
      </tr>
      <tr>
        <td style="padding: 6px 16px 6px 0; color: #6b7280; font-size: 13px; font-weight: 600; white-space: nowrap; vertical-align: top;">Topic</td>
        <td style="padding: 6px 0; font-size: 14px; color: #111827;">${topic}</td>
      </tr>
    </table>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0 0 20px;">
    <p style="margin: 0 0 8px; color: #6b7280; font-size: 13px; font-weight: 600;">Message</p>
    <p style="margin: 0; font-size: 15px; color: #1f2937; line-height: 1.7; white-space: pre-wrap;">${message.trim()}</p>
  </div>
</div>`.trim()

    const { error } = await callEdgeFunction('send-email', {
      to: 'jason@listingignite.com',
      subject: `[ListingIgnite Feedback] ${topic} from ${name}`,
      html,
    })

    if (error) {
      setStatus('error')
      setSubmitting(false)
    } else {
      setStatus('success')
      setSubmitting(false)
      setTimeout(onClose, 2000)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div style={s.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={s.modal} role="dialog" aria-modal="true" aria-label="Share Feedback">
        {/* Header */}
        <div style={s.header}>
          <h2 style={s.heading}>Share Feedback</h2>
          <button style={s.closeBtn} onClick={onClose} type="button" aria-label="Close">✕</button>
        </div>

        {status === 'success' ? (
          <div style={s.successBox}>
            <span style={s.successIcon}>✓</span>
            <p style={s.successText}>Feedback sent. Thank you.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Read-only user info */}
            <div style={s.userInfo}>
              <span style={s.userLabel}>Sending as</span>
              <span style={s.userName}>{fullName || user?.email}</span>
              <span style={s.userEmail}>{fullName ? `· ${user?.email}` : ''}</span>
            </div>

            {/* Topic */}
            <div style={s.field}>
              <label style={s.label}>Topic</label>
              <select
                style={s.select}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                disabled={submitting}
              >
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Message */}
            <div style={s.field}>
              <label style={s.label}>Message</label>
              <textarea
                ref={textareaRef}
                style={s.textarea}
                placeholder="Tell us what's on your mind — bugs, ideas, general thoughts..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={5}
                disabled={submitting}
              />
              <p style={s.charHint}>
                {message.trim().length < 10 && message.length > 0
                  ? `${10 - message.trim().length} more character${10 - message.trim().length === 1 ? '' : 's'} needed`
                  : ''}
              </p>
            </div>

            {status === 'error' && (
              <div style={s.errorBox}>
                Something went wrong sending your feedback. Please try again.
              </div>
            )}

            <button
              style={
                submitting || message.trim().length < 10
                  ? { ...s.submitBtn, ...s.submitBtnDisabled }
                  : s.submitBtn
              }
              type="submit"
              disabled={submitting || message.trim().length < 10}
            >
              {submitting ? 'Sending…' : 'Send Feedback'}
            </button>
          </form>
        )}
      </div>
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
  },
  modal: {
    position: 'fixed',
    bottom: '84px',
    right: '24px',
    zIndex: 1001,
    background: '#1a1a22',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '28px',
    width: '360px',
    maxWidth: 'calc(100vw - 48px)',
    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: 0,
    letterSpacing: '-0.2px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '2px 6px',
    lineHeight: 1,
    fontFamily: 'inherit',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: '#13131a',
    border: '1px solid #2e2e3a',
    borderRadius: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  userLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#4b5563',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  userName: {
    fontSize: '13px',
    color: '#d1d5db',
    fontWeight: '500',
  },
  userEmail: {
    fontSize: '12px',
    color: '#6b7280',
  },
  field: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  select: {
    width: '100%',
    padding: '9px 12px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    background: '#13131a',
    border: '1px solid #3a3a4a',
    borderRadius: '7px',
    color: '#f3f4f6',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    lineHeight: '1.6',
  },
  charHint: {
    margin: '4px 0 0',
    fontSize: '11px',
    color: '#6b7280',
    minHeight: '16px',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '7px',
    color: '#fca5a5',
    fontSize: '13px',
    padding: '10px 12px',
    marginBottom: '14px',
  },
  submitBtn: {
    width: '100%',
    padding: '11px 20px',
    background: 'linear-gradient(135deg, #8b2fe8, #7c3aed)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    boxShadow: '0 4px 14px rgba(139,47,232,0.35)',
  },
  submitBtnDisabled: {
    background: '#2e2e3a',
    color: '#4b5563',
    boxShadow: 'none',
    cursor: 'default',
  },
  successBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 0 8px',
    gap: '12px',
  },
  successIcon: {
    fontSize: '28px',
    color: '#4ade80',
    fontWeight: '700',
  },
  successText: {
    fontSize: '15px',
    color: '#d1d5db',
    margin: 0,
    fontWeight: '500',
  },
}
