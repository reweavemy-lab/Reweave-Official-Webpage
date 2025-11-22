# Orders Table Setup Guide

## Overview
A new Supabase table has been created to store customer orders and lead information. This allows you to:
- Collect customer contact information for lead generation
- Store complete order details for fulfillment
- Track order status and history
- Access customer data for marketing and support

## Database Migration

### File Location
`supabase/migrations/007_create_guest_orders.sql`

### Table Structure
The `orders` table includes:

**Contact Information:**
- `full_name` - Customer's full name
- `email` - Email address (with validation)
- `phone` - Phone number

**Shipping Address:**
- `shipping_address` - Street address
- `shipping_city` - City
- `shipping_state` - State/Province
- `shipping_postcode` - Postal code
- `shipping_country` - Country code (default: 'MY')
- `delivery_instructions` - Optional special instructions

**Order Details:**
- `items` - JSONB array of cart items
- `subtotal` - Order subtotal
- `shipping_cost` - Shipping cost
- `tax` - Tax amount
- `total` - Total order amount
- `promo_code` - Promo code used (if any)
- `promo_discount` - Discount amount

**Order Status:**
- `status` - Order status: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
- `created_at` - Order creation timestamp
- `updated_at` - Last update timestamp (auto-updated)

## How to Apply the Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project: https://mcp.supabase.com/mcp?project_ref=dkpaeiyixdwzjpvvszyy
2. Navigate to **SQL Editor**
3. Open the file `supabase/migrations/007_create_guest_orders.sql`
4. Copy the entire SQL content
5. Paste it into the SQL Editor
6. Click **Run** to execute the migration

### Option 2: Via Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push
```

## Security & Permissions

The table is configured with Row Level Security (RLS) enabled:

- **Anonymous users** can INSERT orders (for guest checkout)
- **Anonymous users** can SELECT orders (currently all orders - restrict in production)
- **Authenticated users** have full access (for admin/management)

### Production Recommendations:
1. Restrict SELECT policy to only allow users to view their own orders (by email)
2. Add authentication for admin access
3. Consider adding rate limiting for order creation
4. Add email validation and verification

## How It Works

### Order Flow:
1. Customer fills out checkout form on cart page
2. Form data is collected and validated
3. Order is saved to Supabase `orders` table
4. Order ID is returned and displayed to customer
5. Order is also saved to localStorage as backup

### Error Handling:
- If Supabase save fails, order is still saved to localStorage
- Customer is notified of the issue
- Order details remain accessible for manual processing

## Accessing Orders

### Via Supabase Dashboard:
1. Go to **Table Editor** → `orders`
2. View all orders with customer details
3. Filter by status, date, email, etc.
4. Export data as CSV/JSON

### Via SQL Query:
```sql
-- Get all pending orders
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;

-- Get orders by customer email
SELECT * FROM orders WHERE email = 'customer@example.com';

-- Get orders summary
SELECT 
  status,
  COUNT(*) as count,
  SUM(total) as total_revenue
FROM orders
GROUP BY status;
```

## Next Steps

1. **Apply the migration** using one of the methods above
2. **Test the checkout flow** by placing a test order
3. **Verify data** in Supabase dashboard
4. **Set up email notifications** (optional) to notify you of new orders
5. **Create admin dashboard** (optional) to manage orders
6. **Set up order status updates** (optional) to track fulfillment

## Code Changes Made

### Files Modified:
- `pages/cart/index.html` - Updated `handleCheckout()` function to save to Supabase
- `supabase/migrations/007_create_guest_orders.sql` - Created orders table schema

### Key Features:
- ✅ Automatic order saving to Supabase
- ✅ localStorage backup if Supabase fails
- ✅ Order ID generation and display
- ✅ Error handling and user feedback
- ✅ Global Supabase client initialization

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify Supabase connection in Supabase dashboard
3. Ensure migration was applied successfully
4. Check RLS policies are correctly configured

