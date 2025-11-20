import { Request, Response } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    images: string[];
    price: number;
  };
}

interface Cart {
  id: string;
  user_id?: string;
  session_id?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  created_at: string;
  updated_at: string;
}

// Get cart by session or user
export const getCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const userId = (req as any).user?.id;

    let query = supabase
      .from('carts')
      .select(`
        *,
        cart_items(
          *,
          products(
            id,
            name,
            images,
            price,
            category,
            status
          )
        )
      `)
      .eq('status', 'active');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return res.status(400).json({ error: 'Session ID or User ID required' });
    }

    const { data: cart, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No cart found, create new one
        return createNewCart(sessionId, userId, res);
      }
      throw error;
    }

    const cartWithTotals = calculateCartTotals(cart);
    res.json(cartWithTotals);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Create new cart
const createNewCart = async (sessionId: string, userId?: string, res?: Response) => {
  try {
    const cartData: any = {
      status: 'active',
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0
    };

    if (userId) {
      cartData.user_id = userId;
    } else {
      cartData.session_id = sessionId;
    }

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert(cartData)
      .select(`
        *,
        cart_items(
          *,
          products(
            id,
            name,
            images,
            price,
            category,
            status
          )
        )
      `)
      .single();

    if (error) throw error;

    return res!.json(newCart);
  } catch (error) {
    console.error('Error creating cart:', error);
    return res!.status(500).json({ error: 'Failed to create cart' });
  }
};

// Add item to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const sessionId = req.headers['x-session-id'] as string;
    const userId = (req as any).user?.id;
    const { productId, variantId, quantity } = req.body;

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }

    // Check inventory availability
    const inventoryCheck = await checkInventoryAvailability(productId, variantId, quantity);
    if (!inventoryCheck.available) {
      return res.status(400).json({ 
        error: 'Insufficient inventory',
        available_quantity: inventoryCheck.available_quantity
      });
    }

    // Get or create cart
    let cart = await getOrCreateCart(sessionId, userId);
    if (!cart) {
      cart = await createCart(sessionId, userId);
    }

    // Check if item already exists in cart
    const existingItem = cart.cart_items?.find((item: any) => 
      item.product_id === productId && item.variant_id === variantId
    );

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      // Check inventory again for new total
      const inventoryCheckUpdate = await checkInventoryAvailability(productId, variantId, newQuantity);
      if (!inventoryCheckUpdate.available) {
        return res.status(400).json({ 
          error: 'Insufficient inventory for requested quantity',
          available_quantity: inventoryCheckUpdate.available_quantity
        });
      }

      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existingItem.id);

      if (updateError) throw updateError;
    } else {
      // Add new item
      const { data: product } = await supabase
        .from('products')
        .select('price, name, images')
        .eq('id', productId)
        .single();

      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id: productId,
          variant_id: variantId,
          quantity,
          price: product.price
        });

      if (insertError) throw insertError;
    }

    // Update cart totals
    const updatedCart = await updateCartTotals(cart.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = [requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid quantity' });
    }

    // Get cart item
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select(`
        *,
        carts!inner(user_id)
      `)
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Verify ownership
    if (item.carts.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check inventory
    const inventoryCheck = await checkInventoryAvailability(item.product_id, item.variant_id, quantity);
    if (!inventoryCheck.available) {
      return res.status(400).json({ 
        error: 'Insufficient inventory',
        available_quantity: inventoryCheck.available_quantity
      });
    }

    // Update quantity
    const { error: updateError } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (updateError) throw updateError;

    // Update cart totals
    const updatedCart = await updateCartTotals(item.cart_id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
}];

// Remove item from cart
export const removeCartItem = [requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { itemId } = req.params;

    // Get cart item
    const { data: item, error: itemError } = await supabase
      .from('cart_items')
      .select(`
        *,
        carts!inner(user_id)
      `)
      .eq('id', itemId)
      .single();

    if (itemError || !item) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    // Verify ownership
    if (item.carts.user_id !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Remove item
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) throw deleteError;

    // Update cart totals
    const updatedCart = await updateCartTotals(item.cart_id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ error: 'Failed to remove cart item' });
  }
}];

// Clear cart
export const clearCart = [requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user's cart
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (cartError || !cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Remove all items
    const { error: deleteError } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);

    if (deleteError) throw deleteError;

    // Reset cart totals
    const { data: updatedCart, error: updateError } = await supabase
      .from('carts')
      .update({
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', cart.id)
      .select(`
        *,
        cart_items(
          *,
          products(
            id,
            name,
            images,
            price,
            category,
            status
          )
        )
      `)
      .single();

    if (updateError) throw updateError;

    res.json(updatedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
}];

// Create order from cart
export const createOrderFromCart = [requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { shippingAddress, billingAddress, paymentMethod, notes } = req.body;

    // Get cart with items
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items(
          *,
          products(
            id,
            name,
            images,
            price,
            category,
            status
          )
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (cartError || !cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    if (!cart.cart_items || cart.cart_items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate inventory
    for (const item of cart.cart_items) {
      const inventoryCheck = await checkInventoryAvailability(
        item.product_id,
        item.variant_id,
        item.quantity
      );
      
      if (!inventoryCheck.available) {
        return res.status(400).json({
          error: `Insufficient inventory for ${item.products.name}`,
          product_id: item.product_id,
          available_quantity: inventoryCheck.available_quantity
        });
      }
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        subtotal: cart.subtotal,
        tax: cart.tax,
        shipping: cart.shipping,
        total: cart.total,
        status: 'pending',
        payment_status: 'pending',
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: paymentMethod,
        notes
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cart.cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      total_price: item.price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update inventory
    for (const item of cart.cart_items) {
      const { error: inventoryError } = await supabase
        .from('inventory')
        .update({
          quantity_reserved: supabase.sql`quantity_reserved + ${item.quantity}`,
          updated_at: new Date().toISOString()
        })
        .eq('product_id', item.product_id)
        .eq('variant_id', item.variant_id || null);

      if (inventoryError) throw inventoryError;
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    await supabase.from('carts').update({ status: 'completed' }).eq('id', cart.id);

    res.json({
      order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Error creating order from cart:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
}];

// Helper functions
async function getOrCreateCart(sessionId: string, userId?: string): Promise<any> {
  let query = supabase
    .from('carts')
    .select(`
      *,
      cart_items(
        *,
        products(
          id,
          name,
          images,
          price,
          category,
          status
        )
      )
    `)
    .eq('status', 'active');

  if (userId) {
    query = query.eq('user_id', userId);
  } else {
    query = query.eq('session_id', sessionId);
  }

  const { data: cart, error } = await query.single();

  if (error && error.code === 'PGRST116') {
    return null; // No cart found
  }

  if (error) throw error;
  return cart;
}

async function createCart(sessionId: string, userId?: string): Promise<any> {
  const cartData: any = {
    status: 'active',
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  };

  if (userId) {
    cartData.user_id = userId;
  } else {
    cartData.session_id = sessionId;
  }

  const { data: cart, error } = await supabase
    .from('carts')
    .insert(cartData)
    .select(`
      *,
      cart_items(
        *,
        products(
          id,
          name,
          images,
          price,
          category,
          status
        )
      )
    `)
    .single();

  if (error) throw error;
  return cart;
}

async function updateCartTotals(cartId: string): Promise<any> {
  // Calculate totals
  const { data: cartItems, error: itemsError } = await supabase
    .from('cart_items')
    .select(`
      *,
      products!inner(price)
    `)
    .eq('cart_id', cartId);

  if (itemsError) throw itemsError;

  const subtotal = cartItems.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  );

  const tax = subtotal * 0.06; // 6% tax
  const shipping = subtotal > 200 ? 0 : 15; // Free shipping over RM200
  const total = subtotal + tax + shipping;

  // Update cart
  const { data: updatedCart, error: updateError } = await supabase
    .from('carts')
    .update({
      subtotal,
      tax,
      shipping,
      total,
      updated_at: new Date().toISOString()
    })
    .eq('id', cartId)
    .select(`
      *,
      cart_items(
        *,
        products(
          id,
          name,
          images,
          price,
          category,
          status
        )
      )
    `)
    .single();

  if (updateError) throw updateError;
  return updatedCart;
}

function calculateCartTotals(cart: any): Cart {
  const subtotal = cart.cart_items?.reduce((sum: number, item: any) => 
    sum + (item.price * item.quantity), 0
  ) || 0;

  const tax = subtotal * 0.06; // 6% tax
  const shipping = subtotal > 200 ? 0 : 15; // Free shipping over RM200
  const total = subtotal + tax + shipping;

  return {
    ...cart,
    subtotal,
    tax,
    shipping,
    total
  };
}

async function generateOrderNumber(): Promise<string> {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `RW${timestamp}${random}`;
}

export const mergeGuestCartWithUser = async (guestSessionId: string, userId: string) => {
  try {
    // Get guest cart
    const { data: guestCart, error: guestError } = await supabase
      .from('carts')
      .select(`*, cart_items(*)`)
      .eq('session_id', guestSessionId)
      .eq('status', 'active')
      .single();

    if (guestError || !guestCart || !guestCart.cart_items?.length) {
      return; // No guest cart to merge
    }

    // Get user cart
    const { data: userCart, error: userError } = await supabase
      .from('carts')
      .select(`*, cart_items(*)`)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (userError) {
      // No user cart exists, convert guest cart to user cart
      await supabase
        .from('carts')
        .update({ user_id: userId, session_id: null })
        .eq('id', guestCart.id);
      return;
    }

    // Merge items
    for (const guestItem of guestCart.cart_items) {
      const existingItem = userCart.cart_items?.find(
        (item: any) => item.product_id === guestItem.product_id && item.variant_id === guestItem.variant_id
      );

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + guestItem.quantity;
        await supabase
          .from('cart_items')
          .update({ quantity: newQuantity })
          .eq('id', existingItem.id);
      } else {
        // Move item to user cart
        await supabase
          .from('cart_items')
          .update({ cart_id: userCart.id })
          .eq('id', guestItem.id);
      }
    }

    // Delete guest cart
    await supabase.from('carts').delete().eq('id', guestCart.id);

    // Update user cart totals
    await updateCartTotals(userCart.id);
  } catch (error) {
    console.error('Error merging guest cart:', error);
    // Don't throw error as this is a background operation
  }
};

export const getCartByUserId = async (userId: string) => {
  const { data: cart, error } = await supabase
    .from('carts')
    .select(`
      *,
      cart_items(
        *,
        products(
          id,
          name,
          images,
          price,
          category,
          status
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No cart found
    }
    throw error;
  }

  return calculateCartTotals(cart);
};

export const getCartTotals = async (cartId: string) => {
  const cart = await updateCartTotals(cartId);
  return {
    subtotal: cart.subtotal,
    tax: cart.tax,
    shipping: cart.shipping,
    total: cart.total
  };
};


export const validateCartItems = async (cartId: string) => {
  const { data: cartItems, error } = await supabase
    .from('cart_items')
    .select('*')
    .eq('cart_id', cartId);

  if (error) throw error;

  const validationResults = await Promise.all(
    cartItems.map(async (item) => {
      const inventoryCheck = await checkInventoryAvailability(
        item.product_id,
        item.variant_id,
        item.quantity
      );
      
      return {
        item_id: item.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        available: inventoryCheck.available,
        available_quantity: inventoryCheck.available_quantity
      };
    })
  );

  return validationResults;
};

const checkInventoryAvailability = async (productId: string, variantId: string | null, quantity: number) => {
  try {
    let query = supabase
      .from('inventory')
      .select('quantity_available, quantity_reserved, quantity_committed')
      .eq('product_id', productId);

    if (variantId) {
      query = query.eq('variant_id', variantId);
    }

    const { data: inventory, error } = await query;

    if (error) throw error;

    const totalAvailable = inventory.reduce((sum, inv) => 
      sum + (inv.quantity_available - inv.quantity_reserved - inv.quantity_committed), 0
    );

    return {
      available: totalAvailable >= quantity,
      available_quantity: totalAvailable
    };
  } catch (error) {
    console.error('Error checking inventory:', error);
    return { available: false, available_quantity: 0 };
  }
};