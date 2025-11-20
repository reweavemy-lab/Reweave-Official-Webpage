# 🚀 Reweave Production Deployment Guide

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Security Configuration](#security-configuration)
7. [Performance Optimization](#performance-optimization)
8. [Monitoring & Logging](#monitoring--logging)
9. [Backup & Recovery](#backup--recovery)
10. [Post-Deployment Verification](#post-deployment-verification)

## ✅ Pre-Deployment Checklist

### System Requirements
- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ or Supabase account
- [ ] Git repository access
- [ ] Domain name configured
- [ ] SSL certificates ready
- [ ] Cloud provider account (Vercel, Railway, AWS, etc.)

### Code Review
- [ ] All tests passing
- [ ] No console errors in development
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Security audit completed
- [ ] Performance benchmarks met

### Dependencies Check
```bash
# Check for outdated packages
pnpm outdated

# Audit for security vulnerabilities
pnpm audit

# Run all tests
pnpm test
```

## 🔧 Environment Setup

### 1. Production Environment Variables

Create `.env.production` in the root directory:

```env
# Frontend Configuration
VITE_API_URL=https://api.reweave.my
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_FACEBOOK_PIXEL_ID=your_facebook_pixel_id
VITE_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENTS=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_PREORDERS=true
```

Create `api/.env.production`:

```env
# Database Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
SUPABASE_ANON_KEY=your-anon-key

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

# Server Configuration
PORT=3001
NODE_ENV=production
HOST=0.0.0.0

# Payment Providers
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_webhook_id

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@reweave.my
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@reweave.my
FROM_NAME="Reweave Team"

# File Storage
SUPABASE_STORAGE_BUCKET=products
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=jpg,jpeg,png,webp

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
CORS_ORIGIN=https://reweave.my,https://www.reweave.my
CORS_CREDENTIALS=true

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info

# Cache
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600

# External Services
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 2. Build Configuration

Update `vite.config.ts` for production:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', '@headlessui/react'],
          utils: ['axios', 'date-fns'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

## 🗄️ Database Configuration

### 1. Supabase Production Setup

```bash
# Create production database
supabase db push --project-ref your-production-project

# Run migrations
supabase migration up --project-ref your-production-project

# Set up row-level security
supabase policy enable --project-ref your-production-project
```

### 2. Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_status ON inventory(status);

-- Create composite indexes
CREATE INDEX idx_products_category_status ON products(category, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_inventory_product_location ON inventory(product_id, location_id);

-- Optimize frequently used queries
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
```

### 3. Database Backup Strategy

```bash
# Automated daily backups
0 2 * * * pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Weekly full backup
0 3 * * 0 pg_dump $DATABASE_URL > full_backup_$(date +%Y%m%d).sql

# Monthly archive
0 4 1 * * tar -czf archive_$(date +%Y%m).tar.gz *.sql
```

## 🚀 Backend Deployment

### 1. Build Process

```bash
# Install production dependencies
cd api
pnpm install --production

# Build TypeScript
pnpm run build

# Optimize build
pnpm run optimize
```

### 2. PM2 Process Management

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'reweave-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
```

Deploy with PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### 3. Nginx Configuration

Create `/etc/nginx/sites-available/reweave-api`:

```nginx
server {
    listen 80;
    server_name api.reweave.my;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/reweave-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🌐 Frontend Deployment

### 1. Build Optimization

```bash
# Build for production
pnpm run build

# Optimize images
pnpm run optimize:images

# Generate sitemap
pnpm run generate:sitemap
```

### 2. Vercel Deployment (Recommended)

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "VITE_API_URL": "@api_url",
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

Deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_API_URL production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### 3. Alternative: Netlify Deployment

Create `netlify.toml`:

```toml
[build]
  command = "pnpm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production.environment]
  VITE_API_URL = "https://api.reweave.my"
  VITE_ENVIRONMENT = "production"
```

## 🔒 Security Configuration

### 1. SSL/TLS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.reweave.my -d reweave.my -d www.reweave.my

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Security Headers

Add to Nginx configuration:

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.paypal.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.stripe.com https://api.paypal.com; frame-src https://js.stripe.com https://www.paypal.com;" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

### 3. API Security

```typescript
// Rate limiting middleware
import rateLimit from 'express-rate-limit'

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

// Apply to all API routes
app.use('/api/', apiLimiter)
```

### 4. Database Security

```sql
-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only see their own data" ON users
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can only see their own orders" ON orders
  FOR ALL USING (auth.uid() = user_id);
```

## ⚡ Performance Optimization

### 1. Caching Strategy

```typescript
// Redis caching
import Redis from 'ioredis'
const redis = new Redis(process.env.REDIS_URL)

// Cache middleware
const cache = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`
    const cached = await redis.get(key)
    
    if (cached) {
      return res.json(JSON.parse(cached))
    }
    
    res.sendResponse = res.json
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body))
      res.sendResponse(body)
    }
    
    next()
  }
}
```

### 2. Database Query Optimization

```typescript
// Use prepared statements
const getProducts = async (filters: any) => {
  const query = `
    SELECT * FROM products 
    WHERE status = $1 
    AND category = $2 
    ORDER BY created_at DESC 
    LIMIT $3 OFFSET $4
  `
  
  const values = ['active', filters.category, filters.limit, filters.offset]
  
  return await supabase.rpc('get_products_optimized', {
    category: filters.category,
    limit: filters.limit,
    offset: filters.offset
  })
}
```

### 3. CDN Configuration

```typescript
// Cloudinary setup
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Optimize images
const optimizeImage = async (file: any) => {
  return await cloudinary.uploader.upload(file.path, {
    folder: 'reweave/products',
    quality: 'auto',
    fetch_format: 'auto',
    width: 800,
    height: 800,
    crop: 'limit',
  })
}
```

## 📊 Monitoring & Logging

### 1. Application Monitoring

```typescript
// Sentry integration
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
})

// Error tracking
app.use(Sentry.Handlers.requestHandler())
app.use(Sentry.Handlers.tracingHandler())
app.use(Sentry.Handlers.errorHandler())
```

### 2. Logging Configuration

```typescript
// Winston logger
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'reweave-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ],
})
```

### 3. Health Checks

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  }
  
  res.status(200).json(health)
})
```

## 💾 Backup & Recovery

### 1. Database Backup

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/reweave"
S3_BUCKET="s3://reweave-backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Upload to S3
aws s3 cp $BACKUP_DIR/db_backup_$DATE.sql.gz $S3_BUCKET/database/

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +30 -delete
aws s3 ls $S3_BUCKET/database/ | awk '{print $4}' | grep -v $(date +%Y%m%d) | tail -n +30 | xargs -I {} aws s3 rm $S3_BUCKET/database/{}

echo "Backup completed: db_backup_$DATE.sql.gz"
```

### 2. File Backup

```bash
#!/bin/bash
# file_backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
S3_BUCKET="s3://reweave-backups"

# Backup uploaded files
aws s3 sync /var/www/reweave/uploads $S3_BUCKET/uploads/$DATE/

# Backup logs
aws s3 sync /var/log/reweave $S3_BUCKET/logs/$DATE/

echo "File backup completed: $DATE"
```

### 3. Disaster Recovery

```bash
#!/bin/bash
# restore.sh

BACKUP_DATE=$1
S3_BUCKET="s3://reweave-backups"

# Download database backup
aws s3 cp $S3_BUCKET/database/db_backup_$BACKUP_DATE.sql.gz /tmp/

# Restore database
gunzip /tmp/db_backup_$BACKUP_DATE.sql.gz
psql $DATABASE_URL < /tmp/db_backup_$BACKUP_DATE.sql

# Restore files
aws s3 sync $S3_BUCKET/uploads/$BACKUP_DATE/ /var/www/reweave/uploads/

echo "Restore completed from backup: $BACKUP_DATE"
```

## ✅ Post-Deployment Verification

### 1. Functionality Tests

```bash
# API health check
curl https://api.reweave.my/health

# Database connectivity
curl https://api.reweave.my/api/products

# Authentication
curl -X POST https://api.reweave.my/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Payment processing (test mode)
curl -X POST https://api.reweave.my/api/orders/test-payment
```

### 2. Performance Tests

```bash
# Load testing with Artillery
npm install -g artillery
artillery run load-test.yml

# Example load test configuration
cat > load-test.yml << EOF
config:
  target: 'https://api.reweave.my'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Content-Type: 'application/json'

scenarios:
  - name: "Browse products"
    flow:
      - get:
          url: "/api/products"
      - get:
          url: "/api/products/featured"
      - get:
          url: "/api/products/categories"
EOF
```

### 3. Security Tests

```bash
# SSL certificate check
curl -I https://reweave.my

# Security headers check
curl -I https://api.reweave.my | grep -E "X-|Strict"

# Rate limiting test
for i in {1..110}; do curl -s -o /dev/null -w "%{http_code}\n" https://api.reweave.my/api/products; done
```

## 🚨 Emergency Procedures

### 1. Rollback Process

```bash
# Quick rollback script
#!/bin/bash
ROLLBACK_VERSION=$1

# Stop current version
pm2 stop reweave-api

# Checkout previous version
git checkout $ROLLBACK_VERSION

# Rebuild and restart
cd api && pnpm install && pnpm run build
pm2 restart reweave-api

echo "Rolled back to version: $ROLLBACK_VERSION"
```

### 2. Incident Response

1. **Immediate Actions**:
   - Check application logs
   - Verify database connectivity
   - Test critical endpoints
   - Assess impact scope

2. **Communication**:
   - Notify stakeholders
   - Update status page
   - Document incident timeline

3. **Recovery**:
   - Implement fix or rollback
   - Verify system stability
   - Monitor for 24 hours

## 📞 Support & Maintenance

### Daily Tasks
- [ ] Monitor application logs
- [ ] Check database performance
- [ ] Verify backup completion
- [ ] Review security alerts

### Weekly Tasks
- [ ] Analyze performance metrics
- [ ] Update dependencies
- [ ] Review error rates
- [ ] Check SSL certificate expiry

### Monthly Tasks
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup restoration test
- [ ] Documentation updates

---

## 🎯 Deployment Success Metrics

- ✅ Zero-downtime deployment
- ✅ < 2 second page load times
- ✅ 99.9% uptime SLA
- ✅ < 1% error rate
- ✅ Secure HTTPS connections
- ✅ Automated backup verification
- ✅ Monitoring alerts configured
- ✅ Disaster recovery tested

**🚀 Ready to deploy! Follow this guide step-by-step for a successful production deployment.**