import { getStore } from '@netlify/blobs'
import { PHOTO_KEY_RE, type Product } from '../shared/catalog'
import { SEED_VERSION, seedProducts, syncSeed } from '../shared/seed'

// Хранилище на Netlify Blobs: весь каталог лежит одним JSON-документом (для магазина
// на сотни товаров это быстро и просто), фото — отдельными бинарными записями.
// Локально `npm run dev` поднимает эмулятор Blobs (см. scripts/dev-api.ts).

type CatalogDoc = { version: 1; /** Версия стартового каталога, с которой сверен документ. */ seed?: number; products: Product[] }

const CATALOG_KEY = 'catalog'
const catalogStore = () => getStore({ name: 'catalog', consistency: 'strong' })
const photoStore = () => getStore({ name: 'photos', consistency: 'strong' })

async function readDoc(): Promise<{ doc: CatalogDoc; etag?: string }> {
  const store = catalogStore()
  let last: { doc: CatalogDoc; etag?: string } | undefined
  for (let attempt = 0; attempt < 4; attempt++) {
    const found = await store.getWithMetadata(CATALOG_KEY, { type: 'json' })
    if (!found) {
      // Первый запуск: переносим стартовый каталог. onlyIfNew защищает от гонки двух запросов.
      const doc: CatalogDoc = { version: 1, seed: SEED_VERSION, products: seedProducts() }
      await store.setJSON(CATALOG_KEY, doc, { onlyIfNew: true })
      last = { doc }
      continue
    }
    const doc = found.data as CatalogDoc
    last = { doc, etag: found.etag }
    if ((doc.seed ?? 1) >= SEED_VERSION) return last
    // Стартовый каталог обновился: аккуратно подтягиваем изменения (см. syncSeed). Если документ
    // параллельно поменяли, условная запись не пройдёт, и мы перечитаем его на следующем круге.
    const migrated: CatalogDoc = { ...doc, seed: SEED_VERSION, products: syncSeed(doc.products, seedProducts()) }
    await store.setJSON(CATALOG_KEY, migrated, found.etag ? { onlyIfMatch: found.etag } : undefined)
  }
  if (!last) throw new Error('Не удалось прочитать каталог')
  return last
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
  // Фото стартового каталога лежат в public/products, в хранилище их нет.
  await Promise.all(keys.filter((k) => PHOTO_KEY_RE.test(k)).map((k) => photoStore().delete(k)))
}
