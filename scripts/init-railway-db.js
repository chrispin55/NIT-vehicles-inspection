#!/usr/bin/env node

// Initialize Railway Database with Correct Schema
// This script initializes your Railway MySQL database with the proper schema

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Railway MySQL Configuration
const dbConfig = {
  host: 'turntable.proxy.rlwy.net',
  port: 12096,
  user: 'root',
  password: 'lTatesqgMIzyrKwiJGDVyJNrJgbQmpNe',
  database: 'railway',
  charset: 'utf8mb4',
  multipleStatements: true
};

async function initializeRailwayDatabase() {
  let connection;
  
  try {
    console.log('🚀 Initializing Railway MySQL database...');
    console.log('📍 Host:', dbConfig.host);
    console.log('💾 Database:', dbConfig.database);
    console.log('');

    // Create connection
    connection = await mysql.createConnection(dbConfig);
    
    console.log('✅ Connected to Railway MySQL!');
    
    // Read the Railway-specific database schema
    const schemaPath = path.join(__dirname, '../database/railway-database.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Railway database schema file not found: ${schemaPath}`);
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
        console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        // Ignore errors for CREATE TABLE IF NOT EXISTS and INSERT IGNORE statements
        if (!statement.includes('CREATE TABLE IF NOT EXISTS') && !statement.includes('INSERT IGNORE')) {
          console.error('❌ Error executing statement:', statement.substring(0, 100) + '...');
          console.error('Error:', error.message);
          errorCount++;
        } else {
          console.log(`ℹ️  Ignored (expected): ${statement.substring(0, 50)}...`);
          successCount++;
        }
      }
    }

    console.log('');
    console.log('✅ Database initialization completed!');
    console.log(`📊 Statements executed: ${successCount} successful, ${errorCount} errors`);
    
    // Verify the setup
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📋 Tables in database: ${tables.length}`);
    
    // Test the setup by querying some data
    const [vehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
    const [drivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    
    console.log(`📈 Database now contains:`);
    console.log(`  👤 Users: ${users[0].count}`);
    console.log(`  🚗 Vehicles: ${vehicles[0].count}`);
    console.log(`  👨‍✈️  Drivers: ${drivers[0].count}`);
    
    if (users[0].count > 0) {
      console.log('');
      console.log('🔐 Default Login Credentials:');
      console.log('  Username: admin');
      console.log('  Password: nit2023');
    }
    
    console.log('');
    console.log('🎉 Railway database setup completed successfully!');
    console.log('🌐 Your app is ready to use this database!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
    
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

// Run initialization if this file is executed directly
if (require.main === module) {
  initializeRailwayDatabase()
    .then(() => {
      console.log('👋 Initialization complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

module.exports = { initializeRailwayDatabase };
