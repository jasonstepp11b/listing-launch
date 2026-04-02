import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Dashboard</h1>
        <p style={styles.email}>{user?.email}</p>
        <Link to="/new-listing" style={styles.newListingButton}>
          ✦ New Listing
        </Link>
        <button style={styles.signOutButton} onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f0f14 0%, #1a1025 100%)',
    fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
  },
  card: {
    background: '#1c1c24',
    border: '1px solid #2e2e3a',
    borderRadius: '16px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#f3f4f6',
    margin: '0 0 12px',
    letterSpacing: '-0.5px',
  },
  email: {
    fontSize: '15px',
    color: '#9ca3af',
    margin: '0 0 32px',
  },
  newListingButton: {
    display: 'inline-block',
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    marginBottom: '12px',
    boxShadow: '0 4px 14px rgba(147, 51, 234, 0.4)',
  },
  signOutButton: {
    padding: '11px 28px',
    background: 'transparent',
    color: '#a855f7',
    border: '1px solid #a855f7',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}
