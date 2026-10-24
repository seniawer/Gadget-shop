import { getStore } from '@netlify/blobs'
import type { Product } from '../shared/catalog'
import { seedProducts } from '../shared/seed'

// Хранилище на Netlify Blobs: весь каталог лежит одним JSON-документом (для магазина
// на сотни товаров это быстро и просто), фото — отдельными бинарными записями.
// Локально `npm run dev` поднимает эмулятор Blobs (см. scripts/dev-api.ts).

type CatalogDoc = { version: 1; products: Product[] }

const CATALOG_KEY = 'catalog'
const catalogStore = () => getStore({ name: 'catalog', consistency: 'strong' })
const photoStore = () => getStore({ name: 'photos', consistency: 'strong' })

async function readDoc(): Promise<{ doc: CatalogDoc; etag?: string }> {
  const store = catalogStore()
  const found = await store.getWithMetadata(CATALOG_KEY, { type: 'json' })
  if (found) return { doc: found.data as CatalogDoc, etag: found.etag }
  // Первый запуск: переносим стартовый каталог. onlyIfNew защищает от гонки двух запросов.
  const doc: CatalogDoc = { version: 1, products: seedProducts() }
  await store.setJSON(CATALOG_KEY, doc, { onlyIfNew: true })
  const created = await store.getWithMetadata(CATALOG_KEY, { type: 'json' })
  return created ? { doc: created.data as CatalogDoc, etag: created.etag } : { doc }
}

export async function listProducts(): Promise<Product[]> {
  return (await readDoc()).doc.products
}

export class NotFoundError extends Error {}

/**
 * Изменяет каталог с защитой от одновременной записи: если документ успел поменяться
 * (два админа жмут «+» одновременно), перечитываем и применяем изменение заново.
 */
export async function updateProducts<T>(change: (products: Product[]) => { products: Product[]; result: T }): Promise<T> {
  const store = catalogStore()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { doc, etag } = await readDoc()
    const { products, result } = change(structuredClone(doc.products))
    const write = await store.setJSON(CATALOG_KEY, { ...doc, products }, etag ? { onlyIfMatch: etag } : undefined)
    if (write.modified) return result
  }
  throw new Error('Каталог сейчас меняют одновременно, попробуйте ещё раз')
}

export async function savePhoto(key: string, data: ArrayBuffer, contentType: string) {
  await photoStore().set(key, data, { metadata: { contentType } })
}

export async function getPhoto(key: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const found = await photoStore().getWithMetadata(key, { type: 'arrayBuffer' })
  if (!found) return null
  return { data: found.data, contentType: String(found.metadata.contentType ?? 'image/jpeg') }
}

export async function deletePhotos(keys: string[]) {
  await Promise.all(keys.map((k) => photoStore().delete(k)))
}
