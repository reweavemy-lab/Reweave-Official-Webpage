import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import hpp from 'hpp'
import xss from 'xss-clean'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { buildRoutes } from './routes'
import { Cache } from './cache'
import { logger } from './logger'

const app = express()
const port = Number(process.env.PORT || 3001)
const origins = (process.env.ALLOWED_ORIGINS || 'http://localhost:8000').split(',').map(s => s.trim())
const limiter = rateLimit({ windowMs: Number(process.env.RATE_WINDOW_MS || 60000), max: Number(process.env.RATE_MAX || 60) })
const cache = new Cache()

app.use(cors({ origin: origins }))
app.use(helmet())
app.use(hpp())
app.use(xss())
app.use(compression())
app.use(express.json({ limit: process.env.JSON_LIMIT || '1mb' }))
app.use(limiter)

app.use((req, _res, next) => {
  logger.info({ msg: 'request', method: req.method, url: req.url, ip: req.ip })
  next()
})

app.use('/api', buildRoutes(cache))

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ msg: 'error', error: err?.message || String(err) })
  res.status(500).json({ error: 'internal_error' })
})

cache.connect().then(() => {
  app.listen(port, () => {
    logger.info({ msg: 'started', port })
  })
}).catch(() => {
  app.listen(port, () => {
    logger.warn({ msg: 'started_without_redis', port })
  })
})