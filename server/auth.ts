import { verifyInitData, type TgUser } from './telegram'
import { fail } from './http'

/** Список админов из ADMIN_IDS ("123,456"). Если он пуст, админом считается владелец из ADMIN_CHAT_ID. */
export function adminIds(): number[] {
  const raw = process.env.ADMIN_IDS?.trim() || process.env.ADMIN_CHAT_ID?.trim() || ''
  return raw
    .split(/[\s,;]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0)
}

export const INIT_DATA_HEADER = 'x-telegram-init-data'

/** Проверяет подпись Telegram и что пользователь в списке админов. Возвращает пользователя или готовый ответ с ошибкой. */
export function requireAdmin(request: Request): TgUser | Response {
  const token = process.env.BOT_TOKEN
  if (!token) return fail('Сервер не настроен', 500)
  const user = verifyInitData(request.headers.get(INIT_DATA_HEADER) ?? '', token)
  if (!user) return fail('Откройте приложение из Telegram', 401)
  if (!adminIds().includes(user.id)) return fail('Нет доступа к админке', 403)
  return user
}
