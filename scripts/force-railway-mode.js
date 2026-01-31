#!/usr/bin/env node

// Force Railway Mode Script
// This script forces Railway mode for testing

// Set Railway environment variables
process.env.RAILWAY_ENVIRONMENT = 'production';
process.env.RAILWAY_PUBLIC_DOMAIN = 'test-app.railway.app';

// Import and test Railway configuration
const { testRailwayConnection } = require('../database/railway-config');

async function testForcedMode() {
  console.log('🚀 Testing Forced Railway Mode');
  console.log('==============================');
  
  try {
    const success = await testRailwayConnection();
    
    if (success) {
      console.log('\n✅ Forced Railway mode test PASSED');
      console.log('🎉 Railway configuration is working!');
      console.log('🚀 Ready for Railway deployment!');
    } else {
      console.log('\n❌ Forced Railway mode test FAILED');
    }
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
  }
}

testForcedMode();
