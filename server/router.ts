import { handleAdmin } from './handlers/admin'
import { POST as handleBot } from './handlers/bot'
import { POST as handleOrder } from './handlers/order'
import { getPhotoResponse } from './handlers/photos'
import { getPublicProducts } from './handlers/products'
import { fail } from './http'

// Единая точка входа для всех /api/* (одна функция Netlify и dev-сервер Vite).
export async function route(request: Request): Promise<Response> {
  const path = new URL(request.url).pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean)
  const [section, ...rest] = path
  try {
    if (section === 'products' && request.method === 'GET') return await getPublicProducts()
    if (section === 'photos' && rest.length === 1 && request.method === 'GET') return await getPhotoResponse(rest[0])
    if (section === 'order' && request.method === 'POST') return await handleOrder(request)
    if (section === 'bot' && request.method === 'POST') return await handleBot(request)
    if (section === 'admin') return await handleAdmin(request, rest)
    return fail('Не найдено', 404)
  } catch (e) {
    console.error(e)
    return fail(e instanceof Error && e.message.startsWith('Каталог') ? e.message : 'Ошибка сервера, попробуйте ещё раз', 500)
  }
}
