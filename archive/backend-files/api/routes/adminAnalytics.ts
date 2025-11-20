import { Router } from 'express'
import { query } from 'express-validator'
import { authenticateAdmin, requireAdmin } from '../middleware/adminAuth'
import {
  getRevenueAnalytics,
  getOrderAnalytics,
  getCustomerAnalytics,
  getProductAnalytics,
  getTrafficAnalytics
} from '../controllers/analyticsController'

const router = Router()

// Validation middleware
const analyticsValidation = [
  query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO date'),
  query('productId').optional().isUUID().withMessage('Product ID must be a valid UUID'),
  query('category').optional().isString().withMessage('Category must be a string')
]

// All analytics routes require admin authentication
router.use(authenticateAdmin)
router.use(requireAdmin)

// Analytics routes
router.get('/revenue', analyticsValidation, getRevenueAnalytics)
router.get('/orders', analyticsValidation, getOrderAnalytics)
router.get('/customers', analyticsValidation, getCustomerAnalytics)
router.get('/products', analyticsValidation, getProductAnalytics)
router.get('/traffic', analyticsValidation, getTrafficAnalytics)

export default router