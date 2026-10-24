import { MAX_PHOTO_BYTES } from '../../shared/catalog'

const MAX_WIDTH = 1200

/** Проверяет файл и сжимает его в WebP (или JPEG, если браузер не умеет WebP) шириной до 1200px. */
export async function preparePhoto(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error(`«${file.name}» — не изображение`)
  if (file.size > MAX_PHOTO_BYTES) throw new Error(`«${file.name}» больше 5 МБ`)

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error(`Не удалось открыть «${file.name}»`)
  })
  const scale = Math.min(1, MAX_WIDTH / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82))
  const webp = await toBlob('image/webp')
  const blob = webp?.type === 'image/webp' ? webp : await toBlob('image/jpeg')
  if (!blob) throw new Error(`Не удалось сжать «${file.name}»`)
  if (blob.size > MAX_PHOTO_BYTES) throw new Error(`«${file.name}» слишком большое даже после сжатия`)
  return blob
}
