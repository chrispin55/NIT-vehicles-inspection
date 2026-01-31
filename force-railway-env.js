// Force Railway.app environment variables before anything else loads
console.log('🚆 FORCING Railway.app Environment Variables...');

// Force production environment
process.env.NODE_ENV = 'production';
process.env.RAILWAY_ENVIRONMENT = 'production';

// Force database configuration with your exact Railway.app MySQL details
process.env.DB_HOST = 'shuttle.proxy.rlwy.net';
process.env.DB_PORT = '35740';
process.env.DB_NAME = 'railway';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'FYeDxMGArZDXDqBTYUivUysJiAbGqKtw';
process.env.RAILWAY_DB_URL = 'mysql://root:FYeDxMGArZDXDqBTYUivUysJiAbGqKtw@shuttle.proxy.rlwy.net:35740/railway';

// Force JWT configuration
process.env.JWT_SECRET = 'super_secret_jwt_key_for_nit_itvms_production_2024';
process.env.JWT_EXPIRES_IN = '7d';

// Force CORS configuration
process.env.FRONTEND_URL = 'https://nit-itvms-production.railway.app';

// Force port
process.env.PORT = '8080';

console.log('✅ Environment Variables Forced:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);
console.log('RAILWAY_DB_URL:', process.env.RAILWAY_DB_URL);
console.log('');

// Now load dotenv (in case there are any additional variables)
require('dotenv').config();

// Start the main server
console.log('🚀 Starting NIT ITVMS Server with forced environment...');
require('./backend/src/server.js');
