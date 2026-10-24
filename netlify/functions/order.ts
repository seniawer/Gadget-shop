import { POST } from '../../api/order.js'

export default (request: Request) =>
  request.method === 'POST' ? POST(request) : new Response('Method Not Allowed', { status: 405 })

export const config = { path: '/api/order' }
