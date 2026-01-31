const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Auto-push script for NIT ITVMS project
function autoPush() {
    try {
        console.log('🔄 Checking for changes...');
        
        // Check if there are any changes
        const status = execSync('git status --porcelain', { encoding: 'utf8' });
        
        if (!status.trim()) {
            console.log('✅ No changes to commit');
            return;
        }
        
        console.log('📝 Changes detected, committing and pushing...');
        
        // Add all changes
        execSync('git add .', { stdio: 'inherit' });
        
        // Get current timestamp for commit message
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        execSync(`git commit -m "Auto-update: ${timestamp}"`, { stdio: 'inherit' });
        
        // Push to remote
        execSync('git push origin main', { stdio: 'inherit' });
        
        console.log('✅ Successfully pushed changes to GitHub!');
        
    } catch (error) {
        console.error('❌ Error during auto-push:', error.message);
    }
}

// Export for use in other scripts
module.exports = { autoPush };

// Run if called directly
if (require.main === module) {
    autoPush();
}
