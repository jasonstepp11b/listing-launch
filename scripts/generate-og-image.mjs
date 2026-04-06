/**
 * Generates og-image.png from og-image.svg at the required 1200×630 OG size.
 * Run once (or after editing the SVG): node scripts/generate-og-image.mjs
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svgBuffer = readFileSync(resolve(root, 'src/assets/og-image.svg'))
const out = resolve(root, 'public', 'og-image.png')

await sharp(svgBuffer)
  .resize(1200, 630)
  .png()
  .toFile(out)

console.log('✓ og-image.png (1200×630)')
console.log('Done.')
