const mysql = require('mysql2/promise');

const { logger, DatabaseError, handleDatabaseError } = require('../utils/errorHandler');

// Import Railway configuration
const { dbConfig, isRailway, initializeRailwayPool } = require('./railway-config');

let pool;

async function initializePool() {
  try {
    // Debug logging for Railway environment
    logger.info('🔧 Initializing database connection...');
    logger.info('🏗️ Environment:', isRailway ? 'Railway' : 'Local');
    logger.info('📍 Host:', dbConfig.host);
    logger.info('🔌 Port:', dbConfig.port);
    logger.info('👤 User:', dbConfig.user);
    logger.info('💾 Database:', dbConfig.database);
    
    // Use Railway-specific initialization
    if (isRailway) {
      logger.info('� Using Railway MySQL configuration...');
      pool = await initializeRailwayPool();
    } else {
      logger.info('🔧 Initializing local MySQL connection...');
      pool = mysql.createPool(dbConfig);
    }

    // Test the connection
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    logger.info('✅ Database pool initialized successfully');
    return pool;
  } catch (error) {
    logger.error('❌ Failed to initialize database pool:', error);
    throw new DatabaseError('Failed to initialize database connection', error);
  }
}

async function testConnection() {
  try {
    if (!pool) {
      await initializePool();
    }
    
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    
    logger.info('✅ Database connection test successful');
    return true;
  } catch (error) {
    logger.error('❌ Database connection test failed:', error);
    return false;
  }
}

async function closePool() {
  if (pool) {
    await pool.end();
    logger.info('Database pool closed');
  }
}

// Initialize pool on module load
initializePool().catch((error) => {
  logger.error('Failed to initialize database pool on startup:', error);
  // Don't throw error to allow application to start in some cases
  // The error will be handled when trying to use the database
});

module.exports = {
  pool: pool || mysql.createPool(dbConfig),
  testConnection,
  closePool,
  config: dbConfig,
  initializePool,
  isCloudSQL: useCloudSQL
};
