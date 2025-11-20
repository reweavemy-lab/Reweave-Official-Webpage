import { Response } from 'express'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AdminRequest } from '../middleware/adminAuth'

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  productId?: string
  category?: string
}

// Get real-time revenue analytics
export const getRevenueAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate }: AnalyticsFilters = req.query

    // Get total revenue
    const { data: totalRevenue } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    const totalRevenueAmount = totalRevenue?.reduce((sum, order) => sum + order.total_amount, 0) || 0

    // Get daily revenue for the last 30 days
    const { data: dailyRevenue } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    // Group by date
    const dailyRevenueMap = new Map()
    dailyRevenue?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      dailyRevenueMap.set(date, (dailyRevenueMap.get(date) || 0) + order.total_amount)
    })

    const dailyRevenueData = Array.from(dailyRevenueMap.entries()).map(([date, amount]) => ({
      date,
      amount
    }))

    // Get monthly revenue
    const { data: monthlyRevenue } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('status', 'completed')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    const monthlyRevenueMap = new Map()
    monthlyRevenue?.forEach(order => {
      const month = new Date(order.created_at).toISOString().slice(0, 7)
      monthlyRevenueMap.set(month, (monthlyRevenueMap.get(month) || 0) + order.total_amount)
    })

    const monthlyRevenueData = Array.from(monthlyRevenueMap.entries()).map(([month, amount]) => ({
      month,
      amount
    }))

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenueAmount,
        dailyRevenue: dailyRevenueData,
        monthlyRevenue: monthlyRevenueData,
        averageDailyRevenue: dailyRevenueData.length > 0 ? totalRevenueAmount / dailyRevenueData.length : 0
      }
    })
  } catch (error) {
    console.error('Revenue analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get revenue analytics'
    })
  }
}

// Get order analytics
export const getOrderAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate }: AnalyticsFilters = req.query

    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    // Get orders by status
    const { data: ordersByStatus } = await supabase
      .from('orders')
      .select('status, count')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    // Get daily orders
    const { data: dailyOrders } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    const dailyOrdersMap = new Map()
    dailyOrders?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0]
      dailyOrdersMap.set(date, (dailyOrdersMap.get(date) || 0) + 1)
    })

    const dailyOrdersData = Array.from(dailyOrdersMap.entries()).map(([date, count]) => ({
      date,
      count
    }))

    // Get conversion rate
    const { count: totalVisitors } = await supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'page_view')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const conversionRate = totalVisitors && totalVisitors > 0 ? (totalOrders || 0) / totalVisitors * 100 : 0

    res.json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        ordersByStatus: ordersByStatus || [],
        dailyOrders: dailyOrdersData,
        conversionRate: conversionRate.toFixed(2),
        averageOrdersPerDay: dailyOrdersData.length > 0 ? (totalOrders || 0) / dailyOrdersData.length : 0
      }
    })
  } catch (error) {
    console.error('Order analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get order analytics'
    })
  }
}

// Get customer analytics
export const getCustomerAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate }: AnalyticsFilters = req.query

    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get new customers in period
    const { count: newCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    // Get returning customers (customers with more than 1 order)
    const { data: returningCustomers } = await supabase
      .from('users')
      .select('id')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    // Get average order value (AOV)
    const { data: completedOrders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('status', 'completed')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    const totalRevenue = completedOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
    const aov = completedOrders && completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

    // Get customer lifetime value (LTV) data
    const { data: customerLTV } = await supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        loyalty_points,
        orders!inner(total_amount, created_at)
      `)

    const customerLTVData = customerLTV?.map(customer => ({
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`,
      email: customer.email,
      totalSpent: customer.orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0,
      orderCount: customer.orders?.length || 0,
      loyaltyPoints: customer.loyalty_points
    })).sort((a, b) => b.totalSpent - a.totalSpent)

    res.json({
      success: true,
      data: {
        totalCustomers: totalCustomers || 0,
        newCustomers: newCustomers || 0,
        returningCustomers: returningCustomers?.length || 0,
        averageOrderValue: aov.toFixed(2),
        customerLTV: customerLTVData?.slice(0, 10) || [] // Top 10 customers
      }
    })
  } catch (error) {
    console.error('Customer analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get customer analytics'
    })
  }
}

// Get product performance analytics
export const getProductAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, category }: AnalyticsFilters = req.query

    // Get product performance data
    const { data: productPerformance } = await supabase
      .from('order_items')
      .select(`
        product_id,
        product_name,
        unit_price,
        quantity,
        orders!inner(created_at, status)
      `)
      .eq('orders.status', 'completed')
      .gte('orders.created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('orders.created_at', endDate || new Date().toISOString())

    // Group by product
    const productMap = new Map()
    productPerformance?.forEach(item => {
      const existing = productMap.get(item.product_id) || {
        productId: item.product_id,
        productName: item.product_name,
        totalQuantity: 0,
        totalRevenue: 0,
        orderCount: 0
      }
      
      existing.totalQuantity += item.quantity
      existing.totalRevenue += item.unit_price * item.quantity
      existing.orderCount += 1
      
      productMap.set(item.product_id, existing)
    })

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    res.json({
      success: true,
      data: {
        topProducts,
        totalProducts: productMap.size,
        totalRevenue: Array.from(productMap.values()).reduce((sum, p) => sum + p.totalRevenue, 0)
      }
    })
  } catch (error) {
    console.error('Product analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get product analytics'
    })
  }
}

// Get traffic source analytics
export const getTrafficAnalytics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate }: AnalyticsFilters = req.query

    // Get traffic source data
    const { data: trafficData } = await supabase
      .from('analytics_events')
      .select('source, medium, campaign, count')
      .eq('event_type', 'page_view')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    // Group by source
    const sourceMap = new Map()
    trafficData?.forEach(event => {
      const source = event.source || 'direct'
      const existing = sourceMap.get(source) || {
        source,
        visits: 0,
        conversions: 0
      }
      
      existing.visits += event.count
      sourceMap.set(source, existing)
    })

    // Get conversion data by source
    const { data: conversionData } = await supabase
      .from('orders')
      .select('source, count')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    conversionData?.forEach(order => {
      const source = order.source || 'direct'
      const existing = sourceMap.get(source) || {
        source,
        visits: 0,
        conversions: 0
      }
      
      existing.conversions += order.count
      sourceMap.set(source, existing)
    })

    const trafficSources = Array.from(sourceMap.values()).map(source => ({
      ...source,
      conversionRate: source.visits > 0 ? (source.conversions / source.visits * 100).toFixed(2) : '0.00'
    }))

    res.json({
      success: true,
      data: {
        trafficSources,
        totalVisits: trafficSources.reduce((sum, source) => sum + source.visits, 0),
        totalConversions: trafficSources.reduce((sum, source) => sum + source.conversions, 0)
      }
    })
  } catch (error) {
    console.error('Traffic analytics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get traffic analytics'
    })
  }
}