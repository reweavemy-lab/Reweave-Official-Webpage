-- SQL Commands to Update Your Product Data
-- Run these in Supabase SQL Editor to fix inaccurate data

-- ==============================================
-- STEP 1: See Current Data (Run this first)
-- ==============================================

-- View all product variants
SELECT * FROM product_variants ORDER BY product_id, price;

-- View main products
SELECT * FROM products ORDER BY id;

-- ==============================================
-- STEP 2: Update Images to Your Actual Images
-- ==============================================

-- Update Pickleball Tote images (replace with your actual image paths)
UPDATE product_variants 
SET image = 'images/pickle-tote-deep-plum.jpg' 
WHERE id = 'pickle-tote-plum';

UPDATE product_variants 
SET image = 'images/pickle-tote-indigo.jpg' 
WHERE id = 'pickle-tote-indigo';

UPDATE product_variants 
SET image = 'images/pickle-tote-black.jpg' 
WHERE id = 'pickle-tote-black';

-- Update Heritage Clutch images
UPDATE product_variants 
SET image = 'images/heritage-clutch-gold.jpg' 
WHERE id = 'heritage-clutch-gold';

UPDATE product_variants 
SET image = 'images/heritage-clutch-silver.jpg' 
WHERE id = 'heritage-clutch-silver';

UPDATE product_variants 
SET image = 'images/heritage-clutch-bronze.jpg' 
WHERE id = 'heritage-clutch-bronze';

-- Update Artisan Wallet images
UPDATE product_variants 
SET image = 'images/artisan-wallet-cognac.jpg' 
WHERE id = 'artisan-wallet-cognac';

UPDATE product_variants 
SET image = 'images/artisan-wallet-black.jpg' 
WHERE id = 'artisan-wallet-black';

UPDATE product_variants 
SET image = 'images/artisan-wallet-tan.jpg' 
WHERE id = 'artisan-wallet-tan';

-- ==============================================
-- STEP 3: Update Prices to Your Actual Prices
-- ==============================================

-- Update Pickleball Tote prices
UPDATE product_variants 
SET price = 'RM 149.00' 
WHERE id = 'pickle-tote-plum';

UPDATE product_variants 
SET price = 'RM 159.00' 
WHERE id = 'pickle-tote-indigo';

UPDATE product_variants 
SET price = 'RM 169.00' 
WHERE id = 'pickle-tote-black';

-- Update Heritage Clutch prices
UPDATE product_variants 
SET price = 'RM 89.00' 
WHERE id = 'heritage-clutch-gold';

UPDATE product_variants 
SET price = 'RM 95.00' 
WHERE id = 'heritage-clutch-silver';

UPDATE product_variants 
SET price = 'RM 99.00' 
WHERE id = 'heritage-clutch-bronze';

-- Update Artisan Wallet prices
UPDATE product_variants 
SET price = 'RM 129.00' 
WHERE id = 'artisan-wallet-cognac';

UPDATE product_variants 
SET price = 'RM 135.00' 
WHERE id = 'artisan-wallet-black';

UPDATE product_variants 
SET price = 'RM 139.00' 
WHERE id = 'artisan-wallet-tan';

-- ==============================================
-- STEP 4: Update Stock Quantities
-- ==============================================

UPDATE product_variants SET stock_quantity = 10 WHERE id = 'pickle-tote-plum';
UPDATE product_variants SET stock_quantity = 5 WHERE id = 'pickle-tote-indigo';
UPDATE product_variants SET stock_quantity = 3 WHERE id = 'pickle-tote-black';

UPDATE product_variants SET stock_quantity = 8 WHERE id = 'heritage-clutch-gold';
UPDATE product_variants SET stock_quantity = 4 WHERE id = 'heritage-clutch-silver';
UPDATE product_variants SET stock_quantity = 6 WHERE id = 'heritage-clutch-bronze';

UPDATE product_variants SET stock_quantity = 12 WHERE id = 'artisan-wallet-cognac';
UPDATE product_variants SET stock_quantity = 7 WHERE id = 'artisan-wallet-black';
UPDATE product_variants SET stock_quantity = 9 WHERE id = 'artisan-wallet-tan';