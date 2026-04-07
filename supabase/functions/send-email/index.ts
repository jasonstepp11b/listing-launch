// supabase/functions/send-email/index.ts
//
// Edge Function: send-email
// Accepts a POST request and sends a transactional email via Resend.
//
// Required environment variable (set in Supabase Dashboard → Edge Functions → Secrets):
//   RESEND_API_KEY  — your Resend API key (re_...)
//
// ─── Local development ───────────────────────────────────────────────────────
//   1. supabase start                        (starts local Supabase stack)
//   2. supabase functions serve send-email   (hot-reloads this function)
//   3. POST http://localhost:54321/functions/v1/send-email
//      Header: Authorization: Bearer <your-local-anon-key>
//
//   Set local secrets in supabase/.env.local (gitignored):
//     RESEND_API_KEY=re_your_key_here
//   Then: supabase functions serve send-email --env-file supabase/.env.local
//
// ─── Deployment ──────────────────────────────────────────────────────────────
//   supabase functions deploy send-email --project-ref <your-project-ref>
//
//   Set secrets in Supabase Dashboard → Project Settings → Edge Functions → Secrets
//   Or via CLI:
//     supabase secrets set RESEND_API_KEY=re_... --project-ref <your-project-ref>
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://listingignite.com',
  'https://www.listingignite.com',
]

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

interface EmailPayload {
  to: string
  subject: string
  html: string
  replyTo?: string
}

serve(async (req: Request) => {
  const cors = corsHeaders(req)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  let payload: EmailPayload
  try {
    payload = await req.json()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  const { to, subject, html, replyTo } = payload

  // Validate required fields
  if (!to || !subject || !html) {
    const missing = ['to', 'subject', 'html'].filter(k => !payload[k as keyof EmailPayload])
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return new Response(
      JSON.stringify({ error: 'Email service not configured' }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  // Send via Resend API
  const resendPayload: Record<string, unknown> = {
    from: 'ListingIgnite <hello@listingignite.com>', // update to your verified Resend sender
    to,
    subject,
    html,
  }
  if (replyTo) resendPayload.reply_to = replyTo

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resendPayload),
  })

  const resendData = await resendRes.json()

  if (!resendRes.ok) {
    console.error('Resend error:', resendData)
    return new Response(
      JSON.stringify({ error: 'Failed to send email', detail: resendData }),
      { status: resendRes.status, headers: { ...cors, 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ success: true, id: resendData.id }),
    { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } },
  )
})
