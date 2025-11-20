-- Create analytics events table for funnel tracking
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view', 'product_view', 'add_to_cart', 'checkout_started', 'purchase_completed', 'checkout_abandoned')),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  source TEXT DEFAULT 'direct',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  revenue DECIMAL(10,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily funnel metrics table for aggregated data
CREATE TABLE daily_funnel_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  visitors INTEGER DEFAULT 0,
  product_views INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  checkout_started INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  repeat_purchases INTEGER DEFAULT 0,
  checkout_abandoned INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product journey analytics table
CREATE TABLE product_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  avg_time_to_purchase DECIMAL(5,2) DEFAULT 0,
  drop_off_stage TEXT DEFAULT 'Unknown',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, date)
);

-- Create traffic source analytics table
CREATE TABLE traffic_source_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  source TEXT NOT NULL,
  date DATE NOT NULL,
  visitors INTEGER DEFAULT 0,
  product_views INTEGER DEFAULT 0,
  add_to_cart INTEGER DEFAULT 0,
  checkout_started INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  repeat_purchases INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_order_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source, date)
);

-- Create customer journey sessions table
CREATE TABLE customer_journey_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  first_event_type TEXT,
  last_event_type TEXT,
  total_events INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  converted BOOLEAN DEFAULT FALSE,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_source ON analytics_events(source);
CREATE INDEX idx_analytics_events_product_id ON analytics_events(product_id);

CREATE INDEX idx_daily_funnel_metrics_date ON daily_funnel_metrics(date);
CREATE INDEX idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX idx_product_analytics_date ON product_analytics(date);
CREATE INDEX idx_traffic_source_analytics_source ON traffic_source_analytics(source);
CREATE INDEX idx_traffic_source_analytics_date ON traffic_source_analytics(date);
CREATE INDEX idx_customer_journey_sessions_user_id ON customer_journey_sessions(user_id);
CREATE INDEX idx_customer_journey_sessions_session_id ON customer_journey_sessions(session_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_analytics_events_updated_at BEFORE UPDATE ON analytics_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_funnel_metrics_updated_at BEFORE UPDATE ON daily_funnel_metrics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_analytics_updated_at BEFORE UPDATE ON product_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traffic_source_analytics_updated_at BEFORE UPDATE ON traffic_source_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_journey_sessions_updated_at BEFORE UPDATE ON customer_journey_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to calculate daily funnel metrics
CREATE OR REPLACE FUNCTION calculate_daily_funnel_metrics(target_date DATE)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_funnel_metrics (
        date,
        visitors,
        product_views,
        add_to_cart,
        checkout_started,
        purchases,
        repeat_purchases,
        checkout_abandoned,
        total_revenue,
        avg_order_value,
        conversion_rate
    )
    SELECT 
        target_date,
        COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'page_view') as visitors,
        COUNT(*) FILTER (WHERE event_type = 'product_view') as product_views,
        COUNT(*) FILTER (WHERE event_type = 'add_to_cart') as add_to_cart,
        COUNT(*) FILTER (WHERE event_type = 'checkout_started') as checkout_started,
        COUNT(*) FILTER (WHERE event_type = 'purchase_completed') as purchases,
        COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'purchase_completed' AND user_id IN (
            SELECT user_id FROM analytics_events 
            WHERE event_type = 'purchase_completed' 
            AND created_at < target_date
        )) as repeat_purchases,
        COUNT(*) FILTER (WHERE event_type = 'checkout_abandoned') as checkout_abandoned,
        COALESCE(SUM(revenue) FILTER (WHERE event_type = 'purchase_completed'), 0) as total_revenue,
        CASE 
            WHEN COUNT(*) FILTER (WHERE event_type = 'purchase_completed') > 0 
            THEN COALESCE(SUM(revenue) FILTER (WHERE event_type = 'purchase_completed'), 0) / COUNT(*) FILTER (WHERE event_type = 'purchase_completed')
            ELSE 0 
        END as avg_order_value,
        CASE 
            WHEN COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'page_view') > 0 
            THEN (COUNT(*) FILTER (WHERE event_type = 'purchase_completed') * 100.0) / COUNT(DISTINCT user_id) FILTER (WHERE event_type = 'page_view')
            ELSE 0 
        END as conversion_rate
    FROM analytics_events
    WHERE DATE(created_at) = target_date
    ON CONFLICT (date) DO UPDATE SET
        visitors = EXCLUDED.visitors,
        product_views = EXCLUDED.product_views,
        add_to_cart = EXCLUDED.add_to_cart,
        checkout_started = EXCLUDED.checkout_started,
        purchases = EXCLUDED.purchases,
        repeat_purchases = EXCLUDED.repeat_purchases,
        checkout_abandoned = EXCLUDED.checkout_abandoned,
        total_revenue = EXCLUDED.total_revenue,
        avg_order_value = EXCLUDED.avg_order_value,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to track funnel event
CREATE OR REPLACE FUNCTION track_funnel_event(
    p_user_id UUID,
    p_event_type TEXT,
    p_product_id UUID DEFAULT NULL,
    p_order_id UUID DEFAULT NULL,
    p_source TEXT DEFAULT 'direct',
    p_revenue DECIMAL(10,2) DEFAULT 0,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics_events (
        user_id,
        event_type,
        product_id,
        order_id,
        source,
        revenue,
        metadata
    ) VALUES (
        p_user_id,
        p_event_type,
        p_product_id,
        p_order_id,
        p_source,
        p_revenue,
        p_metadata
    );
    
    -- Update daily metrics if this is today's data
    IF DATE(NOW()) = DATE(NOW()) THEN
        PERFORM calculate_daily_funnel_metrics(DATE(NOW()));
    END IF;
END;
$$ LANGUAGE plpgsql;