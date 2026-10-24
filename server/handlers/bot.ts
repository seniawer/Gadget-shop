import { callBot } from '../telegram'

type Update = { message?: { chat: { id: number }; text?: string; from?: { first_name: string } } }

// Вебхук бота: отвечает на /start кнопкой, которая открывает мини-апп.
// Подключается командой `npm run set-webhook` после деплоя.
export async function POST(request: Request) {
  const { BOT_TOKEN, WEBAPP_URL, WEBHOOK_SECRET } = process.env
  if (!BOT_TOKEN || !WEBAPP_URL) return new Response('not configured', { status: 500 })
  if (WEBHOOK_SECRET && request.headers.get('x-telegram-bot-api-secret-token') !== WEBHOOK_SECRET)
    return new Response('forbidden', { status: 403 })

  const update = (await request.json()) as Update
  const msg = update.message
  if (msg?.text?.startsWith('/start')) {
    await callBot(BOT_TOKEN, 'sendMessage', {
      chat_id: msg.chat.id,
      text:
        `Привет, ${msg.from?.first_name ?? 'друг'}! 👋\n\n` +
        'Это «ГАДЖЕТ | ТЕХНИКА | РЕМОНТ | АКСЕССУАРЫ» 📱\n' +
        'Новые iPhone, iPad и MacBook, предзаказ новинок, проверенные б/у, аксессуары и ремонт.\n\n' +
        'Жмите кнопку ниже, чтобы открыть каталог 👇',
      reply_markup: { inline_keyboard: [[{ text: '🛍 Открыть магазин', web_app: { url: WEBAPP_URL } }]] },
    })
  } else if (msg) {
    await callBot(BOT_TOKEN, 'sendMessage', {
      chat_id: msg.chat.id,
      text: 'Спасибо! Менеджеры @IgorSavchuk9 и @adroganova отвечают в течение 5 минут с 9:00 до 22:00. А пока загляните в каталог 👇',
      reply_markup: { inline_keyboard: [[{ text: '🛍 Открыть магазин', web_app: { url: WEBAPP_URL } }]] },
    })
  }
  return new Response('ok')
}
