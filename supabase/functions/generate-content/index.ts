// supabase/functions/generate-content/index.ts
//
// Edge Function: generate-content
// Receives listing form data, calls the Anthropic API server-side,
// and returns all 6 generated marketing outputs as JSON.
//
// Required environment variable (set as a Supabase secret — never hardcoded):
//   ANTHROPIC_API_KEY  — your Anthropic API key (sk-ant-...)
//
// ─── Set the secret ──────────────────────────────────────────────────────────
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref <your-project-ref>
//
// ─── Deploy ──────────────────────────────────────────────────────────────────
//   supabase functions deploy generate-content --project-ref <your-project-ref>
//
// ─── Local development ───────────────────────────────────────────────────────
//   Add to supabase/.env.local:
//     ANTHROPIC_API_KEY=sk-ant-your_key_here
//   Then:
//     supabase functions serve generate-content --env-file supabase/.env.local
// ─────────────────────────────────────────────────────────────────────────────

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ListingInput {
  address: string
  price: string
  bedrooms: string
  bathrooms: string
  sqft: string
  propertyType: string
  features: string[]
  neighborhoodHighlights: string
  targetBuyer: string
  additionalNotes: string
}

interface GeneratedOutputs {
  mls_description: string
  social_facebook: string
  social_instagram: string
  social_x: string
  email_blast: string
  flyer_copy: string
  video_script: string
  seo_landing_page: string
  youtube_title: string
  youtube_description: string
  youtube_tags: string[]
}

const REQUIRED_KEYS: (keyof GeneratedOutputs)[] = [
  'mls_description',
  'social_facebook',
  'social_instagram',
  'social_x',
  'email_blast',
  'flyer_copy',
  'video_script',
  'seo_landing_page',
  'youtube_title',
  'youtube_description',
  'youtube_tags',
]

function buildPrompt(listing: ListingInput): string {
  const featuresLine = listing.features.length > 0
    ? listing.features.join(', ')
    : 'None specified'

  const targetBuyerLine = listing.targetBuyer || 'General / Any'

  return `You are an expert real estate copywriter. Using the property details below, generate compelling marketing content across all 9 formats.

PROPERTY DETAILS:
- Address: ${listing.address}
- Listing Price: $${Number(listing.price).toLocaleString()}
- Bedrooms: ${listing.bedrooms}
- Bathrooms: ${listing.bathrooms}
- Square Footage: ${listing.sqft} sq ft
- Property Type: ${listing.propertyType}
- Key Features: ${featuresLine}
- Neighborhood Highlights: ${listing.neighborhoodHighlights || 'None provided'}
- Target Buyer: ${targetBuyerLine}
- Additional Notes: ${listing.additionalNotes || 'None provided'}

Generate all 9 pieces of marketing content and return them as a single valid JSON object with exactly these keys:

{
  "mls_description": "Optimized MLS property description (150–300 words). Professional tone, highlights key features and lifestyle benefits. Write in 2–3 distinct paragraphs separated by blank lines (\\n\\n). Do NOT write it as one continuous block of text. Use plain ASCII hyphens and standard numerals — no typographic dashes, no special Unicode spacing characters.",
  "social_facebook": "Facebook post (100–200 words). Conversational, engaging, includes a call to action and relevant emojis.",
  "social_instagram": "Instagram caption (50–150 words). Punchy, aspirational, ends with 10–15 relevant hashtags.",
  "social_x": "X (Twitter) post (max 280 characters). Sharp and attention-grabbing with a link placeholder [LINK].",
  "email_blast": "Email to a buyer list. Include a subject line on the first line formatted as 'Subject: ...', then the full email body (150–250 words). Warm, informative, clear CTA.",
  "flyer_copy": "Printable property flyer. Start with a bold headline, then 4–6 bullet-point highlights, then a closing tagline and agent CTA placeholder.",
  "video_script": "Short-form video script (60–90 seconds when read aloud). Include scene directions in [brackets]. Suitable for YouTube, Reels, or TikTok.",
  "seo_landing_page": "SEO landing page copy. Include: Headline, Subheadline, 2–3 paragraph body copy, and a CTA button label. Optimized for search with natural keyword use.",
  "youtube_title": "SEO-optimized YouTube video title. Maximum 60 characters. Compelling and keyword-rich for real estate search. Do not use quotes or special characters.",
  "youtube_description": "Full YouTube video description (150–300 words). Start with a compelling opening paragraph about the property. Follow with key property highlights. Include a call to action for viewers to contact the listing agent. End with 8–12 relevant hashtags on their own line.",
  "youtube_tags": ["tag1", "tag2", "..."]
}

For youtube_tags: provide an array of 10–15 strings. Include the property type, city/neighborhood, bedroom count (e.g. '3 bedroom home'), price range (e.g. 'homes under 500k'), key features, and general real estate keywords (e.g. 'real estate', 'homes for sale', 'property tour'). Each tag should be lowercase, no hashtag symbol.

Return ONLY the raw JSON object. No markdown, no code fences, no explanation — just the JSON.`
}

serve(async (req: Request) => {
  console.log('[generate-content] Request received:', req.method, req.url)

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('[generate-content] CORS preflight — responding ok')
    return new Response('ok', { headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    console.error('[generate-content] Wrong method:', req.method)
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Check API key presence (log only first/last 4 chars so the key isn't exposed in logs)
  const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!anthropicApiKey) {
    console.error('[generate-content] ANTHROPIC_API_KEY is not set')
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }
  console.log('[generate-content] ANTHROPIC_API_KEY present, starts with:', anthropicApiKey.slice(0, 10) + '...')

  // Parse request body
  let listing: ListingInput
  try {
    listing = await req.json()
    console.log('[generate-content] Payload parsed — address:', listing.address, '| propertyType:', listing.propertyType)
  } catch (err) {
    console.error('[generate-content] Failed to parse request body:', err)
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Call Anthropic API server-side
  console.log('[generate-content] Calling Anthropic API — model: claude-sonnet-4-20250514')
  let anthropicRes: Response
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: buildPrompt(listing) }],
      }),
    })
  } catch (err) {
    console.error('[generate-content] Network error reaching Anthropic:', err)
    return new Response(
      JSON.stringify({ error: 'Failed to reach AI service' }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  console.log('[generate-content] Anthropic responded — HTTP status:', anthropicRes.status)

  if (!anthropicRes.ok) {
    const detail = await anthropicRes.text()
    console.error('[generate-content] Anthropic API error — status:', anthropicRes.status, '| body:', detail)
    return new Response(
      JSON.stringify({ error: `AI service error (${anthropicRes.status})`, detail }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Parse Anthropic response
  const anthropicBody = await anthropicRes.json()
  console.log('[generate-content] Anthropic response — stop_reason:', anthropicBody.stop_reason, '| content blocks:', anthropicBody.content?.length)

  const rawText: string = anthropicBody.content
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { text: string }) => block.text)
    .join('')

  console.log('[generate-content] Raw text length:', rawText.length, '| first 120 chars:', rawText.slice(0, 120))

  // Parse JSON output
  let parsed: GeneratedOutputs
  try {
    parsed = JSON.parse(rawText)
    console.log('[generate-content] JSON parsed successfully — keys present:', Object.keys(parsed).join(', '))
  } catch (err) {
    console.error('[generate-content] JSON parse failed:', err)
    console.error('[generate-content] Full raw text that failed to parse:', rawText)
    return new Response(
      JSON.stringify({ error: 'AI returned an unexpected format — please try again', rawText }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  // Validate all required keys are present
  for (const key of REQUIRED_KEYS) {
    if (!parsed[key]) {
      console.error('[generate-content] Missing required key in parsed output:', key)
      return new Response(
        JSON.stringify({ error: `AI response missing field: ${key}` }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
      )
    }
  }

  console.log('[generate-content] Success — returning all 9 outputs')
  return new Response(
    JSON.stringify(parsed),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  )
})
