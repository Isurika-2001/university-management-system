# Production Deployment Guide

## ⚠️ Current Setup vs Production

### ❌ Development Mode (Current)
```bash
# Server - Development
npm run dev    # Uses nodemon (auto-restart, not optimized)

# Client - Development  
npm start      # Development server (not optimized, includes dev tools)
```

### ✅ Production Mode (Required)
```bash
# Server - Production
NODE_ENV=production npm start    # Uses node (optimized, no auto-restart)

# Client - Production
npm run build                    # Creates optimized production build
# Then serve the 'build' folder with a web server
```

---

## 🚀 Production Deployment Steps

### Step 1: Server Production Setup

#### Option A: Using PM2 (Recommended for VPS/Dedicated Server)

1. **Install PM2**:
   ```bash
   npm install -g pm2
   ```

2. **Create PM2 ecosystem file** (`server/ecosystem.config.js`):
   ```javascript
   module.exports = {
     apps: [{
       name: 'ums-server',
       script: './index.js',
       instances: 2,  // Use 2 instances for load balancing
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: './logs/pm2-error.log',
       out_file: './logs/pm2-out.log',
       log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
       merge_logs: true,
       autorestart: true,
       max_memory_restart: '1G'
     }]
   };
   ```

3. **Start with PM2**:
   ```bash
   cd server
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup  # Auto-start on server reboot
   ```

#### Option B: Using Node Directly (Simple)

```bash
cd server
NODE_ENV=production npm start
```

#### Option C: Using Vercel (Serverless - Already Configured)

Your `vercel.json` is already set up. Just deploy:
```bash
cd server
vercel --prod
```

---

### Step 2: Client Production Build

1. **Set production API URL**:
   ```bash
   cd client
   # Edit .env or create .env.production
   REACT_APP_API_URL=https://your-api-domain.com/api/
   ```

2. **Build production version**:
   ```bash
   npm run build
   ```
   This creates an optimized `build/` folder.

3. **Test the build locally** (optional):
   ```bash
   # Install serve globally
   npm install -g serve
   
   # Serve the build
   serve -s build -l 3000
   ```

---

### Step 3: Serve Client Build

#### Option A: Using Nginx (Recommended)

1. **Install Nginx**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nginx
   
   # CentOS/RHEL
   sudo yum install nginx
   ```

2. **Configure Nginx** (`/etc/nginx/sites-available/ums`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       # Redirect HTTP to HTTPS
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       # SSL certificates (use Let's Encrypt)
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       # Security headers
       add_header X-Frame-Options "DENY" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header X-XSS-Protection "1; mode=block" always;
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       
       # Serve React app
       root /var/www/ums/build;
       index index.html;
       
       # Handle React Router
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Proxy API requests to backend
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Enable site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ums /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

#### Option B: Using Apache

1. **Install Apache**:
   ```bash
   sudo apt install apache2
   ```

2. **Configure Apache** (`/etc/apache2/sites-available/ums.conf`):
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       Redirect permanent / https://your-domain.com/
   </VirtualHost>
   
   <VirtualHost *:443>
       ServerName your-domain.com
       
       DocumentRoot /var/www/ums/build
       
       <Directory /var/www/ums/build>
           Options -Indexes +FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>
       
       # Proxy API requests
       ProxyPass /api http://localhost:5000/api
       ProxyPassReverse /api http://localhost:5000/api
       
       # SSL Configuration
       SSLEngine on
       SSLCertificateFile /etc/letsencrypt/live/your-domain.com/fullchain.pem
       SSLCertificateKeyFile /etc/letsencrypt/live/your-domain.com/privkey.pem
   </VirtualHost>
   ```

#### Option C: Using Vercel/Netlify (Serverless)

**Vercel**:
```bash
cd client
npm install -g vercel
vercel --prod
```

**Netlify**:
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `build`

---

### Step 4: SSL Certificate (HTTPS - REQUIRED)

**Using Let's Encrypt (Free)**:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already set up by certbot)
sudo certbot renew --dry-run
```

---

## 📋 Production Checklist

### Before Deployment

- [ ] **Environment Variables Set**:
  ```bash
  NODE_ENV=production
  MONGO_URI=<production-mongodb-uri>
  JWT_SECRET=<strong-random-secret-min-32-chars>
  CORS_ORIGIN=https://your-frontend-domain.com
  PORT=5000
  ```

- [ ] **Dependencies Updated**:
  ```bash
  npm audit fix
  ```

- [ ] **Production Build Created**:
  ```bash
  cd client && npm run build
  ```

- [ ] **Security Tests Passed** (see SECURITY_TESTING_CHECKLIST.md)

### Deployment

- [ ] **Server Running in Production Mode**
- [ ] **Client Build Deployed**
- [ ] **HTTPS Enabled** (SSL certificate installed)
- [ ] **Domain Configured** (DNS pointing to server)
- [ ] **Firewall Configured** (only ports 80, 443 open)
- [ ] **Database Backed Up**
- [ ] **Monitoring Set Up** (optional but recommended)

### After Deployment

- [ ] **Test Login/Logout**
- [ ] **Test All Major Features**
- [ ] **Check Error Logs**
- [ ] **Monitor Performance**
- [ ] **Test Security Headers** (https://securityheaders.com/)

---

## 🔧 Production Environment Variables

Create `.env` file in server directory:

```env
# Server
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/ums?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-super-secret-random-string-minimum-32-characters-long
JWT_EXPIRES_IN=24h
JWT_VERSION=1

# CORS
CORS_ORIGIN=https://your-frontend-domain.com

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

**Generate Strong JWT_SECRET**:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 🚨 Common Production Issues

### Issue 1: CORS Errors
**Solution**: Ensure `CORS_ORIGIN` matches your frontend domain exactly (including https://)

### Issue 2: Cookies Not Working
**Solution**: 
- Ensure HTTPS is enabled
- Check `secure: true` in cookie settings
- Verify `sameSite: 'none'` for cross-origin

### Issue 3: Build Fails
**Solution**:
```bash
# Clear cache and rebuild
cd client
rm -rf node_modules build
npm install
npm run build
```

### Issue 4: Server Crashes
**Solution**: Use PM2 for auto-restart:
```bash
pm2 start ecosystem.config.js
pm2 logs  # Check logs
```

---

## 📊 Monitoring (Free Options)

### 1. PM2 Monitoring
```bash
pm2 monit
```

### 2. Uptime Monitoring
- **UptimeRobot** (Free): https://uptimerobot.com/
- **Pingdom** (Free tier): https://www.pingdom.com/

### 3. Error Tracking
- **Sentry** (Free tier): https://sentry.io/
- **LogRocket** (Free tier): https://logrocket.com/

---

## ✅ Final Production Commands

### Server
```bash
cd server
NODE_ENV=production npm start
# OR with PM2
pm2 start ecosystem.config.js
```

### Client
```bash
cd client
npm run build
# Then serve the build/ folder with Nginx/Apache
```

---

## 🎯 Quick Production Setup Script

Create `deploy-production.sh`:

```bash
#!/bin/bash

echo "🚀 Production Deployment"
echo "======================="

# 1. Server
echo "1. Setting up server..."
cd server
npm install --production
NODE_ENV=production npm start &

# 2. Client
echo "2. Building client..."
cd ../client
npm install
npm run build
echo "✅ Build complete! Deploy the 'build' folder"

echo "======================="
echo "✅ Deployment complete!"
```

Make executable:
```bash
chmod +x deploy-production.sh
```

---

## 📝 Post-Deployment Verification

1. **Health Check**:
   ```bash
   curl https://your-api.com/health
   ```

2. **Security Headers**:
   ```bash
   curl -I https://your-domain.com
   ```

3. **Test Login**:
   - Open https://your-domain.com
   - Try logging in
   - Verify cookies are set

4. **Check Logs**:
   ```bash
   # PM2
   pm2 logs
   
   # Or server logs
   tail -f server/logs/*.log
   ```

---

**Remember**: Always test in a staging environment first before deploying to production!

