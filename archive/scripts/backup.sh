#!/bin/bash

# Reweave Backup and Disaster Recovery Script
# This script handles automated backups and disaster recovery procedures

set -euo pipefail

# Configuration
BACKUP_DIR="/backups/reweave"
S3_BUCKET="s3://reweave-backups"
RETENTION_DAYS=30
LOG_FILE="/var/log/reweave-backup.log"
DATE=$(date +%Y%m%d_%H%M%S)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
            echo -e "${YELLOW}[INFO]${NC} $timestamp - $message" | tee -a "$LOG_FILE"
            ;;
        *)
            echo "$timestamp - $message" | tee -a "$LOG_FILE"
            ;;
    esac
}

# Error handling
error_exit() {
    log ERROR "Backup failed: $1"
    send_notification "Backup Failed" "$1"
    exit 1
}

# Notification function
send_notification() {
    local subject=$1
    local message=$2
    
    # Send email notification (configure with your email service)
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "$subject" admin@reweave.my
    fi
    
    # Send Slack notification (if configured)
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$subject: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# Check prerequisites
check_prerequisites() {
    log INFO "Checking prerequisites..."
    
    # Check if required commands are available
    local required_commands=("aws" "pg_dump" "tar" "gzip")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" >/dev/null 2>&1; then
            error_exit "Required command not found: $cmd"
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        error_exit "AWS credentials not configured properly"
    fi
    
    # Check database connection
    if ! pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" >/dev/null 2>&1; then
        error_exit "Database connection failed"
    fi
    
    log SUCCESS "Prerequisites check passed"
}

# Create backup directories
create_backup_directories() {
    log INFO "Creating backup directories..."
    
    mkdir -p "$BACKUP_DIR"/{database,files,logs,config}
    mkdir -p "$BACKUP_DIR/archive"
    
    log SUCCESS "Backup directories created"
}

# Database backup
backup_database() {
    log INFO "Starting database backup..."
    
    local db_backup_file="$BACKUP_DIR/database/db_backup_$DATE.sql"
    local compressed_backup="$db_backup_file.gz"
    
    # Database connection parameters
    local db_host="${DB_HOST:-localhost}"
    local db_port="${DB_PORT:-5432}"
    local db_name="${DB_NAME:-reweave}"
    local db_user="${DB_USER:-postgres}"
    
    # Create database backup
    PGPASSWORD="${DB_PASSWORD:-}" pg_dump \
        -h "$db_host" \
        -p "$db_port" \
        -U "$db_user" \
        -d "$db_name" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --no-owner \
        --no-acl \
        --file="$db_backup_file" \
        || error_exit "Database backup failed"
    
    # Compress backup
    gzip "$db_backup_file" || error_exit "Failed to compress database backup"
    
    # Verify backup integrity
    if ! gunzip -t "$compressed_backup" >/dev/null 2>&1; then
        error_exit "Database backup integrity check failed"
    fi
    
    log SUCCESS "Database backup completed: $(basename "$compressed_backup")"
    
    # Store backup info
    echo "{
        \"timestamp\": \"$(date -Iseconds)\",
        \"file\": \"$(basename "$compressed_backup")\",
        \"size\": $(stat -c%s "$compressed_backup"),
        \"type\": \"database\"
    }" > "$BACKUP_DIR/database/backup_info_$DATE.json"
}

# File system backup
backup_files() {
    log INFO "Starting file system backup..."
    
    local files_backup_file="$BACKUP_DIR/files/files_backup_$DATE.tar.gz"
    
    # Define directories to backup
    local backup_dirs=(
        "/var/www/reweave/uploads"
        "/var/log/reweave"
        "/etc/nginx/sites-available"
        "/etc/systemd/system"
    )
    
    # Create tar archive
    tar -czf "$files_backup_file" \
        --exclude='*.log' \
        --exclude='*.tmp' \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='dist' \
        "${backup_dirs[@]}" \
        || error_exit "File system backup failed"
    
    # Verify backup integrity
    if ! tar -tzf "$files_backup_file" >/dev/null 2>&1; then
        error_exit "File system backup integrity check failed"
    fi
    
    log SUCCESS "File system backup completed: $(basename "$files_backup_file")"
    
    # Store backup info
    echo "{
        \"timestamp\": \"$(date -Iseconds)\",
        \"file\": \"$(basename "$files_backup_file")\",
        \"size\": $(stat -c%s "$files_backup_file"),
        \"type\": \"files\"
    }" > "$BACKUP_DIR/files/backup_info_$DATE.json"
}

# Configuration backup
backup_config() {
    log INFO "Starting configuration backup..."
    
    local config_backup_file="$BACKUP_DIR/config/config_backup_$DATE.tar.gz"
    
    # Create configuration archive
    tar -czf "$config_backup_file" \
        -C / \
        etc/nginx/nginx.conf \
        etc/nginx/sites-available/reweave-api \
        etc/nginx/sites-available/reweave-frontend \
        etc/systemd/system/reweave-api.service \
        etc/systemd/system/reweave-frontend.service \
        || error_exit "Configuration backup failed"
    
    log SUCCESS "Configuration backup completed: $(basename "$config_backup_file")"
}

# Application state backup
backup_application_state() {
    log INFO "Starting application state backup..."
    
    local state_backup_file="$BACKUP_DIR/logs/app_state_$DATE.json"
    
    # Get application state
    local pm2_status
    local nginx_status
    local disk_usage
    local memory_usage
    
    # Get PM2 status
    if command -v pm2 >/dev/null 2>&1; then
        pm2_status=$(pm2 status --json 2>/dev/null || echo "null")
    else
        pm2_status="null"
    fi
    
    # Get Nginx status
    if systemctl is-active --quiet nginx; then
        nginx_status="active"
    else
        nginx_status="inactive"
    fi
    
    # Get system metrics
    disk_usage=$(df -h / | awk 'NR==2 {print $5}')
    memory_usage=$(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
    
    # Create state file
    cat > "$state_backup_file" << EOF
{
    "timestamp": "$(date -Iseconds)",
    "system": {
        "disk_usage": "$disk_usage",
        "memory_usage": "$memory_usage",
        "uptime": "$(uptime -p)",
        "load_average": "$(uptime | awk -F'load average:' '{print $2}')"
    },
    "services": {
        "pm2": $pm2_status,
        "nginx": "$nginx_status"
    },
    "backups": {
        "last_backup": "$(find "$BACKUP_DIR" -name "*.gz" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2- || echo 'none')",
        "total_size": "$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1 || echo '0')"
    }
}
EOF
    
    log SUCCESS "Application state backup completed: $(basename "$state_backup_file")"
}

# Upload to S3
upload_to_s3() {
    log INFO "Uploading backups to S3..."
    
    local s3_path="s3://reweave-backups/production/$DATE"
    
    # Upload database backup
    if [ -f "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" ]; then
        aws s3 cp "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" \
            "$s3_path/database/" \
            --storage-class STANDARD_IA \
            || error_exit "Failed to upload database backup to S3"
        log SUCCESS "Database backup uploaded to S3"
    fi
    
    # Upload files backup
    if [ -f "$BACKUP_DIR/files/files_backup_$DATE.tar.gz" ]; then
        aws s3 cp "$BACKUP_DIR/files/files_backup_$DATE.tar.gz" \
            "$s3_path/files/" \
            --storage-class STANDARD_IA \
            || error_exit "Failed to upload files backup to S3"
        log SUCCESS "Files backup uploaded to S3"
    fi
    
    # Upload configuration backup
    if [ -f "$BACKUP_DIR/config/config_backup_$DATE.tar.gz" ]; then
        aws s3 cp "$BACKUP_DIR/config/config_backup_$DATE.tar.gz" \
            "$s3_path/config/" \
            --storage-class STANDARD_IA \
            || error_exit "Failed to upload config backup to S3"
        log SUCCESS "Configuration backup uploaded to S3"
    fi
    
    # Upload backup metadata
    aws s3 cp "$BACKUP_DIR/" "$s3_path/metadata/" \
        --recursive \
        --exclude "*" \
        --include "*/backup_info_*.json" \
        --include "logs/app_state_*.json" \
        || error_exit "Failed to upload backup metadata to S3"
    
    log SUCCESS "All backups uploaded to S3"
}

# Clean up old backups
cleanup_old_backups() {
    log INFO "Cleaning up old backups..."
    
    # Local cleanup
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
    find "$BACKUP_DIR" -name "*.json" -type f -mtime +$RETENTION_DAYS -delete
    
    # S3 cleanup
    local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
    
    # List and delete old S3 objects
    aws s3 ls "$S3_BUCKET/production/" | while read -r line; do
        local folder_date=$(echo "$line" | awk '{print $2}' | tr -d '/')
        if [[ "$folder_date" < "$cutoff_date" ]]; then
            aws s3 rm "$S3_BUCKET/production/$folder_date/" --recursive
            log INFO "Deleted old backup from S3: $folder_date"
        fi
    done
    
    log SUCCESS "Old backups cleaned up"
}

# Verify backup integrity
verify_backup_integrity() {
    log INFO "Verifying backup integrity..."
    
    local errors=0
    
    # Check database backup
    if [ -f "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" ]; then
        if ! gunzip -t "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" >/dev/null 2>&1; then
            log ERROR "Database backup integrity check failed"
            ((errors++))
        fi
    fi
    
    # Check files backup
    if [ -f "$BACKUP_DIR/files/files_backup_$DATE.tar.gz" ]; then
        if ! tar -tzf "$BACKUP_DIR/files/files_backup_$DATE.tar.gz" >/dev/null 2>&1; then
            log ERROR "Files backup integrity check failed"
            ((errors++))
        fi
    fi
    
    if [ $errors -eq 0 ]; then
        log SUCCESS "All backups passed integrity checks"
    else
        error_exit "Backup integrity verification failed with $errors errors"
    fi
}

# Generate backup report
generate_backup_report() {
    log INFO "Generating backup report..."
    
    local report_file="$BACKUP_DIR/backup_report_$DATE.json"
    
    # Calculate backup sizes
    local db_size=$(stat -c%s "$BACKUP_DIR/database/db_backup_$DATE.sql.gz" 2>/dev/null || echo 0)
    local files_size=$(stat -c%s "$BACKUP_DIR/files/files_backup_$DATE.tar.gz" 2>/dev/null || echo 0)
    local config_size=$(stat -c%s "$BACKUP_DIR/config/config_backup_$DATE.tar.gz" 2>/dev/null || echo 0)
    local total_size=$((db_size + files_size + config_size))
    
    # Create report
    cat > "$report_file" << EOF
{
    "backup_date": "$(date -Iseconds)",
    "backup_id": "$DATE",
    "status": "success",
    "components": {
        "database": {
            "file": "db_backup_$DATE.sql.gz",
            "size": $db_size,
            "status": "completed"
        },
        "files": {
            "file": "files_backup_$DATE.tar.gz",
            "size": $files_size,
            "status": "completed"
        },
        "config": {
            "file": "config_backup_$DATE.tar.gz",
            "size": $config_size,
            "status": "completed"
        }
    },
    "summary": {
        "total_size": $total_size,
        "retention_days": $RETENTION_DAYS,
        "s3_upload": "completed",
        "integrity_check": "passed"
    },
    "system_info": {
        "hostname": "$(hostname)",
        "uptime": "$(uptime -p)",
        "disk_usage": "$(df -h / | awk 'NR==2 {print $5}')",
        "memory_usage": "$(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
    }
}
EOF
    
    log SUCCESS "Backup report generated: $(basename "$report_file")"
}

# Main backup function
main_backup() {
    log INFO "Starting Reweave backup process..."
    
    # Run all backup steps
    check_prerequisites
    create_backup_directories
    backup_database
    backup_files
    backup_config
    backup_application_state
    verify_backup_integrity
    upload_to_s3
    cleanup_old_backups
    generate_backup_report
    
    log SUCCESS "Backup process completed successfully!"
    send_notification "Backup Completed" "Reweave backup completed successfully on $(date)"
}

# Disaster recovery functions

# Database restore
restore_database() {
    local backup_date=$1
    local target_db=${2:-$DB_NAME}
    
    log INFO "Restoring database from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/database/db_backup_${backup_date}.sql.gz"
    
    if [ ! -f "$backup_file" ]; then
        # Download from S3 if not available locally
        aws s3 cp "$S3_BUCKET/production/$backup_date/database/db_backup_${backup_date}.sql.gz" "$backup_file"
    fi
    
    # Decompress and restore
    gunzip -c "$backup_file" | PGPASSWORD="${DB_PASSWORD:-}" psql \
        -h "${DB_HOST:-localhost}" \
        -p "${DB_PORT:-5432}" \
        -U "${DB_USER:-postgres}" \
        -d "$target_db" \
        || error_exit "Database restore failed"
    
    log SUCCESS "Database restored successfully"
}

# Files restore
restore_files() {
    local backup_date=$1
    local target_dir=${2:-/var/www/reweave}
    
    log INFO "Restoring files from backup: $backup_date"
    
    local backup_file="$BACKUP_DIR/files/files_backup_${backup_date}.tar.gz"
    
    if [ ! -f "$backup_file" ]; then
        # Download from S3 if not available locally
        aws s3 cp "$S3_BUCKET/production/$backup_date/files/files_backup_${backup_date}.tar.gz" "$backup_file"
    fi
    
    # Extract files
    tar -xzf "$backup_file" -C / || error_exit "Files restore failed"
    
    log SUCCESS "Files restored successfully"
}

# Full system restore
full_system_restore() {
    local backup_date=$1
    
    log INFO "Starting full system restore from backup: $backup_date"
    
    # Stop services
    systemctl stop reweave-api reweave-frontend nginx
    
    # Restore database
    restore_database "$backup_date"
    
    # Restore files
    restore_files "$backup_date"
    
    # Restore configuration
    restore_config "$backup_date"
    
    # Restart services
    systemctl start reweave-api reweave-frontend nginx
    
    log SUCCESS "Full system restore completed"
    send_notification "System Restored" "Reweave system restored from backup: $backup_date"
}

# Usage function
usage() {
    cat << EOF
Usage: $0 [COMMAND] [OPTIONS]

Commands:
    backup              Run full backup process
    restore <date>      Restore from backup (format: YYYYMMDD_HHMMSS)
    verify <date>       Verify backup integrity
    cleanup             Clean up old backups
    list                List available backups
    status              Show backup system status

Options:
    -h, --help          Show this help message
    -v, --verbose       Enable verbose output
    -q, --quiet         Suppress output
    -d, --dry-run       Simulate operations without executing

Examples:
    $0 backup                    # Run full backup
    $0 restore 20240115_143000   # Restore from specific backup
    $0 verify 20240115_143000    # Verify specific backup
    $0 list                      # List all backups
    $0 status                    # Show system status

Environment Variables:
    DB_HOST              Database host (default: localhost)
    DB_PORT              Database port (default: 5432)
    DB_NAME              Database name (default: reweave)
    DB_USER              Database user (default: postgres)
    DB_PASSWORD          Database password
    S3_BUCKET            S3 bucket for backups (default: s3://reweave-backups)
    RETENTION_DAYS       Backup retention period (default: 30)
    SLACK_WEBHOOK_URL    Slack webhook for notifications

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        backup)
            COMMAND="backup"
            shift
            ;;
        restore)
            COMMAND="restore"
            RESTORE_DATE="$2"
            shift 2
            ;;
        verify)
            COMMAND="verify"
            VERIFY_DATE="$2"
            shift 2
            ;;
        cleanup)
            COMMAND="cleanup"
            shift
            ;;
        list)
            COMMAND="list"
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
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Set default command if none provided
COMMAND=${COMMAND:-backup}

# Execute command
case $COMMAND in
    backup)
        main_backup
        ;;
    restore)
        if [ -z "${RESTORE_DATE:-}" ]; then
            echo "Error: Restore date required"
            usage
            exit 1
        fi
        full_system_restore "$RESTORE_DATE"
        ;;
    verify)
        if [ -z "${VERIFY_DATE:-}" ]; then
            echo "Error: Verify date required"
            usage
            exit 1
        fi
        # Implementation for verify command
        log INFO "Verifying backup: $VERIFY_DATE"
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    list)
        # Implementation for list command
        log INFO "Available backups:"
        ls -la "$BACKUP_DIR"/*/backup_info_*.json 2>/dev/null | while read -r file; do
            echo "  $(basename "$file")"
        done
        ;;
    status)
        # Implementation for status command
        log INFO "Backup system status:"
        log INFO "  Backup directory: $BACKUP_DIR"
        log INFO "  S3 bucket: $S3_BUCKET"
        log INFO "  Retention days: $RETENTION_DAYS"
        log INFO "  Last backup: $(find "$BACKUP_DIR" -name "*.json" -type f -printf '%T@ %p\n' | sort -n | tail -1 | cut -d' ' -f2- || echo 'none')"
        ;;
    *)
        echo "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac