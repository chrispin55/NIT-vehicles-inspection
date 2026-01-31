# 🚆 Railway.app Environment Variables Setup

## 🚨 **URGENT: Fix Database Connection Issue**

Your Railway.app deployment is failing because environment variables are not set correctly in the Railway.app dashboard.

## 📋 **Required Environment Variables**

Copy these exact values to your Railway.app project:

### **Step 1: Go to Railway.app Dashboard**
1. Open your Railway.app project
2. Click on your NIT ITVMS service
3. Go to "Variables" tab

### **Step 2: Add These Environment Variables**

```
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

DB_HOST=shuttle.proxy.rlwy.net
DB_PORT=35740
DB_NAME=railway
DB_USER=root
DB_PASSWORD=FYeDxMGArZDXDqBTYUivUysJiAbGqKtw

RAILWAY_DB_URL=mysql://root:FYeDxMGArZDXDqBTYUivUysJiAbGqKtw@shuttle.proxy.rlwy.net:35740/railway

JWT_SECRET=super_secret_jwt_key_for_nit_itvms_production_2024
JWT_EXPIRES_IN=7d

FRONTEND_URL=https://nit-itvms-production.railway.app

PORT=8080
```

### **Step 3: Save and Redeploy**
1. Click "Save Variables"
2. Railway.app will automatically redeploy
3. Wait for deployment to complete

## 🔍 **What Was Wrong:**

From your logs:
- ❌ Environment: `development` (should be `production`)
- ❌ Host: `localhost` (should be `shuttle.proxy.rlwy.net`)
- ❌ Port: `3306` (should be `35740`)
- ❌ Database: `nit_itvms` (should be `railway`)
- ❌ Connection string: `mysql://user:password@host:port/database` (should be your actual Railway.app URL)

## ✅ **After Fix:**

You should see logs like:
```
🚆 Using Railway.app database URL
✅ Database connection established successfully
📊 Environment: production
🔗 Database: railway
🌐 Host: shuttle.proxy.rlwy.net:35740
```

## 🚀 **Quick Copy-Paste:**

**Copy this entire block to Railway.app variables:**

```
NODE_ENV=production
RAILWAY_ENVIRONMENT=production
DB_HOST=shuttle.proxy.rlwy.net
DB_PORT=35740
DB_NAME=railway
DB_USER=root
DB_PASSWORD=FYeDxMGArZDXDqBTYUivUysJiAbGqKtw
RAILWAY_DB_URL=mysql://root:FYeDxMGArZDXDqBTYUivUysJiAbGqKtw@shuttle.proxy.rlwy.net:35740/railway
JWT_SECRET=super_secret_jwt_key_for_nit_itvms_production_2024
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://nit-itvms-production.railway.app
PORT=8080
```

## 📞 **If Still Failing:**

1. **Check Railway.app MySQL service** is running
2. **Verify the connection string** matches your Railway.app MySQL service
3. **Check Railway.app logs** for detailed error messages
4. **Contact Railway.app support** if database issues persist

---

**🎯 Once you set these variables, your deployment will work correctly!**
