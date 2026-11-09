import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const assets = new URL('../public/assets/', import.meta.url)
const output = new URL('optimized/', assets)
const manifest = {}
const widthsFor = name => {
  if (name === 'hero') return [400, 800, 1200]
  if (name === 'about') return [480, 960, 1600]
  if (name.includes('logo')) return [140, 280]
  if (name.startsWith('testimonial-')) return [420, 840]
  if (name.startsWith('blog-')) return [480, 960, 1440]
  return [320, 640, 1024]
}

await mkdir(output, { recursive: true })
let originalBytes = 0
let generatedBytes = 0

for (const file of (await readdir(assets)).filter(file => file.endsWith('.png')).sort()) {
  const source = new URL(file, assets)
  const input = await readFile(source)
  const metadata = await sharp(input).metadata()
  const name = file.slice(0, -4)
  const variants = []
  originalBytes += input.length

  for (const width of widthsFor(name)) {
    const target = new URL(`${name}-${width}.webp`, output)
    const image = sharp(input).resize({ width, withoutEnlargement: true })
    // Preserve transparency and crisp edges in the original logos.
    const info = await image.webp(name.includes('logo') ? { lossless: true } : { quality: 86, effort: 5 }).toFile(fileURLToPath(target))
    variants.push({ src: `/assets/optimized/${name}-${width}.webp`, width: info.width })
    generatedBytes += (await stat(target)).size
  }

  manifest[file] = {
    width: metadata.width,
    height: metadata.height,
    src: variants[1].src,
    srcSet: variants.map(variant => `${variant.src} ${variant.width}w`).join(', '),
  }
}

await writeFile(new URL('../src/image-manifest.json', import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Originals preserved: ${(originalBytes / 1024 / 1024).toFixed(2)} MiB`)
console.log(`Generated WebP variants: ${(generatedBytes / 1024 / 1024).toFixed(2)} MiB`)
console.log(`Updated ${Object.keys(manifest).length} image entries in src/image-manifest.json`)
