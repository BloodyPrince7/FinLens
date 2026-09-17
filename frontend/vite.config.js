import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Convai's Character REST API (POST /character/getResponse) requires a
// CONVAI-API-KEY header. It has no domain-whitelist requirement at all
// (unlike Convai's Pixel Streaming / Experience Embed product, which this
// app no longer uses) - but the key still shouldn't be shipped in the
// client bundle. This dev-server middleware keeps it server-side: the
// browser calls this local path, and the middleware forwards to Convai
// with the real key attached.
function convaiCharacterProxy(apiKey) {
  return {
    name: 'convai-character-proxy',
    configureServer(server) {
      server.middlewares.use('/convai-proxy/character/getResponse', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end()
          return
        }
        if (!apiKey) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'CONVAI_API_KEY is not set on the dev server.' }))
          return
        }

        const contentType = req.headers['content-type'] ?? 'multipart/form-data'
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const body = Buffer.concat(chunks)

        try {
          console.log('[convai-proxy] Forwarding character/getResponse')
          const upstream = await fetch('https://api.convai.com/character/getResponse', {
            method: 'POST',
            headers: { 'Content-Type': contentType, 'CONVAI-API-KEY': apiKey },
            body,
          })
          const text = await upstream.text()
          console.log('[convai-proxy] Upstream responded', upstream.status)
          res.statusCode = upstream.status
          res.setHeader('Content-Type', 'application/json')
          res.end(text)
        } catch (err) {
          console.error('[convai-proxy] Request to Convai failed', err)
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Proxy request to Convai failed.' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), convaiCharacterProxy(env.VITE_CONVAI_API_KEY)],
    server: {
      port: 5173,
    },
  }
})
