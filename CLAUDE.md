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

## Analytics & SEO

### Google Analytics 4
- **Measurement ID:** `G-E3GJZ5DGWS`
- **Implementation:** Script tags in `index.html`
- **Key Events configured:**
  - `dashboard_visit` — fires when `page_location` contains `/dashboard` (user signed up/logged in)
  - `purchase` — kept for future Stripe integration
- **Note:** `close_convert_lead` and `qualify_lead` have been unmarked as key events
- **Pending:** Mark `dashboard_visit` as key event once it appears in Recent Events tab (may take 24hrs)
- **Pending:** Link Google Search Console to GA4 (Admin → Property Settings → Search Console Links)
- **Pending:** Filter internal traffic (Admin → Data Streams → Configure tag settings → Define internal traffic → add home IP)

### Google Search Console
- **Property:** listingignite.com — verified ✅
- **Sitemap:** `https://listingignite.com/sitemap.xml` — submitted ✅

### Sitemap
- Auto-generated at build time via `scripts/generate-sitemap.mjs`
- Includes all static pages, blog posts, category pages, and tag pages
- Saved to `public/sitemap.xml`
- Regenerated automatically on every Vercel deployment

---

## Blog System

### Architecture
- Blog index: `src/pages/Blog.tsx` at `/blog`
- Blog post: `src/pages/BlogPost.tsx` at `/blog/:slug`
- Category pages: `src/pages/BlogCategory.tsx` at `/blog/category/:category`
- Tag pages: `src/pages/BlogTag.tsx` at `/blog/tag/:tag`
- Posts: markdown files in `src/content/blog/`
- Images: `public/blog/images/`
- Uses `import.meta.glob` (NOT fs) for Vite compatibility

### Frontmatter Schema
```yaml
---
title: "Your Post Title Here"
date: "2026-04-09"
excerpt: "Shown on blog index card. Under 160 characters."
description: "Meta description for Google. 110-160 characters."
featuredImage: "/blog/images/your-slug.jpg"
author: "Jason Stepp"
category: "Category Name"
tags: ["tag one", "tag two", "tag three"]
published: true
---
```

### Blog Features
- **Table of contents** — auto-generated from H2 headings, shown if 2+ H2s exist
- **Related posts** — shown at bottom of each post, matched by category and tags
- **Inline CTA** — insert `<!--cta-->` anywhere in markdown to place the CTA banner mid-post
- **Auto CTA** — `<BlogCTA />` automatically appended to every post above "Keep Reading"
- **Category pages** — `/blog/category/:category` — fully indexed by Google
- **Tag pages** — `/blog/tag/:tag` — dynamically noindexed if fewer than 3 posts
- **Schema markup** — JSON-LD BlogPosting + BreadcrumbList on all post pages
- **OG tags** — per-post via prerender script using absolute URLs
- **2-column layout** on blog index and category/tag pages (desktop)

### Blog Card UX
- Featured image, post title, and "Read More" link are all clickable on blog index, category, and tag pages
- Keep Reading section (bottom of each post) — same clickable pattern applied
- Keep Reading featured images use `object-fit: cover` and `object-position: top center` — anchors to top so logo is always visible, cropping happens at the bottom
- Blog post featured images are always **1200×630px JPG** — keep this in mind for any image container sizing

### Popular Topics Widget
- Shown in the sidebar on `/blog`, `/blog/category/:category`, and `/blog/tag/:tag`
- **Only displays tags associated with 3 or more posts** — tags with fewer than 3 posts are hidden
- Sorted by post count descending (most posts first)
- This threshold matches the `noindex` rule on tag pages (also 3+ posts)

### Blog Post Template
- Template file: `src/content/blog/template.md` (published: false — never shown on site)
- Copy this file for every new post, rename to `{slug}.md`

### Featured Image Workflow
1. Open `tools/blog-image-generator.html` locally: `open tools/blog-image-generator.html`
2. Enter post title, category, and slug
3. Preview updates live in the browser
4. Click "Download JPG" → save to `public/blog/images/{slug}.jpg`
5. Reference in frontmatter: `featuredImage: "/blog/images/{slug}.jpg"`
- **Design:** Dark gradient (#0c0c12→#150e1f), purple glow, flame logo, category pill, title, domain + tagline
- **Dimensions:** 1200x630px JPG
- **Note:** `tools/` is in `.gitignore` — never committed or deployed

### Prerender Script (CRITICAL)
- `scripts/prerender-blog.mjs` — generates static HTML for blog/category/tag pages at build time
- Injects correct OG tags, title, description, and robots meta tag into each page's HTML
- Tag pages with fewer than 3 posts get `noindex` injected automatically
- **This is why OG images work for crawlers and social sharing**
- Runs automatically as part of `npm run build`

### Build Command
```
node scripts/generate-sitemap.mjs && tsc -b && vite build && node scripts/prerender-blog.mjs
```

### vercel.json (CRITICAL)
Must use `"rewrites"` not `"routes"` — otherwise prerendered files are not served:
```json
{
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### New Blog Post Workflow
1. Keyword research (Google Keyword Planner + Ubersuggest)
2. Write post in dedicated Claude conversation (upload BRAND-VOICE.md + template.md)
3. Optimize in NeuronWriter (use their word count target)
4. Generate featured image: `open tools/blog-image-generator.html`
5. Copy `template.md` → rename to `{slug}.md` → fill frontmatter + content
6. Set `published: true`, add `featuredImage: "/blog/images/{slug}.jpg"`
7. Commit and push → Vercel builds and prerenders automatically

---

## Marketing Site & Navigation

### Marketing Nav (unauthenticated only)
- Shown on all marketing/public pages: `/`, `/blog`, `/blog/*`, `/pricing`, `/privacy`, `/terms`
- **Never shown on authenticated app pages** (dashboard, new listing, listing detail, account, etc.)
- Links: Logo | Blog (`/blog`) | Pricing (`/pricing`) | Sign In (ghost button) | Get Started Free → (filled purple button)
- Both auth buttons link to `/login`
- **Mobile:** Hamburger menu (☰) replaces nav links and auth buttons below ~768px. Tapping opens a full-width dropdown with all nav items. Tapping any link closes the menu.
- **Desktop:** Inline nav, no hamburger

### Pricing Page (`src/pages/Pricing.tsx`)
- Route: `/pricing`
- Coming soon page — no fake tiers or placeholder numbers
- Headline: "Simple, transparent pricing."
- Subheadline: "Plans are coming soon. Join the waitlist to be first to know."
- Waitlist email capture form — saves to Supabase `waitlist` table + calls `add-to-kit` Edge Function (same as paywall waitlist)
- Matches marketing site visual style (dark background, brand fonts/colors)

### Landing Page (`src/pages/Landing.tsx`)
- Route: `/` for unauthenticated users → authenticated users redirected to `/dashboard`
- Sections: Nav, Hero, Problem, Features, How It Works, FAQ (accordion), CTA, Footer
- Footer links to `/blog`, `/pricing`, `/privacy`, `/terms`
- **How It Works step 2:** Do NOT mention "Claude" or any specific AI by name — lead with the result, not the technology (per BRAND-VOICE.md)

---

## Video Production

### Demo Video
- **Status:** MVP version complete ✅
- **Tools used:** Loom (recording) + DaVinci Resolve (editing)
- **Format:** Screen recording with voiceover, no face cam
- **Length:** ~2–3 minutes
- **Audience:** Any real estate agent who might be interested in ListingIgnite
- **Goal:** Show what the product does and drive free signups
- Plan to invest more time learning DaVinci Resolve to improve future video quality

### Video Production Workflow
- All video content (demo videos, YouTube tutorials, social clips, etc.) is handled in a **dedicated Claude conversation**
- Upload `CLAUDE.md` and `BRAND-VOICE.md` to that conversation for full product and brand context
- Recording setup: Loom desktop app (Mac), screen + voiceover, no face cam
- Editing: DaVinci Resolve

---

## Claude Code Model Notes

### Current model: Claude Sonnet 4.6 (default)
This is the right choice for day-to-day development work on ListingIgnite. The workflow improvements we've made (tighter prompts, proper git workflow) have resolved the issues we encountered, and the cost/performance tradeoff favors staying on Sonnet 4.6 for now.

### ⚠️ Switch to Claude Opus 4.7 when starting Stripe or Admin Panel
Claude Opus 4.7 (released April 16, 2026) showed a ~20% improvement on agentic coding benchmarks over Sonnet 4.6. Stripe integration and the admin panel are complex, multi-file, long-horizon tasks where that improvement is worth the ~1.35x token cost increase.

**To switch models in Claude Code:**
```bash
# During a session:
/model claude-opus-4-7

# Or permanently via environment variable:
ANTHROPIC_MODEL=claude-opus-4-7

# Requires Claude Code v2.1.111 or later — update first:
claude update
```

---

## Key UX Principles

- **Output presentation is the product.** Generated content must look polished and trustworthy.
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

### `FeedbackButton` + `FeedbackModal`
- `src/components/FeedbackButton.tsx` — floating button fixed to bottom right on all authenticated pages
- `src/components/FeedbackModal.tsx` — modal with topic dropdown and message textarea
- User name/email pre-filled from Supabase profile
- Submits via `send-email` Edge Function to jason@listingignite.com
- Subject format: `[ListingIgnite Feedback] {topic} from {user name}`

### `BlogCTA`
- `src/components/BlogCTA.tsx` — full-width purple banner CTA
- Auto-injected at bottom of every blog post above "Keep Reading"
- Insert mid-post via `<!--cta-->` marker in markdown
- Links to `https://listingignite.com/login`
- Copy: "Your next listing is waiting." + subheadline + "Get Started Free →"

### Dashboard Cards
- 3 columns desktop, 2 columns tablet, 1 column mobile
- Filter tabs: Active / Sold / Inactive
- Sold cards show 🎉 badge, Inactive cards show subtle "Inactive" badge

### Auth Pages
- Login: `src/pages/Login.tsx` — Google OAuth + email/password, "Forgot your password?" link
- Forgot Password: `src/pages/ForgotPassword.tsx` at `/forgot-password`
- Reset Password: `src/pages/ResetPassword.tsx` at `/reset-password`
- All auth emails sent from `noreply@listingignite.com` via Resend SMTP

---

## Git & Deployment Workflow

### CRITICAL: Always follow this sequence for every update
```bash
# 1. Create a feature branch
git checkout -b your-branch-name

# 2. Make changes via Claude Code

# 3. Test locally (npm run dev)

# 4. Commit on the feature branch
git add -A
git commit -m "your commit message"

# 5. Merge into main and push — this triggers Vercel deployment
git checkout main
git merge your-branch-name
git push origin main
```

> ⚠️ **Never push from a feature branch directly** — Vercel only deploys from `main`. Pushing from a feature branch will not trigger a deployment.

> ⚠️ **Always commit before merging** — Claude Code changes that aren't committed before the merge will not be included in the deployment. Run `git status` to verify there are no uncommitted changes before merging.

---

## Project Files Reference
- `CLAUDE.md` — main project brief and developer guide (this file)
- `BRAND-VOICE.md` — brand voice, copy principles, tagline
- `STYLE-GUIDE.md` — colors, typography, component styles
- `legal-content.md` — Privacy Policy and Terms of Service content
- `database.sql` — Supabase schema SQL including RLS policies and profile trigger
- `src/content/blog/template.md` — blog post template (published: false)
- `tools/blog-image-generator.html` — local-only featured image generator (excluded from git)

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
> ⚠️ Switch to Claude Opus 4.7 in Claude Code before starting this work — see Claude Code Model Notes above.

---

### 🍪 Cookie Consent Banner
**Priority: Low — revisit before activating any ad pixels**
Not needed yet. Will be required before launching Google Ads, Meta Ads, or Microsoft Ads campaigns, as those involve third-party tracking cookies. A simple consent library (e.g. `cookie-consent`) should make this a quick add when the time comes.

---

### 📣 Ad Pixel Setup
**Priority: Low — future marketing initiative**
Planned ad platforms: Google Ads, Meta (Facebook/Instagram), Microsoft Ads.
Cookie consent banner must be implemented before any pixels are activated.

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
- [x] Blog live at listingignite.com/blog (markdown-based, 4 posts published)
- [x] Blog SEO — meta tags, category pages, tag pages, schema markup, sitemap, robots.txt
- [x] Blog CTA banner (auto-injected + mid-post via <!--cta-->)
- [x] Blog table of contents (auto-generated from H2 headings)
- [x] Blog related posts section
- [x] Blog featured image generator (tools/blog-image-generator.html — local only)
- [x] Blog post template (src/content/blog/template.md)
- [x] OG images working via prerender script ✅
- [x] vercel.json using rewrites for correct prerender routing
- [x] Legal pages live (/privacy and /terms)
- [x] Logo, favicon, and Open Graph image
- [x] Brand voice (BRAND-VOICE.md) and style guide (STYLE-GUIDE.md)
- [x] Deployed to Vercel + custom domain (listingignite.com)
- [x] First real user onboarded (Puerto Rico client) 🎉
- [x] Google Analytics 4 (G-E3GJZ5DGWS) — tracking active ✅
- [x] Google Search Console verified + sitemap submitted ✅
- [x] Blog card images and titles clickable (Blog, BlogCategory, BlogTag pages) ✅
- [x] Keep Reading section — images/titles clickable, image cropping fixed ✅
- [x] Popular Topics widget — 3+ post minimum, all pages (Blog, BlogCategory, BlogTag) ✅
- [x] Marketing nav — Blog + Pricing links, dual auth buttons, hidden for authenticated users ✅
- [x] Pricing page live at /pricing — coming soon with waitlist capture ✅
- [x] Landing page How It Works step 2 — removed AI brand mention ✅
- [x] Mobile hamburger menu for marketing nav ✅
- [x] Blog post featured image — fixed mobile overflow ✅
- [x] MVP demo video recorded (Loom + DaVinci Resolve) ✅
- [x] Dedicated video production Claude conversation set up ✅
- [ ] GA4 dashboard_visit — mark as key event once it appears in Recent Events (may take 24hrs)
- [ ] Link Google Search Console to GA4 (Admin → Property Settings → Search Console Links)
- [ ] Filter internal traffic in GA4 (add home IP address)
- [ ] Admin panel (switch to Claude Opus 4.7 in Claude Code first)
- [ ] Stripe billing (switch to Claude Opus 4.7 in Claude Code first)
- [ ] Cookie consent banner (before ad pixels go live)
- [ ] Ad pixel setup (Google Ads, Meta, Microsoft Ads)
