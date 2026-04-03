// src/lib/edgeFunction.ts
//
// Utility for calling Supabase Edge Functions from the frontend.
// Automatically attaches the current user's session token so Edge Functions
// can verify the caller is authenticated (via Supabase Auth helpers on the
// Deno side if needed).
//
// Usage:
//   import { callEdgeFunction } from '../lib/edgeFunction'
//
//   const { data, error } = await callEdgeFunction('send-email', {
//     to: 'agent@example.com',
//     subject: 'Your listing is live!',
//     html: '<p>Congrats!</p>',
//   })

import { supabase } from './supabase'

// Base URL for Edge Functions — reads from the same env var used by the Supabase client.
// In production this resolves to: https://<project-ref>.supabase.co/functions/v1
// In local development (supabase start): http://localhost:54321/functions/v1
const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

export interface EdgeFunctionResult<T = unknown> {
  data: T | null
  error: string | null
}

export async function callEdgeFunction<T = unknown>(
  functionName: string,
  payload: Record<string, unknown>,
): Promise<EdgeFunctionResult<T>> {
  // Get the current session token so the Edge Function can authenticate the caller
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY

  let response: Response
  try {
    response = await fetch(`${FUNCTIONS_BASE_URL}/${functionName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // Required by Supabase Edge Function routing
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(payload),
    })
  } catch (networkErr) {
    return {
      data: null,
      error: networkErr instanceof Error ? networkErr.message : 'Network error',
    }
  }

  let body: Record<string, unknown>
  try {
    body = await response.json()
  } catch {
    return {
      data: null,
      error: `Unexpected response from ${functionName} (status ${response.status})`,
    }
  }

  if (!response.ok) {
    const errMsg = typeof body.error === 'string'
      ? body.error
      : `Edge function error (status ${response.status})`
    return { data: null, error: errMsg }
  }

  return { data: body as T, error: null }
}
