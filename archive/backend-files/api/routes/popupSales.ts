import express from 'express';
import { 
  createPopupOrder,
  generateQRPayment,
  verifyQRPayment,
  getPopupEvents,
  getPopupAnalytics
} from '../controllers/popupController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Popup order routes
router.post('/orders', requireAuth, createPopupOrder);
router.post('/qr-payment', requireAuth, generateQRPayment);
router.get('/qr-verify/:qrCode', verifyQRPayment);

// Popup event routes
router.get('/events', requireAuth, getPopupEvents);
router.get('/analytics', requireAuth, getPopupAnalytics);

export default router;