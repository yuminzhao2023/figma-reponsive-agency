import manifest from './image-manifest.json'

type ImageName = keyof typeof manifest

export function imageProps(name: ImageName, sizes: string) {
  const image = manifest[name]
  if (!image) throw new Error(`Missing optimized image: ${name}`)
  return { ...image, sizes }
}

export function serviceImageSizes(name: ImageName) {
  const { width, height } = manifest[name]
  // object-fit: cover can need more source pixels than the visible card width.
  const ratio = width / height
  const desktop = Math.ceil(320 * ratio)
  const mobile = Math.ceil(161 * ratio)
  return `(max-width: 600px) max(calc((100vw - 50px) / 2), ${mobile}px), (max-width: 1199px) max(min(314px, calc((100vw - 100px) / 2)), ${desktop}px), max(270px, ${desktop}px)`
}
