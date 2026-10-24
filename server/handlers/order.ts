import { callBot, escapeHtml as e, verifyInitData } from '../telegram'

type Item = { title: string; color: string; memory?: string; qty: number; price: number }

type Body = {
  initData?: string
  kind?: 'order' | 'repair'
  name?: string
  phone?: string
  delivery?: 'pickup' | 'courier'
  address?: string
  comment?: string
  items?: Item[]
  total?: number
  device?: string
  service?: string
}

const json = (data: unknown, status = 200) => Response.json(data, { status })
const rub = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`
const str = (v: unknown, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

// Принимает заказ или заявку на ремонт из мини-аппа и пересылает менеджеру через бота.
export async function POST(request: Request) {
  const { BOT_TOKEN, ADMIN_CHAT_ID } = process.env
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return json({ ok: false, error: 'Сервер не настроен' }, 500)

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return json({ ok: false, error: 'Неверный запрос' }, 400)
  }

  const user = verifyInitData(body.initData ?? '', BOT_TOKEN)
  if (!user) return json({ ok: false, error: 'Откройте магазин из Telegram' }, 401)

  const name = str(body.name, 100)
  const phone = str(body.phone, 30)
  if (!name || phone.replace(/\D/g, '').length < 10) return json({ ok: false, error: 'Укажите имя и телефон' }, 400)

  const number = String(Date.now()).slice(-6)
  const who = user.username ? `@${e(user.username)}` : `<a href="tg://user?id=${user.id}">${e(user.first_name)}</a>`
  const comment = str(body.comment, 500)
  const lines: string[] = []

  if (body.kind === 'repair') {
    lines.push(
      `🛠 <b>Заявка на ремонт #${number}</b>`,
      '',
      `<b>Устройство:</b> ${e(str(body.device, 50))}`,
      `<b>Услуга:</b> ${e(str(body.service, 100))}`,
    )
  } else {
    const items = Array.isArray(body.items) ? body.items.slice(0, 50) : []
    if (!items.length) return json({ ok: false, error: 'Корзина пуста' }, 400)
    const total = items.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0)
    lines.push(
      `🛒 <b>Новый заказ #${number}</b>`,
      '',
      ...items.map(
        (i) =>
          `• ${e(str(i.title, 100))}${i.memory ? `, ${e(str(i.memory, 30))}` : ''}, ${e(str(i.color, 50))} × ${Number(i.qty)} = ${rub(Number(i.price) * Number(i.qty))}`,
      ),
      '',
      `<b>Итого:</b> ${rub(total)}`,
      `<b>Получение:</b> ${body.delivery === 'courier' ? `курьер, ${e(str(body.address))}` : 'самовывоз'}`,
    )
  }

  lines.push('', `<b>Клиент:</b> ${e(name)}, ${e(phone)}`, `<b>Telegram:</b> ${who}`)
  if (comment) lines.push(`<b>Комментарий:</b> ${e(comment)}`)

  try {
    await callBot(BOT_TOKEN, 'sendMessage', { chat_id: ADMIN_CHAT_ID, text: lines.join('\n'), parse_mode: 'HTML' })
    // Подтверждение покупателю. Сработает, только если он уже писал боту (/start).
    await callBot(BOT_TOKEN, 'sendMessage', {
      chat_id: user.id,
      text: `${body.kind === 'repair' ? 'Заявка на ремонт' : 'Заказ'} #${number} принят ✅\nМенеджер скоро свяжется с вами.`,
    }).catch(() => undefined)
  } catch (err) {
    console.error(err)
    return json({ ok: false, error: 'Не удалось отправить заявку, попробуйте ещё раз' }, 502)
  }

  return json({ ok: true, number })
}
