#!/usr/bin/env node

// Auto-push script for PROJECT KALI - ITVMS
// Automatically commits and pushes changes to GitHub

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  commitMessage: 'Auto-commit: Project updates',
  branch: 'main',
  autoPush: true
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function executeCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'yellow');
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return result.trim();
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    throw error;
  }
}

function checkForChanges() {
  try {
    const status = executeCommand('git status --porcelain', 'Checking for changes');
    return status.length > 0;
  } catch (error) {
    log('❌ Failed to check git status', 'red');
    return false;
  }
}

function getCurrentTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

function generateCommitMessage() {
  const timestamp = getCurrentTimestamp();
  return `Auto-commit: ${timestamp} - Project updates`;
}

async function autoPush() {
  try {
    log('🚀 Starting auto-push process...', 'cyan');
    log('=' .repeat(50), 'blue');

    // Check if we're in a git repository
    try {
      executeCommand('git rev-parse --git-dir', 'Checking git repository');
    } catch (error) {
      log('❌ Not a git repository. Please run: git init', 'red');
      return;
    }

    // Check for changes
    if (!checkForChanges()) {
      log('📝 No changes to commit', 'yellow');
      return;
    }

    log('📋 Changes detected, proceeding with commit...', 'green');

    // Add all changes
    executeCommand('git add .', 'Staging changes');

    // Generate commit message with timestamp
    const commitMessage = generateCommitMessage();
    log(`📝 Commit message: ${commitMessage}`, 'blue');

    // Commit changes
    executeCommand(`git commit -m "${commitMessage}"`, 'Committing changes');

    // Push to remote if configured
    try {
      executeCommand('git remote get-url origin', 'Checking remote repository');
      if (config.autoPush) {
        executeCommand(`git push origin ${config.branch}`, `Pushing to ${config.branch}`);
        log('🎉 Successfully pushed to GitHub!', 'green');
      }
    } catch (error) {
      log('⚠️  No remote repository configured or push failed', 'yellow');
      log('💡 To set up remote: git remote add origin <repository-url>', 'blue');
    }

    log('=' .repeat(50), 'blue');
    log('✅ Auto-push process completed successfully!', 'green');

  } catch (error) {
    log(`💥 Auto-push failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'help' || command === '--help' || command === '-h') {
  log('📖 Auto-push Help:', 'cyan');
  log('');
  log('Usage: node scripts/auto-push.js [options]', 'blue');
  log('');
  log('Options:', 'blue');
  log('  help, --help, -h    Show this help message', 'blue');
  log('  status             Check git status only', 'blue');
  log('  commit             Commit without pushing', 'blue');
  log('  push               Push existing commits', 'blue');
  log('');
  log('Examples:', 'blue');
  log('  node scripts/auto-push.js           # Full auto-push process', 'blue');
  log('  node scripts/auto-push.js status    # Check status only', 'blue');
  log('  node scripts/auto-push.js commit    # Commit only', 'blue');
  log('  node scripts/auto-push.js push      # Push only', 'blue');
  process.exit(0);
}

// Execute specific commands
switch (command) {
  case 'status':
    if (checkForChanges()) {
      log('📋 Changes detected:', 'green');
      executeCommand('git status', 'Showing status');
    } else {
      log('📝 No changes to commit', 'yellow');
    }
    break;

  case 'commit':
    if (checkForChanges()) {
      executeCommand('git add .', 'Staging changes');
      const commitMessage = generateCommitMessage();
      executeCommand(`git commit -m "${commitMessage}"`, 'Committing changes');
      log('✅ Changes committed successfully', 'green');
    } else {
      log('📝 No changes to commit', 'yellow');
    }
    break;

  case 'push':
    try {
      executeCommand('git remote get-url origin', 'Checking remote repository');
      executeCommand(`git push origin ${config.branch}`, `Pushing to ${config.branch}`);
      log('✅ Pushed to GitHub successfully', 'green');
    } catch (error) {
      log('❌ Push failed or no remote configured', 'red');
    }
    break;

  default:
    autoPush();
}

// Export for use in other scripts
module.exports = { autoPush, checkForChanges, generateCommitMessage };
