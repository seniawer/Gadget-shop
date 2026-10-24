import { PHOTO_KEY_RE } from '../../shared/catalog'
import { getPhoto } from '../storage'

export async function getPhotoResponse(key: string) {
  if (!PHOTO_KEY_RE.test(key)) return new Response('Not found', { status: 404 })
  const photo = await getPhoto(key)
  if (!photo) return new Response('Not found', { status: 404 })
  // Ключ фото уникален и не меняется, поэтому кэшируем навсегда.
  return new Response(photo.data, {
    headers: { 'Content-Type': photo.contentType, 'Cache-Control': 'public, max-age=31536000, immutable' },
  })
}
