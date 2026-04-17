import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { callEdgeFunction } from '../lib/edgeFunction'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  credits: number | null
  refreshCredits: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  credits: null,
  refreshCredits: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [credits, setCredits] = useState<number | null>(null)

  const fetchCredits = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single()
    setCredits(data?.credits_remaining ?? null)
  }, [])

  const refreshCredits = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) await fetchCredits(session.user.id)
  }, [fetchCredits])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) fetchCredits(session.user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchCredits(session.user.id)
        // Detect new Google OAuth signups: flag set in Login.tsx before redirect
        if (sessionStorage.getItem('li_signup_check') === '1') {
          sessionStorage.removeItem('li_signup_check')
          const createdAt = new Date(session.user.created_at).getTime()
          const isNewUser = Date.now() - createdAt < 2 * 60 * 1000 // within last 2 minutes
          if (isNewUser) {
            const name = session.user.user_metadata?.full_name ?? session.user.email ?? 'Unknown'
            const email = session.user.email ?? ''
            const time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })
            callEdgeFunction('send-email', {
              to: 'jason@listingignite.com',
              subject: `🆕 New ListingIgnite Signup — ${name}`,
              html: `
                <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:24px;background:#f9fafb;border-radius:8px;">
                  <h2 style="color:#111827;margin:0 0 20px;font-size:20px;">🆕 New Signup</h2>
                  <table style="width:100%;border-collapse:collapse;">
                    <tr><td style="padding:8px 0;color:#6b7280;width:100px;vertical-align:top;">Name</td><td style="padding:8px 0;color:#111827;font-weight:600;">${name}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Email</td><td style="padding:8px 0;color:#111827;">${email}</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Method</td><td style="padding:8px 0;color:#111827;">Google OAuth</td></tr>
                    <tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Time</td><td style="padding:8px 0;color:#111827;">${time}</td></tr>
                  </table>
                </div>
              `,
            }).catch(() => {})
          }
        }
      } else {
        setCredits(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [fetchCredits])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, credits, refreshCredits }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
