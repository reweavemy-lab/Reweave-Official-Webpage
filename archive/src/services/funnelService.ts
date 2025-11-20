import { api } from './api';

export interface FunnelMetrics {
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  repeatPurchases: number;
}

export interface TrafficSourceJourney {
  source: string;
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  repeatPurchases: number;
  conversionRate: number;
  avgOrderValue: number;
  totalRevenue: number;
}

export interface ProductJourneyData {
  productId: string;
  name: string;
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  avgTimeToPurchase: number;
  dropOffStage: string;
}

export interface JourneyTrend {
  date: string;
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  repeatPurchases: number;
  conversionRate: number;
}

export interface TrackEventData {
  eventType: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_started' | 'purchase_completed';
  userId: string;
  productId?: string;
  source?: string;
  revenue?: number;
}

export const funnelService = {
  // Get funnel metrics
  async getFunnelMetrics(timeframe: string = '7d', source: string = 'all') {
    const response = await api.get(`/analytics/funnel/metrics?timeframe=${timeframe}&source=${source}`);
    return (response as any).data;
  },

  // Get traffic source journey data
  async getTrafficSourceMetrics(timeframe: string = '7d') {
    const response = await api.get(`/analytics/funnel/traffic-sources?timeframe=${timeframe}`);
    return (response as any).data;
  },

  // Get product journey analytics
  async getProductJourneyMetrics(timeframe: string = '7d', limit: number = 10) {
    const response = await api.get(`/analytics/funnel/product-journey?timeframe=${timeframe}&limit=${limit}`);
    return (response as any).data;
  },

  // Get funnel trends over time
  async getFunnelTrends(days: number = 7) {
    const response = await api.get(`/analytics/funnel/trends?days=${days}`);
    return (response as any).data;
  },

  // Track funnel event (public endpoint)
  async trackFunnelEvent(eventData: TrackEventData) {
    const response = await api.post('/analytics/funnel/track', eventData);
    return (response as any).data;
  },

  // Get comprehensive funnel dashboard data
  async getFunnelDashboardData(timeframe: string = '7d') {
    try {
      const [
        metricsResponse,
        trafficResponse,
        productsResponse,
        trendsResponse
      ] = await Promise.all([
        this.getFunnelMetrics(timeframe),
        this.getTrafficSourceMetrics(timeframe),
        this.getProductJourneyMetrics(timeframe),
        this.getFunnelTrends(7)
      ]);

      return {
        metrics: metricsResponse.data,
        trafficSources: trafficResponse.data,
        topProducts: productsResponse.data,
        trends: trendsResponse.data
      };
    } catch (error) {
      console.error('Error fetching funnel dashboard data:', error);
      throw error;
    }
  }
};