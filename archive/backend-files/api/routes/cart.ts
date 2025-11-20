import express from 'express';
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Cart routes - some can be accessed without auth (guest cart)
router.get('/', getCart);
router.post('/items', addToCart);
router.put('/items/:itemId', requireAuth, updateCartItem);
router.delete('/items/:itemId', requireAuth, removeCartItem);
router.delete('/clear', requireAuth, clearCart);

export default router;