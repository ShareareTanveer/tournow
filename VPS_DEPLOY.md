# Metro Voyage — VPS Deployment Guide

## Stack
Next.js 15 · PostgreSQL · Node.js 22 · Nginx · PM2 · Ubuntu 22.04

---

## 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 22 (LTS)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install --legacy-peer-deps -g pm2

```

---

## 2. PostgreSQL Setup

```bash
sudo -u postgres psql

-- In psql:
CREATE DATABASE metrovoyage;
CREATE USER mvuser WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE metrovoyage TO mvuser;
\q
```

---

## 3. App Deployment

```bash
# Create app directory
sudo mkdir -p /var/www/metrovoyage
sudo chown $USER:$USER /var/www/metrovoyage

# Clone or upload your project
cd /var/www/metrovoyage
git clone https://github.com/ShareareTanveer/tournow.git .
# OR use scp/rsync to upload the folder

# Install dependencies
npm install --legacy-peer-deps

# Create .env file
nano .env
```

### .env (production)
```env
DATABASE_URL="postgresql://mvuser:your_strong_password@localhost:5432/metrovoyage"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
JWT_SECRET="generate-a-32-char-random-string-here"

# Email (use Gmail App Password or SMTP)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Metro Voyage <your@gmail.com>"
EMAIL_FROM_NAME="Metro Voyage"
ADMIN_EMAIL="admin@yourdomain.com"

# Stripe (get from stripe.com/dashboard)
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME="your_cloud"
CLOUDINARY_API_KEY="your_key"
CLOUDINARY_API_SECRET="your_secret"
```

```bash
# Push schema and seed
npx prisma db push
npx tsx prisma/seed.ts

# Build the app
npm run build

# Test it runs
npm start
```

---

## 4. PM2 Process Manager

```bash
# Start with PM2
pm2 start npm --name "metrovoyage" -- start

# Auto-restart on reboot
pm2 save
pm2 startup
# Run the command it outputs

# Useful PM2 commands
pm2 status
pm2 logs metrovoyage
pm2 restart metrovoyage
```

---

## 5. Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/metrovoyage
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Max upload size (for images)
    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
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

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/metrovoyage /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL Certificate (Free — Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew (already set up by certbot, verify with)
sudo certbot renew --dry-run
```

---

## 7. Stripe Webhook

In your Stripe dashboard → Developers → Webhooks:
- Add endpoint: `https://yourdomain.com/api/payments/webhook`
- Events to listen: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copy the signing secret → paste as `STRIPE_WEBHOOK_SECRET` in `.env`
- Restart: `pm2 restart metrovoyage`

---

## 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 9. Deploy Updates

```bash
cd /var/www/metrovoyage
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 restart metrovoyage
```

---

## 10. Quick Checklist

- [ ] Node 22 + PostgreSQL installed
- [ ] Database created and `.env` configured
- [ ] `prisma db push` + seed run
- [ ] `npm run build` succeeds
- [ ] PM2 running and saved
- [ ] Nginx configured and running
- [ ] SSL cert installed
- [ ] Stripe webhook registered
- [ ] Cloudinary configured for image uploads
- [ ] Admin login works at `/admin/login`

---

## Useful Commands

```bash
pm2 logs metrovoyage --lines 50   # View recent logs
pm2 monit                          # Live CPU/memory monitor
sudo systemctl status nginx        # Nginx status
sudo tail -f /var/log/nginx/error.log  # Nginx errors
npx prisma studio                  # DB GUI (run locally, not on VPS)
```
