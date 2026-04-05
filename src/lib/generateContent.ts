// The Anthropic API call has been moved server-side to:
//   supabase/functions/generate-content/index.ts
// The API key is now stored as a Supabase secret and never sent to the browser.

import { callEdgeFunction } from './edgeFunction'

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

export async function generateContent(listing: ListingInput): Promise<GeneratedOutputs> {
  console.log('[generateContent] Calling generate-content edge function — address:', listing.address)

  const { data, error } = await callEdgeFunction<GeneratedOutputs>('generate-content', { ...listing })

  if (error) {
    console.error('[generateContent] Edge function returned an error:', error)
    throw new Error(error)
  }

  if (!data) {
    console.error('[generateContent] Edge function returned no data and no error')
    throw new Error('No content returned from generate-content function')
  }

  console.log('[generateContent] Success — received keys:', Object.keys(data).join(', '))
  return data
}
