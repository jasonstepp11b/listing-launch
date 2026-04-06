/**
 * Generates PNG favicon/icon files from the SVG logo.
 * Run once: node scripts/generate-icons.mjs
 */
import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')

const svgBuffer = readFileSync(resolve(root, 'src/assets/logo-icon.svg'))

const sizes = [
  { name: 'favicon-16.png',  size: 16  },
  { name: 'favicon-32.png',  size: 32  },
  { name: 'logo-192.png',    size: 192 },
  { name: 'logo-512.png',    size: 512 },
]

for (const { name, size } of sizes) {
  const out = resolve(root, 'public', name)
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(out)
  console.log(`✓ ${name} (${size}×${size})`)
}

console.log('Done.')
