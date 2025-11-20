# DNS Configuration for reweave.shop

## Domain: reweave.shop
## Registrar: Configure with your domain registrar
## TTL: 3600 (1 hour) - adjust as needed

## A Records (Point to your server IP)
# Replace YOUR_SERVER_IP with your actual server IP address

Type    Name                Value               TTL
A       @                   YOUR_SERVER_IP      3600
A       www                 YOUR_SERVER_IP      3600
A       admin               YOUR_SERVER_IP      3600
A       api                 YOUR_SERVER_IP      3600

## CNAME Records (Optional - for CDN or subdomains)

Type    Name                Value               TTL
CNAME   www                 reweave.shop.       3600

## MX Records (For email - configure with your email provider)

Type    Priority    Name    Value                           TTL
MX      10          @       mail.reweave.shop.              3600
MX      20          @       backup-mail.reweave.shop.       3600

## TXT Records (For verification and security)

Type    Name                Value                                           TTL
TXT     @                   "v=spf1 include:_spf.google.com ~all"           3600
TXT     @                   "google-site-verification=YOUR_VERIFICATION_CODE" 3600
TXT     _dmarc              "v=DMARC1; p=none; rua=mailto:dmarc@reweave.shop" 3600

## Configuration Instructions

### Step 1: Get Your Server IP Address
```bash
# If using cloud hosting, get your instance IP
# If using VPS, check your hosting dashboard
# Example IPs (replace with yours):
# - AWS EC2: 54.123.45.67
# - DigitalOcean: 167.99.123.45
# - Vultr: 45.63.123.45
```

### Step 2: Update DNS Records
1. Log into your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
2. Navigate to DNS management/DNS records
3. Update the A records with your server IP
4. Save changes

### Step 3: Wait for Propagation
DNS changes typically take 15 minutes to 24 hours to propagate globally.
You can check propagation using:
```bash
nslookup reweave.shop
nslookup www.reweave.shop
```

### Step 4: Verify Configuration
After propagation, verify your DNS is working:
```bash
# Check A records
dig A reweave.shop
dig A www.reweave.shop

# Check if domain resolves
curl -I https://reweave.shop
```

## SSL Certificate Configuration

Once DNS is propagated, generate SSL certificates:

```bash
# Generate certificates for all subdomains
sudo certbot --nginx -d reweave.shop -d www.reweave.shop -d admin.reweave.shop -d api.reweave.shop

# Test automatic renewal
sudo certbot renew --dry-run
```

## Nginx Configuration

Update your nginx configuration to handle the new domain:

```nginx
# /etc/nginx/sites-available/reweave
server {
    listen 80;
    server_name reweave.shop www.reweave.shop;
    return 301 https://reweave.shop$request_uri;
}

server {
    listen 443 ssl http2;
    server_name reweave.shop;
    
    ssl_certificate /etc/letsencrypt/live/reweave.shop/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/reweave.shop/privkey.pem;
    
    # Your site configuration
    root /var/www/reweave/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring Setup

Set up monitoring for your domain:

```bash
# Add to crontab for SSL monitoring
0 2 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"

# Domain health check
*/5 * * * * curl -f https://reweave.shop/health || echo "Site down" | mail -s "Site Alert" admin@reweave.shop
```

## Troubleshooting

### Common Issues

1. **DNS Not Propagating**
   - Check TTL settings (lower TTL for faster changes)
   - Verify nameservers are correct
   - Use different DNS checkers

2. **SSL Certificate Issues**
   - Ensure DNS is propagated before generating certificates
   - Check certificate expiration: `openssl x509 -in /path/to/cert.pem -text -noout`
   - Verify nginx configuration: `sudo nginx -t`

3. **Domain Not Resolving**
   - Check A records are pointing to correct IP
   - Verify server is running and accessible
   - Check firewall settings

### Useful Commands

```bash
# Check DNS propagation
dig reweave.shop +trace

# Check SSL certificate
openssl s_client -connect reweave.shop:443 -servername reweave.shop

# Test HTTP response
curl -I https://reweave.shop

# Check nginx configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

## Support

For domain-related issues:
- Contact your domain registrar support
- Check server logs: `/var/log/nginx/`
- Verify SSL certificates: `certbot certificates`

For technical support: `support@reweave.shop`