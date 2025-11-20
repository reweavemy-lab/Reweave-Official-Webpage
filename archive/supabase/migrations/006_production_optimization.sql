-- Production Database Optimization and Security
-- Run this after all other migrations for production deployment

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Addresses policies
CREATE POLICY "Users can manage own addresses" ON user_addresses
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX CONCURRENTLY idx_products_status_category ON products(status, category);
CREATE INDEX CONCURRENTLY idx_products_price_range ON products(price);
CREATE INDEX CONCURRENTLY idx_products_created_at ON products(created_at DESC);
CREATE INDEX CONCURRENTLY idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));

CREATE INDEX CONCURRENTLY idx_orders_user_status ON orders(user_id, status);
CREATE INDEX CONCURRENTLY idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX CONCURRENTLY idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY idx_orders_payment_status ON orders(payment_status);

CREATE INDEX CONCURRENTLY idx_inventory_product_location ON inventory(product_id, location_id);
CREATE INDEX CONCURRENTLY idx_inventory_status ON inventory(status);
CREATE INDEX CONCURRENTLY idx_inventory_low_stock ON inventory(quantity_available) WHERE quantity_available <= reorder_point;

CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_phone ON users(phone);
CREATE INDEX CONCURRENTLY idx_users_status ON users(status);

CREATE INDEX CONCURRENTLY idx_payments_order ON payments(order_id);
CREATE INDEX CONCURRENTLY idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY idx_payments_created_at ON payments(created_at DESC);

-- Create composite indexes for common queries
CREATE INDEX CONCURRENTLY idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY idx_products_category_price ON products(category, price);
CREATE INDEX CONCURRENTLY idx_inventory_product_variant ON inventory(product_id, variant_id);

-- Create indexes for foreign keys
CREATE INDEX CONCURRENTLY idx_order_items_order ON order_items(order_id);
CREATE INDEX CONCURRENTLY idx_order_items_product ON order_items(product_id);
CREATE INDEX CONCURRENTLY idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX CONCURRENTLY idx_cart_items_product ON cart_items(product_id);
CREATE INDEX CONCURRENTLY idx_product_variants_product ON product_variants(product_id);
CREATE INDEX CONCURRENTLY idx_inventory_movements_inventory ON inventory_movements(inventory_id);

-- Create indexes for analytics
CREATE INDEX CONCURRENTLY idx_analytics_events_date ON analytics_events(created_at DESC);
CREATE INDEX CONCURRENTLY idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX CONCURRENTLY idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX CONCURRENTLY idx_funnel_events_date ON funnel_events(created_at DESC);

-- Create indexes for popup sales
CREATE INDEX CONCURRENTLY idx_popup_orders_event ON popup_orders(event_id);
CREATE INDEX CONCURRENTLY idx_popup_orders_created ON popup_orders(created_at DESC);
CREATE INDEX CONCURRENTLY idx_popup_events_status ON popup_events(status);
CREATE INDEX CONCURRENTLY idx_popup_events_date ON popup_events(start_date, end_date);

-- Create indexes for loyalty program
CREATE INDEX CONCURRENTLY idx_loyalty_points_user ON loyalty_points_transactions(user_id);
CREATE INDEX CONCURRENTLY idx_loyalty_points_created ON loyalty_points_transactions(created_at DESC);

-- Create indexes for impact tracking
CREATE INDEX CONCURRENTLY idx_impact_metrics_date ON impact_metrics_log(created_at DESC);
CREATE INDEX CONCURRENTLY idx_impact_metrics_type ON impact_metrics_log(metric_type);

-- Create function for optimized product search
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  category_filter TEXT DEFAULT NULL,
  price_min NUMERIC DEFAULT NULL,
  price_max NUMERIC DEFAULT NULL,
  status_filter TEXT DEFAULT 'active',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  price NUMERIC,
  images JSONB,
  category TEXT,
  status TEXT,
  search_rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.images,
    p.category,
    p.status,
    ts_rank(
      to_tsvector('english', p.name || ' ' || p.description),
      plainto_tsquery('english', search_query)
    ) AS search_rank
  FROM products p
  WHERE 
    (search_query IS NULL OR 
     to_tsvector('english', p.name || ' ' || p.description) @@ 
     plainto_tsquery('english', search_query))
    AND (category_filter IS NULL OR p.category = category_filter)
    AND (price_min IS NULL OR p.price >= price_min)
    AND (price_max IS NULL OR p.price <= price_max)
    AND p.status = status_filter
  ORDER BY search_rank DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Create function for inventory availability check
CREATE OR REPLACE FUNCTION check_inventory_availability(
  product_id_param UUID,
  variant_id_param UUID DEFAULT NULL,
  quantity_requested INTEGER DEFAULT 1
)
RETURNS TABLE (
  available BOOLEAN,
  available_quantity INTEGER,
  reserved_quantity INTEGER,
  incoming_quantity INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN i.quantity_available - i.quantity_reserved >= quantity_requested THEN true
      ELSE false
    END AS available,
    i.quantity_available - i.quantity_reserved AS available_quantity,
    i.quantity_reserved,
    i.quantity_incoming
  FROM inventory i
  WHERE i.product_id = product_id_param
    AND (variant_id_param IS NULL OR i.variant_id = variant_id_param)
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Create function for customer lifetime value calculation
CREATE OR REPLACE FUNCTION calculate_customer_lifetime_value(
  customer_id_param UUID
)
RETURNS TABLE (
  total_spent NUMERIC,
  total_orders INTEGER,
  average_order_value NUMERIC,
  last_order_date TIMESTAMP WITH TIME ZONE,
  customer_tier TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    COUNT(o.id) AS total_orders,
    COALESCE(AVG(o.total_amount), 0) AS average_order_value,
    MAX(o.created_at) AS last_order_date,
    CASE 
      WHEN COALESCE(SUM(o.total_amount), 0) >= 5000 THEN 'diamond'
      WHEN COALESCE(SUM(o.total_amount), 0) >= 3000 THEN 'platinum'
      WHEN COALESCE(SUM(o.total_amount), 0) >= 1500 THEN 'gold'
      WHEN COALESCE(SUM(o.total_amount), 0) >= 500 THEN 'silver'
      ELSE 'bronze'
    END AS customer_tier
  FROM orders o
  WHERE o.user_id = customer_id_param
    AND o.status IN ('confirmed', 'shipped', 'delivered');
END;
$$ LANGUAGE plpgsql;

-- Create function for impact metrics calculation
CREATE OR REPLACE FUNCTION calculate_impact_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_type TEXT,
  total_value NUMERIC,
  period_start DATE,
  period_end DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    im.metric_type,
    SUM(im.metric_value) AS total_value,
    start_date AS period_start,
    end_date AS period_end
  FROM impact_metrics_log im
  WHERE im.created_at::date BETWEEN start_date AND end_date
  GROUP BY im.metric_type
  ORDER BY total_value DESC;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for product analytics
CREATE MATERIALIZED VIEW product_analytics_mv AS
SELECT 
  p.id,
  p.name,
  p.category,
  p.price,
  p.status,
  COALESCE(SUM(oi.quantity), 0) AS total_sold,
  COALESCE(SUM(oi.total_price), 0) AS total_revenue,
  COUNT(DISTINCT oi.order_id) AS order_count,
  AVG(r.rating) AS average_rating,
  COUNT(DISTINCT r.id) AS review_count,
  p.created_at
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id AND o.status IN ('confirmed', 'shipped', 'delivered')
LEFT JOIN product_reviews r ON p.id = r.product_id AND r.status = 'approved'
GROUP BY p.id, p.name, p.category, p.price, p.status, p.created_at;

-- Create index on materialized view
CREATE INDEX idx_product_analytics_category ON product_analytics_mv(category);
CREATE INDEX idx_product_analytics_status ON product_analytics_mv(status);
CREATE INDEX idx_product_analytics_revenue ON product_analytics_mv(total_revenue DESC);

-- Create refresh function for materialized view
CREATE OR REPLACE FUNCTION refresh_product_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY product_analytics_mv;
END;
$$ LANGUAGE plpgsql;

-- Schedule materialized view refresh
-- Run this in your scheduling system (cron, etc.)
-- SELECT refresh_product_analytics();

-- Create audit logging function
CREATE OR REPLACE FUNCTION audit_log_function()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, user_id, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), auth.uid(), now());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (table_name, operation, old_data, new_data, user_id, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid(), now());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (table_name, operation, new_data, user_id, created_at)
    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), auth.uid(), now());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create audit triggers for critical tables
CREATE TRIGGER audit_users_trigger
  AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_log_function();

CREATE TRIGGER audit_orders_trigger
  AFTER INSERT OR UPDATE OR DELETE ON orders
  FOR EACH ROW EXECUTE FUNCTION audit_log_function();

CREATE TRIGGER audit_payments_trigger
  AFTER INSERT OR UPDATE OR DELETE ON payments
  FOR EACH ROW EXECUTE FUNCTION audit_log_function();

CREATE TRIGGER audit_products_trigger
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION audit_log_function();

-- Create performance monitoring function
CREATE OR REPLACE FUNCTION monitor_slow_queries()
RETURNS TABLE (
  query TEXT,
  execution_time INTERVAL,
  calls BIGINT,
  total_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    mean_exec_time AS execution_time,
    calls,
    total_exec_time AS total_time
  FROM pg_stat_statements
  WHERE mean_exec_time > 1000  -- queries taking more than 1 second
  ORDER BY mean_exec_time DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data(
  retention_days INTEGER DEFAULT 90
)
RETURNS TABLE (
  table_name TEXT,
  deleted_count BIGINT
) AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  -- Clean up old analytics data
  DELETE FROM analytics_events 
  WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'analytics_events', deleted_count;

  -- Clean up old funnel events
  DELETE FROM funnel_events 
  WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'funnel_events', deleted_count;

  -- Clean up old audit logs
  DELETE FROM audit_logs 
  WHERE created_at < CURRENT_DATE - INTERVAL '1 day' * retention_days;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN QUERY SELECT 'audit_logs', deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT ON product_analytics_mv TO authenticated;
GRANT EXECUTE ON FUNCTION search_products TO authenticated;
GRANT EXECUTE ON FUNCTION check_inventory_availability TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_customer_lifetime_value TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_impact_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_product_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_data TO authenticated;

-- Create comment for documentation
COMMENT ON TABLE product_analytics_mv IS 'Materialized view for optimized product analytics queries';
COMMENT ON FUNCTION search_products IS 'Optimized full-text search for products with filtering';
COMMENT ON FUNCTION check_inventory_availability IS 'Check real-time inventory availability for products';
COMMENT ON FUNCTION calculate_customer_lifetime_value IS 'Calculate customer lifetime value metrics';
COMMENT ON FUNCTION calculate_impact_metrics IS 'Calculate sustainability and impact metrics';
COMMENT ON FUNCTION refresh_product_analytics IS 'Refresh the product analytics materialized view';
COMMENT ON FUNCTION cleanup_old_data IS 'Clean up old analytics and audit data based on retention policy';