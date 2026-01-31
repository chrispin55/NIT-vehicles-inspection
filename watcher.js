const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// File watcher for auto-pushing changes
class AutoPushWatcher {
    constructor() {
        this.watchedDirs = [
            'frontend/src',
            'backend/src',
            'database',
            '.'
        ];
        this.debounceTime = 3000; // 3 seconds debounce
        this.timeout = null;
        this.isPushing = false;
        
        console.log('👀 Auto-push watcher initialized');
        console.log('📁 Watching directories:', this.watchedDirs.join(', '));
        console.log('⏱️  Debounce time:', this.debounceTime + 'ms');
        console.log('🚀 Changes will be auto-pushed to GitHub');
        console.log('----------------------------------------');
    }

    startWatching() {
        this.watchedDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.watchDirectory(dir);
            }
        });
    }

    watchDirectory(dir) {
        fs.watch(dir, { recursive: true }, (eventType, filename) => {
            if (filename && this.shouldIgnoreFile(filename)) {
                return;
            }
            
            console.log(`📝 Change detected: ${path.join(dir, filename)} (${eventType})`);
            
            // Debounce rapid changes
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            
            this.timeout = setTimeout(() => {
                this.autoPush();
            }, this.debounceTime);
        });
        
        console.log(`👀 Watching: ${dir}`);
    }

    shouldIgnoreFile(filename) {
        const ignorePatterns = [
            /\.git/,
            /node_modules/,
            /\.log$/,
            /tmp/,
            /temp/,
            /\.DS_Store/,
            /Thumbs\.db/
        ];
        
        return ignorePatterns.some(pattern => pattern.test(filename));
    }

    async autoPush() {
        if (this.isPushing) {
            console.log('⏳ Push already in progress, skipping...');
            return;
        }

        this.isPushing = true;
        
        try {
            console.log('🔄 Auto-pushing changes...');
            
            // Check if there are changes
            const status = execSync('git status --porcelain', { encoding: 'utf8' });
            
            if (!status.trim()) {
                console.log('✅ No changes to push');
                this.isPushing = false;
                return;
            }
            
            // Add all changes
            execSync('git add .', { stdio: 'pipe' });
            
            // Create commit message with timestamp
            const timestamp = new Date().toLocaleString();
            const commitMessage = `Auto-push: ${timestamp}`;
            
            // Commit changes
            execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
            
            // Push to GitHub
            execSync('git push origin main', { stdio: 'pipe' });
            
            console.log('✅ Successfully auto-pushed to GitHub!');
            console.log(`📝 Commit: ${commitMessage}`);
            
        } catch (error) {
            console.error('❌ Auto-push failed:', error.message);
        } finally {
            this.isPushing = false;
        }
    }
}

// Start the watcher if this file is run directly
if (require.main === module) {
    const watcher = new AutoPushWatcher();
    watcher.startWatching();
    
    console.log('🎯 Auto-push watcher is running!');
    console.log('💡 Make changes to your files and they will be auto-pushed');
    console.log('⏹️  Press Ctrl+C to stop the watcher');
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n👋 Auto-push watcher stopped');
        process.exit(0);
    });
}

module.exports = AutoPushWatcher;
