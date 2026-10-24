import raw from '../shop.config.json'

// Данные магазина берём из shop.config.json, чтобы менять их без правки кода.
export const shop = raw as {
  name: string
  fullName: string
  tagline: string
  /** Логотип из public/, пустая строка — показываем букву. */
  logo: string
  channel: string
  about: string
  perks: { emoji: string; title: string; text: string }[]
  services: { emoji: string; title: string; text: string }[]
  managers: string[]
  managerNames: Record<string, string>
  phones: { name: string; phone: string; whatsapp?: boolean }[]
  hours: string
  responseTime: string
  lateNote: string
  address: string
  /** Что искать на карте для маршрута (без этажа и офиса). */
  mapQuery: string
  storeHours: string
  storePhoto: string
  social: { title: string; url: string }[]
  reviewsUrl: string
  warrantyUsed: string
}

export const telegramUrl = (username: string, text?: string) =>
  `https://t.me/${username}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** Номер для ссылок tel: и wa.me: только цифры, с 7 в начале. */
export const phoneDigits = (phone: string) => phone.replace(/\D/g, '').replace(/^8/, '7')

export const routeUrl = (address: string) => `https://yandex.ru/maps/?rtext=~${encodeURIComponent(address)}&rtt=auto`
