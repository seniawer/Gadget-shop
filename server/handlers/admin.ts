import { randomUUID } from 'node:crypto'
import { MAX_PHOTO_BYTES, PHOTO_KEY_RE, validateProductInput, type Product } from '../../shared/catalog'
import { requireAdmin } from '../auth'
import { fail, json, readJson } from '../http'
import { deletePhotos, listProducts, NotFoundError, savePhoto, updateProducts } from '../storage'

const photoTypes: Record<string, { ext: string; check: (b: Uint8Array) => boolean }> = {
  'image/webp': {
    ext: 'webp',
    check: (b) => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
  },
  'image/jpeg': { ext: 'jpg', check: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  'image/png': { ext: 'png', check: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
}

/** Все запросы /api/admin/*. Каждый проходит проверку подписи Telegram и списка админов. */
export async function handleAdmin(request: Request, path: string[]): Promise<Response> {
  const user = requireAdmin(request)
  if (user instanceof Response) return user
  const [resource, id] = path
  const method = request.method

  if (resource === 'me' && method === 'GET') return json({ ok: true, isAdmin: true, user: { id: user.id, name: user.first_name } })

  if (resource === 'products') {
    if (!id && method === 'GET') return json({ ok: true, products: await listProducts() })
    if (!id && method === 'POST') return createProduct(request)
    if (id && method === 'PATCH') return patchProduct(request, id)
    if (id && method === 'DELETE') return deleteProduct(id)
  }

  if (resource === 'photos') {
    if (!id && method === 'POST') return uploadPhoto(request)
    if (id && method === 'DELETE') return deleteUnusedPhoto(id)
  }

  return fail('Не найдено', 404)
}

async function createProduct(request: Request) {
  const checked = validateProductInput(await readJson(request), false)
  if ('error' in checked) return fail(checked.error, 400)
  const now = Date.now()
  const product: Product = {
    colors: [],
    description: '',
    specs: [],
    photos: [],
    quantity: 0,
    price: 0,
    title: '',
    category: 'iphone',
    condition: 'new',
    ...checked.value,
    id: `p-${randomUUID().slice(0, 8)}`,
    createdAt: now,
    updatedAt: now,
  }
  await updateProducts((products) => ({ products: [product, ...products], result: null }))
  return json({ ok: true, product }, 201)
}

async function patchProduct(request: Request, id: string) {
  const checked = validateProductInput(await readJson(request), true)
  if ('error' in checked) return fail(checked.error, 400)
  try {
    const { product, removedPhotos } = await updateProducts((products) => {
      const index = products.findIndex((p) => p.id === id)
      if (index < 0) throw new NotFoundError()
      const before = products[index]
      const product: Product = { ...before, ...checked.value, updatedAt: Date.now() }
      products[index] = product
      const removedPhotos = before.photos.filter((k) => !product.photos.includes(k))
      return { products, result: { product, removedPhotos } }
    })
    if (removedPhotos.length) await deletePhotos(removedPhotos)
    return json({ ok: true, product })
  } catch (e) {
    if (e instanceof NotFoundError) return fail('Товар не найден', 404)
    throw e
  }
}

async function deleteProduct(id: string) {
  try {
    const removed = await updateProducts((products) => {
      const product = products.find((p) => p.id === id)
      if (!product) throw new NotFoundError()
      return { products: products.filter((p) => p.id !== id), result: product }
    })
    await deletePhotos(removed.photos)
    return json({ ok: true })
  } catch (e) {
    if (e instanceof NotFoundError) return fail('Товар не найден', 404)
    throw e
  }
}

async function uploadPhoto(request: Request) {
  const contentType = (request.headers.get('content-type') ?? '').split(';')[0].trim()
  const type = photoTypes[contentType]
  if (!type) return fail('Можно загружать только изображения JPEG, PNG или WebP', 415)
  if (Number(request.headers.get('content-length') ?? 0) > MAX_PHOTO_BYTES) return fail('Фото больше 5 МБ', 413)
  const data = await request.arrayBuffer()
  if (!data.byteLength) return fail('Пустой файл', 400)
  if (data.byteLength > MAX_PHOTO_BYTES) return fail('Фото больше 5 МБ', 413)
  if (!type.check(new Uint8Array(data.slice(0, 12)))) return fail('Файл не похож на изображение', 415)
  const key = `${randomUUID()}.${type.ext}`
  await savePhoto(key, data, contentType)
  return json({ ok: true, key }, 201)
}

// Удаляет загруженное, но так и не сохранённое в товаре фото (например, админ передумал).
async function deleteUnusedPhoto(key: string) {
  if (!PHOTO_KEY_RE.test(key)) return fail('Некорректное фото', 400)
  const used = (await listProducts()).some((p) => p.photos.includes(key))
  if (used) return fail('Фото используется в товаре', 409)
  await deletePhotos([key])
  return json({ ok: true })
}
