// ⚠️ SECURITY WARNING:
// The Anthropic API key is exposed client-side here because this is a Vite/React app.
// This is intentional for MVP/local development only.
// Before any public launch, this call MUST be moved to a server-side function
// (e.g. a Supabase Edge Function) so the API key is never sent to the browser.

import Anthropic from '@anthropic-ai/sdk'

export interface ListingInput {
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

export interface GeneratedOutputs {
  mls_description: string
  social_facebook: string
  social_instagram: string
  social_x: string
  email_blast: string
  flyer_copy: string
  video_script: string
  seo_landing_page: string
}

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

function buildPrompt(listing: ListingInput): string {
  const featuresLine = listing.features.length > 0
    ? listing.features.join(', ')
    : 'None specified'

  const targetBuyerLine = listing.targetBuyer || 'General / Any'

  return `You are an expert real estate copywriter. Using the property details below, generate compelling marketing content across all 6 formats.

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

Generate all 6 pieces of marketing content and return them as a single valid JSON object with exactly these keys:

{
  "mls_description": "Optimized MLS property description (150–300 words). Professional tone, highlights key features and lifestyle benefits. Write in 2–3 distinct paragraphs separated by blank lines (\\n\\n). Do NOT write it as one continuous block of text. Use plain ASCII hyphens and standard numerals — no typographic dashes, no special Unicode spacing characters.",
  "social_facebook": "Facebook post (100–200 words). Conversational, engaging, includes a call to action and relevant emojis.",
  "social_instagram": "Instagram caption (50–150 words). Punchy, aspirational, ends with 10–15 relevant hashtags.",
  "social_x": "X (Twitter) post (max 280 characters). Sharp and attention-grabbing with a link placeholder [LINK].",
  "email_blast": "Email to a buyer list. Include a subject line on the first line formatted as 'Subject: ...', then the full email body (150–250 words). Warm, informative, clear CTA.",
  "flyer_copy": "Printable property flyer. Start with a bold headline, then 4–6 bullet-point highlights, then a closing tagline and agent CTA placeholder.",
  "video_script": "Short-form video script (60–90 seconds when read aloud). Include scene directions in [brackets]. Suitable for YouTube, Reels, or TikTok.",
  "seo_landing_page": "SEO landing page copy. Include: Headline, Subheadline, 2–3 paragraph body copy, and a CTA button label. Optimized for search with natural keyword use."
}

Return ONLY the raw JSON object. No markdown, no code fences, no explanation — just the JSON.`
}

export async function generateContent(listing: ListingInput): Promise<GeneratedOutputs> {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: buildPrompt(listing),
      },
    ],
  })

  const rawText = message.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')

  let parsed: GeneratedOutputs
  try {
    parsed = JSON.parse(rawText)
  } catch {
    throw new Error(`Failed to parse AI response as JSON.\n\nRaw response:\n${rawText}`)
  }

  const requiredKeys: (keyof GeneratedOutputs)[] = [
    'mls_description',
    'social_facebook',
    'social_instagram',
    'social_x',
    'email_blast',
    'flyer_copy',
    'video_script',
    'seo_landing_page',
  ]

  for (const key of requiredKeys) {
    if (!parsed[key]) {
      throw new Error(`AI response is missing required key: "${key}"`)
    }
  }

  return parsed
}
