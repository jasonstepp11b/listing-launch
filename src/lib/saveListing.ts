import { supabase } from './supabase'
import type { ListingInput, GeneratedOutputs } from './generateContent'

export async function saveListing(
  userId: string,
  form: ListingInput,
  outputs: GeneratedOutputs,
): Promise<string> {
  // Insert listing row
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      user_id: userId,
      address: form.address,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sqft: Number(form.sqft),
      property_type: form.propertyType,
      features: form.features,
      neighborhood_highlights: form.neighborhoodHighlights,
      target_buyer: form.targetBuyer,
      additional_notes: form.additionalNotes,
    })
    .select('id')
    .single()

  if (listingError) throw new Error(`Failed to save listing: ${listingError.message}`)

  // Insert generated outputs linked to the listing
  const { error: outputError } = await supabase
    .from('generated_outputs')
    .insert({
      listing_id: listing.id,
      user_id: userId,
      mls_description: outputs.mls_description,
      social_facebook: outputs.social_facebook,
      social_instagram: outputs.social_instagram,
      social_x: outputs.social_x,
      email_blast: outputs.email_blast,
      flyer_copy: outputs.flyer_copy,
      video_script: outputs.video_script,
      seo_landing_page: outputs.seo_landing_page,
    })

  if (outputError) throw new Error(`Failed to save outputs: ${outputError.message}`)

  // Decrement the user's credit balance (read-then-write is fine for MVP scale)
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single()

  if (profile && profile.credits_remaining > 0) {
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credits_remaining: profile.credits_remaining - 1 })
      .eq('id', userId)

    if (creditError) {
      // Non-fatal: log but don't block the user from seeing their results
      console.error('Failed to decrement credit:', creditError.message)
    }
  }

  return listing.id
}
