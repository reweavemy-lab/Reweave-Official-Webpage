-- Safe version: Only creates table if it doesn't exist, preserves existing data
-- Use this if you have existing orders data you want to keep

-- Create orders table only if it doesn't exist
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Contact Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Shipping Address
    shipping_address TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_state TEXT NOT NULL,
    shipping_postcode TEXT NOT NULL,
    shipping_country TEXT NOT NULL DEFAULT 'MY',
    delivery_instructions TEXT,
    
    -- Order Details
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
    shipping_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    promo_code TEXT,
    promo_discount DECIMAL(10, 2) DEFAULT 0,
    
    -- Order Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_total CHECK (total >= 0),
    CONSTRAINT valid_subtotal CHECK (subtotal >= 0)
);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);

-- Enable RLS (Row Level Security)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Grant permissions (idempotent)
DO $$
BEGIN
    GRANT SELECT, INSERT ON orders TO anon;
    GRANT SELECT, INSERT, UPDATE ON orders TO authenticated;
EXCEPTION WHEN OTHERS THEN
    -- Permissions already exist, ignore
    NULL;
END $$;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Allow anonymous order creation" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can manage orders" ON orders;

-- Policy: Allow anonymous users to insert orders (for guest checkout)
CREATE POLICY "Allow anonymous order creation" ON orders
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow users to view their own orders (by email)
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT
    TO anon
    USING (true); -- For now, allow viewing all orders. In production, restrict by email/auth

-- Policy: Allow authenticated users to manage orders
CREATE POLICY "Authenticated users can manage orders" ON orders
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Add comment to table
COMMENT ON TABLE orders IS 'Stores guest checkout orders and customer information for lead collection and order fulfillment';

