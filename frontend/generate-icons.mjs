import sharp from 'sharp'

const sizes = [
  { file: 'public/pwa-64x64.png', size: 64 },
  { file: 'public/pwa-192x192.png', size: 192 },
  { file: 'public/pwa-512x512.png', size: 512 },
  { file: 'public/maskable-icon-512x512.png', size: 512 },
  { file: 'public/apple-touch-icon-180x180.png', size: 180 },
]

for (const { file, size } of sizes) {
  await sharp('public/emblem.png')
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png()
    .toFile(file)

  console.log(`✓ ${file}`)
}
