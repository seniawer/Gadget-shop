import { callBot } from './_lib/telegram.js'

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
        'Это магазин техники Apple: новые и проверенные б/у устройства, аксессуары и ремонт.\n\n' +
        'Нажмите кнопку ниже, чтобы открыть каталог.',
      reply_markup: { inline_keyboard: [[{ text: '🛍 Открыть магазин', web_app: { url: WEBAPP_URL } }]] },
    })
  } else if (msg) {
    await callBot(BOT_TOKEN, 'sendMessage', {
      chat_id: msg.chat.id,
      text: 'Спасибо за сообщение! Менеджер ответит в ближайшее время. А пока можно посмотреть каталог 👇',
      reply_markup: { inline_keyboard: [[{ text: '🛍 Открыть магазин', web_app: { url: WEBAPP_URL } }]] },
    })
  }
  return new Response('ok')
}
