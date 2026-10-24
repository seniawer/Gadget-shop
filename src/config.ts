import raw from '../shop.config.json'

// Данные магазина берём из shop.config.json, чтобы менять их без правки кода.
export const shop = raw as {
  name: string
  fullName: string
  tagline: string
  channel: string
  managers: string[]
  hours: string
  responseTime: string
  lateNote: string
  address: string
  reviewsUrl: string
  warrantyUsed: string
}

export const telegramUrl = (username: string, text?: string) =>
  `https://t.me/${username}${text ? `?text=${encodeURIComponent(text)}` : ''}`

export const routeUrl = (address: string) => `https://yandex.ru/maps/?rtext=~${encodeURIComponent(address)}&rtt=auto`
