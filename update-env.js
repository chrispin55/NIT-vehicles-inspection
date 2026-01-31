const fs = require('fs');
const path = require('path');

// Update .env file with Railway.app MySQL configuration
console.log('🚆 Updating environment for Railway.app deployment');
console.log('===============================================');

const railwayConfig = `# NIT ITVMS Production Environment - Railway.app
NODE_ENV=production
RAILWAY_ENVIRONMENT=production

# Railway.app MySQL Database
DB_HOST=shuttle.proxy.rlwy.net
DB_PORT=35740
DB_NAME=railway
DB_USER=root
DB_PASSWORD=FYeDxMGArZDXDqBTYUivUysJiAbGqKtw

# Railway.app Connection String
RAILWAY_DB_URL=mysql://root:FYeDxMGArZDXDqBTYUivUysJiAbGqKtw@shuttle.proxy.rlwy.net:35740/railway

# JWT Configuration
JWT_SECRET=super_secret_jwt_key_for_nit_itvms_production_2024
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=https://nit-itvms-production.railway.app

# Server Configuration
PORT=3000`;

// Update .env file
const envPath = path.join(__dirname, '.env');
fs.writeFileSync(envPath, railwayConfig);

console.log('✅ .env file updated with Railway.app configuration');
console.log('');
console.log('📋 Railway.app Configuration:');
console.log('🌐 Host: shuttle.proxy.rlwy.net');
console.log('🔌 Port: 35740');
console.log('🗄️  Database: railway');
console.log('👤 User: root');
console.log('');
console.log('🚀 Ready for Railway.app deployment!');
console.log('');
console.log('📝 Next Steps:');
console.log('1. Push changes to GitHub: npm run auto-push');
console.log('2. Deploy to Railway.app');
console.log('3. Set environment variables in Railway.app dashboard');
console.log('4. Test the deployment');
