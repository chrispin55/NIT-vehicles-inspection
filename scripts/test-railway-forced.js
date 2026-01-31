#!/usr/bin/env node

// Force test Railway MySQL connection
// This script tests the Railway configuration directly

const { testRailwayConnection } = require('../database/railway-config');

async function testForcedRailway() {
  console.log('🚀 Testing Railway MySQL Configuration (Forced)');
  console.log('================================================');
  
  try {
    const success = await testRailwayConnection();
    
    if (success) {
      console.log('\n✅ Railway MySQL connection test PASSED');
      console.log('🎉 Your Railway configuration is working correctly!');
      console.log('🚀 Ready for Railway deployment!');
    } else {
      console.log('\n❌ Railway MySQL connection test FAILED');
      console.log('🔧 Please check your configuration');
    }
  } catch (error) {
    console.error('\n💥 Test failed with error:', error.message);
  }
}

testForcedRailway();
