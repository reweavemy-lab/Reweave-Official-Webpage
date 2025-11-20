-- Create products table for luxury items
CREATE TABLE products (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    colors TEXT[] DEFAULT '{}',
    materials TEXT[] DEFAULT '{}',
    description TEXT,
    category TEXT DEFAULT 'accessories',
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON products TO anon;
GRANT SELECT ON products TO authenticated;
GRANT INSERT, UPDATE, DELETE ON products TO authenticated;

-- Create policy for public read access
CREATE POLICY "Public read access" ON products
    FOR SELECT
    USING (true);

-- Create policy for authenticated users to manage products
CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert sample luxury products
INSERT INTO products (id, title, price, image, colors, materials, description, category) VALUES
('pickle-tote', 'Reweave Pickleball Tote', 'RM 149.00', 'images/Batik Front (WIP).png', ARRAY['Deep Plum', 'Indigo', 'Matte Black'], ARRAY['Batik'], 'Handcrafted pickleball tote with traditional Batik patterns', 'bags'),
('heritage-clutch', 'Heritage Batik Clutch', 'RM 89.00', 'images/heritage-clutch.png', ARRAY['Gold', 'Silver', 'Bronze'], ARRAY['Batik', 'Leather'], 'Elegant clutch featuring traditional Batik artistry', 'accessories'),
('artisan-wallet', 'Artisan Leather Wallet', 'RM 129.00', 'images/artisan-wallet.png', ARRAY['Cognac', 'Black', 'Tan'], ARRAY['Full-grain Leather'], 'Premium leather wallet with hand-stitched details', 'accessories');