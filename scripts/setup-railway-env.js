#!/usr/bin/env node

// Railway Environment Setup Script
// This script helps set up the Railway environment variables

const fs = require('fs');
const path = require('path');

// Railway MySQL Configuration
const RAILWAY_CONFIG = {
  // Internal host (for Railway deployment)
  RAILWAY_PRIVATE_MYSQL_HOST: 'mysql-8zjl.railway.internal',
  RAILWAY_PRIVATE_MYSQL_PORT: '3306',
  RAILWAY_PRIVATE_MYSQL_USER: 'root',
  RAILWAY_PRIVATE_MYSQL_PASSWORD: 'lTatesqgMIzyrKwiJGDVyJNrJgbQmpNe',
  RAILWAY_PRIVATE_MYSQL_DATABASE_NAME: 'railway',
  
  // Public host (for external access)
  RAILWAY_PUBLIC_MYSQL_HOST: 'turntable.proxy.rlwy.net',
  RAILWAY_PUBLIC_MYSQL_PORT: '12096',
  
  // Application settings
  NODE_ENV: 'production',
  JWT_SECRET: 'your-super-secret-jwt-key-change-this-in-production',
  ENCRYPTION_KEY: 'your-encryption-key-change-this-in-production',
  API_KEY: 'your-api-key-change-this-in-production',
  CORS_ORIGIN: 'https://your-app-name.railway.app'
};

function generateRailwayEnvFile() {
  const envContent = Object.entries(RAILWAY_CONFIG)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const envPath = path.join(__dirname, '../.env.railway');
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Railway environment file created:', envPath);
  console.log('📝 Content:');
  console.log(envContent);
}

function generateRailwayVariablesList() {
  console.log('\n🚀 Railway Environment Variables Setup');
  console.log('=====================================');
  console.log('\n📋 Add these variables to your Railway project:');
  console.log('(Go to your Railway project → Settings → Variables)\n');
  
  Object.entries(RAILWAY_CONFIG).forEach(([key, value]) => {
    if (key.includes('PASSWORD') || key.includes('SECRET') || key.includes('KEY')) {
      console.log(`${key}: [HIDDEN - Use: ${value}]`);
    } else {
      console.log(`${key}: ${value}`);
    }
  });
  
  console.log('\n🔗 Railway MySQL URLs:');
  console.log(`Internal: mysql://${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_USER}:${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_PASSWORD}@${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_HOST}:${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_PORT}/${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_DATABASE_NAME}`);
  console.log(`Public:   mysql://${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_USER}:${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_PASSWORD}@${RAILWAY_CONFIG.RAILWAY_PUBLIC_MYSQL_HOST}:${RAILWAY_CONFIG.RAILWAY_PUBLIC_MYSQL_PORT}/${RAILWAY_CONFIG.RAILWAY_PRIVATE_MYSQL_DATABASE_NAME}`);
}

function testRailwayConfig() {
  console.log('\n🔍 Testing Railway Configuration...');
  
  const { testRailwayConnection } = require('../database/railway-config');
  
  testRailwayConnection().then(success => {
    if (success) {
      console.log('✅ Railway configuration test PASSED');
      console.log('🚀 Your application is ready for Railway deployment!');
    } else {
      console.log('❌ Railway configuration test FAILED');
      console.log('🔧 Please check your database connection settings');
    }
  });
}

function showInstructions() {
  console.log(`
🎓 NIT University - PROJECT KALI ITVMS
🚀 Railway Deployment Setup Guide

📋 Steps to Deploy on Railway:

1️⃣  Set up Railway Environment Variables:
    - Go to your Railway project
    - Click on "Variables" tab
    - Add all the variables listed above

2️⃣  Deploy Your Application:
    - Connect your GitHub repository to Railway
    - Railway will automatically deploy your application

3️⃣  Verify Deployment:
    - Check Railway logs for database connection
    - Visit your Railway URL
    - Login with: admin / nit2023

🔗 Your Railway URLs:
    - Application: https://your-app-name.railway.app
    - Health Check: https://your-app-name.railway.app/health

📊 Expected Database Data:
    - Users: 1 (admin user)
    - Vehicles: 1 (sample vehicle)
    - Drivers: 1 (sample driver)
    - Trips: 1 (sample trip)
    - Maintenance: 1 (sample record)

🎯 Success Indicators:
    ✅ Database connection successful
    ✅ Health check shows "database": "connected"
    ✅ Login works with admin/nit2023
    ✅ Modern UI displays correctly
    ✅ All CRUD operations work

🔧 Troubleshooting:
    - If database connection fails, check environment variables
    - If login fails, verify database has admin user
    - If UI doesn't load, check static file serving
    - Check Railway logs for detailed error messages

📞 Support:
    - Technical support: it-support@nit.ac.tz
    - GitHub repository: https://github.com/chrispin55/NIT-vehicle-inspection
`);
}

// Main execution
const command = process.argv[2];

switch (command) {
  case 'env':
    generateRailwayEnvFile();
    break;
  case 'variables':
    generateRailwayVariablesList();
    break;
  case 'test':
    testRailwayConfig();
    break;
  case 'guide':
    showInstructions();
    break;
  default:
    console.log('🚀 Railway Setup Script');
    console.log('Usage: node scripts/setup-railway-env.js [command]');
    console.log('');
    console.log('Commands:');
    console.log('  env       - Generate .env.railway file');
    console.log('  variables - Show Railway environment variables');
    console.log('  test      - Test Railway configuration');
    console.log('  guide     - Show deployment guide');
    console.log('');
    console.log('Running full setup...');
    generateRailwayEnvFile();
    generateRailwayVariablesList();
    testRailwayConfig();
}

module.exports = {
  generateRailwayEnvFile,
  generateRailwayVariablesList,
  testRailwayConfig,
  showInstructions
};
