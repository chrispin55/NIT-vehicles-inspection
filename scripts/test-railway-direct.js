#!/usr/bin/env node

// Direct Railway MySQL Test
// This script directly tests the Railway MySQL connection

const mysql = require('mysql2/promise');

// Railway MySQL Configuration (direct)
const RAILWAY_CONFIG = {
  host: 'mysql-8zjl.railway.internal',
  port: 3306,
  user: 'root',
  password: 'lTatesqgMIzyrKwiJGDVyJNrJgbQmpNe',
  database: 'railway',
  charset: 'utf8mb4'
};

async function testDirectRailway() {
  let connection = null;
  try {
    console.log('🚀 Testing Direct Railway MySQL Connection');
    console.log('==========================================');
    console.log('📍 Host:', RAILWAY_CONFIG.host);
    console.log('🔌 Port:', RAILWAY_CONFIG.port);
    console.log('👤 User:', RAILWAY_CONFIG.user);
    console.log('💾 Database:', RAILWAY_CONFIG.database);
    console.log('');

    connection = await mysql.createConnection(RAILWAY_CONFIG);
    
    console.log('✅ Connection established successfully!');
    
    // Test basic query
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log('📊 MySQL Version:', version[0].version);
    
    // Test database tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tables found:', tables.length);
    tables.forEach(table => {
      console.log('  -', Object.values(table)[0]);
    });
    
    // Test data
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [vehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
    const [drivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
    
    console.log('');
    console.log('📊 Database Data:');
    console.log('  👤 Users:', users[0].count);
    console.log('  🚗 Vehicles:', vehicles[0].count);
    console.log('  👨‍✈️  Drivers:', drivers[0].count);
    
    console.log('');
    console.log('✅ Railway MySQL connection test PASSED');
    console.log('🎉 Your Railway database is ready for deployment!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Railway MySQL connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('SQL State:', error.sqlState);
    return false;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

testDirectRailway().then(success => {
  if (success) {
    console.log('\n🚀 Next Steps:');
    console.log('1. Push your code to GitHub');
    console.log('2. Connect your repository to Railway');
    console.log('3. Railway will automatically deploy with this configuration');
    console.log('4. Your app will connect to this database automatically');
  }
});
