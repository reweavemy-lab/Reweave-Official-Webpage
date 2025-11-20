import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { commitInventory, releaseReservedInventory } from './productController.js';

// Create order from cart
export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { 
      cartId, 
      shippingAddress, 
      billingAddress, 
      shippingMethod = 'standard',
      paymentMethod,
      notes,
      discountCode,
      preorderBatchId
    } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!cartId) {
      return res.status(400).json({ error: 'Cart ID is required' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Shipping address is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Payment method is required' });
    }

    // Get cart with items
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        *,
        cart_items (
          *,
          products (
            id,
            name,
            price,
            is_preorder,
            inventory_policy,
            preorder_batch_id
          ),
          product_variants (
            id,
            name,
            price,
            sku
          )
        )
      `)
      .eq('id', cartId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (cartError || !cart) {
      return res.status(404).json({ error: 'Cart not found or not accessible' });
    }

    if (!cart.cart_items || cart.cart_items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // Validate preorder batch if specified
    if (preorderBatchId) {
      const { data: batch, error: batchError } = await supabase
        .from('preorder_batches')
        .select('*')
        .eq('id', preorderBatchId)
        .eq('status', 'active')
        .single();

      if (batchError || !batch) {
        return res.status(400).json({ error: 'Invalid or inactive preorder batch' });
      }

      if (new Date() > new Date(batch.preorder_end_date)) {
        return res.status(400).json({ error: 'Preorder batch has ended' });
      }

      if (batch.reserved_slots + cart.cart_items.reduce((sum: number, item: any) => sum + item.quantity, 0) > batch.total_slots) {
        return res.status(400).json({ error: 'Preorder batch is full' });
      }
    }

    // Validate discount code if provided
    let discountAmount = 0;
    if (discountCode) {
      const discountResult = await validateDiscountCode(discountCode, userId, cart.subtotal);
      if (discountResult.error) {
        return res.status(400).json({ error: discountResult.error });
      }
      discountAmount = discountResult.discountAmount;
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate totals
    const subtotal = cart.subtotal;
    const taxAmount = calculateTax(subtotal - discountAmount);
    const shippingAmount = calculateShipping(shippingMethod, subtotal - discountAmount);
    const totalAmount = subtotal - discountAmount + taxAmount + shippingAmount;

    // Create order
    const orderData = {
      order_number: orderNumber,
      user_id: userId,
      status: 'pending',
      fulfillment_status: 'unfulfilled',
      payment_status: 'pending',
      subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      shipping_amount: shippingAmount,
      total_amount: totalAmount,
      currency: 'MYR',
      customer_email: shippingAddress.email,
      customer_first_name: shippingAddress.firstName,
      customer_last_name: shippingAddress.lastName,
      customer_phone: shippingAddress.phone,
      shipping_address: shippingAddress,
      billing_address: billingAddress || shippingAddress,
      shipping_method: shippingMethod,
      payment_method: paymentMethod.method,
      payment_provider: paymentMethod.provider,
      is_preorder: cart.cart_items.some((item: any) => item.products.is_preorder),
      preorder_batch_id: preorderBatchId,
      estimated_delivery_date: calculateEstimatedDelivery(cart.cart_items, shippingMethod),
      notes,
      source: 'website'
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('*')
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItems = cart.cart_items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      preorder_batch_id: item.products.is_preorder ? preorderBatchId : null,
      product_name: item.products.name,
      variant_name: item.product_variants?.name,
      sku: item.product_variants?.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
      discount_amount: 0,
      tax_amount: 0
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Commit inventory for non-preorder items
    for (const item of cart.cart_items) {
      if (!item.products.is_preorder) {
        try {
          await commitInventory(item.product_id, item.variant_id, item.quantity, order.id);
        } catch (error) {
          console.error('Error committing inventory:', error);
          // Rollback order if inventory commit fails
          await supabase.from('orders').delete().eq('id', order.id);
          return res.status(400).json({ error: 'Failed to commit inventory' });
        }
      }
    }

    // Update preorder batch if applicable
    if (preorderBatchId) {
      const totalQuantity = cart.cart_items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      await supabase
        .from('preorder_batches')
        .update({ 
          reserved_slots: supabase.raw('reserved_slots + ?', [totalQuantity])
        })
        .eq('id', preorderBatchId);
    }

    // Mark cart as converted
    await supabase
      .from('carts')
      .update({ 
        status: 'converted',
        converted_at: new Date().toISOString()
      })
      .eq('id', cartId);

    // Create initial order status history
    await createOrderStatusHistory(order.id, 'pending', null, 'Order created');

    // Apply discount code usage if provided
    if (discountCode) {
      await applyDiscountCodeUsage(discountCode, userId, order.id);
    }

    res.status(201).json({
      order: {
        ...order,
        items: orderItems
      },
      message: 'Order created successfully',
      next_step: 'payment'
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get user's orders
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { page = 1, limit = 10, status, search } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const offset = (Number(page) - 1) * Number(limit);

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, slug, images)
        )
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customer_email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    res.json({
      orders: data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get order details
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, slug, images),
          product_variants (name, sku)
        ),
        payments (*),
        refunds (*)
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { status, fulfillmentStatus, paymentStatus, notes } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get current order status
    const { data: currentOrder, error: currentError } = await supabase
      .from('orders')
      .select('status, fulfillment_status, payment_status')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (currentError || !currentOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updates: any = {};
    const previousStatus = currentOrder.status;

    if (status && status !== currentOrder.status) {
      updates.status = status;
      
      // Set status-specific timestamps
      if (status === 'confirmed') updates.confirmed_at = new Date().toISOString();
      if (status === 'shipped') updates.shipped_at = new Date().toISOString();
      if (status === 'delivered') updates.delivered_at = new Date().toISOString();
      if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
    }

    if (fulfillmentStatus && fulfillmentStatus !== currentOrder.fulfillment_status) {
      updates.fulfillment_status = fulfillmentStatus;
    }

    if (paymentStatus && paymentStatus !== currentOrder.payment_status) {
      updates.payment_status = paymentStatus;
      if (paymentStatus === 'paid') updates.paid_at = new Date().toISOString();
    }

    if (notes) {
      updates.notes = notes;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) throw error;

    // Create status history
    if (status && status !== previousStatus) {
      await createOrderStatusHistory(orderId, status, previousStatus, notes);
    }

    res.json({ order, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Check if order can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Order cannot be cancelled at this stage' });
    }

    // Release inventory for non-preorder items
    for (const item of order.order_items) {
      if (!order.is_preorder) {
        try {
          await releaseReservedInventory(item.product_id, item.variant_id, item.quantity, orderId);
        } catch (error) {
          console.error('Error releasing inventory:', error);
        }
      }
    }

    // Update order status
    const { data: cancelledOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        internal_notes: reason || 'Customer requested cancellation'
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Create status history
    await createOrderStatusHistory(orderId, 'cancelled', order.status, reason);

    // Process refund if payment was made
    if (order.payment_status === 'paid') {
      await processOrderRefund(orderId, order.total_amount, 'Order cancelled');
    }

    res.json({ 
      order: cancelledOrder, 
      message: 'Order cancelled successfully. Refund will be processed within 3-5 business days.' 
    });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
};

// Process order payment
export const processOrderPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { paymentMethod, paymentDetails } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (orderError || !order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Order is already paid' });
    }

    // Simulate payment processing (integrate with payment gateway)
    const paymentResult = await simulatePaymentProcessing(order, paymentMethod, paymentDetails);

    if (!paymentResult.success) {
      return res.status(400).json({ error: 'Payment processing failed' });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: orderId,
        payment_method: paymentMethod,
        payment_provider: paymentResult.provider,
        amount: order.total_amount,
        currency: order.currency,
        status: 'completed',
        reference_id: paymentResult.referenceId,
        transaction_id: paymentResult.transactionId,
        gateway_response: paymentResult.gatewayResponse,
        paid_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (paymentError) throw paymentError;

    // Update order payment status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        payment_provider: paymentResult.provider,
        payment_reference: paymentResult.referenceId,
        paid_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*')
      .single();

    if (updateError) throw updateError;

    // Update order status if it was pending
    if (order.status === 'pending') {
      const { error: statusError } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (statusError) throw statusError;
    }

    // Award loyalty points
    await awardLoyaltyPoints(userId, order.total_amount, orderId);

    res.json({
      payment,
      order: updatedOrder,
      message: 'Payment processed successfully'
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
};

// Helper functions

const generateOrderNumber = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('generate_order_number');
  if (error) throw error;
  return data;
};

const calculateTax = (subtotal: number): number => {
  // Malaysian SST (Sales and Service Tax) - 6%
  return Math.round(subtotal * 0.06 * 100) / 100;
};

const calculateShipping = (method: string, subtotal: number): number => {
  const shippingRates = {
    standard: 15,
    express: 25,
    overnight: 35
  };
  
  // Free shipping for orders over RM200
  if (subtotal >= 200) {
    return 0;
  }
  
  return shippingRates[method as keyof typeof shippingRates] || 15;
};

const calculateEstimatedDelivery = (items: any[], shippingMethod: string): string => {
  const hasPreorder = items.some(item => item.products.is_preorder);
  
  if (hasPreorder) {
    // For preorder items, use the latest estimated delivery date
    return new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(); // 45 days for preorder
  }
  
  const deliveryDays = {
    standard: 5,
    express: 2,
    overnight: 1
  };
  
  const days = deliveryDays[shippingMethod as keyof typeof deliveryDays] || 5;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};

const validateDiscountCode = async (code: string, userId: string, orderTotal: number) => {
  try {
    const { data: discountCode, error } = await supabase
      .from('discount_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !discountCode) {
      return { error: 'Invalid discount code' };
    }

    // Check date validity
    const now = new Date();
    if (discountCode.start_date && now < new Date(discountCode.start_date)) {
      return { error: 'Discount code not yet valid' };
    }

    if (discountCode.end_date && now > new Date(discountCode.end_date)) {
      return { error: 'Discount code has expired' };
    }

    // Check usage limit
    if (discountCode.usage_limit && discountCode.usage_count >= discountCode.usage_limit) {
      return { error: 'Discount code usage limit reached' };
    }

    // Check minimum order amount
    if (discountCode.minimum_order_amount && orderTotal < discountCode.minimum_order_amount) {
      return { error: `Minimum order amount of RM${discountCode.minimum_order_amount} required` };
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.type === 'percentage') {
      discountAmount = (orderTotal * discountCode.value) / 100;
    } else if (discountCode.type === 'fixed_amount') {
      discountAmount = discountCode.value;
    }

    // Apply maximum discount limit if set
    if (discountCode.maximum_discount_amount && discountAmount > discountCode.maximum_discount_amount) {
      discountAmount = discountCode.maximum_discount_amount;
    }

    return { discountAmount: Math.round(discountAmount * 100) / 100 };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return { error: 'Failed to validate discount code' };
  }
};

const applyDiscountCodeUsage = async (code: string, userId: string, orderId: string) => {
  try {
    // Update usage count
    await supabase
      .from('discount_codes')
      .update({ usage_count: supabase.raw('usage_count + 1') })
      .eq('code', code.toUpperCase());

    // Log usage
    await supabase
      .from('discount_code_usage')
      .insert({
        discount_code_id: code,
        user_id: userId,
        order_id: orderId,
        used_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error applying discount code usage:', error);
  }
};

const createOrderStatusHistory = async (orderId: string, status: string, previousStatus: string | null, notes?: string) => {
  try {
    await supabase
      .from('order_status_history')
      .insert({
        order_id: orderId,
        status,
        previous_status: previousStatus,
        notes
      });
  } catch (error) {
    console.error('Error creating order status history:', error);
  }
};

const simulatePaymentProcessing = async (order: any, paymentMethod: any, paymentDetails: any) => {
  // Simulate payment gateway integration
  // In production, this would integrate with actual payment providers
  
  return {
    success: true,
    provider: paymentMethod.provider || 'stripe',
    referenceId: `REF-${Date.now()}`,
    transactionId: `TXN-${Date.now()}`,
    gatewayResponse: {
      status: 'succeeded',
      amount: order.total_amount,
      currency: order.currency
    }
  };
};

const processOrderRefund = async (orderId: string, amount: number, reason: string) => {
  try {
    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'completed')
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment record not found');
    }

    // Create refund record
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        order_id: orderId,
        payment_id: payment.id,
        refund_method: payment.payment_method,
        amount: amount,
        currency: payment.currency,
        reason: reason,
        status: 'pending',
        reference_id: `REFUND-${Date.now()}`,
        transaction_id: `REFUND-TXN-${Date.now()}`
      })
      .select('*')
      .single();

    if (refundError) throw refundError;

    // Simulate refund processing
    setTimeout(async () => {
      await supabase
        .from('refunds')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', refund.id);
    }, 3000);

    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

const awardLoyaltyPoints = async (userId: string, orderTotal: number, orderId: string) => {
  try {
    // Get user's current tier
    const { data: userLoyalty, error: loyaltyError } = await supabase
      .from('user_loyalty_points')
      .select('tier, points_balance')
      .eq('user_id', userId)
      .single();

    if (loyaltyError || !userLoyalty) {
      throw new Error('User loyalty points not found');
    }

    // Calculate points based on tier
    const pointsEarned = calculateLoyaltyPoints(orderTotal, userLoyalty.tier);

    // Update user loyalty points
    await supabase
      .from('user_loyalty_points')
      .update({
        points_balance: userLoyalty.points_balance + pointsEarned,
        points_earned_lifetime: supabase.raw('points_earned_lifetime + ?', [pointsEarned]),
        last_activity_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Create loyalty transaction
    await supabase
      .from('loyalty_points_transactions')
      .insert({
        user_id: userId,
        points: pointsEarned,
        type: 'earned',
        source: 'purchase',
        order_id: orderId,
        description: `Purchase - Order ${orderId}`,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
      });

    return { pointsEarned };
  } catch (error) {
    console.error('Error awarding loyalty points:', error);
    throw error;
  }
};

const calculateLoyaltyPoints = (orderTotal: number, tier: string): number => {
  const basePoints = Math.floor(orderTotal);
  
  const tierMultipliers = {
    bronze: 1.0,
    silver: 1.2,
    gold: 1.5,
    platinum: 2.0,
    diamond: 2.5
  };

  const multiplier = tierMultipliers[tier as keyof typeof tierMultipliers] || 1.0;
  return Math.floor(basePoints * multiplier);
};