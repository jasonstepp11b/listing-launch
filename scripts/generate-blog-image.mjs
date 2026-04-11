// scripts/generate-blog-image.mjs
//
// Generates a branded 1200x630 OG/featured image for a blog post.
//
// Usage:
//   node scripts/generate-blog-image.mjs "Post Title" "Category Name" post-slug
//
// Output:
//   public/blog/images/{slug}.jpg
//
// Requires puppeteer (installed as devDependency).

import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

// ─── Args ─────────────────────────────────────────────────────────────────────

const [, , title, category, slug] = process.argv

if (!title || !slug) {
  console.error('Usage: node scripts/generate-blog-image.mjs "Post Title" "Category Name" post-slug')
  process.exit(1)
}

const categoryLabel = category ?? ''

// ─── SVG logo (inlined from src/assets/logo-icon.svg) ────────────────────────

const logoSvg = readFileSync(join(root, 'src/assets/logo-icon.svg'), 'utf8')
const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

// ─── Font size — scale down for long titles ───────────────────────────────────

function titleFontSize(text) {
  const len = text.length
  if (len <= 40) return 72
  if (len <= 60) return 60
  if (len <= 80) return 50
  if (len <= 100) return 42
  return 36
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildHtml(title, category, logoSrc) {
  const fontSize = titleFontSize(title)

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }

    .canvas {
      width: 1200px;
      height: 630px;
      background: linear-gradient(160deg, #0c0c12 0%, #150e1f 55%, #0c0c12 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 64px 80px;
    }

    /* Decorative glows */
    .glow-top {
      position: absolute;
      top: -140px;
      right: -60px;
      width: 640px;
      height: 640px;
      background: radial-gradient(ellipse at center, rgba(139,47,232,0.28) 0%, transparent 68%);
      pointer-events: none;
    }
    .glow-bottom {
      position: absolute;
      bottom: -200px;
      left: 100px;
      width: 480px;
      height: 480px;
      background: radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%);
      pointer-events: none;
    }
    /* Subtle top border line */
    .top-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #7c3aed 0%, #a855f7 50%, transparent 100%);
    }

    /* Logo row */
    .logo-row {
      display: flex;
      align-items: center;
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
    }
    .wordmark {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }

    /* Middle content — grows to fill available space */
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      max-width: 960px;
      position: relative;
      z-index: 1;
      padding: 32px 0 16px;
    }

    .category-pill {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 6px 16px;
      background: rgba(124,58,237,0.22);
      border: 1px solid rgba(168,85,247,0.45);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      color: #c084fc;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 24px;
    }

    .title {
      font-size: ${fontSize}px;
      font-weight: 800;
      color: #f3f4f6;
      line-height: 1.1;
      letter-spacing: -1.5px;
      max-width: 960px;
    }

    /* Bottom row */
    .bottom-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 1;
    }
    .url {
      font-size: 15px;
      font-weight: 500;
      color: #4b5563;
      letter-spacing: 0.2px;
    }
    .tagline {
      font-size: 13px;
      font-weight: 500;
      color: rgba(168,85,247,0.5);
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="canvas">
    <div class="glow-top"></div>
    <div class="glow-bottom"></div>
    <div class="top-line"></div>

    <!-- Logo row -->
    <div class="logo-row">
      <img class="logo-icon" src="${logoSrc}" alt="ListingIgnite">
      <span class="wordmark">ListingIgnite</span>
    </div>

    <!-- Post content -->
    <div class="content">
      ${category ? `<div class="category-pill">${category}</div>` : ''}
      <div class="title">${title}</div>
    </div>

    <!-- Bottom row -->
    <div class="bottom-row">
      <span class="url">listingignite.com</span>
      <span class="tagline">List it. Ignite it.</span>
    </div>
  </div>
</body>
</html>`
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const outDir = join(root, 'public/blog/images')
mkdirSync(outDir, { recursive: true })
const outPath = join(outDir, `${slug}.jpg`)

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ],
  timeout: 120000,
})

try {
  const page = await browser.newPage()
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 })

  const html = buildHtml(title, categoryLabel, logoDataUri)
  await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 })

  // Wait for fonts to finish loading (Google Fonts may be slow in headless; cap at 8s)
  await page.evaluate(() =>
    Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 8000)),
    ])
  )

  const screenshot = await page.screenshot({
    type: 'jpeg',
    quality: 95,
    clip: { x: 0, y: 0, width: 1200, height: 630 },
  })

  writeFileSync(outPath, screenshot)
  console.log(`✓  Generated: public/blog/images/${slug}.jpg`)
} finally {
  await browser.close()
}
