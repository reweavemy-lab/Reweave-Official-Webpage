import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Get all products with filtering and pagination
export const getProducts = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      search, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      isPreorder,
      inStock,
      priceMin,
      priceMax,
      tags
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        categories (name, slug)
      `, { count: 'exact' })
      .eq('status', 'active');

    // Apply filters
    if (category && category !== 'all') {
      query = query.eq('category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isPreorder !== undefined) {
      query = query.eq('is_preorder', isPreorder === 'true');
    }

    if (inStock !== undefined) {
      if (inStock === 'true') {
        query = query.gt('inventory_quantity', 0);
      } else {
        query = query.eq('inventory_quantity', 0);
      }
    }

    if (priceMin) {
      query = query.gte('price', Number(priceMin));
    }

    if (priceMax) {
      query = query.lte('price', Number(priceMax));
    }

    if (tags) {
      const tagArray = (tags as string).split(',');
      query = query.contains('tags', tagArray as any[]);
    }

    // Apply sorting
    if (sortBy && sortOrder) {
      query = query.order(sortBy as string, { ascending: sortOrder === 'asc' ? true : false });
    }

    const { data, error, count } = await query;

    if (error) throw error;

    // Process inventory data for each product
    const productsWithInventory = await Promise.all(
      data.map(async (product) => {
        const inventoryData = await getProductInventory(product.id);
        return {
          ...product,
          inventory: inventoryData,
          total_stock: inventoryData.reduce((sum, inv) => sum + inv.quantity_available, 0),
          is_in_stock: inventoryData.some(inv => inv.quantity_available > 0)
        };
      })
    );

    res.json({
      products: productsWithInventory,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product by ID or slug
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_variants (*),
        categories (name, slug),
        product_reviews (
          id,
          rating,
          title,
          content,
          user_id,
          created_at,
          users (first_name, last_name)
        )
      `)
      .eq('status', 'active');

    // Query by ID or slug
    if (id.includes('-')) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Product not found' });

    // Get inventory data
    const inventoryData = await getProductInventory(data.id);
    
    // Get preorder batches if applicable
    const preorderBatches = data.is_preorder ? await getProductPreorderBatches(data.id) : [];

    // Increment view count
    await supabase
      .from('products')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);

    res.json({
      ...data,
      inventory: inventoryData,
      total_stock: inventoryData.reduce((sum, inv) => sum + inv.quantity_available, 0),
      is_in_stock: inventoryData.some(inv => inv.quantity_available > 0),
      preorder_batches: preorderBatches
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Get product variants
export const getProductVariants = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    
    const { data, error } = await supabase
      .from('product_variants')
      .select(`
        *,
        inventory (
          quantity_available,
          quantity_reserved,
          quantity_committed,
          low_stock_threshold
        )
      `)
      .eq('product_id', productId)
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (error) throw error;

    res.json({ variants: data });
  } catch (error) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({ error: 'Failed to fetch product variants' });
  }
};

// Get product inventory
export const getProductInventory = async (productId: string, variantId?: string) => {
  try {
    let query = supabase
      .from('inventory')
      .select(`
        *,
        product_variants (name, sku)
      `)
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return [];
  }
};

// Get product preorder batches
export const getProductPreorderBatches = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('preorder_batches')
      .select('*')
      .eq('product_id', productId)
      .eq('status', 'active')
      .gte('preorder_end_date', new Date().toISOString())
      .order('preorder_end_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching preorder batches:', error);
    return [];
  }
};

// Check inventory availability
export const checkInventoryAvailability = async (req: Request, res: Response) => {
  try {
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Get product details
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('is_preorder, inventory_policy')
      .eq('id', productId)
      .single();

    if (productError) throw productError;

    // If product allows backorder, always available
    if (product.inventory_policy === 'continue') {
      return res.json({ available: true, message: 'Available (backorder allowed)' });
    }

    // Check inventory
    let inventoryQuery = supabase
      .from('inventory')
      .select('quantity_available, quantity_reserved, quantity_committed');

    if (variantId) {
      inventoryQuery = inventoryQuery.eq('variant_id', variantId);
    } else {
      inventoryQuery = inventoryQuery.eq('product_id', productId);
    }

    const { data: inventory, error: inventoryError } = await inventoryQuery;

    if (inventoryError) throw inventoryError;

    const totalAvailable = inventory.reduce((sum, inv) => 
      sum + (inv.quantity_available - inv.quantity_reserved - inv.quantity_committed), 0
    );

    const available = totalAvailable >= quantity;

    res.json({
      available,
      available_quantity: totalAvailable,
      requested_quantity: quantity,
      message: available ? 'Available' : `Only ${totalAvailable} available`
    });
  } catch (error) {
    console.error('Error checking inventory:', error);
    res.status(500).json({ error: 'Failed to check inventory availability' });
  }
};

// Reserve inventory for order
export const reserveInventory = async (productId: string, variantId: string, quantity: number, orderId: string) => {
  try {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq(variantId ? 'variant_id' : 'variant_id', variantId || null)
      .single();

    if (inventoryError) throw inventoryError;

    // Check if enough inventory is available
    const availableQuantity = inventory.quantity_available - inventory.quantity_reserved - inventory.quantity_committed;
    
    if (availableQuantity < quantity) {
      throw new Error(`Insufficient inventory. Available: ${availableQuantity}, Requested: ${quantity}`);
    }

    // Reserve the inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity_reserved: inventory.quantity_reserved + quantity 
      })
      .eq('id', inventory.id);

    if (updateError) throw updateError;

    // Create inventory movement record
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        inventory_id: inventory.id,
        type: 'reserve',
        quantity: -quantity,
        previous_quantity: inventory.quantity_available - inventory.quantity_reserved - inventory.quantity_committed,
        new_quantity: availableQuantity - quantity,
        reference_type: 'order',
        reference_id: orderId,
        reason: 'Order reservation'
      });

    if (movementError) throw movementError;

    return { success: true, reserved_quantity: quantity };
  } catch (error) {
    console.error('Error reserving inventory:', error);
    throw error;
  }
};

// Release reserved inventory
export const releaseReservedInventory = async (productId: string, variantId: string, quantity: number, orderId: string) => {
  try {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq(variantId ? 'variant_id' : 'variant_id', variantId || null)
      .single();

    if (inventoryError) throw inventoryError;

    // Release the reserved inventory
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity_reserved: Math.max(0, inventory.quantity_reserved - quantity)
      })
      .eq('id', inventory.id);

    if (updateError) throw updateError;

    // Create inventory movement record
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        inventory_id: inventory.id,
        type: 'release',
        quantity: quantity,
        previous_quantity: inventory.quantity_available - inventory.quantity_reserved - inventory.quantity_committed,
        new_quantity: inventory.quantity_available - inventory.quantity_reserved - inventory.quantity_committed + quantity,
        reference_type: 'order',
        reference_id: orderId,
        reason: 'Order cancellation/release'
      });

    if (movementError) throw movementError;

    return { success: true, released_quantity: quantity };
  } catch (error) {
    console.error('Error releasing inventory:', error);
    throw error;
  }
};

// Commit inventory (reduce available quantity)
export const commitInventory = async (productId: string, variantId: string, quantity: number, orderId: string) => {
  try {
    // Get current inventory
    const { data: inventory, error: inventoryError } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_id', productId)
      .eq(variantId ? 'variant_id' : 'variant_id', variantId || null)
      .single();

    if (inventoryError) throw inventoryError;

    // Commit the inventory (reduce available and reserved)
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ 
        quantity_available: inventory.quantity_available - quantity,
        quantity_reserved: Math.max(0, inventory.quantity_reserved - quantity),
        quantity_committed: inventory.quantity_committed + quantity
      })
      .eq('id', inventory.id);

    if (updateError) throw updateError;

    // Create inventory movement record
    const { error: movementError } = await supabase
      .from('inventory_movements')
      .insert({
        inventory_id: inventory.id,
        type: 'sale',
        quantity: -quantity,
        previous_quantity: inventory.quantity_available - inventory.quantity_reserved - inventory.quantity_committed,
        new_quantity: inventory.quantity_available - inventory.quantity_reserved - inventory.quantity_committed - quantity,
        reference_type: 'order',
        reference_id: orderId,
        reason: 'Order fulfillment'
      });

    if (movementError) throw movementError;

    return { success: true, committed_quantity: quantity };
  } catch (error) {
    console.error('Error committing inventory:', error);
    throw error;
  }
};

// Get categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    res.json({ categories: data });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get materials
export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { type, lowStock } = req.query;
    
    let query = supabase
      .from('materials')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (type) {
      query = query.eq('type', type);
    }

    if (lowStock === 'true') {
      query = query.lte('current_stock', supabase.raw('reorder_point'));
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ materials: data });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
};

// Create product review
export const createProductReview = async (req: Request, res: Response) => {
  try {
    const { productId, rating, title, content, images = [] } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Product ID and valid rating (1-5) are required' });
    }

    // Check if user has purchased this product
    const { data: existingOrder, error: orderError } = await supabase
      .from('order_items')
      .select('id, orders!inner(user_id, status)')
      .eq('product_id', productId)
      .eq('orders.user_id', userId)
      .eq('orders.status', 'delivered')
      .single();

    if (orderError || !existingOrder) {
      return res.status(400).json({ error: 'You must purchase this product to review it' });
    }

    // Check if user has already reviewed this product
    const { data: existingReview, error: reviewError } = await supabase
      .from('product_reviews')
      .select('id')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this product' });
    }

    // Create review
    const { data: review, error: createError } = await supabase
      .from('product_reviews')
      .insert({
        product_id: productId,
        user_id: userId,
        rating,
        title,
        content,
        images,
        is_verified_purchase: true,
        status: 'pending'
      })
      .select('*')
      .single();

    if (createError) throw createError;

    // Update product rating and review count
    await updateProductRating(productId);

    res.json({ review, message: 'Review submitted successfully and is pending approval' });
  } catch (error) {
    console.error('Error creating product review:', error);
    res.status(500).json({ error: 'Failed to create product review' });
  }
};

// Update product rating and review count
const updateProductRating = async (productId: string) => {
  try {
    // Get all approved reviews for this product
    const { data: reviews, error } = await supabase
      .from('product_reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('status', 'approved');

    if (error) throw error;

    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await supabase
        .from('products')
        .update({
          rating: Math.round(avgRating * 100) / 100,
          review_count: reviews.length
        })
        .eq('id', productId);
    }
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};