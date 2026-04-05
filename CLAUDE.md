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
| AI Generation | Anthropic API (Claude) via Supabase Edge Function |
| Email | Resend (via Supabase Edge Function) |
| Hosting | Vercel |
| Domain | listingignite.com (registered via Spaceship) |
| Business Email | Zoho Mail (jason@listingignite.com) |

---

## MVP Scope

The MVP is intentionally tight. Ship these six things, nothing more:

1. **Auth** — Supabase Google OAuth login
2. **Listing Input Form** — Hybrid approach: structured fields + optional freeform notes
3. **AI Generation** — Anthropic API call producing all 6 output types in a single request
4. **Output UI** — Tabbed layout per content type, polished presentation
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
The call is made server-side via the `generate-content` Supabase Edge Function.
Outputs are displayed in a tabbed UI.

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
- `status` (text, default: `active`) — one of: `active`, `sold`, `inactive`
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

- **Primary provider:** Google OAuth via Supabase
- **Planned:** Email/password auth (Step E) — to support users without Google accounts
- On first login, a `profiles` row is auto-created with `credits_remaining = 3`
- Session is managed by Supabase client and persists across browser closes via localStorage
- Protected routes redirect unauthenticated users to the login page
- Authenticated users visiting `/` are redirected to `/dashboard`
- Supabase redirect URLs include `https://listingignite.com` and `http://localhost:5173`
- Google Cloud OAuth authorized redirect URIs include the Supabase callback URL, `https://listingignite.com`, and `https://www.listingignite.com`

---

## Email Infrastructure

- **Provider:** Resend (resend.com)
- **Domain:** listingignite.com — verified in Resend via DNS records
- **Sending address:** jason@listingignite.com
- **API key:** stored as a Supabase Edge Function secret (`RESEND_API_KEY`) — never exposed client-side
- **Edge Function:** `supabase/functions/send-email/index.ts` — accepts POST with `{ to, subject, html, replyTo? }` and sends via Resend
- **Frontend helper:** `src/lib/edgeFunction.ts` — `callEdgeFunction(name, payload)` utility for calling any Edge Function with auth headers
- **Planned email types:** feedback notifications to jason@listingignite.com, transactional emails to users, and marketing/product update emails to opted-in users and leads
- **Status:** Resend account suspended on signup — reactivation request submitted with full use case details. Awaiting response (submitted over Easter holiday weekend — expect reply Monday/Tuesday).

---

## Supabase Edge Functions

Edge Functions are server-side Deno functions that run on Supabase's infrastructure. They keep secrets off the client side.

**Current Edge Functions:**
- `send-email` — sends email via Resend API
- `generate-content` — calls Anthropic API server-side to generate all 6 marketing outputs

**Deploy commands:**
```bash
# Deploy a function
supabase functions deploy generate-content --project-ref fmcnfutdyqmwtommnryx
supabase functions deploy send-email --project-ref fmcnfutdyqmwtommnryx

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref fmcnfutdyqmwtommnryx
supabase secrets set RESEND_API_KEY=re_... --project-ref fmcnfutdyqmwtommnryx

# List secrets (shows digests only, not actual values)
supabase secrets list --project-ref fmcnfutdyqmwtommnryx
```

---

## Environment Variables

### Frontend (Vercel + local `.env.local`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

> Note: `VITE_ANTHROPIC_API_KEY` has been removed from both `.env.local` and Vercel environment variables. The Anthropic API is now called exclusively server-side via the `generate-content` Edge Function.

### Supabase Edge Function Secrets
| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key — server-side only, never exposed to client |
| `RESEND_API_KEY` | Resend API key for sending email |

---

## Key UX Principles

- **Output presentation is the product.** Generated content must look polished and trustworthy.
- Tabs should be clearly labeled, content should be well-formatted, and readable.
- A loading state (with a progress indicator) is important — generation may take 5–15 seconds.
- Saved listings should be accessible from a simple dashboard so agents can revisit past work.
- **Editing is non-destructive.** Editing a listing never triggers a new AI generation or deducts credits.
- **No hard deletes.** Listings are never permanently deleted — they are marked as `sold` or `inactive` to preserve data integrity and prevent credit abuse disputes.
- **Edit modal pattern.** Listing editing is handled via a reusable `EditListingModal` component, triggered from both the dashboard card (pencil icon) and the listing detail page ("Edit Listing" button).
- **No copy buttons.** Copy buttons were removed due to inconsistent clipboard behavior. Users are guided to manually highlight and copy text directly from the UI, which works reliably across all apps and platforms.

---

## UI Patterns & Component Notes

### `EditListingModal`
- Located at `src/components/EditListingModal.tsx`
- Reusable modal for editing listing details, replacing property images, and managing listing status
- Triggered from two places: the pencil icon on dashboard cards, and the "Edit Listing" button on the listing detail page
- Status section appears at the top of the modal above all other fields
- Status changes are staged (not saved until "Save Changes" is clicked) — no native browser confirm dialogs
- On save, updates the `listings` table and handles image replacement via Supabase Storage
- Uses timestamps in storage filenames to avoid browser caching issues
- Scrollable to handle all fields on smaller screens

### Dashboard Cards
- 3 columns desktop, 2 columns tablet, 1 column mobile
- Each card shows: property image (or placeholder), address, price, property type, beds/baths, date generated
- Two actions per card: "View Marketing Content →" (navigates to listing detail) and a pencil icon (opens EditListingModal)
- Dashboard shows `active` listings by default — filter tabs for Active / Sold / Inactive
- Sold cards show a 🎉 badge, Inactive cards show a subtle "Inactive" badge

### Listing Detail Page
- Hero section shows property image, address, price, beds/baths/sqft, features, and a read-only status badge
- Status badge is color coded: green (Active), gold (Sold), grey (Inactive)
- "Edit Listing" button in hero section opens EditListingModal
- Marketing content tabs below the hero section
- No copy buttons — helper tip text guides users to manually highlight and copy

### Landing Page (`src/pages/Landing.tsx`)
- Route: `/` for unauthenticated users
- Authenticated users visiting `/` are redirected to `/dashboard`
- Sections: Nav, Hero, Problem, Features (6 output types), How It Works (3 steps), CTA, Footer
- Matches dark premium aesthetic of the app with purple accents
- Fully responsive (mobile, tablet, desktop)

---

## Security Notes

- ✅ **Anthropic API key is fully secured** — moved to Supabase Edge Function secret. No longer in `.env.local` or Vercel environment variables. Never exposed to the browser.
- ✅ **Resend API key is secured** — stored as Supabase Edge Function secret, never client-side.
- ⚠️ **GitHub repository is currently public** — to work around Vercel Hobby plan deployment restrictions. To make private again: ensure git committer email matches Vercel account email (`jason@listingignite.com`) by running `git config --global user.email "jason@listingignite.com"`.

---

## Out of Scope for MVP

- Payment processing / Stripe integration
- PDF/image export of flyer
- Direct social media posting (API integrations)
- Team accounts or agency plans
- Custom branding per agent
- Mobile app
- Agent writing style personalization (see Future Roadmap below)
- Projects concept / multi-campaign per property (see Future Roadmap below)

---

## Future Roadmap (Post-MVP)

### 📧 Feedback Form
**Priority: High — blocked until Resend account is reactivated**

A "Share Feedback" button visible on all protected pages (bottom right corner). Opens a modal with a topic dropdown and message textarea. User name and email are pre-filled from their profile. Submits via the `send-email` Edge Function to jason@listingignite.com.

---

### ✍️ Agent Writing Style Personalization
**Priority: High — build after core MVP is validated**

Allow agents to upload a PDF containing examples of their past writing. The AI uses this as a style reference to generate copy that sounds like the agent, not generic AI.

**Trigger to build:** When users say "I love it, but it doesn't sound like me."

---

### 📁 Projects — Multi-Campaign Per Property
**Priority: High — major product evolution**

One property = a living project with multiple marketing campaigns over its lifetime.

**Example campaign types:** New Listing, Price Drop, Open House, Back on Market, Just Sold

**Data model changes needed:**
- New `projects` table (one per property) with shared property details and image
- Existing `listings` table becomes `campaigns` — linked to a project with a `campaign_type` field
- Dashboard shows projects as top-level cards, campaigns nested inside
- Credits consumed per campaign generation

**Trigger to build:** After MVP is validated with real users.

---

### 💳 Stripe Billing & Subscription Tiers
**Priority: High — required for revenue**

Wire up Stripe for credit purchases and subscription plans. Stripe webhooks update `credits_remaining` in Supabase on successful payment.

---

### 👤 Admin Panel
**Priority: Medium — build after feature set is stable**

Internal tool for managing users, manually adjusting credits, viewing usage stats, and monitoring overall app health. Intentionally deferred until the feature set stops changing frequently.

---

## Project Status

- [x] Project scaffolded (Vite + React + TS)
- [x] Supabase project created & env vars configured
- [x] Supabase Google OAuth enabled
- [x] Database schema applied (profiles, listings, generated_outputs)
- [x] Auth flow implemented (Google OAuth, protected routes, auth context)
- [x] Session persistence fixed (survives browser close via localStorage)
- [x] Listing input form built (hybrid structured + freeform)
- [x] Anthropic API integration complete (single call, all 6 outputs)
- [x] Anthropic API key migrated to Supabase Edge Function (server-side only)
- [x] Output UI (tabs + loading state + manual copy helper text)
- [x] Listings and outputs saved to Supabase
- [x] Credit tracking implemented (deduct on success, block at 0)
- [x] Paywall placeholder built
- [x] Polish & UX pass complete
- [x] Property image upload (Supabase Storage, property-images bucket)
- [x] Dashboard card grid redesign (3 col, image cards, listing detail page)
- [x] Edit listing details + image replacement (EditListingModal)
- [x] Profile / Account page with avatar upload
- [x] Listing status management (Active / Sold / Inactive via EditListingModal)
- [x] Supabase Edge Function foundation (send-email + generate-content)
- [x] Resend account created, domain verified, API key set in Supabase secrets
- [x] Landing page live at listingignite.com
- [x] Deployed to Vercel + custom domain connected (listingignite.com)
- [x] Google OAuth and Supabase redirect URLs updated for production
- [x] Resend reactivation request submitted
- [ ] Resend account reactivated (pending — submitted over Easter holiday weekend)
- [ ] Step E — Email/password auth (non-Google login)
- [ ] Feedback form UI (blocked until Resend reactivated)
- [ ] Make GitHub repo private again (fix git identity: jason@listingignite.com)
