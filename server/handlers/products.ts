import { listProducts } from '../storage'
import { json } from '../http'

// Публичный каталог: скрытые товары не отдаём.
export async function getPublicProducts() {
  const products = (await listProducts()).filter((p) => !p.hidden)
  return json({ ok: true, products }, 200, { 'Cache-Control': 'no-cache' })
}
