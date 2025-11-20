-- Create product_variants table for individual product variations
CREATE TABLE product_variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    variant_name TEXT NOT NULL,
    price TEXT NOT NULL,
    image TEXT NOT NULL,
    color TEXT NOT NULL,
    material TEXT,
    stock_quantity INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT SELECT ON product_variants TO anon;
GRANT SELECT ON product_variants TO authenticated;
GRANT INSERT, UPDATE, DELETE ON product_variants TO authenticated;

-- Create policy for public read access
CREATE POLICY "Public read access" ON product_variants
    FOR SELECT
    USING (is_active = true);

-- Create policy for authenticated users to manage variants
CREATE POLICY "Authenticated users can manage variants" ON product_variants
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert variants for existing products with individual pricing and images

-- Reweave Pickleball Tote variants
INSERT INTO product_variants (id, product_id, variant_name, price, image, color, material, stock_quantity) VALUES
('pickle-tote-plum', 'pickle-tote', 'Reweave Pickleball Tote - Deep Plum', 'RM 149.00', 'images/Batik Front (WIP).png', 'Deep Plum', 'Batik', 5),
('pickle-tote-indigo', 'pickle-tote', 'Reweave Pickleball Tote - Indigo', 'RM 159.00', 'images/Batik Front Indigo.png', 'Indigo', 'Batik', 3),
('pickle-tote-black', 'pickle-tote', 'Reweave Pickleball Tote - Matte Black', 'RM 169.00', 'images/Batik Front Black.png', 'Matte Black', 'Batik + Leather Trim', 2);

-- Heritage Batik Clutch variants
INSERT INTO product_variants (id, product_id, variant_name, price, image, color, material, stock_quantity) VALUES
('heritage-clutch-gold', 'heritage-clutch', 'Heritage Batik Clutch - Gold', 'RM 89.00', 'images/heritage-clutch-gold.png', 'Gold', 'Batik + Leather', 8),
('heritage-clutch-silver', 'heritage-clutch', 'Heritage Batik Clutch - Silver', 'RM 95.00', 'images/heritage-clutch-silver.png', 'Silver', 'Batik + Metallic Leather', 4),
('heritage-clutch-bronze', 'heritage-clutch', 'Heritage Batik Clutch - Bronze', 'RM 99.00', 'images/heritage-clutch-bronze.png', 'Bronze', 'Batik + Premium Leather', 6);

-- Artisan Leather Wallet variants
INSERT INTO product_variants (id, product_id, variant_name, price, image, color, material, stock_quantity) VALUES
('artisan-wallet-cognac', 'artisan-wallet', 'Artisan Leather Wallet - Cognac', 'RM 129.00', 'images/artisan-wallet-cognac.png', 'Cognac', 'Full-grain Leather', 10),
('artisan-wallet-black', 'artisan-wallet', 'Artisan Leather Wallet - Black', 'RM 135.00', 'images/artisan-wallet-black.png', 'Black', 'Full-grain Leather', 7),
('artisan-wallet-tan', 'artisan-wallet', 'Artisan Leather Wallet - Tan', 'RM 139.00', 'images/artisan-wallet-tan.png', 'Tan', 'Premium Full-grain Leather', 5);