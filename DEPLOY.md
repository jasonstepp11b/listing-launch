# Vercel Deployment Checklist

## Environment Variables (add in Vercel Dashboard → Project → Settings → Environment Variables)

| Variable | Description | Where to find it |
|---|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable anon key (safe to expose) | Supabase Dashboard → Project Settings → API → anon / public |
| `VITE_ANTHROPIC_API_KEY` | Anthropic API key for AI generation | console.anthropic.com → API Keys |

Set all three for **Production**, **Preview**, and **Development** environments in Vercel.

---

## ⚠️ Security Notes

### Anthropic API Key (client-side exposure — known MVP tradeoff)
`VITE_ANTHROPIC_API_KEY` is prefixed with `VITE_`, which means Vite bundles it into
the browser JavaScript. Anyone can extract it from the page source.

This is a documented, accepted tradeoff for the MVP (see CLAUDE.md Security Notes).

**Before scaling to real users:** Move the Anthropic API call to a Supabase Edge Function
(the `send-email` function in `supabase/functions/` is the pattern to follow). The Edge
Function runs server-side, so the key stays secret. Remove `VITE_ANTHROPIC_API_KEY` from
Vercel once the migration is done.

### Supabase Anon Key
The anon key is intentionally public — it's a publishable key designed to be in the browser.
Supabase Row Level Security (RLS) policies are what protect your data, not key secrecy.
Confirm RLS is enabled on all tables before going live.

---

## Pre-Deploy Steps

1. **Verify .env.local was never committed:**
   ```
   git log --all -- .env.local
   git log --all -- .env
   ```
   Both should return no output. If either has commits, rotate the exposed keys immediately.

2. **Confirm Supabase RLS is on** for all tables:
   - `profiles` — users can only read/write their own row
   - `listings` — users can only read/write their own listings
   - `generated_outputs` — users can only read/write their own outputs
   - `storage.objects` (property-images, avatars) — users can only access their own folder

3. **Run a production build locally to catch any build errors:**
   ```
   npm run build
   ```

4. **Check Supabase Auth redirect URLs:**
   Supabase Dashboard → Authentication → URL Configuration
   Add your Vercel production URL to:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

   Without this, Google OAuth will redirect back to localhost after login.

---

## Deploy Commands

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Or just connect the GitHub repo in the Vercel dashboard and it deploys automatically on push to main.

---

## Post-Deploy Verification

- [ ] Home/login page loads
- [ ] Google OAuth login works and redirects correctly
- [ ] Dashboard loads and shows listings
- [ ] Creating a new listing and generating content works
- [ ] Refreshing `/dashboard`, `/listing/123`, `/profile` does NOT return 404
- [ ] Property image upload works
- [ ] Avatar upload works
- [ ] Listing status changes save correctly
