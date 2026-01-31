// Fix Table Column Names to Match Application
// This script will fix column name mismatches

const mysql = require('mysql2/promise');

async function fixTableColumns() {
    console.log('🔧 Fixing table column names...');
    
    const config = {
        host: 'turntable.proxy.rlwy.net',
        port: 12096,
        user: 'root',
        password: 'lTatesqgMIzyrKwiJGDVyJNrJgbQmpNe',
        database: 'railway',
        charset: 'utf8mb4'
    };
    
    try {
        const connection = await mysql.createConnection(config);
        console.log('✅ Connected to Railway database');
        
        // Check current table structures
        await checkTableStructure(connection, 'trips');
        await checkTableStructure(connection, 'maintenance_records');
        
        // Fix trips table if needed
        await fixTripsTable(connection);
        
        // Fix maintenance table if needed
        await fixMaintenanceTable(connection);
        
        await connection.end();
        console.log('✅ Table column fixes completed!');
        
    } catch (error) {
        console.error('❌ Table fix failed:', error.message);
        process.exit(1);
    }
}

async function checkTableStructure(connection, tableName) {
    try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`\n📊 ${tableName} table structure:`);
        columns.forEach(col => {
            console.log(`   ${col.Field} - ${col.Type}`);
        });
    } catch (error) {
        console.error(`❌ Error checking ${tableName} structure:`, error.message);
    }
}

async function fixTripsTable(connection) {
    try {
        console.log('\n🛣️ Fixing trips table...');
        
        // Check if distance column exists
        const [columns] = await connection.execute(`SHOW COLUMNS FROM trips LIKE 'distance'`);
        
        if (columns.length === 0) {
            console.log('Adding missing columns to trips table...');
            await connection.execute(`ALTER TABLE trips ADD COLUMN distance DECIMAL(10, 2)`);
            await connection.execute(`ALTER TABLE trips ADD COLUMN fuel_consumed DECIMAL(10, 2)`);
            console.log('✅ Added distance and fuel_consumed columns to trips table');
        } else {
            console.log('✅ Trips table columns already exist');
        }
        
    } catch (error) {
        console.error('❌ Error fixing trips table:', error.message);
    }
}

async function fixMaintenanceTable(connection) {
    try {
        console.log('\n🔧 Fixing maintenance_records table...');
        
        // Check if maintenance_type column exists
        const [columns] = await connection.execute(`SHOW COLUMNS FROM maintenance_records LIKE 'maintenance_type'`);
        
        if (columns.length === 0) {
            console.log('Adding missing columns to maintenance_records table...');
            await connection.execute(`ALTER TABLE maintenance_records ADD COLUMN maintenance_type VARCHAR(50) NOT NULL DEFAULT 'General'`);
            await connection.execute(`ALTER TABLE maintenance_records ADD COLUMN mechanic_name VARCHAR(100)`);
            console.log('✅ Added maintenance_type and mechanic_name columns to maintenance_records table');
        } else {
            console.log('✅ Maintenance_records table columns already exist');
        }
        
    } catch (error) {
        console.error('❌ Error fixing maintenance table:', error.message);
    }
}

fixTableColumns();
