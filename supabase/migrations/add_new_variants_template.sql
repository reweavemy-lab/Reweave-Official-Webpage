-- Template for Adding New Product Variants
-- Copy and modify this template to add new products

-- ==============================================
-- ADD NEW PRODUCT (if needed)
-- ==============================================
INSERT INTO products (id, title, price, image, colors, materials, description, category) VALUES
('new-product-handle', 'Your Product Name', 'RM 0.00', 'images/placeholder.jpg', ARRAY['Color1'], ARRAY['Material1'], 'Your product description', 'category-name');

-- ==============================================
-- ADD VARIANTS FOR YOUR PRODUCT
-- ==============================================

-- Example: Adding a new handbag with 3 color variants
INSERT INTO product_variants (id, product_id, variant_name, price, image, color, material, stock_quantity) VALUES
('your-handbag-black', 'new-product-handle', 'Your Handbag - Black', 'RM 189.00', 'images/handbag-black.jpg', 'Black', 'Premium Leather', 8),
('your-handbag-brown', 'new-product-handle', 'Your Handbag - Brown', 'RM 179.00', 'images/handbag-brown.jpg', 'Brown', 'Full-grain Leather', 6),
('your-handbag-tan', 'new-product-handle', 'Your Handbag - Tan', 'RM 199.00', 'images/handbag-tan.jpg', 'Tan', 'Italian Leather', 4);

-- Example: Adding a wallet with 2 variants
INSERT INTO product_variants (id, product_id, variant_name, price, image, color, material, stock_quantity) VALUES
('your-wallet-navy', 'new-product-handle', 'Your Wallet - Navy', 'RM 89.00', 'images/wallet-navy.jpg', 'Navy Blue', 'Canvas + Leather', 15),
('your-wallet-olive', 'new-product-handle', 'Your Wallet - Olive', 'RM 95.00', 'images/wallet-olive.jpg', 'Olive Green', 'Waxed Canvas', 12);

-- ==============================================
-- QUICK UPDATE COMMANDS
-- ==============================================

-- Change price of a variant
UPDATE product_variants SET price = 'RM 159.00' WHERE id = 'your-variant-id';

-- Change image of a variant
UPDATE product_variants SET image = 'images/new-image.jpg' WHERE id = 'your-variant-id';

-- Update stock quantity
UPDATE product_variants SET stock_quantity = 20 WHERE id = 'your-variant-id';

-- Disable a variant (hide from website)
UPDATE product_variants SET is_active = false WHERE id = 'your-variant-id';

-- Enable a variant (show on website)
UPDATE product_variants SET is_active = true WHERE id = 'your-variant-id';

-- ==============================================
-- CHECK YOUR DATA
-- ==============================================

-- See all your variants with current data
SELECT 
  v.id,
  p.title as product_name,
  v.variant_name,
  v.price,
  v.color,
  v.stock_quantity,
  v.is_active
FROM product_variants v
JOIN products p ON v.product_id = p.id
ORDER BY p.title, v.price;