import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

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
      if (session?.user) fetchCredits(session.user.id)
      else setCredits(null)
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
