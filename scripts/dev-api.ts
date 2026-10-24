import type { Plugin } from 'vite'
import { loadEnv } from 'vite'

// Локальная разработка: `npm run dev` обслуживает /api/* теми же обработчиками, что и функция
// Netlify, а Netlify Blobs заменяет локальный эмулятор (данные в .netlify/blobs-local).
export function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    async configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const key of ['BOT_TOKEN', 'ADMIN_IDS', 'ADMIN_CHAT_ID', 'WEBAPP_URL', 'WEBHOOK_SECRET']) {
        if (env[key] && !process.env[key]) process.env[key] = env[key]
      }

      if (!process.env.NETLIFY_BLOBS_CONTEXT) {
        const { BlobsServer } = await import('@netlify/blobs/server')
        const blobs = new BlobsServer({ directory: '.netlify/blobs-local', token: 'local' })
        const { port } = await blobs.start()
        const url = `http://localhost:${port}`
        process.env.NETLIFY_BLOBS_CONTEXT = Buffer.from(
          JSON.stringify({ siteID: 'local', token: 'local', edgeURL: url, uncachedEdgeURL: url }),
        ).toString('base64')
      }

      const skipHeaders = new Set(['host', 'connection', 'content-length', 'transfer-encoding'])

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()
        try {
          const { route } = (await server.ssrLoadModule('/server/router.ts')) as typeof import('../server/router')
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const headers = new Headers()
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === 'string' && !skipHeaders.has(k)) headers.set(k, v)
          }
          const method = req.method ?? 'GET'
          const response = await route(
            new Request(new URL(req.url, 'http://localhost'), {
              method,
              headers,
              body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
            }),
          )
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(Buffer.from(await response.arrayBuffer()))
        } catch (e) {
          next(e)
        }
      })
    },
  }
}
