// import { supabase } from '@/lib/supabase'; // Not available in frontend

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  rating: number;
  review_count: number;
  is_preorder: boolean;
  preorder_end_date?: string;
  estimated_delivery_date?: string;
  inventory_quantity: number;
  low_stock_threshold: number;
  category: string;
  tags: string[];
  variants: ProductVariant[];
  inventory?: Inventory[];
  total_stock?: number;
  is_in_stock?: boolean;
  preorder_batches?: PreorderBatch[];
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inventory_quantity: number;
  option1?: string;
  option2?: string;
  option3?: string;
  sku?: string;
  barcode?: string;
  image_url?: string;
  is_active?: boolean;
}

export interface Inventory {
  id: string;
  product_id: string;
  variant_id?: string;
  location_id?: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_incoming: number;
  quantity_committed: number;
  reorder_point: number;
  reorder_quantity: number;
  last_counted_at?: string;
  last_adjusted_at?: string;
}

export interface PreorderBatch {
  id: string;
  product_id: string;
  name: string;
  description?: string;
  batch_number?: string;
  preorder_start_date: string;
  preorder_end_date: string;
  estimated_delivery_date: string;
  minimum_order_quantity: number;
  maximum_order_quantity?: number;
  price: number;
  early_bird_price?: number;
  early_bird_end_date?: string;
  total_slots: number;
  reserved_slots: number;
  sold_slots: number;
  status: 'draft' | 'active' | 'closed' | 'cancelled' | 'delivered';
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';
  sortOrder?: 'asc' | 'desc';
  isPreorder?: boolean;
  inStock?: boolean;
  priceMin?: number;
  priceMax?: number;
  tags?: string[];
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  content?: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
  };
}

// Product Service
export const productService = {
  // Get products with filtering and pagination
  async getProducts(filters: ProductFilters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get single product by ID or slug
  async getProduct(id: string) {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  },

  // Get product variants
  async getProductVariants(productId: string) {
    try {
      const response = await fetch(`/api/products/${productId}/variants`);
      if (!response.ok) throw new Error('Failed to fetch product variants');
      
      const data = await response.json();
      return data.variants;
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  },

  // Check inventory availability
  async checkInventoryAvailability(productId: string, variantId?: string, quantity: number = 1) {
    try {
      const response = await fetch('/api/products/check-inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, variantId, quantity }),
      });
      
      if (!response.ok) throw new Error('Failed to check inventory');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking inventory:', error);
      throw error;
    }
  },

  // Get categories
  async getCategories() {
    try {
      const response = await fetch('/api/products/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      
      const data = await response.json();
      return data.categories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Get materials
  async getMaterials(filters: { type?: string; lowStock?: boolean } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.lowStock) params.append('lowStock', 'true');

      const response = await fetch(`/api/products/materials?${params}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      
      const data = await response.json();
      return data.materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  },

  // Create product review
  async createProductReview(productId: string, review: {
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
  }) {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
        body: JSON.stringify(review),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create review');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating product review:', error);
      throw error;
    }
  },

  // Get product reviews
  async getProductReviews(productId: string, filters: { page?: number; limit?: number; rating?: number } = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.rating) params.append('rating', filters.rating.toString());

      const response = await fetch(`/api/products/${productId}/reviews?${params}`);
      if (!response.ok) throw new Error('Failed to fetch product reviews');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  },

  // Search products
  async searchProducts(query: string, filters: ProductFilters = {}) {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/products/search?${params}`);
      if (!response.ok) throw new Error('Failed to search products');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  },

  // Get featured products
  async getFeaturedProducts(limit: number = 8) {
    try {
      const response = await fetch(`/api/products/featured?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch featured products');
      
      const data = await response.json();
      return data.products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  },

  // Get new arrivals
  async getNewArrivals(limit: number = 8) {
    try {
      const response = await fetch(`/api/products/new-arrivals?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch new arrivals');
      
      const data = await response.json();
      return data.products;
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      throw error;
    }
  },

  // Get preorder products
  async getPreorderProducts(limit: number = 8) {
    try {
      const response = await fetch(`/api/products/preorder?limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch preorder products');
      
      const data = await response.json();
      return data.products;
    } catch (error) {
      console.error('Error fetching preorder products:', error);
      throw error;
    }
  },

  // Get low stock products (for admin)
  async getLowStockProducts(limit: number = 20) {
    try {
      const response = await fetch(`/api/products/low-stock?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch low stock products');
      
      const data = await response.json();
      return data.products;
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  },

  // Get product analytics (for admin)
  async getProductAnalytics(productId: string) {
    try {
      const response = await fetch(`/api/products/${productId}/analytics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('reweave-auth-token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch product analytics');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  },

  // Helper functions
  formatPrice(price: number): string {
    return `RM ${price.toFixed(2)}`;
  },

  calculateDiscount(originalPrice: number, salePrice: number): { amount: number; percentage: number } {
    const amount = originalPrice - salePrice;
    const percentage = (amount / originalPrice) * 100;
    return {
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round(percentage * 100) / 100
    };
  },

  isLowStock(product: Product, variant?: ProductVariant): boolean {
    const stock = variant ? variant.inventory_quantity : product.inventory_quantity;
    const threshold = product.low_stock_threshold;
    return stock <= threshold && stock > 0;
  },

  isOutOfStock(product: Product, variant?: ProductVariant): boolean {
    const stock = variant ? variant.inventory_quantity : product.inventory_quantity;
    return stock === 0;
  },

  canAddToCart(product: Product, variant?: ProductVariant, quantity: number = 1): boolean {
    if (product.is_preorder) return true;
    const stock = variant ? variant.inventory_quantity : product.inventory_quantity;
    return stock >= quantity;
  },

  getPreorderStatus(product: Product): 'available' | 'ended' | 'upcoming' | 'none' {
    if (!product.is_preorder) return 'none';
    
    const now = new Date();
    const endDate = product.preorder_end_date ? new Date(product.preorder_end_date) : null;
    
    if (!endDate) return 'available';
    
    if (now > endDate) return 'ended';
    
    return 'available';
  },

  getEstimatedDeliveryDate(product: Product): string {
    if (product.is_preorder && product.estimated_delivery_date) {
      return new Date(product.estimated_delivery_date).toLocaleDateString();
    }
    
    // Default delivery estimate for in-stock items
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5); // 5 business days
    return deliveryDate.toLocaleDateString();
  }
};

export default productService;