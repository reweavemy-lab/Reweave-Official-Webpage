import { Router } from 'express'
import { body, query } from 'express-validator'
import { authenticateAdmin, requireAdmin } from '../middleware/adminAuth'
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  updateInventory,
  getLowStockProducts
} from '../controllers/adminProductController'

const router = Router()

// Validation middleware
const getProductsValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isString(),
  query('isActive').optional().isBoolean(),
  query('isPreorder').optional().isBoolean(),
  query('search').optional().isString()
]

const createProductValidation = [
  body('name').isLength({ min: 1, max: 200 }).withMessage('Product name is required'),
  body('description').isString().withMessage('Description is required'),
  body('category').isString().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('originalPrice').optional().isFloat({ min: 0 }),
  body('sku').isLength({ min: 1, max: 50 }).withMessage('SKU is required'),
  body('isActive').isBoolean().withMessage('isActive must be boolean'),
  body('isPreorder').isBoolean().withMessage('isPreorder must be boolean'),
  body('preorderStartDate').optional().isISO8601(),
  body('preorderEndDate').optional().isISO8601(),
  body('estimatedDelivery').optional().isString(),
  body('images').optional().isArray(),
  body('variants').optional().isArray(),
  body('inventory').optional().isObject()
]

const updateProductValidation = [
  body('name').optional().isLength({ min: 1, max: 200 }),
  body('description').optional().isString(),
  body('category').optional().isString(),
  body('price').optional().isFloat({ min: 0 }),
  body('originalPrice').optional().isFloat({ min: 0 }),
  body('sku').optional().isLength({ min: 1, max: 50 }),
  body('isActive').optional().isBoolean(),
  body('isPreorder').optional().isBoolean(),
  body('preorderStartDate').optional().isISO8601(),
  body('preorderEndDate').optional().isISO8601(),
  body('estimatedDelivery').optional().isString(),
  body('images').optional().isArray(),
  body('variants').optional().isArray(),
  body('inventory').optional().isObject()
]

const uploadImageValidation = [
  body('imageUrl').isURL().withMessage('Valid image URL is required'),
  body('isPrimary').optional().isBoolean()
]

const updateInventoryValidation = [
  body('stock').optional().isInt({ min: 0 }),
  body('lowStockThreshold').optional().isInt({ min: 0 }),
  body('reservedStock').optional().isInt({ min: 0 })
]

// All admin product routes require admin authentication
router.use(authenticateAdmin)
router.use(requireAdmin)

// Product management routes
router.get('/', getProductsValidation, getAllProducts)
router.get('/low-stock', getLowStockProducts)
router.get('/:productId', getProduct)
router.post('/', createProductValidation, createProduct)
router.put('/:productId', updateProductValidation, updateProduct)
router.delete('/:productId', deleteProduct)
router.post('/:productId/images', uploadImageValidation, uploadProductImage)
router.put('/:productId/inventory', updateInventoryValidation, updateInventory)

export default router