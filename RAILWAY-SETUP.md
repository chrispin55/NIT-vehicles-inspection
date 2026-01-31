# 🚆 Railway.app Deployment Guide for NIT ITVMS

## 📋 Environment Configuration

### **Step 1: Create Your .env File**
Copy the content from `env-template.txt` to create your `.env` file:

```bash
# Create .env file in project root
cp env-template.txt .env
```

### **Step 2: Local Development Settings**
Edit your `.env` file for local development:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Local)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nit_itvms
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Configuration
JWT_SECRET=your_local_secret_key
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

## 🚀 Railway.app Deployment

### **Step 3: Add MySQL Service in Railway.app**
1. Go to your Railway.app project
2. Click "New Service" → "Add MySQL"
3. Wait for MySQL to be provisioned

### **Step 4: Set Railway.app Environment Variables**
In Railway.app dashboard, set these environment variables:

```env
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

# Database (Railway will provide these automatically)
DB_HOST=${{MYSQLHOST}}
DB_PORT=${{MYSQLPORT}}
DB_NAME=${{MYSQLDATABASE}}
DB_USER=${{MYSQLUSER}}
DB_PASSWORD=${{MYSQLPASSWORD}}

# JWT (Set your own secure secret)
JWT_SECRET=your_production_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS (Update with your Railway.app URL)
FRONTEND_URL=https://your-app-name.railway.app
```

### **Step 5: Deploy Your Application**
1. Connect your GitHub repository to Railway.app
2. Railway.app will automatically detect and deploy
3. Monitor the deployment logs

## 🔧 Database Setup

### **Local Database Setup**
```bash
# Create database using the schema
mysql -u root -p nit_itvms < database/schema.sql
```

### **Railway.app Database Setup**
The database schema will be automatically created. You can run:

```sql
-- Run this in Railway.app MySQL console
-- Or the schema will be applied automatically on first startup
```

## 🌐 Accessing Your Application

### **Local Development**
- Frontend: http://localhost:3000/index.html
- API: http://localhost:3000/api/
- Health Check: http://localhost:3000/health

### **Railway.app Production**
- Frontend: https://your-app-name.railway.app/index.html
- API: https://your-app-name.railway.app/api/
- Health Check: https://your-app-name.railway.app/health

## 🛠️ Troubleshooting

### **Common Issues**

1. **Database Connection Error**
   - Check environment variables
   - Ensure MySQL is running locally
   - Verify Railway.app MySQL service is active

2. **CORS Issues**
   - Update FRONTEND_URL environment variable
   - Check Railway.app URL in CORS settings

3. **Build Failures**
   - Check package.json dependencies
   - Verify all files are committed to Git
   - Review Railway.app build logs

### **Environment Variable Reference**

| Variable | Local | Railway.app | Description |
|----------|-------|-------------|-------------|
| NODE_ENV | development | production | Environment mode |
| DB_HOST | localhost | ${{MYSQLHOST}} | Database host |
| DB_PORT | 3306 | ${{MYSQLPORT}} | Database port |
| DB_NAME | nit_itvms | ${{MYSQLDATABASE}} | Database name |
| DB_USER | root | ${{MYSQLUSER}} | Database user |
| DB_PASSWORD | your_pass | ${{MYSQLPASSWORD}} | Database password |
| JWT_SECRET | local_secret | production_secret | JWT signing key |

## 🔄 Auto-Deployment

Your application is configured for:
- **Auto-deployment** on Git push
- **Health checks** every 100 seconds
- **Auto-restart** on failure (max 10 retries)
- **Zero-downtime** deployments

## 📊 Monitoring

- Check Railway.app dashboard for logs
- Monitor `/health` endpoint
- Review database performance metrics
- Track API response times

---

**🎉 Your NIT ITVMS is ready for Railway.app deployment!**
