#!/usr/bin/env node

// Test Railway MySQL Database Connection
// This script tests the connection to your Railway MySQL database

const mysql = require('mysql2/promise');

// Railway MySQL Configuration
const dbConfig = {
  host: 'turntable.proxy.rlwy.net',
  port: 12096,
  user: 'root',
  password: 'lTatesqgMIzyrKwiJGDVyJNrJgbQmpNe',
  database: 'railway',
  charset: 'utf8mb4'
};

async function testRailwayConnection() {
  let connection;
  
  try {
    console.log('🔧 Testing Railway MySQL connection...');
    console.log('📍 Host:', dbConfig.host);
    console.log('🔌 Port:', dbConfig.port);
    console.log('👤 User:', dbConfig.user);
    console.log('💾 Database:', dbConfig.database);
    console.log('');

    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Successfully connected to Railway MySQL!');
    
    // Test basic query
    const [rows] = await connection.execute('SELECT VERSION() as version');
    console.log('📊 MySQL Version:', rows[0].version);
    
    // Check if database exists and has tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Current tables:', tables.length);
    
    if (tables.length > 0) {
      console.log('Tables found:');
      tables.forEach(table => {
        console.log('  -', Object.values(table)[0]);
      });
    } else {
      console.log('📝 No tables found. Database is empty.');
    }
    
    console.log('');
    console.log('🎉 Railway MySQL connection test successful!');
    
  } catch (error) {
    console.error('❌ Railway MySQL connection failed:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('SQL State:', error.sqlState);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('');
      console.log('💡 Possible solutions:');
      console.log('  1. Check if Railway MySQL service is running');
      console.log('  2. Verify the connection URL is correct');
      console.log('  3. Check network connectivity');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('');
      console.log('💡 Possible solutions:');
      console.log('  1. Verify username and password are correct');
      console.log('  2. Check if user has permissions for the database');
    }
    
    process.exit(1);
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

async function initializeDatabase() {
  let connection;
  
  try {
    console.log('🚀 Initializing Railway database...');
    
    connection = await mysql.createConnection(dbConfig);
    
    // Read and execute the database schema
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(__dirname, '../database/database.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Database schema file not found: ${schemaPath}`);
    }
    
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const statement of statements) {
      try {
        await connection.execute(statement);
        successCount++;
      } catch (error) {
        // Ignore errors for CREATE DATABASE and INSERT IGNORE statements
        if (!statement.includes('CREATE DATABASE') && !statement.includes('INSERT IGNORE')) {
          console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error.message);
          errorCount++;
        }
      }
    }

    console.log('✅ Database initialization completed!');
    console.log(`📊 Statements executed: ${successCount} successful, ${errorCount} errors`);
    
    // Verify the setup
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tables created: ${tables.length}`);
    
    // Test the setup by querying some data
    const [vehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
    const [drivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`📈 Database contains: ${vehicles[0].count} vehicles, ${drivers[0].count} drivers, ${users[0].count} users`);
    
    console.log('🎉 Railway database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
    
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || command === '--help' || command === '-h') {
  console.log('📖 Railway Database Test Help:');
  console.log('');
  console.log('Usage: node scripts/test-railway-db.js [command]');
  console.log('');
  console.log('Commands:');
  console.log('  test       Test database connection only');
  console.log('  init       Initialize database with schema and data');
  console.log('  help       Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  node scripts/test-railway-db.js test');
  console.log('  node scripts/test-railway-db.js init');
  process.exit(0);
}

switch (command) {
  case 'test':
    testRailwayConnection();
    break;
  case 'init':
    testRailwayConnection()
      .then(() => initializeDatabase())
      .catch(() => process.exit(1));
    break;
  default:
    console.log('🚀 Testing Railway MySQL connection and initializing database...');
    testRailwayConnection()
      .then(() => initializeDatabase())
      .catch(() => process.exit(1));
}

module.exports = { testRailwayConnection, initializeDatabase };
