import { useState, useEffect } from 'react'
import { adminService } from '../../services/adminService'
import { Toaster, toast } from 'sonner'
import AdminNavigation from '../../components/AdminNavigation'

interface Order {
  id: string
  order_number: string
  user_id: string
  total_amount: number
  status: string
  created_at: string
  users: {
    first_name: string
    last_name: string
    email: string
  }
  order_items: Array<{
    product_name: string
    quantity: number
    unit_price: number
  }>
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  })
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 20
  })

  useEffect(() => {
    loadOrders()
  }, [filters])

  const loadOrders = async () => {
    try {
      setIsLoading(true)
      const response = await adminService.getAllOrders(filters)
      
      if (response.success) {
        setOrders(response.data.orders)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      toast.error('Failed to load orders')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await adminService.updateOrderStatus(orderId, newStatus)
      if (response.success) {
        toast.success('Order status updated successfully')
        loadOrders()
      }
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const handleBatchStatusUpdate = async (newStatus: string) => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders first')
      return
    }

    try {
      const response = await adminService.batchUpdateOrderStatus(selectedOrders, newStatus)
      if (response.success) {
        toast.success(`${response.data.updatedCount} orders updated successfully`)
        setSelectedOrders([])
        loadOrders()
      }
    } catch (error) {
      toast.error('Failed to update orders')
    }
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrders(orders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }

  const handlePrintPackingSlips = async () => {
    if (selectedOrders.length === 0) {
      toast.error('Please select orders first')
      return
    }

    try {
      const response = await adminService.getPackingSlips(selectedOrders)
      if (response.success) {
        // In a real app, this would open a print dialog or generate PDF
        toast.success('Packing slips generated successfully')
        console.log('Packing slips:', response.data)
      }
    } catch (error) {
      toast.error('Failed to generate packing slips')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-sage to-gold rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-pebble">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ivory">
      <Toaster position="top-right" />
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-indigo" style={{ fontFamily: 'Playfair Display, serif' }}>
            Order Management
          </h1>
          <p className="text-pebble">Manage customer orders and fulfillment</p>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6 border border-sand">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Order number, customer name..."
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo mb-2">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-sand rounded-lg focus:ring-2 focus:ring-sage focus:border-transparent"
              />
            </div>
          </div>

          {/* Batch Actions */}
          {selectedOrders.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-sage/5 rounded-lg">
              <span className="text-sm font-medium text-indigo">
                {selectedOrders.length} orders selected
              </span>
              <button
                onClick={() => handleBatchStatusUpdate('processing')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Mark Processing
              </button>
              <button
                onClick={() => handleBatchStatusUpdate('shipped')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Mark Shipped
              </button>
              <button
                onClick={handlePrintPackingSlips}
                className="px-4 py-2 bg-sage text-white rounded-lg hover:bg-sage/90 transition-colors"
              >
                Print Packing Slips
              </button>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden border border-sand">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-sand">
              <thead className="bg-sage/5">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === orders.length && orders.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-sand text-sage focus:ring-sage"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-pebble uppercase tracking-wide">
                    Order
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-pebble uppercase tracking-wide">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-pebble uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-pebble uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-pebble uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-pebble uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-sand">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-sage/5">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-sand text-sage focus:ring-sage"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo">#{order.order_number}</div>
                      <div className="text-sm text-pebble">{order.order_items.length} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo">
                        {order.users.first_name} {order.users.last_name}
                      </div>
                      <div className="text-sm text-pebble">{order.users.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pebble">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="text-sm border border-sand rounded px-2 py-1 focus:ring-2 focus:ring-sage focus:border-transparent"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-sage/5 px-6 py-4 border-t border-sand">
              <div className="flex items-center justify-between">
                <div className="text-sm text-pebble">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} orders
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 text-sm font-medium text-indigo bg-white border border-sand rounded-lg hover:bg-sage/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm font-medium text-indigo">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-2 text-sm font-medium text-indigo bg-white border border-sand rounded-lg hover:bg-sage/5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}