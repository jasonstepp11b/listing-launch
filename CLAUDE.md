# ListingIgnite – Project Brief & Developer Guide

## Overview

**ListingIgnite** is a SaaS web app built for real estate agents. The core promise:
paste/fill in a property listing → instantly get everything needed to market it everywhere.

Agents currently spend 1–3 hours per listing creating marketing content manually.
This app eliminates that entirely.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript |
| Auth & Database | Supabase (OAuth via Google, PostgreSQL) |
| AI Generation | Anthropic API (Claude) |
| Hosting | TBD |

---

## MVP Scope

The MVP is intentionally tight. Ship these six things, nothing more:

1. **Auth** — Supabase Google OAuth login
2. **Listing Input Form** — Hybrid approach: structured fields + optional freeform notes
3. **AI Generation** — Anthropic API call producing all 6 output types in a single request
4. **Output UI** — Tabbed layout per content type, copy-to-clipboard buttons, polished presentation
5. **Persistence** — Save listing inputs + generated outputs to Supabase per user
6. **Credit Tracking** — 3 free listings per user, then a paywall placeholder (no real payment yet)

---

## Input Form Design

Use a **hybrid approach**:
- Structured fields for reliable, consistent AI output
- A freeform "Additional Notes / Highlights" textarea for agent personality and extras

### Structured Fields
- Property address
- Listing price
- Bedrooms / Bathrooms / Square footage
- Property type (Single Family, Condo, Townhouse, Multi-Family, Land, Commercial)
- Key features (multi-select or tags: e.g. pool, garage, renovated kitchen, waterfront)
- Neighborhood highlights
- Target buyer (optional: First-Time Buyer, Investor, Luxury, Family, Downsizer, Out-of-State Buyer, Tax Incentive Buyer, Retiree Buyer, Any)

### Freeform Field
- "Anything else you'd like to highlight?" (open textarea)

---

## AI Output Types

All 6 outputs are generated in a **single Anthropic API call** from one structured prompt.
Outputs are displayed in a tabbed UI with individual copy buttons.

| Tab | Output |
|---|---|
| MLS Description | Optimized property description for MLS submission |
| Social Media | Separate posts for Facebook, Instagram, and X (Twitter) |
| Email Blast | Ready-to-send email to a buyer list |
| Flyer Copy | Headline + body copy for a printable property flyer |
| Video Script | Short-form script for YouTube, Reels, or TikTok |
| SEO Landing Page | Headline, subheadline, body copy, and CTA for a property web page |

---

## Database Schema (Supabase)

### `profiles`
Extends Supabase auth.users.
- `id` (uuid, FK to auth.users)
- `full_name` (text)
- `email` (text)
- `credits_remaining` (integer, default: 3)
- `avatar_url` (text, nullable) — public Supabase Storage URL, stored under `avatars/{userId}/{filename}`
- `created_at` (timestamp)

### `listings`
- `id` (uuid, PK)
- `user_id` (uuid, FK to profiles)
- `address` (text)
- `price` (numeric)
- `bedrooms`, `bathrooms`, `sqft` (integer / numeric)
- `property_type` (text)
- `features` (text array)
- `neighborhood_highlights` (text)
- `target_buyer` (text)
- `additional_notes` (text)
- `image_url` (text, nullable) — public Supabase Storage URL, stored under `{userId}/{listingId}/{timestamp}-{filename}`
- `created_at` (timestamp)

### `generated_outputs`
- `id` (uuid, PK)
- `listing_id` (uuid, FK to listings)
- `user_id` (uuid, FK to profiles)
- `mls_description` (text)
- `social_facebook` (text)
- `social_instagram` (text)
- `social_x` (text)
- `email_blast` (text)
- `flyer_copy` (text)
- `video_script` (text)
- `seo_landing_page` (text)
- `created_at` (timestamp)

---

## Credit System

- New users receive **3 free credits** on signup
- Each generation (1 listing → all 6 outputs) costs **1 credit**
- Credits are only deducted after both the API call AND the Supabase save succeed — failed generations are never charged
- After 0 credits, the generate button is disabled and a paywall placeholder is shown
- No real payment processing in MVP — just a "Coming Soon / Join Waitlist" CTA

> ⚠️ **TODO — Pricing & Credit Model (Post-MVP)**
>
> The monetization model needs to be defined before launch. Open questions:
> - What is the credit-to-dollar conversion? (e.g. 1 credit = $1? 10 credits = $9?)
> - What subscription tiers make sense? (e.g. $19/mo = 15 listings, $49/mo = unlimited)
> - Do credits roll over month to month?
> - Is there a per-listing pay-as-you-go option alongside subscriptions?
> - What payment processor to use? (Stripe is the obvious choice)
> - How do we handle Stripe webhooks updating Supabase credit balances?

---

## Auth Flow

- **Provider:** Google OAuth via Supabase
- On first login, a `profiles` row is auto-created with `credits_remaining = 3`
- Session is managed by Supabase client — no custom JWT handling needed
- Protected routes redirect unauthenticated users to the login page

---

## Key UX Principles

- **Output presentation is the product.** Generated content must look polished and trustworthy.
- Tabs should be clearly labeled, content should be well-formatted, and copy buttons must be prominent.
- A loading state (with a progress indicator) is important — generation may take 5–15 seconds.
- Saved listings should be accessible from a simple dashboard so agents can revisit past work.
- **Editing is non-destructive.** Editing a listing never triggers a new AI generation or deducts credits.
- **Edit modal pattern.** Listing editing is handled via a reusable `EditListingModal` component, triggered from both the dashboard card (pencil icon) and the listing detail page ("Edit Listing" button). This keeps the two actions — viewing marketing content and editing listing details — feeling distinct and purposeful.

---

## UI Patterns & Component Notes

### `EditListingModal`
- Located at `src/components/EditListingModal.tsx`
- Reusable modal for editing listing details and replacing property images
- Triggered from two places: the pencil icon on dashboard cards, and the "Edit Listing" button on the listing detail page
- On save, updates the `listings` table and handles image replacement via Supabase Storage
- Uses timestamps in storage filenames to avoid browser caching issues (e.g. `{userId}/{listingId}/{timestamp}-{filename}`)
- Parent components update their local state after a successful save so UI reflects changes immediately
- Scrollable to handle all fields on smaller screens

### Dashboard Cards
- 3 columns desktop, 2 columns tablet, 1 column mobile
- Each card shows: property image (or placeholder), address, price, property type, beds/baths, date generated
- Two actions per card: "View Marketing Content →" (navigates to listing detail) and a pencil icon (opens EditListingModal)

---

## Security Notes

- The Anthropic API key is currently exposed on the client side via `VITE_ANTHROPIC_API_KEY`. This is acceptable for MVP/local development only.
- Before any public launch, the Anthropic API call must be moved to a server-side function (e.g. Supabase Edge Function) to protect the API key.

---

## Out of Scope for MVP

- Payment processing / Stripe integration
- PDF/image export of flyer
- Direct social media posting (API integrations)
- Team accounts or agency plans
- Custom branding per agent
- Email delivery (SMTP / SendGrid)
- Mobile app
- Agent writing style personalization (see Future Roadmap below)
- Projects concept / multi-campaign per property (see Future Roadmap below)

---

## Future Roadmap (Post-MVP)

### ✍️ Agent Writing Style Personalization
**Priority: High — build after core MVP is validated**

Allow agents to upload a PDF or document containing examples of their past posts, videos, emails, or any written content. The AI will use this as a style reference to generate marketing copy that sounds like the agent — not generic AI.

Suggested implementation:
- Agent creates a Google Doc with examples of their writing (posts, emails, video scripts they've published)
- Exports it as a PDF and uploads it to ListingIgnite
- PDF is stored in Supabase Storage, linked to their profile
- On generation, the PDF text is extracted and injected into the Anthropic prompt as a style guide
- The prompt instructs Claude to match the agent's tone, vocabulary, and voice

Why this matters: Agents have distinct personal brands. Their audience follows *them*, not just the property. Content that sounds like the agent is significantly more valuable than generic AI copy — and could justify a premium credit tier.

**Trigger to build:** When users say "I love it, but it doesn't sound like me."

---

### 📁 Projects — Multi-Campaign Per Property
**Priority: High — major product evolution**

Right now, one listing = one set of marketing content. The Projects concept reframes this into a much more powerful model:

> One property = a living project with multiple marketing campaigns over its lifetime

Instead of "listings," agents would create a **Project** for each property. Within that project, they can run multiple **campaigns** depending on where they are in the sales cycle. Each campaign generates a fresh full set of marketing content tailored to that moment.

**Example campaign types:**
- **New Listing** — full launch copy, all 6 outputs, maximum excitement
- **Price Drop** — urgency-focused copy highlighting the new value opportunity
- **Open House** — event-driven copy with date/time details and a strong CTA to attend
- **Back on Market** — copy addressing the return with a positive spin
- **Just Sold** — social proof content for the agent's brand

**Why this matters:**
Agents work with a property for weeks or months. Every milestone is a new marketing moment. This turns ListingIgnite from a one-time tool into an indispensable part of their entire listing workflow — dramatically increasing retention and credit consumption.

**What needs to change in the data model:**
- Introduce a `projects` table (one per property) containing the shared property details and image
- The existing `listings` table effectively becomes `campaigns` — linked to a project, with a `campaign_type` field
- The dashboard would show projects as the top-level cards, with campaigns nested inside each project
- Credits are consumed per campaign generation, not per project

**Trigger to build:** After the MVP is validated with real users and the core loop is proven.

---

## Project Status

- [x] Project scaffolded (Vite + React + TS)
- [x] Supabase project created & env vars configured
- [x] Supabase Google OAuth enabled
- [x] Database schema applied
- [x] Auth flow implemented
- [x] Listing input form built
- [x] Anthropic API integration complete
- [x] Output UI (tabs + copy buttons) built
- [x] Listings saved to Supabase
- [x] Credit tracking implemented
- [x] Paywall placeholder built
- [x] Step 10 polish & UX pass complete
- [x] Property image upload (Supabase Storage)
- [x] Dashboard card grid redesign with listing detail page
- [x] Step A2a — image upload on existing listings + edit listing details
- [x] Step B — Profile / Account page with avatar upload
- [ ] Step A2b — EditListingModal refactor (reusable modal from dashboard + detail page)
- [ ] Step C — Landing page
- [ ] MVP deployed
