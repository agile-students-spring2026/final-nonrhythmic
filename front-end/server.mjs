import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const port = Number(process.env.PORT) || 8080
const root = resolve(fileURLToPath(new URL('./dist', import.meta.url)))

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
}

function resolvePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0] || '/')
  const normalized = normalize(decoded).replace(/^(\.\.[/\\])+/, '')
  return join(root, normalized === '/' ? 'index.html' : normalized)
}

async function existingFile(pathname) {
  try {
    const info = await stat(pathname)
    return info.isFile() ? pathname : null
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  const requestedPath = resolvePath(req.url || '/')
  const safeRequestedPath = requestedPath.startsWith(root) ? requestedPath : join(root, 'index.html')
  const filePath = (await existingFile(safeRequestedPath)) || join(root, 'index.html')
  const type = contentTypes[extname(filePath)] || 'application/octet-stream'

  res.writeHead(200, {
    'Content-Type': type,
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000',
  })
  createReadStream(filePath).pipe(res)
}).listen(port, '0.0.0.0')
