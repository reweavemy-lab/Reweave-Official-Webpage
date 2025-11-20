import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';

interface FunnelMetrics {
  visitors: number;
  productViews: number;
  addToCart: number;
  checkoutStarted: number;
  purchases: number;
  repeatPurchases: number;
}

interface TrafficSource {
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

interface ProductJourney {
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

// Get real-time funnel metrics
export const getFunnelMetrics = async (req: Request, res: Response) => {
  try {
    const { timeframe = '7d', source = 'all' } = req.query;
    
    // Calculate date range based on timeframe
    const now = new Date();
    const startDate = new Date();
    
    switch (timeframe) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    // Get visitors count
    const { data: visitorsData, error: visitorsError } = await supabase
      .from('analytics_events')
      .select('user_id', { count: 'exact' })
      .eq('event_type', 'page_view')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString());

    if (visitorsError) throw visitorsError;

    // Get product views
    const { data: productViewsData, error: productViewsError } = await supabase
      .from('analytics_events')
      .select('user_id', { count: 'exact' })
      .eq('event_type', 'product_view')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString());

    if (productViewsError) throw productViewsError;

    // Get add to cart events
    const { data: addToCartData, error: addToCartError } = await supabase
      .from('analytics_events')
      .select('user_id', { count: 'exact' })
      .eq('event_type', 'add_to_cart')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString());

    if (addToCartError) throw addToCartError;

    // Get checkout started events
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('analytics_events')
      .select('user_id', { count: 'exact' })
      .eq('event_type', 'checkout_started')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString());

    if (checkoutError) throw checkoutError;

    // Get completed purchases
    const { data: purchasesData, error: purchasesError } = await supabase
      .from('orders')
      .select('id', { count: 'exact' })
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString());

    if (purchasesError) throw purchasesError;

    // Get repeat purchases (customers with more than one order)
    const { data: repeatPurchasesData, error: repeatError } = await supabase
      .from('orders')
      .select('customer_id')
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .lt('created_at', now.toISOString());

    if (repeatError) throw repeatError;

    // Count repeat customers
    const customerOrderCounts: { [key: string]: number } = {};
    repeatPurchasesData?.forEach(order => {
      customerOrderCounts[order.customer_id] = (customerOrderCounts[order.customer_id] || 0) + 1;
    });
    
    const repeatPurchaseCount = Object.values(customerOrderCounts).filter(count => count > 1).length;

    const metrics: FunnelMetrics = {
      visitors: visitorsData?.length || 0,
      productViews: productViewsData?.length || 0,
      addToCart: addToCartData?.length || 0,
      checkoutStarted: checkoutData?.length || 0,
      purchases: purchasesData?.length || 0,
      repeatPurchases: repeatPurchaseCount
    };

    res.json({
      success: true,
      data: metrics,
      timeframe,
      source
    });

  } catch (error) {
    console.error('Error getting funnel metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve funnel metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get traffic source performance
export const getTrafficSourceMetrics = async (req: Request, res: Response) => {
  try {
    const { timeframe = '7d' } = req.query;
    
    const startDate = new Date();
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get traffic sources with conversion data
    const { data: trafficData, error: trafficError } = await supabase
      .from('analytics_events')
      .select('source, event_type, user_id, revenue')
      .gte('created_at', startDate.toISOString());

    if (trafficError) throw trafficError;

    // Process data by traffic source
    const sourceMetrics: { [key: string]: any } = {};
    
    trafficData?.forEach(event => {
      const source = event.source || 'Direct';
      if (!sourceMetrics[source]) {
        sourceMetrics[source] = {
          source,
          visitors: new Set(),
          productViews: 0,
          addToCart: 0,
          checkoutStarted: 0,
          purchases: 0,
          repeatPurchases: 0,
          totalRevenue: 0,
          avgOrderValue: 0
        };
      }

      sourceMetrics[source].visitors.add(event.user_id);

      switch (event.event_type) {
        case 'product_view':
          sourceMetrics[source].productViews++;
          break;
        case 'add_to_cart':
          sourceMetrics[source].addToCart++;
          break;
        case 'checkout_started':
          sourceMetrics[source].checkoutStarted++;
          break;
        case 'purchase_completed':
          sourceMetrics[source].purchases++;
          sourceMetrics[source].totalRevenue += event.revenue || 0;
          break;
      }
    });

    // Calculate conversion rates and averages
    const result = Object.values(sourceMetrics).map((source: any) => ({
      ...source,
      visitors: source.visitors.size,
      conversionRate: source.visitors.size > 0 ? (source.purchases / source.visitors.size) * 100 : 0,
      avgOrderValue: source.purchases > 0 ? source.totalRevenue / source.purchases : 0,
      repeatPurchaseRate: source.purchases > 0 ? (source.repeatPurchases / source.purchases) * 100 : 0
    }));

    res.json({
      success: true,
      data: result,
      timeframe
    });

  } catch (error) {
    console.error('Error getting traffic source metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve traffic source metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get product journey analytics
export const getProductJourneyMetrics = async (req: Request, res: Response) => {
  try {
    const { timeframe = '7d', limit = 10 } = req.query;
    
    const startDate = new Date();
    switch (timeframe) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get product analytics data
    const { data: productData, error: productError } = await supabase
      .from('product_analytics')
      .select(`
        product_id,
        product_name,
        views,
        add_to_cart,
        purchases,
        revenue,
        avg_time_to_purchase,
        drop_off_stage
      `)
      .gte('date', startDate.toISOString())
      .order('conversion_rate', { ascending: false })
      .limit(Number(limit));

    if (productError) throw productError;

    const productJourney: ProductJourney[] = (productData || []).map(product => ({
      productId: product.product_id,
      name: product.product_name,
      views: product.views || 0,
      addToCart: product.add_to_cart || 0,
      purchases: product.purchases || 0,
      conversionRate: product.views > 0 ? (product.purchases / product.views) * 100 : 0,
      revenue: product.revenue || 0,
      avgTimeToPurchase: product.avg_time_to_purchase || 0,
      dropOffStage: product.drop_off_stage || 'Unknown'
    }));

    res.json({
      success: true,
      data: productJourney,
      timeframe,
      limit
    });

  } catch (error) {
    console.error('Error getting product journey metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve product journey metrics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get funnel trends over time
export const getFunnelTrends = async (req: Request, res: Response) => {
  try {
    const { days = 7 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get daily funnel data
    const { data: trendsData, error: trendsError } = await supabase
      .from('daily_funnel_metrics')
      .select('*')
      .gte('date', startDate.toISOString())
      .order('date', { ascending: true });

    if (trendsError) throw trendsError;

    const trends = (trendsData || []).map(day => ({
      date: day.date,
      visitors: day.visitors || 0,
      productViews: day.product_views || 0,
      addToCart: day.add_to_cart || 0,
      checkoutStarted: day.checkout_started || 0,
      purchases: day.purchases || 0,
      repeatPurchases: day.repeat_purchases || 0,
      conversionRate: day.visitors > 0 ? (day.purchases / day.visitors) * 100 : 0
    }));

    res.json({
      success: true,
      data: trends,
      days
    });

  } catch (error) {
    console.error('Error getting funnel trends:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve funnel trends',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Track funnel event (for real-time tracking)
export const trackFunnelEvent = async (req: Request, res: Response) => {
  try {
    const { eventType, userId, productId, source, revenue } = req.body;

    // Validate event type
    const validEvents = ['page_view', 'product_view', 'add_to_cart', 'checkout_started', 'purchase_completed'];
    if (!validEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event type'
      });
    }

    // Insert analytics event
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        event_type: eventType,
        user_id: userId,
        product_id: productId,
        source: source || 'direct',
        revenue: revenue || 0,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    res.json({
      success: true,
      message: 'Event tracked successfully',
      data
    });

  } catch (error) {
    console.error('Error tracking funnel event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track funnel event',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};