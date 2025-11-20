import express from 'express';
import { 
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  processOrderPayment
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Order routes
router.post('/', requireAuth, createOrder);
router.get('/', requireAuth, getUserOrders);
router.get('/:orderId', requireAuth, getOrder);
router.put('/:orderId/status', requireAuth, updateOrderStatus);
router.post('/:orderId/cancel', requireAuth, cancelOrder);
router.post('/:orderId/payment', requireAuth, processOrderPayment);

export default router;