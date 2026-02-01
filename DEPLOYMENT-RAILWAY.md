# Railway Deployment Guide for NIT ITVMS

This guide will help you deploy the NIT University Integrated Transport & Vehicle Management System (ITVMS) on Railway with their managed MySQL database service.

## 🚀 Quick Deployment

### 1. Prerequisites
- Railway account (https://railway.app)
- GitHub account
- Git installed locally

### 2. Deploy to Railway

#### Option A: GitHub Integration (Recommended)
1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - NIT ITVMS"
   git branch -M main
   git remote add origin https://github.com/your-username/nit-itvms.git
   git push -u origin main
   ```

2. **Deploy on Railway**
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect the Node.js application

#### Option B: Railway CLI
1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

### 3. Database Setup

#### Automatic Database Creation
Railway will automatically create a MySQL database when you deploy. The database schema will be created automatically using the `schema-railway.sql` file.

#### Manual Database Setup (if needed)
1. Go to your Railway project dashboard
2. Add a new MySQL service
3. Once created, go to the MySQL service settings
4. Click "Connect" to get connection details
5. Railway will automatically set the environment variables

### 4. Environment Variables

Railway automatically sets these variables:
- `RAILWAY_PRIVATE_DOMAIN` - Database host
- `RAILWAY_TCP_PORT` - Database port
- `MYSQLDATABASE` - Database name
- `MYSQLUSER` - Database username
- `MYSQLPASSWORD` - Database password

#### Required Environment Variables
Set these in your Railway project settings:

**Security Variables:**
```
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
MYSQL_ROOT_PASSWORD=your_mysql_root_password
```

**Optional Variables:**
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 5. Configuration Files

The project includes Railway-specific configuration:

- `railway.toml` - Railway deployment configuration
- `server-railway.js` - Railway-optimized server
- `database-railway.js` - Railway database connection
- `schema-railway.sql` - Database schema for Railway

## 🔧 Configuration Details

### Railway Configuration (`railway.toml`)
```toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Database Connection
The Railway database connection automatically:
- Uses Railway's internal networking
- Handles SSL connections
- Manages connection pooling
- Includes retry logic

### Health Check
Railway monitors your application at `/api/health` endpoint to ensure it's running properly.

## 🌐 Accessing Your Application

After deployment:

1. **Application URL**: Provided by Railway (e.g., `https://your-app-name.up.railway.app`)
2. **API Base URL**: `https://your-app-name.up.railway.app/api`
3. **Health Check**: `https://your-app-name.up.railway.app/api/health`

## 🔐 Default Login Credentials

- **Admin**: username `admin`, password `password`
- **Manager**: username `jmanager`, password `password`

**⚠️ Important**: Change these passwords immediately after first login!

## 📊 Monitoring and Logs

### Viewing Logs
1. Go to your Railway project dashboard
2. Select your application service
3. Click "Logs" tab to view real-time logs

### Monitoring
1. Go to the "Metrics" tab
2. Monitor CPU, memory, and network usage
3. Set up alerts if needed

### Database Management
1. Go to your MySQL service
2. Use the built-in query editor or connect externally
3. View database statistics and performance

## 🔄 Updating Your Application

### Automatic Updates (GitHub Integration)
1. Push changes to your GitHub repository
2. Railway will automatically redeploy

### Manual Updates
```bash
git add .
git commit -m "Update application"
git push
```

Or using Railway CLI:
```bash
railway up
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
**Solution**: 
- Check if MySQL service is running
- Verify environment variables are set correctly
- Check logs for specific error messages

#### 2. Application Not Starting
**Solution**:
- Check build logs in Railway dashboard
- Ensure all dependencies are in `package.json`
- Verify `start` script points to `server-railway.js`

#### 3. CORS Errors
**Solution**:
- Ensure `PUBLIC_URL` environment variable is set
- Check CORS configuration in `server-railway.js`

#### 4. Health Check Failing
**Solution**:
- Access `/api/health` endpoint directly
- Check if server is listening on correct port (3000)

### Environment Variable Issues
```bash
# Check current environment variables
railway variables list

# Set missing variables
railway variables set JWT_SECRET=your_secret_key
```

### Database Schema Issues
If database schema doesn't create automatically:
1. Connect to Railway MySQL service
2. Run the `schema-railway.sql` file manually
3. Check for any SQL errors

## 📈 Performance Optimization

### Database Optimization
- The schema includes proper indexes for performance
- Connection pooling is configured (max 10 connections)
- Query optimization is implemented

### Application Optimization
- Static files are served efficiently
- Rate limiting prevents abuse
- Compression is enabled via helmet

### Railway-Specific Optimizations
- Automatic scaling based on load
- CDN integration for static assets
- Built-in caching

## 🔒 Security Considerations

### Railway Security
- Automatic SSL certificates
- Private networking for database
- Environment variable encryption
- DDoS protection

### Application Security
- JWT authentication
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection via helmet

## 💰 Cost Management

### Railway Pricing
- Free tier available (limited hours)
- Pay-as-you-go pricing
- Database costs are separate

### Optimization Tips
- Use the free tier for development
- Monitor usage regularly
- Optimize database queries
- Implement caching where possible

## 📞 Support

### Railway Support
- Documentation: https://docs.railway.app
- Discord community: https://discord.gg/railway
- Email: support@railway.app

### Application Support
- GitHub Issues: Create issues in your repository
- Email: support@nit.ac.tz
- Documentation: Check the README.md file

---

## 🎉 You're Ready!

Your NIT ITVMS application is now configured for Railway deployment with:

✅ **Managed MySQL Database**  
✅ **Automatic SSL Certificates**  
✅ **Health Monitoring**  
✅ **Environment-Based Configuration**  
✅ **Scalable Infrastructure**  
✅ **Production-Ready Security**  

Deploy now and enjoy your fully managed transport management system! 🚀
