import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // store session in localStorage so it survives browser closes
    storage: window.localStorage,
    autoRefreshToken: true,     // silently refresh the access token before it expires
    detectSessionInUrl: true,   // pick up the OAuth token from the URL after Google login
  },
})
