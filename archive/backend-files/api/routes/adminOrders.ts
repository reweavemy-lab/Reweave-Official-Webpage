import { Router } from 'express'
import { body, query } from 'express-validator'
import { authenticateAdmin, requireAdmin } from '../middleware/adminAuth'
import {
  getAllOrders,
  updateOrderStatus,
  batchUpdateOrderStatus,
  getPackingSlips,
  getOrderStatistics
} from '../controllers/adminOrderController'

const router = Router()

// Validation middleware
const getOrdersValidation = [
  query('status').optional().isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('customerId').optional().isUUID(),
  query('productId').optional().isUUID(),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 }),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isString(),
  query('sortOrder').optional().isIn(['asc', 'desc'])
]

const updateOrderStatusValidation = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('trackingNumber').optional().isString(),
  body('courier').optional().isString(),
  body('notes').optional().isString()
]

const batchUpdateValidation = [
  body('orderIds').isArray().withMessage('Order IDs must be an array'),
  body('orderIds.*').isUUID().withMessage('Each order ID must be a valid UUID'),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
]

const packingSlipsValidation = [
  body('orderIds').isArray().withMessage('Order IDs must be an array'),
  body('orderIds.*').isUUID().withMessage('Each order ID must be a valid UUID')
]

// All admin order routes require admin authentication
router.use(authenticateAdmin)
router.use(requireAdmin)

// Order management routes
router.get('/', getOrdersValidation, getAllOrders)
router.put('/:orderId/status', updateOrderStatusValidation, updateOrderStatus)
router.post('/batch-status', batchUpdateValidation, batchUpdateOrderStatus)
router.post('/packing-slips', packingSlipsValidation, getPackingSlips)
router.get('/statistics', getOrdersValidation, getOrderStatistics)

export default router