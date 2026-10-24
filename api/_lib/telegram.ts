import { createHmac, timingSafeEqual } from 'node:crypto'

export type TgUser = { id: number; first_name: string; last_name?: string; username?: string }

// Проверка подписи initData по документации Telegram:
// https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
export function verifyInitData(initData: string, botToken: string, maxAgeSec = 24 * 60 * 60): TgUser | null {
  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  if (!hash) return null
  params.delete('hash')

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  const expected = createHmac('sha256', secret).update(dataCheckString).digest()
  const actual = Buffer.from(hash, 'hex')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null

  const authDate = Number(params.get('auth_date'))
  if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null

  try {
    return JSON.parse(params.get('user') ?? 'null')
  } catch {
    return null
  }
}

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function callBot(token: string, method: string, body: Record<string, unknown>) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = (await res.json()) as { ok: boolean; description?: string }
  if (!data.ok) throw new Error(`Telegram ${method}: ${data.description}`)
  return data
}
