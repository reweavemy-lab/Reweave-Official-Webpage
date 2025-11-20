-- Complete Database Schema for Reweave E-commerce System
-- This migration creates all tables for Users, Products, Orders, Marketing, and Impact tracking

-- =============================================================================
-- USER TABLES
-- =============================================================================

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_expires_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended', 'deleted')) DEFAULT 'active',
  role TEXT CHECK (role IN ('customer', 'admin', 'super_admin')) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User addresses
CREATE TABLE user_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('billing', 'shipping', 'both')) DEFAULT 'shipping',
  is_default BOOLEAN DEFAULT FALSE,
  recipient_name TEXT NOT NULL,
  phone TEXT,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Malaysia',
  coordinates POINT,
  delivery_instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency TEXT DEFAULT 'MYR',
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'Asia/Kuala_Lumpur',
  newsletter_opt_in BOOLEAN DEFAULT TRUE,
  sms_opt_in BOOLEAN DEFAULT FALSE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT TRUE,
  order_updates BOOLEAN DEFAULT TRUE,
  preferred_categories TEXT[],
  size_preferences JSONB DEFAULT '{}',
  color_preferences TEXT[],
  price_range_min DECIMAL(10,2),
  price_range_max DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User loyalty points
CREATE TABLE user_loyalty_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points_balance INTEGER NOT NULL DEFAULT 0,
  points_earned_lifetime INTEGER NOT NULL DEFAULT 0,
  points_redeemed_lifetime INTEGER NOT NULL DEFAULT 0,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')) DEFAULT 'bronze',
  tier_progress DECIMAL(5,2) DEFAULT 0,
  next_tier_points INTEGER,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Loyalty points transactions
CREATE TABLE loyalty_points_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type TEXT CHECK (type IN ('earned', 'redeemed', 'expired', 'adjusted', 'bonus')) NOT NULL,
  source TEXT CHECK (source IN ('purchase', 'referral', 'social_share', 'review', 'birthday', 'manual', 'expired', 'redemption')),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  description TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- PRODUCT TABLES
-- =============================================================================

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  sku TEXT UNIQUE,
  type TEXT CHECK (type IN ('physical', 'digital', 'service')) DEFAULT 'physical',
  status TEXT CHECK (status IN ('draft', 'active', 'inactive', 'archived')) DEFAULT 'draft',
  featured BOOLEAN DEFAULT FALSE,
  is_preorder BOOLEAN DEFAULT FALSE,
  preorder_end_date DATE,
  estimated_delivery_date DATE,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight DECIMAL(8,2),
  length DECIMAL(8,2),
  width DECIMAL(8,2),
  height DECIMAL(8,2),
  category_id UUID,
  brand_id UUID,
  collection_id UUID,
  tags TEXT[],
  images JSONB DEFAULT '[]',
  videos JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  inventory_policy TEXT CHECK (inventory_policy IN ('deny', 'continue')) DEFAULT 'deny',
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT FALSE,
  requires_shipping BOOLEAN DEFAULT TRUE,
  is_taxable BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  sales_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product variants
CREATE TABLE product_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  weight DECIMAL(8,2),
  barcode TEXT,
  image_url TEXT,
  position INTEGER DEFAULT 0,
  option1 TEXT,
  option2 TEXT,
  option3 TEXT,
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  allow_backorder BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory tracking
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  location_id UUID,
  quantity_available INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_incoming INTEGER NOT NULL DEFAULT 0,
  quantity_committed INTEGER NOT NULL DEFAULT 0,
  reorder_point INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  last_counted_at TIMESTAMP WITH TIME ZONE,
  last_adjusted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, variant_id, location_id)
);

-- Inventory movements
CREATE TABLE inventory_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('purchase', 'sale', 'return', 'adjustment', 'transfer', 'damage', 'loss')) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  reason TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materials (for raw materials tracking)
CREATE TABLE materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT UNIQUE,
  type TEXT CHECK (type IN ('fabric', 'thread', 'dye', 'hardware', 'packaging', 'other')) NOT NULL,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(10,2),
  supplier_id UUID,
  minimum_stock INTEGER DEFAULT 10,
  current_stock INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 20,
  reorder_quantity INTEGER DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preorder batches
CREATE TABLE preorder_batches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  batch_number TEXT UNIQUE,
  preorder_start_date DATE NOT NULL,
  preorder_end_date DATE NOT NULL,
  estimated_delivery_date DATE NOT NULL,
  minimum_order_quantity INTEGER DEFAULT 1,
  maximum_order_quantity INTEGER,
  price DECIMAL(10,2) NOT NULL,
  early_bird_price DECIMAL(10,2),
  early_bird_end_date DATE,
  total_slots INTEGER,
  reserved_slots INTEGER DEFAULT 0,
  sold_slots INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'active', 'closed', 'cancelled', 'delivered')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product categories
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product reviews
CREATE TABLE product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  content TEXT,
  images JSONB DEFAULT '[]',
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- =============================================================================
-- ORDER TABLES
-- =============================================================================

-- Shopping carts
CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  status TEXT CHECK (status IN ('active', 'abandoned', 'converted', 'expired')) DEFAULT 'active',
  total_items INTEGER DEFAULT 0,
  total_quantity INTEGER DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'MYR',
  expires_at TIMESTAMP WITH TIME ZONE,
  converted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart items
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id, variant_id)
);

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed')) DEFAULT 'pending',
  fulfillment_status TEXT CHECK (fulfillment_status IN ('unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned')) DEFAULT 'unfulfilled',
  payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'partially_paid', 'refunded', 'partially_refunded', 'failed', 'cancelled')) DEFAULT 'pending',
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'MYR',
  
  -- Customer info
  customer_email TEXT NOT NULL,
  customer_first_name TEXT,
  customer_last_name TEXT,
  customer_phone TEXT,
  
  -- Shipping address
  shipping_address JSONB,
  billing_address JSONB,
  
  -- Shipping
  shipping_method TEXT,
  shipping_carrier TEXT,
  tracking_number TEXT,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- Payment
  payment_method TEXT,
  payment_provider TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Preorder info
  is_preorder BOOLEAN DEFAULT FALSE,
  preorder_batch_id UUID REFERENCES preorder_batches(id),
  estimated_delivery_date DATE,
  
  -- Metadata
  notes TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  tags TEXT[],
  source TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  
  -- Timestamps
  confirmed_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  preorder_batch_id UUID REFERENCES preorder_batches(id) ON DELETE SET NULL,
  
  -- Item details
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Fulfillment
  fulfillment_status TEXT CHECK (fulfillment_status IN ('unfulfilled', 'fulfilled', 'returned')) DEFAULT 'unfulfilled',
  fulfilled_quantity INTEGER DEFAULT 0,
  returned_quantity INTEGER DEFAULT 0,
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL,
  payment_provider TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')) DEFAULT 'pending',
  reference_id TEXT,
  transaction_id TEXT,
  gateway_response JSONB,
  failure_reason TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Refunds
CREATE TABLE refunds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  refund_method TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'MYR',
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  reference_id TEXT,
  transaction_id TEXT,
  gateway_response JSONB,
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order status history
CREATE TABLE order_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  previous_status TEXT,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- MARKETING & TRACKING TABLES
-- =============================================================================

-- Discount codes
CREATE TABLE discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y')) NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  maximum_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  usage_limit_per_customer INTEGER DEFAULT 1,
  applicable_products JSONB DEFAULT '[]',
  excluded_products JSONB DEFAULT '[]',
  applicable_categories JSONB DEFAULT '[]',
  excluded_categories JSONB DEFAULT '[]',
  customer_eligibility TEXT CHECK (customer_eligibility IN ('all', 'specific', 'minimum_order')) DEFAULT 'all',
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Abandoned carts
CREATE TABLE abandoned_carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT,
  email TEXT,
  items_count INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  abandonment_reason TEXT,
  recovery_email_sent BOOLEAN DEFAULT FALSE,
  recovery_email_sent_at TIMESTAMP WITH TIME ZONE,
  recovered BOOLEAN DEFAULT FALSE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  recovered_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Restock notifications
CREATE TABLE restock_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, variant_id, email)
);

-- Referral codes
CREATE TABLE referral_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount')) DEFAULT 'percentage',
  discount_value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  referrer_reward_type TEXT CHECK (referrer_reward_type IN ('points', 'discount', 'cash')) DEFAULT 'points',
  referrer_reward_value DECIMAL(10,2) NOT NULL,
  referee_reward_type TEXT CHECK (referee_reward_type IN ('discount', 'free_shipping')) DEFAULT 'discount',
  referee_reward_value DECIMAL(10,2) NOT NULL,
  usage_limit INTEGER,
  referrer_usage_count INTEGER DEFAULT 0,
  referee_usage_count INTEGER DEFAULT 0,
  valid_until DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral tracking
CREATE TABLE referral_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referral_code_id UUID NOT NULL REFERENCES referral_codes(id) ON DELETE CASCADE,
  referrer_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referee_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
  referrer_reward_issued BOOLEAN DEFAULT FALSE,
  referee_reward_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referrer_user_id, referee_user_id)
);

-- Traffic sources
CREATE TABLE traffic_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('organic', 'paid', 'social', 'email', 'direct', 'referral', 'affiliate')) NOT NULL,
  source TEXT,
  medium TEXT,
  campaign TEXT,
  term TEXT,
  content TEXT,
  domain TEXT,
  path TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketing campaigns
CREATE TABLE marketing_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('email', 'social', 'paid_ads', 'content', 'influencer', 'event')) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  budget DECIMAL(10,2),
  actual_spend DECIMAL(10,2) DEFAULT 0,
  target_audience TEXT,
  goals JSONB DEFAULT '{}',
  metrics JSONB DEFAULT '{}',
  status TEXT CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed', 'cancelled')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- IMPACT TRACKING TABLES
-- =============================================================================

-- Impact metrics log
CREATE TABLE impact_metrics_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT CHECK (metric_type IN ('environmental', 'social', 'economic', 'cultural')) NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,2) NOT NULL,
  unit TEXT NOT NULL,
  measurement_date DATE NOT NULL,
  period_type TEXT CHECK (period_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')) DEFAULT 'monthly',
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  data_source TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artisan profiles
CREATE TABLE artisans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  bio TEXT,
  location TEXT,
  coordinates POINT,
  specialization TEXT[],
  years_experience INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  profile_image_url TEXT,
  gallery_images JSONB DEFAULT '[]',
  social_media JSONB DEFAULT '{}',
  impact_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Artisan products (linking artisans to products)
CREATE TABLE artisan_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artisan_id UUID NOT NULL REFERENCES artisans(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  contribution_type TEXT CHECK (contribution_type IN ('design', 'production', 'materials')) NOT NULL,
  contribution_percentage DECIMAL(5,2),
  earnings_percentage DECIMAL(5,2),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(artisan_id, product_id, contribution_type)
);

-- Sustainability metrics
CREATE TABLE sustainability_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  metric_type TEXT CHECK (metric_type IN ('carbon_footprint', 'water_usage', 'waste_reduction', 'energy_usage', 'material_sourcing')) NOT NULL,
  metric_value DECIMAL(12,2) NOT NULL,
  unit TEXT NOT NULL,
  baseline_value DECIMAL(12,2),
  reduction_percentage DECIMAL(5,2),
  measurement_method TEXT,
  certification TEXT,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cultural impact tracking
CREATE TABLE cultural_impact (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  cultural_element TEXT NOT NULL,
  tradition_preserved TEXT,
  artisan_community TEXT,
  region TEXT,
  cultural_significance TEXT,
  preservation_effort TEXT,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SYSTEM TABLES
-- =============================================================================

-- Wishlist
CREATE TABLE wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  notes TEXT,
  priority INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, variant_id)
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email templates
CREATE TABLE email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'sent', 'failed', 'bounced')) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounce_reason TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_is_default ON user_addresses(is_default);
CREATE INDEX idx_user_addresses_is_active ON user_addresses(is_active);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);

CREATE INDEX idx_user_loyalty_points_user_id ON user_loyalty_points(user_id);
CREATE INDEX idx_user_loyalty_points_tier ON user_loyalty_points(tier);
CREATE INDEX idx_user_loyalty_points_balance ON user_loyalty_points(points_balance);

CREATE INDEX idx_loyalty_points_transactions_user_id ON loyalty_points_transactions(user_id);
CREATE INDEX idx_loyalty_points_transactions_type ON loyalty_points_transactions(type);
CREATE INDEX idx_loyalty_points_transactions_created_at ON loyalty_points_transactions(created_at);

-- Product indexes
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_preorder ON products(is_preorder);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_tags ON products USING GIN(tags);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_is_active ON product_variants(is_active);

CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_variant_id ON inventory(variant_id);
CREATE INDEX idx_inventory_location_id ON inventory(location_id);

CREATE INDEX idx_inventory_movements_inventory_id ON inventory_movements(inventory_id);
CREATE INDEX idx_inventory_movements_type ON inventory_movements(type);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at);

CREATE INDEX idx_materials_name ON materials(name);
CREATE INDEX idx_materials_sku ON materials(sku);
CREATE INDEX idx_materials_type ON materials(type);
CREATE INDEX idx_materials_is_active ON materials(is_active);

CREATE INDEX idx_preorder_batches_product_id ON preorder_batches(product_id);
CREATE INDEX idx_preorder_batches_status ON preorder_batches(status);
CREATE INDEX idx_preorder_batches_start_date ON preorder_batches(start_date);

-- Order indexes
CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_status ON carts(status);
CREATE INDEX idx_carts_expires_at ON carts(expires_at);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_variant_id ON cart_items(variant_id);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_is_preorder ON orders(is_preorder);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_variant_id ON order_items(variant_id);
CREATE INDEX idx_order_items_preorder_batch_id ON order_items(preorder_batch_id);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_created_at ON payments(created_at);

CREATE INDEX idx_refunds_order_id ON refunds(order_id);
CREATE INDEX idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX idx_refunds_status ON refunds(status);

-- Marketing indexes
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_status ON discount_codes(is_active);
CREATE INDEX idx_discount_codes_start_date ON discount_codes(start_date);
CREATE INDEX idx_discount_codes_end_date ON discount_codes(end_date);

CREATE INDEX idx_abandoned_carts_cart_id ON abandoned_carts(cart_id);
CREATE INDEX idx_abandoned_carts_user_id ON abandoned_carts(user_id);
CREATE INDEX idx_abandoned_carts_recovery_email_sent ON abandoned_carts(recovery_email_sent);
CREATE INDEX idx_abandoned_carts_recovered ON abandoned_carts(recovered);

CREATE INDEX idx_restock_notifications_product_id ON restock_notifications(product_id);
CREATE INDEX idx_restock_notifications_variant_id ON restock_notifications(variant_id);
CREATE INDEX idx_restock_notifications_user_id ON restock_notifications(user_id);
CREATE INDEX idx_restock_notifications_notification_sent ON restock_notifications(notification_sent);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_is_active ON referral_codes(is_active);
CREATE INDEX idx_referral_codes_valid_until ON referral_codes(valid_until);

CREATE INDEX idx_referral_tracking_referral_code_id ON referral_tracking(referral_code_id);
CREATE INDEX idx_referral_tracking_referrer_user_id ON referral_tracking(referrer_user_id);
CREATE INDEX idx_referral_tracking_referee_user_id ON referral_tracking(referee_user_id);
CREATE INDEX idx_referral_tracking_status ON referral_tracking(status);

-- Impact indexes
CREATE INDEX idx_impact_metrics_log_metric_type ON impact_metrics_log(metric_type);
CREATE INDEX idx_impact_metrics_log_metric_name ON impact_metrics_log(metric_name);
CREATE INDEX idx_impact_metrics_log_measurement_date ON impact_metrics_log(measurement_date);
CREATE INDEX idx_impact_metrics_log_period_start ON impact_metrics_log(period_start);
CREATE INDEX idx_impact_metrics_log_period_end ON impact_metrics_log(period_end);
CREATE INDEX idx_impact_metrics_log_verification_status ON impact_metrics_log(verification_status);

CREATE INDEX idx_artisans_name ON artisans(name);
CREATE INDEX idx_artisans_location ON artisans(location);
CREATE INDEX idx_artisans_is_active ON artisans(is_active);

CREATE INDEX idx_artisan_products_artisan_id ON artisan_products(artisan_id);
CREATE INDEX idx_artisan_products_product_id ON artisan_products(product_id);
CREATE INDEX idx_artisan_products_is_primary ON artisan_products(is_primary);

CREATE INDEX idx_sustainability_metrics_product_id ON sustainability_metrics(product_id);
CREATE INDEX idx_sustainability_metrics_order_id ON sustainability_metrics(order_id);
CREATE INDEX idx_sustainability_metrics_metric_type ON sustainability_metrics(metric_type);

CREATE INDEX idx_cultural_impact_product_id ON cultural_impact(product_id);
CREATE INDEX idx_cultural_impact_order_id ON cultural_impact(order_id);

-- System indexes
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_product_id ON wishlist(product_id);
CREATE INDEX idx_wishlist_is_active ON wishlist(is_active);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON user_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_loyalty_points_updated_at BEFORE UPDATE ON user_loyalty_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preorder_batches_updated_at BEFORE UPDATE ON preorder_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at BEFORE UPDATE ON refunds
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_codes_updated_at BEFORE UPDATE ON referral_codes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referral_tracking_updated_at BEFORE UPDATE ON referral_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_impact_metrics_log_updated_at BEFORE UPDATE ON impact_metrics_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artisans_updated_at BEFORE UPDATE ON artisans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sustainability_metrics_updated_at BEFORE UPDATE ON sustainability_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cultural_impact_updated_at BEFORE UPDATE ON cultural_impact
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at BEFORE UPDATE ON wishlist
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =============================================================================

-- Function to generate unique order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for order numbers
CREATE SEQUENCE order_number_seq START 100000;

-- Function to calculate loyalty points
CREATE OR REPLACE FUNCTION calculate_loyalty_points(p_order_total DECIMAL, p_user_tier TEXT)
RETURNS INTEGER AS $$
BEGIN
  RETURN CASE 
    WHEN p_user_tier = 'bronze' THEN FLOOR(p_order_total * 1)
    WHEN p_user_tier = 'silver' THEN FLOOR(p_order_total * 1.2)
    WHEN p_user_tier = 'gold' THEN FLOOR(p_order_total * 1.5)
    WHEN p_user_tier = 'platinum' THEN FLOOR(p_order_total * 2)
    WHEN p_user_tier = 'diamond' THEN FLOOR(p_order_total * 2.5)
    ELSE FLOOR(p_order_total * 1)
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to check inventory availability
CREATE OR REPLACE FUNCTION check_inventory_availability(p_product_id UUID, p_variant_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INTEGER;
BEGIN
  SELECT (quantity_available - quantity_reserved - quantity_committed)
  INTO v_available
  FROM inventory
  WHERE product_id = p_product_id 
    AND (variant_id = p_variant_id OR (variant_id IS NULL AND p_variant_id IS NULL));
  
  RETURN COALESCE(v_available, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- Function to update product popularity
CREATE OR REPLACE FUNCTION update_product_popularity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products 
    SET sales_count = sales_count + 1,
        updated_at = NOW()
    WHERE id = NEW.product_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for product popularity
CREATE TRIGGER update_product_sales_count
    AFTER INSERT ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_product_popularity();