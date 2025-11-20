-- Create popup events table
CREATE TABLE popup_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')) DEFAULT 'upcoming',
  organizer_name TEXT,
  organizer_contact TEXT,
  expected_attendees INTEGER DEFAULT 0,
  actual_attendees INTEGER DEFAULT 0,
  budget DECIMAL(10,2) DEFAULT 0,
  actual_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create popup orders table
CREATE TABLE popup_orders (
  id TEXT PRIMARY KEY,
  event_name TEXT NOT NULL,
  items JSONB NOT NULL,
  customer JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  qr_code TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create popup customers table
CREATE TABLE popup_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  instagram TEXT,
  first_event TEXT NOT NULL,
  last_event TEXT,
  total_purchases INTEGER DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  loyalty_points INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_vip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(phone)
);

-- Create popup QR payments table
CREATE TABLE popup_qr_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT REFERENCES popup_orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  qr_code TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  event_name TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'expired', 'failed')) DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create popup sales analytics table
CREATE TABLE popup_sales_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES popup_events(id),
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour <= 23),
  total_sales DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  unique_customers INTEGER DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  top_product TEXT,
  payment_methods JSONB DEFAULT '{}',
  customer_tags JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, date, hour)
);

-- Create popup inventory tracking table
CREATE TABLE popup_inventory_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES popup_events(id),
  product_id UUID REFERENCES products(id),
  variant_id UUID REFERENCES product_variants(id),
  initial_stock INTEGER NOT NULL,
  sold_quantity INTEGER DEFAULT 0,
  remaining_stock INTEGER NOT NULL,
  low_stock_alert INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_popup_orders_event ON popup_orders(event_name);
CREATE INDEX idx_popup_orders_created_at ON popup_orders(created_at);
CREATE INDEX idx_popup_orders_status ON popup_orders(status);
CREATE INDEX idx_popup_orders_payment_method ON popup_orders(payment_method);

CREATE INDEX idx_popup_customers_phone ON popup_customers(phone);
CREATE INDEX idx_popup_customers_name ON popup_customers(name);
CREATE INDEX idx_popup_customers_created_at ON popup_customers(created_at);
CREATE INDEX idx_popup_customers_is_vip ON popup_customers(is_vip);

CREATE INDEX idx_popup_qr_payments_order_id ON popup_qr_payments(order_id);
CREATE INDEX idx_popup_qr_payments_qr_code ON popup_qr_payments(qr_code);
CREATE INDEX idx_popup_qr_payments_status ON popup_qr_payments(status);
CREATE INDEX idx_popup_qr_payments_expires_at ON popup_qr_payments(expires_at);

CREATE INDEX idx_popup_events_status ON popup_events(status);
CREATE INDEX idx_popup_events_start_date ON popup_events(start_date);
CREATE INDEX idx_popup_events_created_by ON popup_events(created_by);

CREATE INDEX idx_popup_sales_analytics_event_date ON popup_sales_analytics(event_id, date);
CREATE INDEX idx_popup_inventory_tracking_event ON popup_inventory_tracking(event_id);

-- Create function to calculate popup event analytics
CREATE OR REPLACE FUNCTION calculate_popup_analytics(
  p_event_id UUID,
  p_date DATE,
  p_hour INTEGER
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO popup_sales_analytics (
    event_id,
    date,
    hour,
    total_sales,
    total_orders,
    unique_customers,
    avg_order_value,
    conversion_rate,
    top_product,
    payment_methods,
    customer_tags
  )
  SELECT 
    p_event_id,
    p_date,
    p_hour,
    COALESCE(SUM(total_amount), 0),
    COUNT(*),
    COUNT(DISTINCT (customer->>'phone')),
    CASE WHEN COUNT(*) > 0 THEN COALESCE(SUM(total_amount), 0) / COUNT(*) ELSE 0 END,
    0, -- Will be calculated separately
    (SELECT (items->0->>'productName')::TEXT FROM popup_orders 
     WHERE DATE(created_at) = p_date AND EXTRACT(HOUR FROM created_at) = p_hour
     ORDER BY total_amount DESC LIMIT 1),
    (SELECT json_object_agg(payment_method, json_build_object('amount', SUM(total_amount), 'count', COUNT(*)))
     FROM popup_orders 
     WHERE DATE(created_at) = p_date AND EXTRACT(HOUR FROM created_at) = p_hour
     GROUP BY payment_method),
    (SELECT json_object_agg(tag, count)
     FROM (SELECT unnest(tags) as tag, COUNT(*) as count
           FROM popup_customers pc
           JOIN popup_orders po ON pc.phone = po.customer->>'phone'
           WHERE DATE(po.created_at) = p_date AND EXTRACT(HOUR FROM po.created_at) = p_hour
           GROUP BY tag) as tag_counts)
  FROM popup_orders
  WHERE event_name = (SELECT name FROM popup_events WHERE id = p_event_id)
    AND DATE(created_at) = p_date
    AND EXTRACT(HOUR FROM created_at) = p_hour
    AND status = 'paid'
  ON CONFLICT (event_id, date, hour) DO UPDATE SET
    total_sales = EXCLUDED.total_sales,
    total_orders = EXCLUDED.total_orders,
    unique_customers = EXCLUDED.unique_customers,
    avg_order_value = EXCLUDED.avg_order_value,
    top_product = EXCLUDED.top_product,
    payment_methods = EXCLUDED.payment_methods,
    customer_tags = EXCLUDED.customer_tags,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update popup customer data
CREATE OR REPLACE FUNCTION update_popup_customer(
  p_phone TEXT,
  p_name TEXT,
  p_email TEXT DEFAULT NULL,
  p_instagram TEXT DEFAULT NULL,
  p_event_name TEXT DEFAULT NULL,
  p_total_spent DECIMAL(10,2) DEFAULT 0,
  p_tags TEXT[] DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO popup_customers (
    name,
    phone,
    email,
    instagram,
    first_event,
    last_event,
    total_purchases,
    total_spent,
    loyalty_points,
    tags
  )
  VALUES (
    p_name,
    p_phone,
    p_email,
    p_instagram,
    p_event_name,
    p_event_name,
    1,
    p_total_spent,
    FLOOR(p_total_spent), -- 1 point per RM spent
    p_tags
  )
  ON CONFLICT (phone) DO UPDATE SET
    name = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, popup_customers.email),
    instagram = COALESCE(EXCLUDED.instagram, popup_customers.instagram),
    last_event = EXCLUDED.last_event,
    total_purchases = popup_customers.total_purchases + 1,
    total_spent = popup_customers.total_spent + p_total_spent,
    loyalty_points = popup_customers.loyalty_points + FLOOR(p_total_spent),
    tags = array_cat(popup_customers.tags, p_tags),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_popup_events_updated_at BEFORE UPDATE ON popup_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_orders_updated_at BEFORE UPDATE ON popup_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_customers_updated_at BEFORE UPDATE ON popup_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_qr_payments_updated_at BEFORE UPDATE ON popup_qr_payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_sales_analytics_updated_at BEFORE UPDATE ON popup_sales_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_popup_inventory_tracking_updated_at BEFORE UPDATE ON popup_inventory_tracking
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();