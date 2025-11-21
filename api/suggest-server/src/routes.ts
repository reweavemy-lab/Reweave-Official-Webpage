import { Router, Request, Response, NextFunction } from 'express'
import { validationResult, checkSchema } from 'express-validator'
import { Cache } from './cache'
import { logger } from './logger'
import { colorsSchema, outfitSchema, styleSchema } from './validation'
import { suggestColors, recommendOutfit, styleAdvice } from './ai'

export function buildRoutes(cache: Cache) {
  const router = Router()
  router.post('/suggest/colors', checkSchema(colorsSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
      const { palette } = req.body as { palette: string[] }
      const key = 'colors:' + JSON.stringify(palette)
      const cached = await cache.get(key)
      if (cached) return res.json(cached)
      const result = await suggestColors(palette)
      await cache.set(key, result)
      res.json(result)
    } catch (e) {
      next(e)
    }
  })
  router.post('/suggest/outfit', checkSchema(outfitSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
      const { occasion, palette, budget } = req.body as { occasion: string; palette?: string[]; budget?: { min?: number; max?: number } }
      const key = 'outfit:' + JSON.stringify({ occasion, palette, budget })
      const cached = await cache.get(key)
      if (cached) return res.json(cached)
      const result = await recommendOutfit(occasion, palette || [], budget?.min, budget?.max)
      await cache.set(key, result)
      res.json(result)
    } catch (e) {
      next(e)
    }
  })
  router.post('/suggest/style', checkSchema(styleSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
      const { products, palette } = req.body as { products: { id?: string; name: string; price: number }[]; palette?: string[] }
      const key = 'style:' + JSON.stringify({ products, palette })
      const cached = await cache.get(key)
      if (cached) return res.json(cached)
      const result = await styleAdvice(products, palette || [])
      await cache.set(key, result)
      res.json(result)
    } catch (e) {
      next(e)
    }
  })
  router.get('/health', async (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() })
  })
  router.get('/ready', async (_req, res) => {
    const status = await cache.status()
    res.json({ status: 'ok', cache: status })
  })
  return router
}