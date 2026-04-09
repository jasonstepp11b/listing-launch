// scripts/generate-sitemap.mjs
//
// Generates public/sitemap.xml at build time.
// Must run BEFORE vite build so Vite copies the file into dist/.
//
// Called automatically via: npm run build
// Called manually via:      node scripts/generate-sitemap.mjs

import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root    = join(__dirname, '..')
const blogDir = join(root, 'src/content/blog')
const SITE_URL = 'https://listingignite.com'

// ─── Frontmatter parser (mirrors src/lib/blog.ts) ────────────────────────────

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return {}

  const data  = {}
  const lines = match[1].split('\n')
  let i = 0

  while (i < lines.length) {
    const line     = lines[i]
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

// ─── Category slug (mirrors src/lib/blog.ts) ─────────────────────────────────

function categoryToSlug(category) {
  return category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// ─── XML helpers ──────────────────────────────────────────────────────────────

function urlEntry(loc, { priority, changefreq, lastmod } = {}) {
  const lines = ['  <url>', `    <loc>${loc}</loc>`]
  if (lastmod)              lines.push(`    <lastmod>${lastmod}</lastmod>`)
  if (changefreq)           lines.push(`    <changefreq>${changefreq}</changefreq>`)
  if (priority !== undefined) lines.push(`    <priority>${Number(priority).toFixed(1)}</priority>`)
  lines.push('  </url>')
  return lines.join('\n')
}

// ─── Static pages ─────────────────────────────────────────────────────────────

const entries = [
  urlEntry(`${SITE_URL}/`,       { priority: 1.0, changefreq: 'weekly'  }),
  urlEntry(`${SITE_URL}/blog`,   { priority: 0.9, changefreq: 'weekly'  }),
  urlEntry(`${SITE_URL}/privacy`,{ priority: 0.3, changefreq: 'yearly'  }),
  urlEntry(`${SITE_URL}/terms`,  { priority: 0.3, changefreq: 'yearly'  }),
]

// ─── Blog posts + categories ──────────────────────────────────────────────────

const files = readdirSync(blogDir).filter(f => f.endsWith('.md'))
const categories = new Set()

for (const file of files) {
  const raw  = readFileSync(join(blogDir, file), 'utf8')
  const data = parseFrontmatter(raw)
  if (!data.published) continue

  const slug = file.replace(/\.md$/, '')
  entries.push(urlEntry(`${SITE_URL}/blog/${slug}`, {
    priority:    0.8,
    changefreq:  'monthly',
    lastmod:     data.date ?? undefined,
  }))

  if (data.category) categories.add(String(data.category))
}

// Category index pages
for (const cat of [...categories].sort()) {
  entries.push(urlEntry(`${SITE_URL}/blog/category/${categoryToSlug(cat)}`, {
    priority:   0.7,
    changefreq: 'weekly',
  }))
}

// ─── Write output ─────────────────────────────────────────────────────────────

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`

writeFileSync(join(root, 'public/sitemap.xml'), xml, 'utf8')
console.log(`✓  sitemap.xml generated (${entries.length} URLs)`)
