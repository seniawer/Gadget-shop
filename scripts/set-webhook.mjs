// Настраивает бота после деплоя: вебхук, кнопку меню и описание.
// Запуск: BOT_TOKEN=... WEBAPP_URL=https://... [WEBHOOK_SECRET=...] npm run set-webhook
const { BOT_TOKEN, WEBAPP_URL, WEBHOOK_SECRET } = process.env
if (!BOT_TOKEN || !WEBAPP_URL) {
  console.error('Нужны переменные BOT_TOKEN и WEBAPP_URL')
  process.exit(1)
}

const call = async (method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  console.log(method, data.ok ? '✅' : `❌ ${data.description}`)
}

const url = WEBAPP_URL.replace(/\/$/, '')
await call('setWebhook', { url: `${url}/api/bot`, secret_token: WEBHOOK_SECRET || undefined, allowed_updates: ['message'] })
await call('setChatMenuButton', { menu_button: { type: 'web_app', text: 'Магазин', web_app: { url } } })
await call('setMyDescription', { description: 'ГАДЖЕТ | ТЕХНИКА | РЕМОНТ | АКСЕССУАРЫ. Новые iPhone, iPad и MacBook, предзаказ новинок, б/у, аксессуары и ремонт. Нажмите «Начать», чтобы открыть каталог.' })
await call('setMyShortDescription', { short_description: 'Техника Apple, б/у, аксессуары и ремонт' })
