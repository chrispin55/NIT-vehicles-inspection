#!/usr/bin/env node

// File watcher for automatic Git commits and pushes
// Watches for file changes and automatically commits/pushes to GitHub

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { autoPush } = require('./auto-push');

// Configuration
const config = {
  watchInterval: 5000, // Check every 5 seconds
  debounceDelay: 10000, // Wait 10 seconds after changes before committing
  excludePatterns: [
    'node_modules/',
    '.git/',
    'logs/',
    '*.tmp',
    '*.log',
    '.env*'
  ],
  autoPush: true,
  verbose: false
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

let lastCommitTime = 0;
let isProcessing = false;

function shouldExcludeFile(filePath) {
  return config.excludePatterns.some(pattern => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filePath);
  });
}

function getChangedFiles() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' });
    return output.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    return [];
  }
}

function hasSignificantChanges() {
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) return false;
  
  // Check if any important files have changed
  const importantFiles = changedFiles.filter(file => {
    const filePath = file.substring(3); // Remove git status prefix
    return !shouldExcludeFile(filePath);
  });
  
  if (config.verbose && importantFiles.length > 0) {
    log(`📁 Changed files: ${importantFiles.map(f => f.substring(3)).join(', ')}`, 'blue');
  }
  
  return importantFiles.length > 0;
}

async function processChanges() {
  if (isProcessing) {
    log('⏳ Already processing changes...', 'yellow');
    return;
  }

  const now = Date.now();
  if (now - lastCommitTime < config.debounceDelay) {
    log(`⏰ Waiting for debounce delay...`, 'yellow');
    return;
  }

  if (!hasSignificantChanges()) {
    return;
  }

  isProcessing = true;
  
  try {
    log('🔄 Processing changes...', 'cyan');
    
    if (config.autoPush) {
      await autoPush();
      lastCommitTime = now;
    } else {
      log('📝 Changes detected (auto-push disabled)', 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error processing changes: ${error.message}`, 'red');
  } finally {
    isProcessing = false;
  }
}

function setupWatcher() {
  log('👀 Starting file watcher...', 'green');
  log(`⏱️  Check interval: ${config.watchInterval}ms`, 'blue');
  log(`⏰ Debounce delay: ${config.debounceDelay}ms`, 'blue');
  log(`🚀 Auto-push: ${config.autoPush ? 'enabled' : 'disabled'}`, 'blue');
  log('Press Ctrl+C to stop watching', 'yellow');
  log('=' .repeat(50), 'magenta');

  const watcher = setInterval(processChanges, config.watchInterval);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('\n🛑 Stopping file watcher...', 'yellow');
    clearInterval(watcher);
    
    // Final commit before exiting
    if (hasSignificantChanges()) {
      log('📝 Committing final changes...', 'cyan');
      autoPush().then(() => {
        log('👋 Goodbye!', 'green');
        process.exit(0);
      }).catch(() => {
        process.exit(1);
      });
    } else {
      log('👋 Goodbye!', 'green');
      process.exit(0);
    }
  });

  // Initial check
  setTimeout(processChanges, 1000);
}

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || command === '--help' || command === '-h') {
  log('📖 Watch & Push Help:', 'cyan');
  log('');
  log('Usage: node scripts/watch-and-push.js [options]', 'blue');
  log('');
  log('Options:', 'blue');
  log('  help, --help, -h    Show this help message', 'blue');
  log('  --no-push           Disable automatic pushing', 'blue');
  log('  --verbose           Show detailed file changes', 'blue');
  log('  --interval <ms>     Set check interval (default: 5000)', 'blue');
  log('  --debounce <ms>     Set debounce delay (default: 10000)', 'blue');
  log('');
  log('Examples:', 'blue');
  log('  node scripts/watch-and-push.js              # Start with defaults', 'blue');
  log('  node scripts/watch-and-push.js --no-push     # Watch without auto-push', 'blue');
  log('  node scripts/watch-and-push.js --verbose     # Show detailed changes', 'blue');
  log('  node scripts/watch-and-push.js --interval 3000 # Check every 3 seconds', 'blue');
  process.exit(0);
}

// Parse command line options
args.forEach(arg => {
  switch (arg) {
    case '--no-push':
      config.autoPush = false;
      break;
    case '--verbose':
      config.verbose = true;
      break;
    default:
      if (arg.startsWith('--interval=')) {
        config.watchInterval = parseInt(arg.split('=')[1]);
      } else if (arg.startsWith('--debounce=')) {
        config.debounceDelay = parseInt(arg.split('=')[1]);
      }
  }
});

// Start the watcher
setupWatcher();
