# ListingIgnite – Project Brief & Developer Guide

## Overview

**ListingIgnite** is a SaaS web app built for real estate agents. The core promise:
paste/fill in a property listing → instantly get everything needed to market it everywhere.

Agents currently spend 1–3 hours per listing creating marketing content manually.
This app eliminates that entirely.

**Tagline: "List it. Ignite it."**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React + TypeScript |
| Auth & Database | Supabase (OAuth via Google, PostgreSQL) |
| AI Generation | Anthropic API (Claude) via Supabase Edge Function |
| Email (Transactional) | Resend (via Supabase Edge Function + Supabase SMTP) |
| Email (Marketing) | Kit (ConvertKit) — waitlist subscribers synced via Edge Function |
| Hosting | Vercel |
| Domain | listingignite.com (registered via Spaceship) |
| Business Email | Zoho Mail (jason@listingignite.com) |

---

## MVP Scope

The MVP is intentionally tight. Ship these six things, nothing more:

1. **Auth** — Supabase Google OAuth login + email/password
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

All outputs are generated in a **single Anthropic API call** from one structured prompt.
The call is made server-side via the `generate-content` Supabase Edge Function.
Outputs are displayed in a tabbed UI with copy buttons.

| Tab | Output |
|---|---|
| MLS Description | Optimized property description for MLS submission |
| Social Media | Separate posts for Facebook, Instagram, and X (Twitter) |
| Email Blast | Ready-to-send email to a buyer list |
| Flyer Copy | Headline + body copy for a printable property flyer |
| Video Script | 60-90 second script for YouTube, Reels, or TikTok + YouTube title, description, and tags |
| SEO Landing Page | Headline, subheadline, body copy, and CTA for a property web page |

### YouTube Metadata (inside Video Script tab)
The Video Script tab includes a "YouTube Package" section below the script:
- `youtube_title` — SEO-optimized title, 60 chars max
- `youtube_description` — 150-300 word description with hashtags
- `youtube_tags` — array of 10-15 tags, displayed as chips with "Copy All Tags" button
These are stored in the `generated_outputs` table.

---

## Database Schema (Supabase)

### `profiles`
Extends Supabase auth.users.
- `id` (uuid, FK to auth.users)
- `full_name` (text)
- `email` (text)
- `credits_remaining` (integer, default: 3)
- `avatar_url` (text, nullable) — public Supabase Storage URL, stored under `avatars/{userId}/{filename}`
- `banned` (boolean, default: false) — **planned, not yet built** — for user ban functionality in admin panel
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
- `youtube_title` (text, nullable)
- `youtube_description` (text, nullable)
- `youtube_tags` (text array, nullable)
- `seo_landing_page` (text)
- `created_at` (timestamp)

### `waitlist`
- `id` (uuid, PK)
- `email` (text)
- `user_id` (uuid, nullable FK to profiles)
- `created_at` (timestamp)
- RLS policy: authenticated users can view their own waitlist entry

---

## Credit System

- New users receive **3 free credits** on signup
- Each generation (1 listing → all outputs) costs **1 credit**
- Credits are only deducted after both the API call AND the Supabase save succeed — failed generations are never charged
- After 0 credits, the generate button is disabled and a paywall banner is shown
- Paywall banner includes a waitlist email capture form — submissions saved to `waitlist` table AND synced to Kit
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
- **Secondary provider:** Email/password (with email confirmation enabled)
- On first login, a `profiles` row is auto-created with `credits_remaining = 3`
- Session is managed by Supabase client and persists across browser closes via localStorage
- Protected routes redirect unauthenticated users to the login page
- Authenticated users visiting `/` are redirected to `/dashboard`
- Supabase redirect URLs include `https://listingignite.com/**`, `https://www.listingignite.com/**`, and `http://localhost:5173/**`
- Google Cloud OAuth authorized redirect URIs include the Supabase callback URL, `https://listingignite.com`, and `https://www.listingignite.com`
- Email confirmation is enabled — new email/password signups receive a confirmation email before they can log in
- Google OAuth does not require email confirmation (Google already verified the email)
- Password reset flow is live at `/forgot-password` and `/reset-password`

### Important: Deleting Users
- **Never delete from the `profiles` table to remove a user** — this only removes their public data, not their auth credentials
- To fully remove a user: Supabase → Authentication → Users → find user → Delete
- For banning users, use the planned `banned` column on `profiles` (see Admin Panel in roadmap)

---

## Email Infrastructure

### Resend (Transactional)
- **Account:** Active and verified ✅
- **Domain:** listingignite.com — verified in Resend via DNS records
- **From address:** `noreply@listingignite.com`
- **API key:** stored as Supabase Edge Function secret (`RESEND_API_KEY`)
- **Edge Function:** `supabase/functions/send-email/index.ts` — tested and working ✅
- **CORS:** Uses `'Access-Control-Allow-Origin': '*'` — safe because JWT auth is required

### Kit (ConvertKit) — Email Marketing
- **Account:** Active ✅
- **Form:** ListingIgnite Waitlist (Form ID: `9295798`)
- **API version:** V3 (Legacy) — required for form subscriber API
- **Edge Function:** `supabase/functions/add-to-kit/index.ts` — tested and working ✅
- **Flow:** User joins waitlist → saved to Supabase `waitlist` table → added to Kit form via Edge Function
- **Double opt-in:** Enabled in Kit — subscribers must confirm email before being added
- **Kit confirmation email:** Customized with ListingIgnite branding and copy
- **Secrets:** `KIT_API_KEY`, `KIT_API_SECRET`, `KIT_FORM_ID` stored in Supabase secrets

### Supabase Custom SMTP (Auth Emails)
- Supabase auth emails sent via Resend SMTP
- Host: smtp.resend.com, Port: 465
- From: noreply@listingignite.com
- Custom branded HTML templates for confirmation and password reset emails

### DNS Records (Spaceship)
- **SPF:** `v=spf1 include:zohomail.com include:amazonses.com ~all` (combined, single record)
- **DKIM:** Resend (`resend._do`) + Zoho (`zmail._dom`)
- **DMARC:** `v=DMARC1; p=none; rua=mailto:jason@listingignite.com` on `_dmarc` host
- **MX:** Zoho Mail records for receiving

---

## Supabase Edge Functions

Edge Functions are server-side Deno functions. All use `'Access-Control-Allow-Origin': '*'` for CORS.

**Current Edge Functions:**
- `send-email` — sends email via Resend API ✅ tested
- `generate-content` — calls Anthropic API server-side ✅ tested
- `add-to-kit` — adds subscriber to Kit waitlist form ✅ tested

**Deploy commands:**
```bash
supabase login
supabase functions deploy generate-content --project-ref fmcnfutdyqmwtommnryx
supabase functions deploy send-email --project-ref fmcnfutdyqmwtommnryx
supabase functions deploy add-to-kit --project-ref fmcnfutdyqmwtommnryx
supabase secrets list --project-ref fmcnfutdyqmwtommnryx
```

---

## Environment Variables

### Frontend (Vercel + local `.env.local`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |

### Supabase Edge Function Secrets
| Secret | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key — server-side only |
| `RESEND_API_KEY` | Resend API key for sending email |
| `KIT_API_KEY` | Kit V3 API key |
| `KIT_API_SECRET` | Kit V3 API secret |
| `KIT_FORM_ID` | Kit waitlist form ID (9295798) |

---

## Branding & Design

### Brand Files
- `BRAND-VOICE.md` — brand voice, copy principles, tagline, on/off-brand examples
- `STYLE-GUIDE.md` — colors, typography, spacing, component styles
- `src/pages/StyleGuide.tsx` — visual style guide at `/style-guide` (dev reference only)

### Logo & Favicon
- Flame icon: `src/assets/logo-icon.svg`
- Logo component: `src/components/Logo.tsx` (icon + wordmark, accepts `size` prop: sm/md/lg)
- Favicons: `public/favicon-16.png`, `public/favicon-32.png`
- App icons: `public/logo-192.png`, `public/logo-512.png`
- Open Graph image: `public/og-image.png` (1200x630px)

---

## Key UX Principles

- **Output presentation is the product.** Generated content must look polished and trustworthy.
- Tabs should be clearly labeled, content should be well-formatted, and readable.
- A loading state (with a progress indicator) is important — generation may take 5–15 seconds.
- Saved listings should be accessible from a simple dashboard so agents can revisit past work.
- **Editing is non-destructive.** Editing a listing never triggers a new AI generation or deducts credits.
- **No hard deletes.** Listings are never permanently deleted — marked as `sold` or `inactive`.
- **Edit modal pattern.** Listing editing is handled via `EditListingModal` component.
- **Copy buttons** use `navigator.clipboard.writeText()` with normalized line endings. Works reliably on HTTPS.

---

## UI Patterns & Component Notes

### `EditListingModal`
- Located at `src/components/EditListingModal.tsx`
- Reusable modal for editing listing details, replacing property images, and managing listing status
- Triggered from: pencil icon on dashboard cards, and "Edit Listing" button on listing detail page
- Status section at top of modal — changes staged until "Save Changes" clicked
- Uses timestamps in storage filenames to avoid browser caching issues
- Scrollable to handle all fields on smaller screens

### `FeedbackButton` + `FeedbackModal`
- `src/components/FeedbackButton.tsx` — floating button fixed to bottom right on all authenticated pages
- `src/components/FeedbackModal.tsx` — modal with topic dropdown and message textarea
- User name/email pre-filled from Supabase profile
- Submits via `send-email` Edge Function to jason@listingignite.com
- Subject format: `[ListingIgnite Feedback] {topic} from {user name}`

### Dashboard Cards
- 3 columns desktop, 2 columns tablet, 1 column mobile
- Each card: property image (or placeholder), address, price, property type, beds/baths, date
- Two actions: "View Marketing Content →" and pencil icon (opens EditListingModal)
- Filter tabs: Active / Sold / Inactive
- Sold cards show 🎉 badge, Inactive cards show subtle "Inactive" badge

### Listing Detail Page
- Hero: property image, address, price, beds/baths/sqft, features, read-only status badge
- Status badge: green (Active), gold (Sold), grey (Inactive)
- "Edit Listing" button opens EditListingModal
- Marketing content tabs below hero, each with copy button

### Landing Page (`src/pages/Landing.tsx`)
- Route: `/` for unauthenticated users → authenticated users redirected to `/dashboard`
- Sections: Nav, Hero, Problem, Features, How It Works (3 steps), FAQ (accordion), CTA, Footer
- Footer links to `/blog`, `/privacy`, `/terms`
- Fully responsive (mobile, tablet, desktop)

### Blog
- Blog index: `src/pages/Blog.tsx` at `/blog`
- Blog post layout: `src/pages/BlogPost.tsx` at `/blog/:slug`
- Posts stored as markdown files in `src/content/blog/`
- Images stored in `public/blog/images/`
- Uses `import.meta.glob` (NOT fs) to load markdown files in Vite
- Each post has frontmatter: `title`, `date`, `excerpt`, `featuredImage`, `author`, `tags`, `published`
- Sidebar on desktop: "Get Started Free" CTA card + Recent Posts / Popular Tags
- Sidebar stacks below content on mobile
- Adding a new post: create `.md` file → add frontmatter → add image to `public/blog/images/` → commit and push

### Legal Pages
- `src/pages/PrivacyPolicy.tsx` at `/privacy`
- `src/pages/Terms.tsx` at `/terms`
- Content sourced from `legal-content.md` in project root

### Auth Pages
- Login: `src/pages/Login.tsx` — Google OAuth + email/password, with "Forgot your password?" link
- Forgot Password: `src/pages/ForgotPassword.tsx` at `/forgot-password`
- Reset Password: `src/pages/ResetPassword.tsx` at `/reset-password`
- All auth emails sent from `noreply@listingignite.com` via Resend SMTP

---

## Project Files Reference
- `CLAUDE.md` — main project brief and developer guide (this file)
- `BRAND-VOICE.md` — brand voice, copy principles, tagline
- `STYLE-GUIDE.md` — colors, typography, component styles
- `legal-content.md` — Privacy Policy and Terms of Service content
- `database.sql` — Supabase schema SQL including RLS policies and profile trigger

---

## Security Notes

- ✅ **Anthropic API key** — Supabase Edge Function secret only, never in browser
- ✅ **Resend API key** — Supabase Edge Function secret only, never client-side
- ✅ **Kit API keys** — Supabase Edge Function secrets only, never client-side
- ⚠️ **GitHub repository is public** — required for Vercel Hobby plan. All secrets are in Supabase/Vercel, not the repo.

---

## Out of Scope for MVP

- Payment processing / Stripe integration
- PDF/image export of flyer
- Direct social media posting
- Team accounts or agency plans
- Custom branding per agent
- Mobile app
- Agent writing style personalization (see Future Roadmap)
- Projects concept / multi-campaign per property (see Future Roadmap)

---

## Future Roadmap (Post-MVP)

### 👤 Admin Panel
**Priority: Medium — build after feature set is stable**
Internal tool for managing users, adjusting credits, viewing usage stats. Should include:
- User list with ability to manually adjust `credits_remaining`
- **Ban/unban users** via a `banned` boolean column on `profiles` — banned users are signed out immediately and shown a "Your account has been suspended" message
- Blog post management (create, edit, delete posts — replaces markdown file workflow)
- Usage analytics

---

### 📝 Blog CMS (inside Admin Panel)
**Priority: Medium**
Currently blog posts are markdown files committed to the repo. Eventually migrate to a simple CMS inside the admin panel — posts stored in Supabase. The blog rendering layer stays the same, just the data source changes.

---

### ✍️ Agent Writing Style Personalization
**Priority: High — build after core MVP is validated**
Allow agents to upload a PDF of their past writing as a style reference. AI generates copy that matches the agent's voice.
**Trigger:** When users say "I love it, but it doesn't sound like me."

---

### 📁 Projects — Multi-Campaign Per Property
**Priority: High — major product evolution**
One property = a living project with multiple campaigns over its lifetime.
Campaign types: New Listing, Price Drop, Open House, Back on Market, Just Sold.
Requires new `projects` table and refactoring `listings` into `campaigns`.

---

### 💳 Stripe Billing & Subscription Tiers
**Priority: High — required for revenue**
Stripe for credit purchases and subscriptions. Webhooks update `credits_remaining` in Supabase.

---

## Project Status

- [x] Project scaffolded (Vite + React + TS)
- [x] Supabase project created & env vars configured
- [x] Supabase Google OAuth enabled
- [x] Email/password auth enabled (with email confirmation)
- [x] Database schema applied (profiles, listings, generated_outputs, waitlist)
- [x] Auth flow implemented (Google OAuth + email/password, protected routes)
- [x] Session persistence fixed (survives browser close via localStorage)
- [x] Password reset flow (forgot password + reset password pages)
- [x] Custom SMTP via Resend (auth emails from noreply@listingignite.com)
- [x] Custom email templates (confirmation + password reset, branded HTML)
- [x] DNS hardened (combined SPF, DKIM, DMARC added)
- [x] Listing input form built (hybrid structured + freeform)
- [x] Anthropic API integration (single call, all outputs including YouTube metadata)
- [x] Anthropic API key migrated to Supabase Edge Function (server-side only)
- [x] Output UI (tabs + loading state + working copy buttons)
- [x] YouTube metadata tab (title, description, tags with copy buttons)
- [x] Listings and outputs saved to Supabase
- [x] Credit tracking implemented (deduct on success, block at 0)
- [x] Paywall with waitlist email capture → syncs to Kit ✅
- [x] Kit (ConvertKit) integration — waitlist subscribers auto-added to Kit form
- [x] Feedback form — floating button + modal on all authenticated pages ✅
- [x] Polish & UX pass complete
- [x] Property image upload (Supabase Storage)
- [x] Dashboard card grid (3 col, image cards, listing detail page)
- [x] Edit listing details + image replacement (EditListingModal)
- [x] Listing status management (Active / Sold / Inactive)
- [x] Profile / Account page with avatar upload
- [x] Supabase Edge Functions (send-email + generate-content + add-to-kit)
- [x] Resend account active and verified ✅
- [x] Landing page live at listingignite.com (with FAQ accordion)
- [x] Blog live at listingignite.com/blog (markdown-based)
- [x] Legal pages live (/privacy and /terms)
- [x] Logo, favicon, and Open Graph image
- [x] Brand voice (BRAND-VOICE.md) and style guide (STYLE-GUIDE.md)
- [x] App footer on all authenticated pages
- [x] Deployed to Vercel + custom domain (listingignite.com)
- [x] First real user onboarded (Puerto Rico client) 🎉
- [ ] First blog post (real SEO content)
- [ ] Admin panel
- [ ] Stripe billing
