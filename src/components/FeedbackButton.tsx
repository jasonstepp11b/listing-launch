import { useState } from 'react'
import FeedbackModal from './FeedbackModal'

export default function FeedbackButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        style={s.btn}
        onClick={() => setOpen(true)}
        type="button"
        aria-label="Share feedback"
      >
        <span style={s.icon}>✦</span>
        <span style={s.label}>Feedback</span>
      </button>

      <FeedbackModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}

const s: Record<string, React.CSSProperties> = {
  btn: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    background: '#1a1a22',
    border: '1px solid #3a3a4a',
    borderRadius: '999px',
    color: '#a0a8b8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
    letterSpacing: '0.1px',
  },
  icon: {
    fontSize: '11px',
    color: '#a855f7',
    lineHeight: 1,
  },
  label: {
    lineHeight: 1,
  },
}
