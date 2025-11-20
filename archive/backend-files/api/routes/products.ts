import express from 'express';
import { 
  getProducts, 
  getProduct, 
  getProductVariants, 
  checkInventoryAvailability,
  getCategories,
  getMaterials,
  createProductReview
} from '../controllers/productController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/materials', getMaterials);
router.get('/:id', getProduct);
router.get('/:productId/variants', getProductVariants);
router.post('/check-inventory', checkInventoryAvailability);

// Protected routes
router.post('/:productId/reviews', requireAuth, createProductReview);

export default router;