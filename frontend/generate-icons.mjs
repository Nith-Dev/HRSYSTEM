import sharp from 'sharp'

const BG = { r: 37, g: 99, b: 235 } // blue-600 #2563EB

const sizes = [
  { file: 'public/pwa-64x64.png', size: 64 },
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/maskable-icon-512x512.png', size: 512, maskable: true },
  { file: 'public/apple-touch-icon-180x180.png', size: 180 },
]

for (const { file, size, maskable } of sizes) {
  // For maskable icons, emblem takes 60% of space (safe zone); others 85%
  const embedSize = Math.round(size * (maskable ? 0.6 : 0.85))
  const offset = Math.round((size - embedSize) / 2)

  const emblem = await sharp('public/emblem.png')
    .resize(embedSize, embedSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer()

  await sharp({
    create: { width: size, height: size, channels: 4, background: { ...BG, alpha: 255 } },
  })
    .composite([{ input: emblem, top: offset, left: offset }])
    .png()
    .toFile(file)

  console.log(`✓ ${file}`)
}
