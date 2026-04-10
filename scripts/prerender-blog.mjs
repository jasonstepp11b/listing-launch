// scripts/prerender-blog.mjs
//
// Post-build prerenderer for blog routes.
// Reads every published markdown post, injects the correct title / meta tags
// into a copy of dist/index.html, and writes the result to:
//
//   dist/blog/index.html                   → /blog
//   dist/blog/<slug>/index.html            → /blog/<slug>
//
// Vercel resolves static files before applying catch-all rewrites, so these
// files are served with the correct meta tags baked in — no JS required.
// That means view-source, social scrapers (OG/Twitter), and non-JS crawlers
// all see the right title and description immediately.
//
// Run automatically via:   npm run build
// Run manually via:        node scripts/prerender-blog.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = join(__dirname, '..')
const distDir   = join(root, 'dist')
const blogDir   = join(root, 'src/content/blog')
const SITE_URL  = 'https://listingignite.com'

// ─── Frontmatter parser (same logic as src/lib/blog.ts) ──────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return {}

  const data = {}
  const lines = match[1].split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) { i++; continue }

    const key  = line.slice(0, colonIdx).trim()
    const rest = line.slice(colonIdx + 1).trim()

    if (rest === '' || rest === '[]') {
      const arr = []
      i++
      while (i < lines.length && /^\s*-\s/.test(lines[i])) {
        arr.push(lines[i].replace(/^\s*-\s*/, '').replace(/^["']|["']$/g, '').trim())
        i++
      }
      data[key] = arr
      continue
    }

    if (rest.startsWith('[')) {
      data[key] = rest
        .slice(1, rest.lastIndexOf(']'))
        .split(',')
        .map(s => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean)
    } else if (rest === 'true') {
      data[key] = true
    } else if (rest === 'false') {
      data[key] = false
    } else {
      data[key] = rest.replace(/^["']|["']$/g, '')
    }
    i++
  }
  return data
}

// ─── Meta tag injection ───────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inject(html, { title, description, ogTitle, ogDescription, ogImage, ogUrl, ogType }) {
  const t   = esc(title)
  const d   = esc(description)
  const ot  = esc(ogTitle ?? title)
  const od  = esc(ogDescription ?? description)
  const oi  = esc(ogImage)
  const ou  = esc(ogUrl)
  const oty = esc(ogType ?? 'website')

  return html
    .replace(/<title>[^<]*<\/title>/,                                          `<title>${t}</title>`)
    .replace(/(<meta name="description"\s+content=")[^"]*(")/,                `$1${d}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/,             `$1${ot}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/,       `$1${od}$2`)
    .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/,             `$1${oi}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/,               `$1${ou}$2`)
    .replace(/(<meta\s+property="og:type"\s+content=")[^"]*(")/,              `$1${oty}$2`)
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,            `$1${ot}$2`)
    .replace(/(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,      `$1${od}$2`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const baseHtml = readFileSync(join(distDir, 'index.html'), 'utf8')

// /blog index
const blogIndexDir = join(distDir, 'blog')
mkdirSync(blogIndexDir, { recursive: true })
writeFileSync(
  join(blogIndexDir, 'index.html'),
  inject(baseHtml, {
    title:       'Blog — ListingIgnite',
    description: 'Real estate marketing tips, AI tools, and strategies to help agents generate more leads and close more deals.',
    ogUrl:       `${SITE_URL}/blog`,
    ogImage:     `${SITE_URL}/og-image.png`,
    ogType:      'website',
  }),
)
console.log('✓  prerendered /blog')

// Individual posts
const files = readdirSync(blogDir).filter(f => f.endsWith('.md'))

for (const file of files) {
  const raw  = readFileSync(join(blogDir, file), 'utf8')
  const data = parseFrontmatter(raw)

  if (!data.published) continue

  const slug           = file.replace(/\.md$/, '')
  const rawTitle       = String(data.title ?? '')
  const rawDescription = String(data.description ?? data.excerpt ?? '')
  const suffix         = ' | ListingIgnite'
  const title          = (rawTitle + suffix).length <= 60 ? rawTitle + suffix : rawTitle
  const description    = rawDescription.length > 155
    ? rawDescription.slice(0, 152) + '...'
    : rawDescription

  const imageField = data.featuredImage ? String(data.featuredImage) : ''
  const ogImage    = imageField && !imageField.toLowerCase().includes('placeholder')
    ? (imageField.startsWith('http') ? imageField : `${SITE_URL}${imageField}`)
    : `${SITE_URL}/og-image.png`

  const outDir = join(distDir, 'blog', slug)
  mkdirSync(outDir, { recursive: true })
  writeFileSync(
    join(outDir, 'index.html'),
    inject(baseHtml, {
      title,
      description,
      ogTitle:       title,
      ogDescription: description,
      ogImage,
      ogUrl:         `${SITE_URL}/blog/${slug}`,
      ogType:        'article',
    }),
  )
  console.log(`✓  prerendered /blog/${slug}`)
}

console.log('Prerender complete.')
