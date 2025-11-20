import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth'
import {
  getPaymentMethods,
  getPaymentMethod,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
} from '../controllers/paymentController'

const router = Router()

// Validation middleware
const createPaymentMethodValidation = [
  body('type').isIn(['card', 'fpx', 'wallet']).withMessage('Type must be card, fpx, or wallet'),
  body('provider').isLength({ min: 1, max: 50 }).withMessage('Provider is required and must be less than 50 characters'),
  body('token').isLength({ min: 1 }).withMessage('Token is required'),
  body('lastFour').optional().isLength({ min: 4, max: 4 }).withMessage('Last four digits must be 4 characters'),
  body('expiryMonth').optional().isLength({ min: 2, max: 2 }).withMessage('Expiry month must be 2 characters'),
  body('expiryYear').optional().isLength({ min: 2, max: 4 }).withMessage('Expiry year must be 2-4 characters'),
  body('isDefault').optional().isBoolean(),
  body('metadata').optional().isObject()
]

const updatePaymentMethodValidation = [
  body('isDefault').optional().isBoolean(),
  body('metadata').optional().isObject()
]

// Routes
router.get('/', requireAuth, getPaymentMethods)
router.get('/:methodId', requireAuth, getPaymentMethod)
router.post('/', requireAuth, createPaymentMethodValidation, createPaymentMethod)
router.put('/:methodId', requireAuth, updatePaymentMethodValidation, updatePaymentMethod)
router.delete('/:methodId', requireAuth, deletePaymentMethod)

export default router