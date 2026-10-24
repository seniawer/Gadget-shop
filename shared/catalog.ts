// Модель каталога, общая для клиента и сервера.

export type CategoryId = 'iphone' | 'ipad' | 'mac' | 'watch' | 'audio' | 'accessories' | 'gadgets'

export const categories: { id: CategoryId; title: string; emoji: string }[] = [
  { id: 'iphone', title: 'iPhone', emoji: '📱' },
  { id: 'ipad', title: 'iPad', emoji: '📲' },
  { id: 'mac', title: 'MacBook', emoji: '💻' },
  { id: 'watch', title: 'Watch', emoji: '⌚' },
  { id: 'audio', title: 'AirPods', emoji: '🎧' },
  { id: 'accessories', title: 'Аксессуары', emoji: '🔌' },
  { id: 'gadgets', title: 'Гаджеты', emoji: '🎮' },
]

export const categoryTitle = (id: CategoryId) => categories.find((c) => c.id === id)?.title ?? id

/** `photo` — фото этого цвета из списка photos: при выборе цвета галерея перелистывается на него. */
export type Color = { name: string; hex: string; photo?: string }
export type MemoryOption = { label: string; delta: number }
export type UsedInfo = { battery?: number; grade?: string; kit?: string }

export type Product = {
  id: string
  title: string
  category: CategoryId
  condition: 'new' | 'used'
  price: number
  oldPrice?: number
  description: string
  specs: [string, string][]
  quantity: number
  /** Новинка под заказ: показываем «Под заказ» независимо от остатка. */
  preorder?: boolean
  /** Скрыт из каталога (виден только в админке). */
  hidden?: boolean
  /** Ключи фото в хранилище, первое фото главное. */
  photos: string[]
  colors: Color[]
  memory?: MemoryOption[]
  tags?: ('hit' | 'new' | 'sale')[]
  used?: UsedInfo
  createdAt: number
  updatedAt: number
}

export const LOW_STOCK = 3

export type Availability = { kind: 'in_stock' | 'few' | 'out' | 'preorder'; label: string }

export function availability(p: Pick<Product, 'quantity' | 'preorder'>): Availability {
  if (p.preorder) return { kind: 'preorder', label: 'Под заказ' }
  if (p.quantity <= 0) return { kind: 'out', label: 'Нет в наличии' }
  if (p.quantity <= LOW_STOCK) return { kind: 'few', label: `Осталось ${p.quantity}` }
  return { kind: 'in_stock', label: 'В наличии' }
}

/** Цена 0 означает «Цена по запросу»: такой товар не кладут в корзину, а спрашивают у менеджера. */
export const hasPrice = (p: Pick<Product, 'price'>) => p.price > 0

export const canBuy = (p: Pick<Product, 'quantity' | 'preorder' | 'price'>) => !p.preorder && p.quantity > 0 && hasPrice(p)

/** Фото, загруженное через админку (лежит в хранилище). */
export const PHOTO_KEY_RE = /^[a-z0-9-]{8,64}\.(webp|jpg|png)$/
/** Фото из стартового каталога: статический файл из public/products. */
export const STATIC_PHOTO_RE = /^\/products\/[a-z0-9-]{1,80}\.(webp|jpg|png)$/

export const isPhotoKey = (key: string) => PHOTO_KEY_RE.test(key) || STATIC_PHOTO_RE.test(key)

export const photoUrl = (key: string) => (STATIC_PHOTO_RE.test(key) ? key : `/api/photos/${key}`)
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const MAX_PHOTOS = 10

/** Поля, которые админ может менять. */
export type ProductInput = Partial<
  Pick<
    Product,
    | 'title'
    | 'category'
    | 'condition'
    | 'price'
    | 'oldPrice'
    | 'description'
    | 'specs'
    | 'quantity'
    | 'preorder'
    | 'hidden'
    | 'photos'
    | 'used'
  >
>

const isNonNegInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : undefined)

/**
 * Проверяет и нормализует изменения товара. Возвращает текст ошибки или очищенный объект.
 * `partial` разрешает передавать только часть полей (например, только количество).
 */
export function validateProductInput(input: unknown, partial: boolean): { error: string } | { value: ProductInput } {
  if (!input || typeof input !== 'object') return { error: 'Пустой запрос' }
  const i = input as Record<string, unknown>
  const out: ProductInput = {}
  const has = (k: string) => k in i && i[k] !== undefined

  if (has('title') || !partial) {
    const title = text(i.title, 120)
    if (!title) return { error: 'Укажите название' }
    out.title = title
  }
  if (has('category') || !partial) {
    if (!categories.some((c) => c.id === i.category)) return { error: 'Выберите категорию' }
    out.category = i.category as CategoryId
  }
  if (has('condition') || !partial) {
    if (i.condition !== 'new' && i.condition !== 'used') return { error: 'Укажите состояние: новый или б/у' }
    out.condition = i.condition
  }
  if (has('price') || !partial) {
    if (!isNonNegInt(i.price)) return { error: 'Цена должна быть целым неотрицательным числом' }
    out.price = i.price
  }
  if ('oldPrice' in i) {
    if (i.oldPrice === null || i.oldPrice === undefined || i.oldPrice === 0) out.oldPrice = undefined
    else if (!isNonNegInt(i.oldPrice)) return { error: 'Старая цена должна быть целым неотрицательным числом' }
    else out.oldPrice = i.oldPrice
  }
  if (has('quantity') || !partial) {
    if (!isNonNegInt(i.quantity) || i.quantity > 100000) return { error: 'Количество должно быть целым неотрицательным числом' }
    out.quantity = i.quantity
  }
  if (has('description') || !partial) out.description = text(i.description, 3000) ?? ''
  if (has('specs') || !partial) {
    const specs = Array.isArray(i.specs) ? i.specs : []
    out.specs = specs
      .filter((r): r is [string, string] => Array.isArray(r) && typeof r[0] === 'string' && typeof r[1] === 'string')
      .map(([k, v]) => [k.trim().slice(0, 60), v.trim().slice(0, 200)] as [string, string])
      .filter(([k, v]) => k && v)
      .slice(0, 30)
  }
  if (has('preorder')) out.preorder = Boolean(i.preorder) || undefined
  if (has('hidden')) out.hidden = Boolean(i.hidden) || undefined
  if (has('photos') || !partial) {
    const photos = Array.isArray(i.photos) ? i.photos : []
    if (photos.length > MAX_PHOTOS) return { error: `Не больше ${MAX_PHOTOS} фото` }
    if (!photos.every((k) => typeof k === 'string' && isPhotoKey(k))) return { error: 'Некорректное фото' }
    out.photos = [...new Set(photos as string[])]
  }
  if ('used' in i) {
    const u = (i.used ?? {}) as Record<string, unknown>
    const battery = u.battery === undefined || u.battery === null || u.battery === '' ? undefined : Number(u.battery)
    if (battery !== undefined && (!Number.isInteger(battery) || battery < 0 || battery > 100))
      return { error: 'Аккумулятор: число от 0 до 100' }
    out.used = { battery, grade: text(u.grade, 20) || undefined, kit: text(u.kit, 200) || undefined }
  }
  return { value: out }
}
