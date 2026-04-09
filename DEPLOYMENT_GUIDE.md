# SchoolWallet Deployment Guide

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Development Deployment](#development-deployment)
3. [Production Deployment](#production-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Database Backup & Recovery](#database-backup--recovery)
6. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Pre-Deployment Checklist

### Security
- [ ] Change all default passwords
- [ ] Generate strong JWT secret
- [ ] Configure SSL/TLS certificates
- [ ] Set up firewall rules
- [ ] Enable HTTPS only
- [ ] Configure CORS properly
- [ ] Set strong database password
- [ ] Review API rate limits

### Configuration
- [ ] Set NODE_ENV to production
- [ ] Configure all environment variables
- [ ] Set up email/SMS providers
- [ ] Configure payment gateway
- [ ] Set database backup schedule
- [ ] Configure logging

### Testing
- [ ] Run all unit tests
- [ ] Perform security scan
- [ ] Load testing
- [ ] User acceptance testing
- [ ] Backup and restore testing

### Documentation
- [ ] Update API documentation
- [ ] Create runbook
- [ ] Document architecture
- [ ] Create troubleshooting guide

---

## Development Deployment

### Local Setup (Windows/Mac/Linux)

```bash
# 1. Install requirements
# - Node.js v14+
# - MySQL v5.7+
# - Git

# 2. Clone repository
git clone <repository-url>
cd "School system"

# 3. Frontend setup
# Serve using any HTTP server
# For testing: open index.html in browser

# 4. Backend setup
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with local database credentials

# 5. Database setup
mysql -u root -p -e "CREATE DATABASE schoolwallet;"
mysql -u root -p schoolwallet < database_schema.sql

# 6. Start development server
npm run dev

# Server runs on http://localhost:5000
```

---

## Production Deployment

### Option 1: VPS Deployment (Ubuntu 20.04+)

#### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install PM2 (process manager)
sudo npm install -g pm2

# Install SSL certificates (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 2: Database Setup
```bash
# Secure MySQL
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
mysql> CREATE DATABASE schoolwallet;
mysql> CREATE USER 'wallet_user'@'localhost' IDENTIFIED BY 'strong_password';
mysql> GRANT ALL PRIVILEGES ON schoolwallet.* TO 'wallet_user'@'localhost';
mysql> FLUSH PRIVILEGES;
mysql> EXIT;

# Import schema
mysql -u wallet_user -p schoolwallet < database_schema.sql
```

#### Step 3: Application Setup
```bash
# Clone and setup
cd /var/www
sudo git clone <repository-url>
cd "School system/backend"

# Install dependencies
sudo npm install --production

# Create production .env
sudo nano .env
# Add production configuration:
# NODE_ENV=production
# DB_USER=wallet_user
# DB_PASSWORD=strong_password
# JWT_SECRET=very-strong-secret-key
# ALLOWED_ORIGINS=https://yourdomain.com
```

#### Step 4: Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/schoolwallet

# Add following configuration:
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        root /var/www/"School system";
        try_files $uri $uri/ /index.html;
    }

    # API backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/schoolwallet /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

#### Step 5: SSL Certificate
```bash
# Generate SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

#### Step 6: Application Management with PM2
```bash
# Start application with PM2
cd /var/www/"School system"/backend
sudo pm2 start server.js --name "schoolwallet"

# Startup on boot
sudo pm2 startup
sudo pm2 save

# Monitor
sudo pm2 monit
```

#### Step 7: Backup Configuration
```bash
# Create backup directory
sudo mkdir -p /backups/schoolwallet

# Create backup script
sudo nano /usr/local/bin/backup-schoolwallet.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/schoolwallet"
DB_NAME="schoolwallet"
DB_USER="wallet_user"

# Database backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/db_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/db_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete

echo "Backup completed: db_$DATE.sql.gz"

# Make executable
sudo chmod +x /usr/local/bin/backup-schoolwallet.sh

# Schedule daily at 2 AM
sudo crontab -e
# Add line:
# 0 2 * * * /usr/local/bin/backup-schoolwallet.sh >> /var/log/schoolwallet-backup.log 2>&1
```

---

## Docker Deployment

### Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Install MySQL client
RUN apk add --no-cache mysql-client

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY backend/ .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/v1/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    container_name: schoolwallet-db
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: schoolwallet
      MYSQL_USER: wallet_user
      MYSQL_PASSWORD: wallet_password
    volumes:
      - db_data:/var/lib/mysql
      - ./backend/database_schema.sql:/docker-entrypoint-initdb.d/schema.sql
    ports:
      - "3306:3306"
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  app:
    build: .
    container_name: schoolwallet-app
    environment:
      NODE_ENV: production
      DB_HOST: mysql
      DB_USER: wallet_user
      DB_PASSWORD: wallet_password
      DB_NAME: schoolwallet
      JWT_SECRET: your-secret-key
    ports:
      - "5000:5000"
    depends_on:
      mysql:
        condition: service_healthy
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped

  nginx:
    image: nginx:latest
    container_name: schoolwallet-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
      - ./School\ system:/var/www/schoolwallet:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  db_data:
```

### Deploy with Docker
```bash
# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop containers
docker-compose down
```

---

## Database Backup & Recovery

### Automated Backup
```bash
# Daily backup at 2 AM
0 2 * * * mysqldump -u wallet_user -ppassword schoolwallet | gzip > /backups/schoolwallet_$(date +\%Y\%m\%d).sql.gz
```

### Manual Backup
```bash
# Full backup
mysqldump -u wallet_user -p schoolwallet > schoolwallet_backup.sql

# Backup with stored procedures
mysqldump -u wallet_user -p --routines schoolwallet > schoolwallet_backup.sql

# Backup compressed
mysqldump -u wallet_user -p schoolwallet | gzip > schoolwallet_backup.sql.gz
```

### Recovery
```bash
# Restore from backup
mysql -u wallet_user -p schoolwallet < schoolwallet_backup.sql

# Restore from compressed backup
gunzip < schoolwallet_backup.sql.gz | mysql -u wallet_user -p schoolwallet
```

---

## Monitoring & Maintenance

### PM2 Monitoring
```bash
# Monitor in real-time
pm2 monit

# Get logs
pm2 logs schoolwallet

# Restart app
pm2 restart schoolwallet

# Stop app
pm2 stop schoolwallet

# Start app
pm2 start schoolwallet
```

### System Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop
sudo apt install -y nethogs

# Monitor resources
htop

# Monitor network
nethogs
```

### Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/schoolwallet

/var/log/schoolwallet/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 nodejs nodejs
    sharedscripts
    postrotate
        pm2 restart schoolwallet
    endscript
}
```

### Health Checks
```bash
# Check application
curl http://localhost:5000/api/v1/health

# Check database
mysql -u wallet_user -p -e "SELECT 1"

# Check Nginx
sudo systemctl status nginx
```

---

## Performance Optimization

### Database Optimization
```sql
-- Add indexes for frequently queried columns
ALTER TABLE transactions ADD INDEX idx_wallet_created (wallet_id, created_at);
ALTER TABLE withdrawals ADD INDEX idx_student_status (student_id, status);

-- Analyze query performance
ANALYZE TABLE users, wallets, transactions;

-- Enable query cache (if not using MySQL 8.0+)
SET GLOBAL query_cache_size = 268435456;
```

### Caching Strategy
- Use Redis for session storage
- Cache user data
- Cache balance information
- Implement query result caching

### Load Balancing
```nginx
# Nginx upstream configuration
upstream backend {
    server app1:5000;
    server app2:5000;
    server app3:5000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
}
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs schoolwallet

# Check port availability
lsof -i :5000

# Check Node.js
node -v
npm -v
```

### Database connection issues
```bash
# Test connection
mysql -u wallet_user -p schoolwallet -e "SELECT 1"

# Check MySQL status
sudo systemctl status mysql

# Check slow queries
mysql -u wallet_user -p -e "SHOW PROCESSLIST" schoolwallet
```

### High memory usage
```bash
# Monitor memory
free -h
ps aux | grep node

# Enable garbage collection
NODE_OPTIONS="--max-old-space-size=512" pm2 start server.js
```

---

## Security Hardening

```bash
# Firewall setup (UFW)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3306/tcp from localhost
sudo ufw enable

# Fail2Ban (prevent brute force)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban

# SSH hardening
sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

---

## Maintenance Schedule

- **Daily**: Database backups, log rotation
- **Weekly**: Security updates review, performance analysis
- **Monthly**: Database optimization, capacity planning
- **Quarterly**: Security audit, disaster recovery testing
- **Annually**: Full system review, compliance audit

---

**Last Updated**: 2026-03-07  
**Status**: Ready for Production
