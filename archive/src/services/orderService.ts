import { api } from './api'

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  currency: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shipping_address_id?: string
  billing_address_id?: string
  metadata?: any
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  shipments?: Shipment[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  product_name: string
  unit_price: number
  quantity: number
  product_attributes?: any
  created_at: string
}

export interface Shipment {
  id: string
  order_id: string
  tracking_number?: string
  courier?: string
  status: string
  tracking_data?: any
  estimated_delivery?: string
  created_at: string
  updated_at: string
}

export interface OrderFilters {
  page?: number
  limit?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
    attributes?: any
  }>
  shippingAddressId: string
  billingAddressId: string
  paymentMethodId: string
  totalAmount: number
  currency?: string
}

export const orderService = {
  async getOrderHistory(filters?: OrderFilters): Promise<{
    success: boolean
    data: {
      orders: Order[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }
  }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.status) params.append('status', filters.status)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)

    const response = await api.get<{
      success: boolean
      data: {
        orders: Order[]
        pagination: {
          page: number
          limit: number
          total: number
          totalPages: number
        }
      }
    }>(`/orders/history?${params}`)
    return response
  },

  async getOrderDetails(orderId: string): Promise<{
    success: boolean
    data: Order
  }> {
    const response = await api.get<{
      success: boolean
      data: Order
    }>(`/orders/${orderId}`)
    return response
  },

  async trackOrder(orderId: string): Promise<{
    success: boolean
    data: {
      orderNumber: string
      status: string
      totalAmount: number
      trackingNumber?: string
      courier?: string
      shipmentStatus: string
      trackingData?: any
      estimatedDelivery?: string
      createdAt: string
      updatedAt: string
    }
  }> {
    const response = await api.get<{
      success: boolean
      data: {
        orderNumber: string
        status: string
        totalAmount: number
        trackingNumber?: string
        courier?: string
        shipmentStatus: string
        trackingData?: any
        estimatedDelivery?: string
        createdAt: string
        updatedAt: string
      }
    }>(`/orders/${orderId}/track`)
    return response
  },

  async createOrder(data: CreateOrderRequest): Promise<{
    success: boolean
    data: {
      orderId: string
      orderNumber: string
      totalAmount: number
      status: string
      createdAt: string
    }
  }> {
    const response = await api.post<{
      success: boolean
      data: {
        orderId: string
        orderNumber: string
        totalAmount: number
        status: string
        createdAt: string
      }
    }>('/orders/', data)
    return response
  }
}