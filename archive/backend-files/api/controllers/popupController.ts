import { Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { v4 as uuidv4 } from 'uuid';

interface PopupOrderItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}

interface PopupCustomer {
  name: string;
  phone: string;
  instagram?: string;
  email?: string;
}

interface PopupOrderRequest {
  items: PopupOrderItem[];
  customer: PopupCustomer;
  eventName: string;
  paymentMethod: string;
  totalAmount: number;
}

interface QRPaymentRequest {
  amount: number;
  orderId: string;
  paymentMethod: string;
  customerName: string;
  eventName: string;
}

// Create popup order
export const createPopupOrder = async (req: Request, res: Response) => {
  try {
    const { items, customer, eventName, paymentMethod, totalAmount }: PopupOrderRequest = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone are required'
      });
    }

    if (!eventName) {
      return res.status(400).json({
        success: false,
        message: 'Event name is required'
      });
    }

    // Generate unique order ID
    const orderId = `POP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Check inventory for each item
    for (const item of items) {
      const { data: inventory, error: inventoryError } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', item.variantId)
        .single();

      if (inventoryError || !inventory) {
        return res.status(400).json({
          success: false,
          message: `Product variant ${item.variantName} not found`
        });
      }

      if (inventory.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.productName} - ${item.variantName}. Available: ${inventory.stock}, Requested: ${item.quantity}`
        });
      }
    }

    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('popup_orders')
      .insert([{
        id: orderId,
        items: items,
        customer: customer,
        event_name: eventName,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        created_by: (req as any).user?.id || 'popup-system'
      }])
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    // Deduct inventory
    for (const item of items) {
      const { error: inventoryError } = await supabase
        .from('product_variants')
        .update({
          stock: supabase.sql`stock - ${item.quantity}`,
          updated_at: new Date().toISOString()
        })
        .eq('id', item.variantId);

      if (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        // Continue with order creation even if inventory update fails
      }
    }

    // Tag customer as popup customer
    const { data: existingCustomer, error: customerError } = await supabase
      .from('popup_customers')
      .select('id')
      .eq('phone', customer.phone)
      .single();

    if (!existingCustomer) {
      await supabase.from('popup_customers').insert([{
        id: uuidv4(),
        name: customer.name,
        phone: customer.phone,
        instagram: customer.instagram,
        email: customer.email,
        first_event: eventName,
        total_purchases: 1,
        total_spent: totalAmount,
        tags: ['popup-customer', eventName.toLowerCase().replace(/\s+/g, '-')],
        created_at: new Date().toISOString()
      }]);
    } else {
      await supabase
        .from('popup_customers')
        .update({
          total_purchases: supabase.sql`total_purchases + 1`,
          total_spent: supabase.sql`total_spent + ${totalAmount}`,
          last_event: eventName,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCustomer.id);
    }

    // Generate QR payment code
    const qrCode = generateQRPaymentCode(orderId, totalAmount, paymentMethod);

    res.json({
      success: true,
      data: {
        order,
        qrCode,
        message: 'Popup order created successfully'
      }
    });

  } catch (error) {
    console.error('Error creating popup order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create popup order',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Generate QR payment code
export const generateQRPayment = async (req: Request, res: Response) => {
  try {
    const { amount, orderId, paymentMethod, customerName, eventName }: QRPaymentRequest = req.body;

    // Validate input
    if (!amount || !orderId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Amount, orderId, and paymentMethod are required'
      });
    }

    // Generate QR code based on payment method
    const qrCode = generateQRPaymentCode(orderId, amount, paymentMethod);

    // Store QR code in database
    const { data, error } = await supabase
      .from('popup_qr_payments')
      .insert([{
        id: uuidv4(),
        order_id: orderId,
        amount: amount,
        payment_method: paymentMethod,
        qr_code: qrCode,
        customer_name: customerName,
        event_name: eventName,
        status: 'pending',
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: {
        qrCode,
        expiresAt: data.expires_at,
        paymentUrl: `${process.env.FRONTEND_URL}/payment/qr/${qrCode}`,
        message: 'QR payment code generated successfully'
      }
    });

  } catch (error) {
    console.error('Error generating QR payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR payment code',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Verify QR payment
export const verifyQRPayment = async (req: Request, res: Response) => {
  try {
    const { qrCode } = req.params;

    const { data: payment, error } = await supabase
      .from('popup_qr_payments')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (error || !payment) {
      return res.status(404).json({
        success: false,
        message: 'QR payment code not found'
      });
    }

    // Check if expired
    if (new Date() > new Date(payment.expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'QR payment code has expired'
      });
    }

    // Mark as paid
    const { data: updatedPayment, error: updateError } = await supabase
      .from('popup_qr_payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', payment.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Update order status
    await supabase
      .from('popup_orders')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', payment.order_id);

    res.json({
      success: true,
      data: {
        payment: updatedPayment,
        message: 'Payment verified successfully'
      }
    });

  } catch (error) {
    console.error('Error verifying QR payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify QR payment',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get popup events
export const getPopupEvents = async (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0, status } = req.query;

    let query = supabase
      .from('popup_events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      data: data,
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: data?.length || 0
      }
    });

  } catch (error) {
    console.error('Error getting popup events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popup events',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get popup analytics
export const getPopupAnalytics = async (req: Request, res: Response) => {
  try {
    const { eventId, startDate, endDate } = req.query;

    // Build query conditions
    let query = supabase
      .from('popup_orders')
      .select('*')
      .eq('status', 'paid');

    if (eventId) {
      query = query.eq('event_name', eventId);
    }

    if (startDate && endDate) {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: orders, error } = await query;

    if (error) {
      throw error;
    }

    // Calculate analytics
    const totalSales = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
    const totalOrders = orders?.length || 0;
    const uniqueCustomers = new Set(orders?.map(order => order.customer.phone)).size || 0;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Get product performance
    const productPerformance: { [key: string]: { name: string; sales: number; revenue: number } } = {};
    
    orders?.forEach(order => {
      order.items.forEach((item: PopupOrderItem) => {
        const key = `${item.productId}-${item.variantId}`;
        if (!productPerformance[key]) {
          productPerformance[key] = {
            name: `${item.productName} - ${item.variantName}`,
            sales: 0,
            revenue: 0
          };
        }
        productPerformance[key].sales += item.quantity;
        productPerformance[key].revenue += item.price * item.quantity;
      });
    });

    // Get payment method breakdown
    const paymentMethods: { [key: string]: { amount: number; count: number } } = {};
    
    orders?.forEach(order => {
      if (!paymentMethods[order.payment_method]) {
        paymentMethods[order.payment_method] = { amount: 0, count: 0 };
      }
      paymentMethods[order.payment_method].amount += order.total_amount;
      paymentMethods[order.payment_method].count += 1;
    });

    res.json({
      success: true,
      data: {
        totalSales,
        totalOrders,
        uniqueCustomers,
        avgOrderValue,
        topProducts: Object.values(productPerformance).sort((a, b) => b.revenue - a.revenue).slice(0, 10),
        paymentMethods: Object.entries(paymentMethods).map(([method, data]) => ({
          method,
          amount: data.amount,
          count: data.count
        })),
        period: {
          startDate: startDate || 'all',
          endDate: endDate || 'all',
          eventId: eventId || 'all'
        }
      }
    });

  } catch (error) {
    console.error('Error getting popup analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get popup analytics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to generate QR payment code
function generateQRPaymentCode(orderId: string, amount: number, paymentMethod: string): string {
  const timestamp = Date.now();
  const methodCode = paymentMethod.toUpperCase().substr(0, 3);
  const randomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  return `PAY_${methodCode}_${orderId}_${amount}_${timestamp}_${randomCode}`;
}