import express from 'express';
import { 
  getFunnelMetrics, 
  getTrafficSourceMetrics, 
  getProductJourneyMetrics, 
  getFunnelTrends, 
  trackFunnelEvent 
} from '../controllers/funnelController';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Funnel analytics routes
router.get('/metrics', requireAuth, getFunnelMetrics);
router.get('/traffic-sources', requireAuth, getTrafficSourceMetrics);
router.get('/product-journey', requireAuth, getProductJourneyMetrics);
router.get('/trends', requireAuth, getFunnelTrends);

// Public tracking endpoint (no auth required for event tracking)
router.post('/track', trackFunnelEvent);

export default router;