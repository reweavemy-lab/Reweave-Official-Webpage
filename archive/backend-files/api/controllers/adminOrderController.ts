import { Response } from 'express'
import { validationResult } from 'express-validator'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { AdminRequest } from '../middleware/adminAuth'
import { AnalyticsFilters } from './analyticsController'

export interface OrderFilters {
  status?: string
  dateFrom?: string
  dateTo?: string
  customerId?: string
  productId?: string
  minAmount?: number
  maxAmount?: number
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Get all orders with filters
export const getAllOrders = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
      return
    }

    const {
      status,
      dateFrom,
      dateTo,
      customerId,
      productId,
      minAmount,
      maxAmount,
      search,
      page = 1,
      limit = 50,
      sortBy = 'created_at',
      sortOrder = 'desc'
    }: OrderFilters = req.query

    let query = supabase
      .from('orders')
      .select(`
        *,
        users!inner(first_name, last_name, email),
        order_items(*),
        shipments(*)
      `)

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (customerId) {
      query = query.eq('user_id', customerId)
    }

    if (minAmount) {
      query = query.gte('total_amount', minAmount)
    }

    if (maxAmount) {
      query = query.lte('total_amount', maxAmount)
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%`)
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data: orders, error, count } = await query

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    })
  } catch (error) {
    console.error('Get all orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get orders'
    })
  }
}

// Update order status
export const updateOrderStatus = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
      return
    }

    const { orderId } = req.params
    const { status, trackingNumber, courier, notes }: {
      status: string
      trackingNumber?: string
      courier?: string
      notes?: string
    } = req.body

    // Update order
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }

    if (trackingNumber) updateData.tracking_number = trackingNumber
    if (courier) updateData.courier = courier
    if (notes) updateData.admin_notes = notes

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      })
      return
    }

    // Create shipment if status is shipped
    if (status === 'shipped' && trackingNumber) {
      await supabase
        .from('shipments')
        .insert({
          order_id: orderId,
          tracking_number: trackingNumber,
          courier: courier || 'Unknown',
          status: 'in_transit',
          estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
    }

    // Send email notification
    if (status === 'shipped') {
      // TODO: Implement email notification
      console.log(`Order ${order.order_number} shipped with tracking ${trackingNumber}`)
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Update order status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update order status'
    })
  }
}

// Batch update order statuses
export const batchUpdateOrderStatus = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      })
      return
    }

    const { orderIds, status }: { orderIds: string[], status: string } = req.body

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      })
      return
    }

    // Update all orders
    const { data: orders, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .in('id', orderIds)
      .select('*')

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: {
        updatedCount: orders?.length || 0,
        orders: orders || []
      }
    })
  } catch (error) {
    console.error('Batch update order status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to batch update order statuses'
    })
  }
}

// Get order packing slips
export const getPackingSlips = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { orderIds }: { orderIds: string[] } = req.body

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Order IDs array is required'
      })
      return
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        users!inner(first_name, last_name, email, phone),
        order_items(*),
        addresses!inner(address_line_1, address_line_2, city, state, postal_code)
      `)
      .in('id', orderIds)
      .eq('status', 'processing')

    if (error) {
      throw error
    }

    // Generate packing slip data
    const packingSlips = orders?.map(order => ({
      orderNumber: order.order_number,
      customerName: `${order.users.first_name} ${order.users.last_name}`,
      customerEmail: order.users.email,
      customerPhone: order.users.phone,
      shippingAddress: {
        line1: order.addresses.address_line_1,
        line2: order.addresses.address_line_2,
        city: order.addresses.city,
        state: order.addresses.state,
        postalCode: order.addresses.postal_code
      },
      items: order.order_items.map((item: any) => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price
      })),
      totalAmount: order.total_amount,
      orderDate: order.created_at
    }))

    res.json({
      success: true,
      data: packingSlips || []
    })
  } catch (error) {
    console.error('Get packing slips error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get packing slips'
    })
  }
}

// Get order statistics
export const getOrderStatistics = async (req: AdminRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate }: AnalyticsFilters = req.query

    // Get order counts by status
    const { data: statusCounts } = await supabase
      .from('orders')
      .select('status, count')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    // Get total revenue by status
    const { data: revenueByStatus } = await supabase
      .from('orders')
      .select('status, total_amount')
      .eq('status', 'completed')
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('created_at', endDate || new Date().toISOString())

    const revenueMap = new Map()
    revenueByStatus?.forEach(order => {
      revenueMap.set(order.status, (revenueMap.get(order.status) || 0) + order.total_amount)
    })

    // Get average order processing time
    const { data: processingTimeData } = await supabase
      .from('orders')
      .select('created_at, updated_at, status')
      .in('status', ['shipped', 'delivered'])
      .gte('created_at', startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    let totalProcessingTime = 0
    let processedOrders = 0

    processingTimeData?.forEach(order => {
      const createdTime = new Date(order.created_at).getTime()
      const updatedTime = new Date(order.updated_at).getTime()
      const processingTime = updatedTime - createdTime
      
      totalProcessingTime += processingTime
      processedOrders++
    })

    const averageProcessingTime = processedOrders > 0 ? totalProcessingTime / processedOrders / (1000 * 60 * 60 * 24) : 0 // in days

    res.json({
      success: true,
      data: {
        statusCounts: statusCounts || [],
        revenueByStatus: Array.from(revenueMap.entries()).map(([status, revenue]) => ({
          status,
          revenue
        })),
        averageProcessingTime: averageProcessingTime.toFixed(1)
      }
    })
  } catch (error) {
    console.error('Get order statistics error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get order statistics'
    })
  }
}