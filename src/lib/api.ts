import { tg } from './telegram'

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

// Отправляет заказ или заявку на /api/order (функция Vercel), которая пересылает их менеджеру через бота.
// Возвращает номер заявки. Вне Telegram или без бэкенда (локальный `vite dev`) работает в демо-режиме:
// сервер принимает только заявки с подписью Telegram, чтобы бота не заспамили из браузера.
export async function submit(payload: OrderPayload): Promise<string> {
  const fallback = String(Math.floor(1000 + Math.random() * 9000))
  if (!tg.isTelegram) {
    await new Promise((r) => setTimeout(r, 700))
    return fallback
  }
  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, initData: tg.initData }),
    })
    if (res.status === 404) return fallback
    const data = (await res.json()) as { ok: boolean; number?: string; error?: string }
    if (!data.ok) throw new Error(data.error ?? 'Не удалось отправить заявку')
    return data.number ?? fallback
  } catch (e) {
    if (e instanceof TypeError || e instanceof SyntaxError) return fallback
    throw e
  }
}
