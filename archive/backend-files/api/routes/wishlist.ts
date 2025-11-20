import { Router } from 'express'
import { body } from 'express-validator'
import { requireAuth } from '../middleware/auth'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} from '../controllers/wishlistController'

const router = Router()

// Validation middleware
const addToWishlistValidation = [
  body('productId').isLength({ min: 1 }).withMessage('Product ID is required')
]

// Routes
router.get('/', requireAuth, getWishlist)
router.post('/', requireAuth, addToWishlistValidation, addToWishlist)
router.delete('/:productId', requireAuth, removeFromWishlist)
router.delete('/clear', requireAuth, clearWishlist)

export default router