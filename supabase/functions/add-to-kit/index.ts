// supabase/functions/add-to-kit/index.ts
//
// Edge Function: add-to-kit
// Adds a subscriber to the ListingIgnite Waitlist form in Kit (ConvertKit).
//
// Required secrets (set via Supabase CLI):
//   KIT_API_KEY   — Kit V3 API key
//   KIT_API_SECRET — Kit V3 API secret (not used directly in this call but stored for reference)
//   KIT_FORM_ID   — Kit form ID (e.g. 9295798)
//
// ─── Set secrets ─────────────────────────────────────────────────────────────
//   supabase secrets set KIT_API_KEY=your_key --project-ref fmcnfutdyqmwtommnryx
//   supabase secrets set KIT_API_SECRET=your_secret --project-ref fmcnfutdyqmwtommnryx
//   supabase secrets set KIT_FORM_ID=9295798 --project-ref fmcnfutdyqmwtommnryx
//
// ─── Deploy ──────────────────────────────────────────────────────────────────
//   supabase functions deploy add-to-kit --project-ref fmcnfutdyqmwtommnryx
// ─────────────────────────────────────────────────────────────────────────────

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  let email: string
  let firstName: string

  try {
    const body = await req.json()
    email = body.email
    firstName = body.firstName ?? ''
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  if (!email) {
    return new Response(
      JSON.stringify({ error: 'Missing required field: email' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const kitApiKey = Deno.env.get('KIT_API_KEY')
  const kitFormId = Deno.env.get('KIT_FORM_ID')

  console.log('[add-to-kit] Secrets present — KIT_API_KEY:', !!kitApiKey, '| KIT_FORM_ID:', kitFormId ?? 'MISSING')

  if (!kitApiKey || !kitFormId) {
    console.error('[add-to-kit] Aborting — missing KIT_API_KEY or KIT_FORM_ID secret')
    return new Response(
      JSON.stringify({ error: 'Kit integration not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  const kitUrl = `https://api.convertkit.com/v3/forms/${kitFormId}/subscribe`
  console.log(`[add-to-kit] POST ${kitUrl} — email: ${email} | firstName: ${firstName}`)

  const kitRes = await fetch(kitUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: kitApiKey,
      email,
      first_name: firstName,
    }),
  })

  const kitData = await kitRes.json()
  console.log('[add-to-kit] Kit API response — status:', kitRes.status, '| body:', JSON.stringify(kitData))

  if (!kitRes.ok) {
    console.error('[add-to-kit] Kit API returned error status:', kitRes.status)
    return new Response(
      JSON.stringify({ error: 'Failed to add subscriber to Kit', detail: kitData }),
      { status: kitRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  console.log('[add-to-kit] Success — subscriber id:', kitData.subscription?.subscriber?.id)

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
