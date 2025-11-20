import { api } from './api';

export interface PopupOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface PopupCustomer {
  name: string;
  phone: string;
  instagram?: string;
  email?: string;
}

export interface PopupOrderRequest {
  items: PopupOrderItem[];
  customer: PopupCustomer;
  eventName: string;
  paymentMethod: string;
  totalAmount: number;
}

export interface QRPaymentRequest {
  amount: number;
  orderId: string;
  paymentMethod: string;
  customerName: string;
  eventName: string;
}

export interface PopupEvent {
  id: string;
  name: string;
  description?: string;
  location: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  totalSales: number;
  totalOrders: number;
  uniqueCustomers: number;
}

export interface PopupAnalytics {
  totalSales: number;
  totalOrders: number;
  uniqueCustomers: number;
  avgOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
}

export const popupService = {
  // Create popup order
  async createPopupOrder(orderData: PopupOrderRequest) {
    const response = await api.post('/popup/orders', orderData);
    return (response as any).data;
  },

  // Generate QR payment code
  async generateQRPayment(paymentData: QRPaymentRequest) {
    const response = await api.post('/popup/qr-payment', paymentData);
    return (response as any).data;
  },

  // Verify QR payment
  async verifyQRPayment(qrCode: string) {
    const response = await api.get(`/popup/qr-verify/${qrCode}`);
    return (response as any).data;
  },

  // Get popup events
  async getPopupEvents(limit = 10, offset = 0, status?: string) {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    if (status) params.append('status', status);
    
    const response = await api.get(`/popup/events?${params.toString()}`);
    return (response as any).data;
  },

  // Get popup analytics
  async getPopupAnalytics(eventId?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/popup/analytics?${params.toString()}`);
    return (response as any).data;
  },

  // Get customer data for export
  async getPopupCustomers(eventId?: string) {
    const params = new URLSearchParams();
    if (eventId) params.append('eventId', eventId);
    
    const response = await api.get(`/popup/customers?${params.toString()}`);
    return (response as any).data;
  },

  // Export customer data as CSV
  exportCustomersToCSV(customers: any[], format: 'detailed' | 'summary' | 'crm' = 'detailed') {
    let csvContent = '';
    
    if (format === 'detailed') {
      csvContent = [
        ['Customer ID', 'Name', 'Phone', 'Instagram', 'Email', 'Event', 'Total Spent', 'Purchases', 'Loyalty Points', 'Tags', 'First Purchase', 'Last Purchase', 'VIP Status'],
        ...customers.map(customer => [
          customer.id,
          customer.name,
          customer.phone,
          customer.instagram || '',
          customer.email || '',
          customer.eventName,
          customer.totalSpent,
          customer.totalPurchases,
          customer.loyaltyPoints,
          customer.tags.join('; '),
          customer.firstPurchaseDate,
          customer.lastPurchaseDate,
          customer.isVip ? 'Yes' : 'No'
        ])
      ].map(row => row.join(',')).join('\n');
    } else if (format === 'summary') {
      csvContent = [
        ['Event Name', 'Total Customers', 'Total Revenue', 'Avg Spend per Customer', 'VIP Customers'],
        ...customers.reduce((acc: any[], customer: any) => {
          const existing = acc.find(item => item[0] === customer.eventName);
          if (existing) {
            existing[1] += 1;
            existing[2] += customer.totalSpent;
            existing[3] = (existing[2] / existing[1]).toFixed(2);
            if (customer.isVip) existing[4] += 1;
          } else {
            acc.push([
              customer.eventName,
              1,
              customer.totalSpent,
              customer.totalSpent.toFixed(2),
              customer.isVip ? 1 : 0
            ]);
          }
          return acc;
        }, []).map((row: any[]) => [
          row[0],
          row[1],
          row[2].toFixed(2),
          row[3],
          row[4]
        ])
      ].map(row => row.join(',')).join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `popup-customers-${format}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  },

  // Generate QR code for payment (client-side fallback)
  generateQRCodeData(orderId: string, amount: number, paymentMethod: string): string {
    const timestamp = Date.now();
    const methodCode = paymentMethod.toUpperCase().substr(0, 3);
    const randomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    return `PAY_${methodCode}_${orderId}_${amount}_${timestamp}_${randomCode}`;
  },

  // Format currency for display
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  },

  // Calculate loyalty points
  calculateLoyaltyPoints(totalSpent: number): number {
    return Math.floor(totalSpent); // 1 point per RM spent
  },

  // Get payment method display info
  getPaymentMethodInfo(method: string) {
    const methods = {
      'touchngo': { name: 'Touch n Go eWallet', color: 'bg-blue-500', icon: '🏪' },
      'grabpay': { name: 'GrabPay', color: 'bg-green-500', icon: '🟢' },
      'boost': { name: 'Boost', color: 'bg-orange-500', icon: '🟠' },
      'fpx': { name: 'FPX Online Banking', color: 'bg-purple-500', icon: '🏦' }
    };
    
    return methods[method as keyof typeof methods] || { name: method, color: 'bg-gray-500', icon: '💳' };
  }
};