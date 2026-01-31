const fs = require('fs');
const path = require('path');

// Environment setup script for NIT ITVMS
console.log('🚀 NIT ITVMS Environment Setup');
console.log('================================');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const templatePath = path.join(__dirname, 'env-template.txt');

if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
} else if (fs.existsSync(templatePath)) {
  // Copy template to .env
  fs.copyFileSync(templatePath, envPath);
  console.log('✅ .env file created from template');
  console.log('💡 Please edit .env with your local database settings');
} else {
  // Create basic .env file
  const basicEnv = `# NIT ITVMS Environment Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nit_itvms
DB_USER=root
DB_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3000
`;
  
  fs.writeFileSync(envPath, basicEnv);
  console.log('✅ Basic .env file created');
  console.log('💡 Please update with your database settings');
}

// Check for package.json
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  console.log('✅ package.json found');
} else {
  console.log('❌ package.json not found');
}

// Check for database schema
const schemaPath = path.join(__dirname, 'database', 'schema.sql');
if (fs.existsSync(schemaPath)) {
  console.log('✅ Database schema found');
} else {
  console.log('❌ Database schema not found');
}

console.log('');
console.log('📋 Next Steps:');
console.log('1. Edit .env file with your database settings');
console.log('2. Install dependencies: npm install');
console.log('3. Set up local database: mysql -u root -p nit_itvms < database/schema.sql');
console.log('4. Start the server: npm start');
console.log('5. Access the application: http://localhost:3000');
console.log('');
console.log('🚆 For Railway.app deployment, see RAILWAY-SETUP.md');
