import { Router } from 'express'
import { body, query } from 'express-validator'
import { requireAuth } from '../middleware/auth'
import {
  getBalance,
  getHistory,
  redeemPoints
} from '../controllers/loyaltyController'

const router = Router()

// Validation middleware
const redeemPointsValidation = [
  body('points').isInt({ min: 1 }).withMessage('Points must be a positive integer'),
  body('description').optional().isString()
]

const getHistoryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
]

// Routes
router.get('/balance', requireAuth, getBalance)
router.get('/history', requireAuth, getHistoryValidation, getHistory)
router.post('/redeem', requireAuth, redeemPointsValidation, redeemPoints)

export default router