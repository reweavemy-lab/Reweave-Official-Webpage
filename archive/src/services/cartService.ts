// import { supabase } from '../lib/supabase'; // Not available in frontend

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount?: number;
  notes?: string;
  added_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    is_preorder: boolean;
    inventory_policy: string;
  };
  product_variants?: {
    id: string;
    name: string;
    price: number;
    sku: string;
    inventory_quantity: number;
  };
}

export interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  status: 'active' | 'abandoned' | 'converted' | 'expired';
  total_items: number;
  total_quantity: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  expires_at?: string;
  converted_at?: string;
  created_at: string;
  updated_at: string;
  cart_items?: CartItem[];
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
  sessionId?: string;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface BillingAddress extends ShippingAddress {}

export interface PaymentMethod {
  method: string;
  provider: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardholderName?: string;
}

export interface CreateOrderRequest {
  cartId: string;
  shippingAddress: ShippingAddress;
  billingAddress?: BillingAddress;
  shippingMethod?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  discountCode?: string;
  preorderBatchId?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  preorder_batch_id?: string;
  product_name: string;
  variant_name?: string;
  sku?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_amount: number;
  tax_amount: number;
  fulfillment_status: 'unfulfilled' | 'fulfilled' | 'returned';
  fulfilled_quantity: number;
  returned_quantity: number;
  notes?: string;
  metadata?: Record<string, any>;
  products?: {
    name: string;
    slug: string;
    images: string[];
  };
  product_variants?: {
    name: string;
    sku: string;
  };
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string;
  session_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'failed';
  fulfillment_status: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'partially_refunded' | 'failed' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  total_amount: number;
  currency: string;
  customer_email: string;
  customer_first_name?: string;
  customer_last_name?: string;
  customer_phone?: string;
  shipping_address?: Record<string, any>;
  billing_address?: Record<string, any>;
  shipping_method?: string;
  shipping_carrier?: string;
  tracking_number?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  payment_method?: string;
  payment_provider?: string;
  payment_reference?: string;
  paid_at?: string;
  is_preorder: boolean;
  preorder_batch_id?: string;
  notes?: string;
  customer_notes?: string;
  internal_notes?: string;
  tags?: string[];
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  confirmed_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
  payments?: Payment[];
  refunds?: Refund[];
}

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  payment_provider: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  reference_id?: string;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  failure_reason?: string;
  paid_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Refund {
  id: string;
  order_id: string;
  payment_id?: string;
  refund_method: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference_id?: string;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  failure_reason?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

// Cart Service
export const cartService = {
  // Get user's cart
  async getCart(sessionId?: string): Promise<Cart> {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('sessionId', sessionId);

      const response = await fetch(`/api/cart?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  // Add item to cart
  async addToCart(request: AddToCartRequest): Promise<{ cart: Cart; message: string; reserved_quantity: number }> {
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add item to cart');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  async updateCartItem(itemId: string, quantity: number): Promise<{ cart: Cart; message: string }> {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update cart item');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  async removeCartItem(itemId: string): Promise<{ cart: Cart; message: string }> {
    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to remove cart item');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing cart item:', error);
      throw error;
    }
  },

  // Clear cart
  async clearCart(): Promise<{ cart: Cart; message: string }> {
    try {
      const response = await fetch('/api/cart/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to clear cart');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  // Create order from cart
  async createOrder(request: CreateOrderRequest): Promise<{ order: Order; message: string; next_step: string }> {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create order');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user's orders
  async getOrders(filters: { page?: number; limit?: number; status?: string; search?: string } = {}): Promise<{ orders: Order[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch orders');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get order details
  async getOrder(orderId: string): Promise<{ order: Order }> {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch order');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: string, status: string, notes?: string): Promise<{ order: Order; message: string }> {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify({ status, notes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update order status');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cancel order
  async cancelOrder(orderId: string, reason?: string): Promise<{ order: Order; message: string }> {
    try {
      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel order');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },

  // Process order payment
  async processOrderPayment(orderId: string, paymentMethod: PaymentMethod, paymentDetails: any): Promise<{ payment: Payment; order: Order; message: string }> {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify({ paymentMethod, paymentDetails }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to process payment');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Helper functions
  formatPrice(price: number): string {
    return `RM ${price.toFixed(2)}`;
  },

  calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => total + item.total_price, 0);
  },

  calculateTotal(items: CartItem[], discountAmount: number = 0, taxAmount: number = 0, shippingAmount: number = 0): number {
    const subtotal = this.calculateSubtotal(items);
    return subtotal - discountAmount + taxAmount + shippingAmount;
  },

  getOrderStatusColor(status: string): string {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'confirmed': return 'text-indigo-600 bg-indigo-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'partially_paid': return 'text-yellow-600 bg-yellow-100';
      case 'refunded': return 'text-red-600 bg-red-100';
      case 'partially_refunded': return 'text-orange-600 bg-orange-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  },

  canCancelOrder(order: Order): boolean {
    return !['shipped', 'delivered', 'cancelled'].includes(order.status);
  },

  isOrderPaid(order: Order): boolean {
    return order.payment_status === 'paid' || order.payment_status === 'partially_paid';
  },

  getEstimatedDeliveryDate(order: Order): string {
    if (order.estimated_delivery_date) {
      return new Date(order.estimated_delivery_date).toLocaleDateString();
    }
    
    // Default estimate based on order date
    const orderDate = new Date(order.created_at);
    orderDate.setDate(orderDate.getDate() + 5); // 5 business days
    return orderDate.toLocaleDateString();
  }
};

export default cartService;