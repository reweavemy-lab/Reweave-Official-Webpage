import { Router } from 'express'

const router = Router()

// Simple test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() })
})

export default router