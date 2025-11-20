#!/bin/bash

# Reweave.shop Production Deployment Script
# Deploy to reweave.shop domain

set -e

echo "🚀 Starting deployment to reweave.shop..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if build exists
if [ ! -d "dist" ]; then
    error "Build directory not found. Please run 'pnpm run build' first."
fi

# Check if API is built
if [ ! -f "api/dist/server.js" ]; then
    log "Building API..."
    cd api && npx tsc && cd ..
fi

# Create deployment package
log "Creating deployment package..."
mkdir -p deployment-package
cp -r dist/* deployment-package/
cp -r api deployment-package/
cp vercel.json deployment-package/
cp package.json deployment-package/
cp -r scripts deployment-package/

# Create deployment info
cat > deployment-package/DEPLOYMENT_INFO.md << EOF
# Deployment Package for reweave.shop

## Build Information
- Build Date: $(date)
- Node Version: $(node --version)
- Package Manager: pnpm

## Files Included
- Frontend build (dist/)
- Backend API (api/)
- Deployment scripts (scripts/)
- Configuration files

## Deployment Steps
1. Upload this package to your server
2. Run the deployment script
3. Configure DNS records
4. Set up SSL certificates

## Domain Configuration
- Main: https://reweave.shop
- Admin: https://admin.reweave.shop
- API: https://api.reweave.shop

## Next Steps
See REWEAVE_SHOP_DEPLOYMENT.md for complete deployment instructions.
EOF

success "Deployment package created in deployment-package/"

# Create simple deployment script
cat > deployment-package/deploy-to-server.sh << 'EOF'
#!/bin/bash

# Server deployment script for reweave.shop

echo "Deploying to production server..."

# Configuration
DOMAIN="reweave.shop"
API_DOMAIN="api.reweave.shop"
ADMIN_DOMAIN="admin.reweave.shop"
WWW_DOMAIN="www.reweave.shop"

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo "This script should not be run as root for security reasons"
   exit 1
fi

# Create deployment directory
DEPLOY_DIR="/var/www/$DOMAIN"
sudo mkdir -p $DEPLOY_DIR

# Copy files
echo "Copying files to $DEPLOY_DIR..."
sudo cp -r dist/* $DEPLOY_DIR/
sudo cp -r api $DEPLOY_DIR/

# Set permissions
sudo chown -R www-data:www-data $DEPLOY_DIR
sudo chmod -R 755 $DEPLOY_DIR

# Create systemd service for API
echo "Creating API service..."
sudo tee /etc/systemd/system/reweave-api.service > /dev/null << EOL
[Unit]
Description=Reweave API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$DEPLOY_DIR/api
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001

[Install]
WantedBy=multi-user.target
EOL

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable reweave-api
sudo systemctl start reweave-api

echo "✅ Deployment completed!"
echo "Next steps:"
echo "1. Configure nginx for $DOMAIN"
echo "2. Generate SSL certificates"
echo "3. Update DNS records"
echo "4. Test the deployment"
EOF

chmod +x deployment-package/deploy-to-server.sh

success "Deployment package ready!"
echo ""
echo "📦 Package contents:"
ls -la deployment-package/
echo ""
echo "🎯 Next steps:"
echo "1. Upload deployment-package/ to your server"
echo "2. Run ./deploy-to-server.sh on your server"
echo "3. Configure DNS records for reweave.shop"
echo "4. Generate SSL certificates"
echo ""
echo "📋 Files created:"
echo "- deployment-package/ (deployment bundle)"
echo "- deployment-package/DEPLOYMENT_INFO.md"
echo "- deployment-package/deploy-to-server.sh"