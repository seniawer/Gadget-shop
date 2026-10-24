import { POST } from '../../api/bot.js'

export default (request: Request) =>
  request.method === 'POST' ? POST(request) : new Response('Method Not Allowed', { status: 405 })

export const config = { path: '/api/bot' }
