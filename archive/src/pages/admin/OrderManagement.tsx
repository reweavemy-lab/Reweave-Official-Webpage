import { useState } from 'react';
import { Search, Filter, Download, Printer, CheckCircle, Clock, Package, Truck, AlertCircle, ShoppingCart } from 'lucide-react';

interface Order {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  items: number;
  shippingMethod: string;
  trackingNumber?: string;
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customer: 'Sarah Lim',
    email: 'sarah@email.com',
    total: 285.00,
    status: 'paid',
    date: '2024-01-15',
    items: 2,
    shippingMethod: 'Standard',
    trackingNumber: 'TRK123456'
  },
  {
    id: 'ORD-002',
    customer: 'John Tan',
    email: 'john@email.com',
    total: 450.00,
    status: 'shipped',
    date: '2024-01-14',
    items: 3,
    shippingMethod: 'Express',
    trackingNumber: 'TRK789012'
  },
  {
    id: 'ORD-003',
    customer: 'Maria Wong',
    email: 'maria@email.com',
    total: 180.00,
    status: 'pending',
    date: '2024-01-16',
    items: 1,
    shippingMethod: 'Standard'
  },
  {
    id: 'ORD-004',
    customer: 'David Chen',
    email: 'david@email.com',
    total: 320.00,
    status: 'delivered',
    date: '2024-01-13',
    items: 2,
    shippingMethod: 'Express',
    trackingNumber: 'TRK345678'
  },
  {
    id: 'ORD-005',
    customer: 'Lisa Ng',
    email: 'lisa@email.com',
    total: 195.00,
    status: 'paid',
    date: '2024-01-15',
    items: 1,
    shippingMethod: 'Standard'
  }
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  shipped: 'bg-blue-100 text-blue-800 border-blue-200',
  delivered: 'bg-sage/10 text-sage border-sage',
  cancelled: 'bg-red-100 text-red-800 border-red-200'
};

const statusIcons = {
  pending: Clock,
  paid: CheckCircle,
  shipped: Truck,
  delivered: Package,
  cancelled: AlertCircle
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesDate = dateFilter === 'all' || 
                       (dateFilter === 'today' && order.date === new Date().toISOString().split('T')[0]) ||
                       (dateFilter === 'week' && new Date(order.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleMarkAsFulfilled = () => {
    setOrders(prev => prev.map(order => 
      selectedOrders.includes(order.id) 
        ? { ...order, status: 'shipped' as const }
        : order
    ));
    setSelectedOrders([]);
  };

  const handlePrintPackingSlips = () => {
    console.log('Printing packing slips for:', selectedOrders);
    // Implement print functionality
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-indigo">Order Management</h1>
          <p className="text-pebble mt-2">Manage and fulfill customer orders</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handlePrintPackingSlips}
            disabled={selectedOrders.length === 0}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Packing Slips ({selectedOrders.length})
          </button>
          <button 
            onClick={handleMarkAsFulfilled}
            disabled={selectedOrders.length === 0}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Mark as Fulfilled
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-soft">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-pebble" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-ivory border border-sand rounded-xl focus:outline-none focus:ring-2 focus:ring-sage"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button className="btn btn-outline">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-sand/20">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-sand text-sage focus:ring-sage"
                  />
                </th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Order ID</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Customer</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Total</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Status</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Date</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Items</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Shipping</th>
                <th className="px-6 py-4 text-left text-pebble font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {filteredOrders.map((order) => {
                const StatusIcon = statusIcons[order.status];
                return (
                  <tr key={order.id} className="hover:bg-sand/20">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-sand text-sage focus:ring-sage"
                      />
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-indigo font-medium">
                      {order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-indigo">{order.customer}</p>
                        <p className="text-sm text-pebble">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-indigo">
                      RM {order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusColors[order.status]}`}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-pebble">
                      {new Date(order.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-indigo">
                      {order.items} items
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-indigo">{order.shippingMethod}</p>
                        {order.trackingNumber && (
                          <p className="text-xs text-pebble font-mono">{order.trackingNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 rounded-lg hover:bg-sand text-indigo">
                          <Package className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-sand text-indigo">
                          <Truck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-pebble mx-auto mb-4" />
            <p className="text-pebble">No orders found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-indigo mt-2">{orders.length}</p>
            </div>
            <div className="w-12 h-12 bg-sage/10 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-sage" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold text-indigo mt-2">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Shipped</p>
              <p className="text-3xl font-bold text-indigo mt-2">
                {orders.filter(o => o.status === 'shipped').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pebble text-sm font-medium">Revenue</p>
              <p className="text-3xl font-bold text-indigo mt-2">
                RM {orders.reduce((sum, order) => sum + order.total, 0).toFixed(0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}