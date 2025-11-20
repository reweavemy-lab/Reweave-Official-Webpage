# Reweave.shop Domain Configuration

This document outlines the configuration changes made for deploying to reweave.shop domain.

## Domain Structure

- **Main Website**: `https://reweave.shop`
- **Admin Dashboard**: `https://admin.reweave.shop`
- **API Server**: `https://api.reweave.shop`
- **WWW Redirect**: `https://www.reweave.shop` → `https://reweave.shop`

## Configuration Files Updated

### 1. Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "name": "reweave-shop",
  "alias": ["reweave.shop", "www.reweave.shop"],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 2. Frontend Environment (`.env.production`)
```bash
VITE_API_URL=https://api.reweave.shop
VITE_BASE_URL=https://reweave.shop
VITE_ADMIN_URL=https://admin.reweave.shop
VITE_SUPPORT_EMAIL=support@reweave.shop
VITE_BUSINESS_EMAIL="hello@reweave.shop"
```

### 3. API Environment (`api/.env.production`)
```bash
SMTP_USER=noreply@reweave.shop
FROM_EMAIL=noreply@reweave.shop
CORS_ORIGIN=https://reweave.shop,https://www.reweave.shop,https://admin.reweave.shop
BUSINESS_EMAIL="hello@reweave.shop"
```

### 4. CORS Configuration (`api/app.ts`)
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:4173',
  'https://reweave.shop',
  'https://www.reweave.shop'
];
```

### 5. Security Middleware (`api/middleware/security.ts`)
```typescript
const allowedOrigins = [
  'https://reweave.shop',
  'https://www.reweave.shop',
  'https://admin.reweave.shop',
  'https://api.reweave.shop',
  'http://localhost:5173',
  'http://localhost:3001'
];
```

## SSL Certificate Configuration

Generate SSL certificates for all subdomains:
```bash
sudo certbot --nginx -d reweave.shop -d www.reweave.shop -d admin.reweave.shop -d api.reweave.shop
```

## DNS Configuration Required

### A Records
- `reweave.shop` → Your server IP
- `www.reweave.shop` → Your server IP
- `admin.reweave.shop` → Your server IP
- `api.reweave.shop` → Your server IP

### CNAME Records (if using CDN)
- `www.reweave.shop` → `reweave.shop`

## Deployment Commands

### Build and Deploy
```bash
# Frontend build
pnpm run build:production

# Backend build
cd api && pnpm run build

# Deploy to production
pnpm run deploy:production
```

### Health Checks
```bash
# Check API health
curl https://api.reweave.shop/health

# Check frontend
curl https://reweave.shop

# Check admin panel
curl https://admin.reweave.shop
```

## Environment Variables for Production

Create `.env.production` in root directory:
```bash
# Frontend
VITE_API_URL=https://api.reweave.shop
VITE_BASE_URL=https://reweave.shop

# Backend
FRONTEND_URL=https://reweave.shop
CORS_ORIGIN=https://reweave.shop,https://www.reweave.shop
```

## Monitoring and Maintenance

### Log Files
- Application logs: `/var/log/reweave/`
- Nginx logs: `/var/log/nginx/`
- SSL certificate logs: `/var/log/letsencrypt/`

### Backup Locations
- Database backups: `/backups/reweave/database/`
- File backups: `/backups/reweave/files/`
- SSL backups: `/backups/reweave/ssl/`

### Renewal Scripts
- SSL certificates: `sudo certbot renew --dry-run`
- Log rotation: Configured in `/etc/logrotate.d/reweave`

## Security Considerations

1. **HTTPS Only**: All traffic should be redirected to HTTPS
2. **HSTS Headers**: Enable HTTP Strict Transport Security
3. **CSP Headers**: Content Security Policy configured
4. **Rate Limiting**: Implemented on API endpoints
5. **CORS**: Properly configured for cross-origin requests

## Troubleshooting

### Common Issues
1. **SSL Certificate Issues**: Check certificate expiration and renewal
2. **CORS Errors**: Verify allowed origins in configuration
3. **Database Connection**: Check Supabase credentials and network access
4. **Email Delivery**: Verify SMTP settings and domain authentication

### Support Contacts
- Technical Support: `support@reweave.shop`
- Business Inquiries: `hello@reweave.shop`
- Domain Issues: Check with domain registrar

## Verification Checklist

- [ ] All configuration files updated with new domain
- [ ] DNS records configured and propagated
- [ ] SSL certificates generated and installed
- [ ] CORS settings updated for new domain
- [ ] Environment variables set correctly
- [ ] Health checks passing for all services
- [ ] Email delivery working
- [ ] Admin panel accessible
- [ ] API endpoints responding correctly
- [ ] Frontend loading without errors