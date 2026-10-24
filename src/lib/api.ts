import type { Product, ProductInput } from '../../shared/catalog'
import { tg } from './telegram'

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { 'X-Telegram-Init-Data': tg.initData, ...init.headers },
    })
  } catch {
    throw new ApiError('Нет соединения. Проверьте интернет и попробуйте ещё раз', 0)
  }
  const data = (await res.json().catch(() => null)) as ({ ok?: boolean; error?: string } & T) | null
  if (!res.ok || !data?.ok) throw new ApiError(data?.error ?? 'Что-то пошло не так, попробуйте ещё раз', res.status)
  return data
}

const jsonBody = (body: unknown): RequestInit => ({
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json' },
})

export const api = {
  products: () => request<{ products: Product[] }>('/products').then((d) => d.products),

  admin: {
    me: () => request<{ isAdmin: boolean }>('/admin/me').then((d) => d.isAdmin),
    products: () => request<{ products: Product[] }>('/admin/products').then((d) => d.products),
    create: (input: ProductInput) =>
      request<{ product: Product }>('/admin/products', { method: 'POST', ...jsonBody(input) }).then((d) => d.product),
    update: (id: string, input: ProductInput) =>
      request<{ product: Product }>(`/admin/products/${id}`, { method: 'PATCH', ...jsonBody(input) }).then((d) => d.product),
    remove: (id: string) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    uploadPhoto: (blob: Blob) =>
      request<{ key: string }>('/admin/photos', { method: 'POST', body: blob, headers: { 'Content-Type': blob.type } }).then(
        (d) => d.key,
      ),
    deletePhoto: (key: string) => request(`/admin/photos/${key}`, { method: 'DELETE' }),
  },
}

export type OrderPayload =
  | {
      kind: 'order'
      name: string
      phone: string
      delivery: 'pickup' | 'courier'
      address?: string
      comment?: string
      items: { title: string; color: string; memory?: string; qty: number; price: number }[]
      total: number
    }
  | {
      kind: 'repair'
      name: string
      phone: string
      device: string
      service: string
      comment?: string
    }

// Отправляет заказ или заявку на ремонт менеджеру через бота и возвращает номер заявки.
// Вне Telegram работает демо-режим: сервер принимает только заявки с подписью Telegram.
export async function submit(payload: OrderPayload): Promise<string> {
  if (!tg.isTelegram) {
    await new Promise((r) => setTimeout(r, 700))
    return String(Math.floor(1000 + Math.random() * 9000))
  }
  const data = await request<{ number: string }>('/order', {
    method: 'POST',
    ...jsonBody({ ...payload, initData: tg.initData }),
  })
  return data.number
}
