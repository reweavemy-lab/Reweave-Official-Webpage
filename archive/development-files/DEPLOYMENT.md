# Reweave E-Commerce Platform - Deployment Guide

## System Overview

The Reweave E-Commerce Platform is a comprehensive full-stack solution featuring:
- **Frontend**: React + TypeScript with batik-inspired design
- **Backend**: Node.js + Express with TypeScript
- **Database**: PostgreSQL with Supabase
- **Authentication**: JWT-based with role-based access control
- **Payment Integration**: Multi-platform support (Stripe, PayPal, FPX, E-wallets)
- **Inventory Management**: Real-time tracking with preorder system
- **Customer Management**: Loyalty program and segmentation
- **Analytics**: Comprehensive business intelligence dashboard
- **Popup Sales**: Physical event management system

## Prerequisites

### System Requirements
- Node.js 18+ and npm/pnpm
- PostgreSQL 14+ or Supabase account
- Git
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Development Environment
```bash
# Install pnpm globally (recommended)
npm install -g pnpm

# Verify installations
node --version
pnpm --version
git --version
```

## Database Setup

### Option 1: Supabase (Recommended)
1. Create a free Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run all migration files in order:
   ```sql
   -- Run each migration file in sequence
   001_create_users_and_auth.sql
   002_create_products_and_inventory.sql
   003_create_orders_and_payments.sql
   004_create_popup_sales_tables.sql
   005_complete_database_schema.sql
   ```

### Option 2: Local PostgreSQL
1. Install PostgreSQL locally
2. Create database: `createdb reweave_db`
3. Run migrations:
   ```bash
   psql -d reweave_db -f supabase/migrations/001_create_users_and_auth.sql
   psql -d reweave_db -f supabase/migrations/002_create_products_and_inventory.sql
   psql -d reweave_db -f supabase/migrations/003_create_orders_and_payments.sql
   psql -d reweave_db -f supabase/migrations/004_create_popup_sales_tables.sql
   psql -d reweave_db -f supabase/migrations/005_complete_database_schema.sql
   ```

## Environment Configuration

### Backend Environment Variables
Create `api/.env` file:
```env
# Database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
SUPABASE_ANON_KEY=your_supabase_anon_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=production

# Payment Providers
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Storage
SUPABASE_STORAGE_BUCKET=products
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### Frontend Environment Variables
Create `.env` file in root:
```env
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Configuration
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id

# Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_FACEBOOK_PIXEL_ID=your_fb_pixel_id

# Environment
VITE_ENVIRONMENT=production
```

## Installation & Build

### 1. Install Dependencies
```bash
# Install frontend dependencies
pnpm install

# Install backend dependencies
cd api && pnpm install && cd ..
```

### 2. Build the Application
```bash
# Build frontend
pnpm run build

# Build backend
cd api && pnpm run build && cd ..
```

### 3. Run Production Build
```bash
# Start backend server
cd api && pnpm start

# In another terminal, serve frontend
pnpm preview
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)
1. Connect GitHub repository to Vercel
2. Configure build settings:
   - Framework: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

#### Backend Deployment (Railway)
1. Connect GitHub repository to Railway
2. Configure service:
   - Root Directory: `api`
   - Build Command: `pnpm build`
   - Start Command: `pnpm start`
3. Add environment variables
4. Deploy

### Option 2: DigitalOcean App Platform
1. Create new app from GitHub
2. Configure services:
   - Frontend service with build command `pnpm build`
   - Backend service with build command `cd api && pnpm build`
3. Set environment variables
4. Deploy

### Option 3: AWS Deployment

#### Frontend (S3 + CloudFront)
```bash
# Build frontend
pnpm build

# Upload to S3
aws s3 sync dist/ s3://your-frontend-bucket --delete

# Configure CloudFront distribution
# Point to your S3 bucket
```

#### Backend (EC2 + RDS)
```bash
# Launch EC2 instance
# Install Node.js and dependencies
# Clone repository
# Install and build backend
# Configure PM2 for process management
# Set up Nginx reverse proxy
```

## Domain & SSL Configuration

### Domain Setup
1. Purchase domain from registrar
2. Point DNS to your hosting provider
3. Configure subdomains:
   - `api.yourdomain.com` → Backend
   - `admin.yourdomain.com` → Admin Panel
   - `yourdomain.com` → Main Website

### SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Payment Gateway Configuration

### Stripe Setup
1. Create Stripe account
2. Get API keys from Dashboard
3. Configure webhook endpoints:
   - `https://api.yourdomain.com/api/webhooks/stripe`
4. Test in sandbox mode first

### PayPal Setup
1. Create PayPal business account
2. Get API credentials
3. Configure webhook URLs
4. Test in sandbox environment

### FPX Integration (Malaysia)
1. Register with FPX provider
2. Get merchant credentials
3. Configure FPX settings in backend
4. Test with sandbox accounts

## Email Configuration

### Gmail SMTP Setup
1. Enable 2-factor authentication
2. Generate app-specific password
3. Use in SMTP configuration

### Email Templates
The system includes automated emails for:
- Order confirmations
- Shipping notifications
- Password resets
- Welcome emails
- Marketing campaigns

## Monitoring & Analytics

### Application Monitoring
```bash
# Install PM2 for process management
npm install -g pm2

# Start with PM2
pm2 start api/dist/index.js --name "reweave-api"
pm2 startup
pm2 save
```

### Database Monitoring
- Use Supabase dashboard for database metrics
- Set up alerts for connection limits
- Monitor query performance

### Error Tracking
Configure Sentry or similar service:
```javascript
// In backend
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
});
```

## Performance Optimization

### Frontend Optimization
- Images are automatically optimized
- Code splitting implemented
- Lazy loading for components
- Service worker for offline support

### Backend Optimization
- Database indexes created
- Query optimization
- Redis caching (optional)
- Rate limiting implemented

### CDN Configuration
- Use CloudFlare or similar CDN
- Cache static assets
- Enable compression
- Configure edge locations

## Security Configuration

### Security Headers
Configure in Nginx:
```nginx
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
```

### Database Security
- Use connection pooling
- Implement row-level security
- Regular security audits
- Backup encryption

### API Security
- JWT token validation
- Rate limiting per endpoint
- Input validation
- SQL injection prevention

## Backup & Recovery

### Database Backups
```bash
# Automated daily backups
0 2 * * * pg_dump your_database > backup_$(date +%Y%m%d).sql

# Upload to cloud storage
aws s3 cp backup_$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### File Backups
- Product images to cloud storage
- User uploads to secure storage
- Regular backup verification

## Testing

### Pre-deployment Testing
```bash
# Run all tests
pnpm test

# Run backend tests
cd api && pnpm test

# Run frontend tests
pnpm test:ui

# Run integration tests
pnpm test:integration
```

### Load Testing
```bash
# Install Artillery
npm install -g artillery

# Run load tests
artillery run load-test.yml
```

### Security Testing
- Run OWASP ZAP scans
- Perform penetration testing
- Check for vulnerabilities

## Post-Deployment Checklist

### Immediate Checks
- [ ] All pages load correctly
- [ ] Database connections work
- [ ] Payment processing functions
- [ ] Email notifications send
- [ ] Admin panel accessible
- [ ] User registration/login works
- [ ] Cart and checkout flow
- [ ] Inventory updates in real-time

### Performance Monitoring
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database query performance
- [ ] Server resource usage
- [ ] Error rates < 1%

### Security Verification
- [ ] SSL certificate valid
- [ ] Security headers present
- [ ] No sensitive data exposure
- [ ] Rate limiting active
- [ ] Authentication working

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Check Supabase credentials
- Verify network connectivity
- Check connection limits

#### Payment Processing Failures
- Verify API keys
- Check webhook configurations
- Review payment gateway logs

#### Email Delivery Issues
- Check SMTP credentials
- Verify email service limits
- Check spam folder

#### Performance Issues
- Monitor database queries
- Check server resources
- Review CDN configuration

### Support Resources
- Check application logs
- Monitor error tracking
- Review performance metrics
- Contact hosting support

## Maintenance

### Regular Tasks
- Monitor system health
- Update dependencies
- Review security patches
- Backup verification
- Performance optimization

### Monthly Reviews
- Analytics review
- Customer feedback analysis
- Feature usage statistics
- Revenue performance
- Security audit

## Scaling

### Horizontal Scaling
- Load balancer configuration
- Multiple server instances
- Database read replicas
- CDN optimization

### Vertical Scaling
- Server resource upgrades
- Database optimization
- Caching improvements
- Code optimization

## Support

For deployment support:
1. Check this documentation first
2. Review application logs
3. Check monitoring dashboards
4. Contact development team

## Updates

This deployment guide is maintained alongside the application. Always refer to the latest version in the repository for the most current instructions.

---

**Deployment Complete!** 🎉

Your Reweave E-Commerce Platform is now live and ready to serve customers with authentic Malaysian batik products while supporting local artisans and promoting sustainable fashion.