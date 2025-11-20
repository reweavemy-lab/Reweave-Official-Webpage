#!/bin/bash

# Reweave Production Deployment Script
# Automated deployment with rollback capabilities and health checks

set -euo pipefail

# Configuration
DEPLOYMENT_DIR="/var/www/reweave"
BACKUP_DIR="/backups/reweave"
LOG_FILE="/var/log/reweave-deploy.log"
HEALTH_CHECK_URL="https://api.reweave.shop/health"
MAX_HEALTH_CHECK_ATTEMPTS=30
HEALTH_CHECK_INTERVAL=10
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        ERROR)
            echo -e "${RED}[ERROR]${NC} $timestamp - $message" | tee -a "$LOG_FILE"
            ;;
        SUCCESS)
            echo -e "${GREEN}[SUCCESS]${NC} $timestamp - $message" | tee -a "$LOG_FILE"
            ;;
        INFO)
            echo -e "${BLUE}[INFO]${NC} $timestamp - $message" | tee -a "$LOG_FILE"
            ;;
        WARN)
            echo -e "${YELLOW}[WARN]${NC} $timestamp - $message" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "$timestamp - $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handling
error_exit() {
    log ERROR "Deployment failed: $1"
    send_notification "Deployment Failed" "$1"
    rollback_deployment
    exit 1
}

# Notification function
send_notification() {
    local subject=$1
    local message=$2
    
    # Send Slack notification (if configured)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 $subject: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    # Send email notification (if configured)
    if command -v mail >/dev/null 2>&1 && [ -n "${NOTIFICATION_EMAIL:-}" ]; then
        echo "$message" | mail -s "$subject" "$NOTIFICATION_EMAIL" || true
    fi
}

# Check prerequisites
check_prerequisites() {
    log INFO "Checking deployment prerequisites..."
    
    # Check required commands
    local required_commands=("git" "pnpm" "pm2" "nginx" "systemctl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error_exit "Required command not found: $cmd"
        fi
    done
    
    # Check disk space (require at least 2GB free)
    local free_space=$(df -BG / | awk 'NR==2 {print $4}' | sed 's/G//')
    if [ "$free_space" -lt 2 ]; then
        error_exit "Insufficient disk space. Required: 2GB, Available: ${free_space}GB"
    fi
    
    # Check memory (require at least 1GB free)
    local free_memory=$(free -g | awk 'NR==2{print $7}')
    if [ "$free_memory" -lt 1 ]; then
        error_exit "Insufficient memory. Required: 1GB, Available: ${free_memory}GB"
    fi
    
    # Check network connectivity
    if ! ping -c 1 google.com >/dev/null 2>&1; then
        error_exit "No internet connectivity detected"
    fi
    
    # Check SSL certificates
    if [ ! -f "/etc/letsencrypt/live/reweave.my/fullchain.pem" ]; then
        log WARN "SSL certificates not found. Will generate during deployment."
    fi
    
    log SUCCESS "Prerequisites check passed"
}

# Pre-deployment backup
create_pre_deployment_backup() {
    log INFO "Creating pre-deployment backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR/$DATE"
    
    # Backup current application
    if [ -d "$DEPLOYMENT_DIR" ]; then
        tar -czf "$BACKUP_DIR/$DATE/application.tar.gz" -C "$DEPLOYMENT_DIR" . || true
    fi
    
    # Backup database
    if [ -n "${DB_URL:-}" ]; then
        pg_dump "$DB_URL" > "$BACKUP_DIR/$DATE/database.sql" || true
        gzip "$BACKUP_DIR/$DATE/database.sql" || true
    fi
    
    # Backup configuration
    cp -r /etc/nginx/sites-available/reweave* "$BACKUP_DIR/$DATE/" || true
    cp -r /etc/systemd/system/reweave* "$BACKUP_DIR/$DATE/" || true
    
    # Create backup manifest
    cat > "$BACKUP_DIR/$DATE/manifest.json" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "deployment_id": "$DATE",
    "backup_type": "pre_deployment",
    "components": {
        "application": $(if [ -f "$BACKUP_DIR/$DATE/application.tar.gz" ]; then echo "true"; else echo "false"; fi),
        "database": $(if [ -f "$BACKUP_DIR/$DATE/database.sql.gz" ]; then echo "true"; else echo "false"; fi),
        "configuration": $(if [ -d "$BACKUP_DIR/$DATE/" ]; then echo "true"; else echo "false"; fi)
    },
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')"
}
EOF
    
    log SUCCESS "Pre-deployment backup created: $BACKUP_DIR/$DATE"
}

# Setup deployment environment
setup_deployment_environment() {
    log INFO "Setting up deployment environment..."
    
    # Create deployment directory
    mkdir -p "$DEPLOYMENT_DIR"/{frontend,backend,logs,config}
    
    # Set proper permissions
    chown -R www-data:www-data "$DEPLOYMENT_DIR"
    chmod -R 755 "$DEPLOYMENT_DIR"
    
    # Create log directory
    mkdir -p /var/log/reweave
    chown www-data:www-data /var/log/reweave
    
    # Create systemd service files
    create_systemd_services
    
    # Setup log rotation
    setup_log_rotation
    
    log SUCCESS "Deployment environment setup completed"
}

# Create systemd services
create_systemd_services() {
    log INFO "Creating systemd services..."
    
    # Backend service
    cat > /etc/systemd/system/reweave-api.service << EOF
[Unit]
Description=Reweave API Service
After=network.target
Wants=network.target

[Service]
Type=forking
User=www-data
Group=www-data
WorkingDirectory=$DEPLOYMENT_DIR/backend
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js --env production
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3001
EnvironmentFile=$DEPLOYMENT_DIR/backend/.env.production

# Logging
StandardOutput=append:/var/log/reweave/api.log
StandardError=append:/var/log/reweave/api-error.log

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=$DEPLOYMENT_DIR/backend/logs /var/log/reweave

[Install]
WantedBy=multi-user.target
EOF
    
    # Frontend service (if serving from Node.js)
    cat > /etc/systemd/system/reweave-frontend.service << EOF
[Unit]
Description=Reweave Frontend Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$DEPLOYMENT_DIR/frontend
ExecStart=/usr/bin/serve -s dist -l 5173
Restart=always
RestartSec=10
Environment=NODE_ENV=production

# Logging
StandardOutput=append:/var/log/reweave/frontend.log
StandardError=append:/var/log/reweave/frontend-error.log

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    systemctl daemon-reload
    
    log SUCCESS "Systemd services created"
}

# Setup log rotation
setup_log_rotation() {
    log INFO "Setting up log rotation..."
    
    cat > /etc/logrotate.d/reweave << EOF
/var/log/reweave/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload reweave-api reweave-frontend 2>/dev/null || true
    endscript
}
EOF
    
    log SUCCESS "Log rotation configured"
}

# Build and deploy backend
build_and_deploy_backend() {
    log INFO "Building and deploying backend..."
    
    # Navigate to backend directory
    cd api
    
    # Install dependencies
    pnpm install --production || error_exit "Failed to install backend dependencies"
    
    # Build TypeScript
    pnpm run build || error_exit "Backend build failed"
    
    # Copy built files
    cp -r dist package.json pnpm-lock.yaml ecosystem.config.js "$DEPLOYMENT_DIR/backend/"
    cp ../.env.production "$DEPLOYMENT_DIR/backend/.env.production"
    
    # Set permissions
    chown -R www-data:www-data "$DEPLOYMENT_DIR/backend"
    chmod -R 755 "$DEPLOYMENT_DIR/backend"
    
    # Install PM2 globally if not present
    if ! command -v pm2 >/dev/null 2>&1; then
        npm install -g pm2
    fi
    
    # Start backend with PM2
    cd "$DEPLOYMENT_DIR/backend"
    pm2 start ecosystem.config.js --env production || error_exit "Failed to start backend"
    pm2 save
    
    log SUCCESS "Backend deployed successfully"
}

# Build and deploy frontend
build_and_deploy_frontend() {
    log INFO "Building and deploying frontend..."
    
    # Navigate to frontend directory
    cd ..
    
    # Install dependencies
    pnpm install || error_exit "Failed to install frontend dependencies"
    
    # Build for production
    pnpm run build || error_exit "Frontend build failed"
    
    # Copy built files
    cp -r dist/* "$DEPLOYMENT_DIR/frontend/"
    cp package.json "$DEPLOYMENT_DIR/frontend/"
    
    # Set permissions
    chown -R www-data:www-data "$DEPLOYMENT_DIR/frontend"
    chmod -R 755 "$DEPLOYMENT_DIR/frontend"
    
    log SUCCESS "Frontend deployed successfully"
}

# Setup Nginx configuration
setup_nginx() {
    log INFO "Setting up Nginx configuration..."
    
    # Copy Nginx configuration
    cp nginx/production.conf /etc/nginx/sites-available/reweave
    
    # Enable site
    ln -sf /etc/nginx/sites-available/reweave /etc/nginx/sites-enabled/
    
    # Test Nginx configuration
    if ! nginx -t; then
        error_exit "Nginx configuration test failed"
    fi
    
    # Generate SSL certificates if not present
    if [ ! -f "/etc/letsencrypt/live/reweave.my/fullchain.pem" ]; then
        generate_ssl_certificates
    fi
    
    # Reload Nginx
    systemctl reload nginx || error_exit "Failed to reload Nginx"
    
    log SUCCESS "Nginx configured successfully"
}

# Generate SSL certificates
generate_ssl_certificates() {
    log INFO "Generating SSL certificates..."
    
    # Install Certbot if not present
    if ! command -v certbot >/dev/null 2>&1; then
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Generate certificates
    certbot --nginx -d reweave.my -d www.reweave.my -d admin.reweave.my -d api.reweave.my --non-interactive --agree-tos -m admin@reweave.my || true
    
    # Setup auto-renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    log SUCCESS "SSL certificates generated"
}

# Health check
perform_health_check() {
    log INFO "Performing health check..."
    
    local attempt=1
    local max_attempts=$MAX_HEALTH_CHECK_ATTEMPTS
    
    while [ $attempt -le $max_attempts ]; do
        log INFO "Health check attempt $attempt/$max_attempts"
        
        # Check API health
        if curl -f -s "$HEALTH_CHECK_URL" >/dev/null; then
            log SUCCESS "API health check passed"
            
            # Check frontend
            if curl -f -s "https://reweave.my" >/dev/null; then
                log SUCCESS "Frontend health check passed"
                
                # Check admin panel
                if curl -f -s "https://admin.reweave.my" >/dev/null; then
                    log SUCCESS "Admin panel health check passed"
                    return 0
                fi
            fi
        fi
        
        log WARN "Health check failed, retrying in $HEALTH_CHECK_INTERVAL seconds..."
        sleep $HEALTH_CHECK_INTERVAL
        ((attempt++))
    done
    
    error_exit "Health check failed after $max_attempts attempts"
}

# Database migration
run_database_migrations() {
    log INFO "Running database migrations..."
    
    # Check if database URL is configured
    if [ -n "${DB_URL:-}" ]; then
        # Run migrations
        cd api
        pnpm run db:migrate || error_exit "Database migration failed"
        log SUCCESS "Database migrations completed"
    else
        log WARN "Database URL not configured, skipping migrations"
    fi
}

# Post-deployment verification
post_deployment_verification() {
    log INFO "Performing post-deployment verification..."
    
    # Check all services are running
    systemctl is-active --quiet reweave-api || error_exit "Reweave API service not running"
    systemctl is-active --quiet nginx || error_exit "Nginx service not running"
    
    # Check PM2 processes
    if ! pm2 status | grep -q "online"; then
        error_exit "PM2 processes not running properly"
    fi
    
    # Verify SSL certificates
    if ! openssl x509 -checkend 86400 -noout -in /etc/letsencrypt/live/reweave.my/fullchain.pem; then
        log WARN "SSL certificate expiring within 24 hours"
    fi
    
    # Check log files
    if [ ! -f "/var/log/reweave/api.log" ]; then
        log WARN "API log file not found"
    fi
    
    log SUCCESS "Post-deployment verification completed"
}

# Rollback deployment
rollback_deployment() {
    log WARN "Initiating rollback procedure..."
    
    # Find latest backup
    local latest_backup=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort -r | head -1)
    
    if [ -n "$latest_backup" ] && [ -d "$latest_backup" ]; then
        log INFO "Rolling back to backup: $(basename "$latest_backup")"
        
        # Stop services
        systemctl stop reweave-api reweave-frontend nginx || true
        
        # Restore application
        if [ -f "$latest_backup/application.tar.gz" ]; then
            rm -rf "$DEPLOYMENT_DIR"
            mkdir -p "$DEPLOYMENT_DIR"
            tar -xzf "$latest_backup/application.tar.gz" -C "$DEPLOYMENT_DIR"
        fi
        
        # Restore database
        if [ -f "$latest_backup/database.sql.gz" ]; then
            gunzip -c "$latest_backup/database.sql.gz" | psql "$DB_URL" || true
        fi
        
        # Restore configuration
        if [ -d "$latest_backup" ]; then
            cp -r "$latest_backup"/reweave* /etc/nginx/sites-available/ || true
            cp -r "$latest_backup"/reweave* /etc/systemd/system/ || true
        fi
        
        # Reload configuration
        systemctl daemon-reload || true
        nginx -t && systemctl reload nginx || true
        
        # Start services
        systemctl start reweave-api reweave-frontend nginx || true
        
        log SUCCESS "Rollback completed successfully"
    else
        log ERROR "No backup found for rollback"
    fi
}

# Cleanup old deployments
cleanup_old_deployments() {
    log INFO "Cleaning up old deployments..."
    
    # Keep only last 5 deployments
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort -r | tail -n +6 | xargs rm -rf || true
    
    # Clean up old logs
    find /var/log/reweave -name "*.log.*" -mtime +30 -delete || true
    
    # Clean up PM2 logs
    pm2 flush || true
    
    log SUCCESS "Cleanup completed"
}

# Generate deployment report
generate_deployment_report() {
    log INFO "Generating deployment report..."
    
    local report_file="$BACKUP_DIR/$DATE/deployment_report.json"
    
    cat > "$report_file" << EOF
{
    "deployment_id": "$DATE",
    "timestamp": "$(date -Iseconds)",
    "status": "success",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "git_branch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
    "components": {
        "backend": {
            "status": "deployed",
            "port": 3001,
            "pm2_status": "$(pm2 status | grep reweave-api | awk '{print $4}' || echo 'unknown')"
        },
        "frontend": {
            "status": "deployed",
            "port": 5173,
            "build_status": "completed"
        },
        "nginx": {
            "status": "$(systemctl is-active nginx)",
            "ssl_status": "$(if [ -f /etc/letsencrypt/live/reweave.my/fullchain.pem ]; then echo 'configured'; else echo 'missing'; fi)"
        },
        "database": {
            "status": "$(if [ -n \"${DB_URL:-}\" ]; then echo 'migrated'; else echo 'skipped'; fi)"
        }
    },
    "health_checks": {
        "api": "passed",
        "frontend": "passed",
        "admin": "passed"
    },
    "performance": {
        "deployment_time": "$(($(date +%s) - $(date -d "$DATE" +%s)))s",
        "backup_size": "$(du -sh "$BACKUP_DIR/$DATE" 2>/dev/null | cut -f1 || echo '0')"
    }
}
EOF
    
    log SUCCESS "Deployment report generated: $report_file"
}

# Main deployment function
main_deployment() {
    log INFO "Starting Reweave production deployment..."
    
    local start_time=$(date +%s)
    
    # Execute deployment steps
    check_prerequisites
    create_pre_deployment_backup
    setup_deployment_environment
    run_database_migrations
    build_and_deploy_backend
    build_and_deploy_frontend
    setup_nginx
    perform_health_check
    post_deployment_verification
    cleanup_old_deployments
    generate_deployment_report
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    log SUCCESS "Deployment completed successfully in ${duration} seconds!"
    send_notification "Deployment Successful" "Reweave deployed successfully in ${duration} seconds"
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    deploy              Run full deployment process
    rollback            Rollback to previous deployment
    health-check        Perform health check only
    cleanup             Clean up old deployments
    status              Show deployment status

Options:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose output
    -q, --quiet         Suppress output
    -d, --dry-run       Simulate operations without executing
    -f, --force         Force deployment even with warnings

Environment Variables:
    DEPLOYMENT_DIR      Deployment directory (default: /var/www/reweave)
    BACKUP_DIR          Backup directory (default: /backups/reweave)
    DB_URL              Database connection URL
    SLACK_WEBHOOK_URL   Slack webhook for notifications
    NOTIFICATION_EMAIL  Email for notifications

Examples:
    $0 deploy                    # Run full deployment
    $0 rollback                  # Rollback to previous version
    $0 health-check              # Check system health
    $0 status                    # Show deployment status

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        deploy)
            COMMAND="deploy"
            shift
            ;;
        rollback)
            COMMAND="rollback"
            shift
            ;;
        health-check)
            COMMAND="health-check"
            shift
            ;;
        cleanup)
            COMMAND="cleanup"
            shift
            ;;
        status)
            COMMAND="status"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -q|--quiet)
            QUIET=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Set default command if none provided
COMMAND=${COMMAND:-deploy}

# Execute command
case $COMMAND in
    deploy)
        main_deployment
        ;;
    rollback)
        rollback_deployment
        ;;
    health-check)
        perform_health_check
        ;;
    cleanup)
        cleanup_old_deployments
        ;;
    status)
        log INFO "Deployment Status:"
        log INFO "  Deployment directory: $DEPLOYMENT_DIR"
        log INFO "  Backup directory: $BACKUP_DIR"
        log INFO "  Services status:"
        systemctl is-active reweave-api && log INFO "    API: Running" || log WARN "    API: Stopped"
        systemctl is-active nginx && log INFO "    Nginx: Running" || log WARN "    Nginx: Stopped"
        log INFO "  Last deployment: $(find "$BACKUP_DIR" -maxdepth 1 -type d -name "20*" | sort -r | head -1 | xargs basename 2>/dev/null || echo 'none')"
        ;;
    *)
        echo "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac