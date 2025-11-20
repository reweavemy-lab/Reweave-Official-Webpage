import { api } from './api'

export interface AdminLoginRequest {
  email: string
  password: string
}

export interface AdminLoginResponse {
  success: boolean
  data: {
    adminId: string
    email: string
    firstName: string
    lastName: string
    role: 'founder' | 'admin' | 'manager'
    permissions: string[]
    token: string
    refreshToken: string
  }
}

export interface AnalyticsData {
  totalRevenue: number
  dailyRevenue: Array<{ date: string; amount: number }>
  monthlyRevenue: Array<{ month: string; amount: number }>
  averageDailyRevenue: number
}

export interface OrderData {
  orders: Array<any>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ProductData {
  products: Array<any>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Create admin API client with admin token
const adminApi = {
  ...api,
  async get<T>(url: string, config?: any): Promise<T> {
    const adminToken = localStorage.getItem('adminToken')
    const headers = {
      ...config?.headers,
      'Authorization': `Bearer ${adminToken}`
    }
    return api.get(url, { ...config, headers })
  },
  
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const adminToken = localStorage.getItem('adminToken')
    const headers = {
      ...config?.headers,
      'Authorization': `Bearer ${adminToken}`
    }
    return api.post(url, data, { ...config, headers })
  },
  
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const adminToken = localStorage.getItem('adminToken')
    const headers = {
      ...config?.headers,
      'Authorization': `Bearer ${adminToken}`
    }
    return api.put(url, data, { ...config, headers })
  },
  
  async delete<T>(url: string, config?: any): Promise<T> {
    const adminToken = localStorage.getItem('adminToken')
    const headers = {
      ...config?.headers,
      'Authorization': `Bearer ${adminToken}`
    }
    return api.delete(url, { ...config, headers })
  }
}

export const adminService = {
  async login(data: AdminLoginRequest): Promise<AdminLoginResponse> {
    return adminApi.post('/admin/auth/login', data)
  },

  async getRevenueAnalytics(filters?: any): Promise<{ success: boolean; data: AnalyticsData }> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    return adminApi.get(`/admin/analytics/revenue?${params}`)
  },

  async getOrderAnalytics(filters?: any): Promise<{ success: boolean; data: any }> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    return adminApi.get(`/admin/analytics/orders?${params}`)
  },

  async getCustomerAnalytics(filters?: any): Promise<{ success: boolean; data: any }> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    return adminApi.get(`/admin/analytics/customers?${params}`)
  },

  async getProductAnalytics(filters?: any): Promise<{ success: boolean; data: any }> {
    const params = new URLSearchParams()
    if (filters?.startDate) params.append('startDate', filters.startDate)
    if (filters?.endDate) params.append('endDate', filters.endDate)
    
    return adminApi.get(`/admin/analytics/products?${params}`)
  },

  async getAllOrders(filters?: any): Promise<{ success: boolean; data: OrderData }> {
    const params = new URLSearchParams()
    if (filters?.status) params.append('status', filters.status)
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters?.dateTo) params.append('dateTo', filters.dateTo)
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.search) params.append('search', filters.search)
    
    return adminApi.get(`/admin/orders?${params}`)
  },

  async updateOrderStatus(orderId: string, status: string, trackingNumber?: string, courier?: string): Promise<{ success: boolean; data: any }> {
    return adminApi.put(`/admin/orders/${orderId}/status`, {
      status,
      trackingNumber,
      courier
    })
  },

  async batchUpdateOrderStatus(orderIds: string[], status: string): Promise<{ success: boolean; data: any }> {
    return adminApi.post('/admin/orders/batch-status', {
      orderIds,
      status
    })
  },

  async getPackingSlips(orderIds: string[]): Promise<{ success: boolean; data: any[] }> {
    return adminApi.post('/admin/orders/packing-slips', {
      orderIds
    })
  },

  async getAllProducts(filters?: any): Promise<{ success: boolean; data: ProductData }> {
    const params = new URLSearchParams()
    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.category) params.append('category', filters.category)
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters?.isPreorder !== undefined) params.append('isPreorder', filters.isPreorder.toString())
    if (filters?.search) params.append('search', filters.search)
    
    return adminApi.get(`/admin/products?${params}`)
  },

  async updateProduct(productId: string, data: any): Promise<{ success: boolean; data: any }> {
    return adminApi.put(`/admin/products/${productId}`, data)
  },

  async createProduct(data: any): Promise<{ success: boolean; data: any }> {
    return adminApi.post('/admin/products', data)
  },

  async deleteProduct(productId: string): Promise<{ success: boolean; message: string }> {
    return adminApi.delete(`/admin/products/${productId}`)
  },

  async updateInventory(productId: string, data: any): Promise<{ success: boolean; data: any }> {
    return adminApi.put(`/admin/products/${productId}/inventory`, data)
  },

  async getLowStockProducts(): Promise<{ success: boolean; data: any[] }> {
    return adminApi.get('/admin/products/low-stock')
  },

  async uploadProductImage(productId: string, imageUrl: string, isPrimary?: boolean): Promise<{ success: boolean; data: any }> {
    return adminApi.post(`/admin/products/${productId}/images`, {
      imageUrl,
      isPrimary
    })
  },

  async logout(): Promise<{ success: boolean; message: string }> {
    return adminApi.post('/admin/auth/logout')
  }
}