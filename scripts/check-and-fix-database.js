// Check and Fix Railway Database Structure
// This script will verify tables exist and add sample data if needed

const mysql = require('mysql2/promise');

async function checkAndFixDatabase() {
    console.log('🔍 Checking Railway database structure...');
    
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
        
        // Check if tables exist
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📊 Current tables:', tables.map(t => Object.values(t)[0]));
        
        // Check and create vehicles table if needed
        await checkAndCreateVehiclesTable(connection);
        
        // Check and create drivers table if needed
        await checkAndCreateDriversTable(connection);
        
        // Check and create trips table if needed
        await checkAndCreateTripsTable(connection);
        
        // Check and create maintenance_records table if needed
        await checkAndCreateMaintenanceTable(connection);
        
        // Insert sample data if tables are empty
        await insertSampleData(connection);
        
        await connection.end();
        console.log('✅ Database check and fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Database check failed:', error.message);
        process.exit(1);
    }
}

async function checkAndCreateVehiclesTable(connection) {
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS vehicles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                plate_number VARCHAR(20) UNIQUE NOT NULL,
                vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
                model VARCHAR(100) NOT NULL,
                manufacture_year INT,
                capacity INT,
                status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
                fuel_type ENUM('Diesel', 'Petrol', 'Electric', 'Hybrid') DEFAULT 'Diesel',
                last_maintenance_date DATE,
                next_maintenance_date DATE,
                insurance_expiry DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_plate_number (plate_number),
                INDEX idx_status (status),
                INDEX idx_vehicle_type (vehicle_type)
            )
        `);
        console.log('✅ Vehicles table structure verified');
    } catch (error) {
        console.error('❌ Error creating vehicles table:', error.message);
    }
}

async function checkAndCreateDriversTable(connection) {
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS drivers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                full_name VARCHAR(100) NOT NULL,
                license_number VARCHAR(50) UNIQUE NOT NULL,
                phone_number VARCHAR(20),
                email VARCHAR(100),
                experience_years INT DEFAULT 0,
                license_expiry DATE,
                assigned_vehicle_id INT NULL,
                status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
                INDEX idx_license_number (license_number),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Drivers table structure verified');
    } catch (error) {
        console.error('❌ Error creating drivers table:', error.message);
    }
}

async function checkAndCreateTripsTable(connection) {
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS trips (
                id INT AUTO_INCREMENT PRIMARY KEY,
                route_from VARCHAR(100) NOT NULL,
                route_to VARCHAR(100) NOT NULL,
                driver_id INT NOT NULL,
                vehicle_id INT NOT NULL,
                trip_date DATE NOT NULL,
                departure_time TIME NOT NULL,
                arrival_time TIME,
                status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                distance DECIMAL(10, 2),
                fuel_consumed DECIMAL(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
                INDEX idx_trip_date (trip_date),
                INDEX idx_status (status),
                INDEX idx_driver_trip (driver_id),
                INDEX idx_vehicle_trip (vehicle_id)
            )
        `);
        console.log('✅ Trips table structure verified');
    } catch (error) {
        console.error('❌ Error creating trips table:', error.message);
    }
}

async function checkAndCreateMaintenanceTable(connection) {
    try {
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS maintenance_records (
                id INT AUTO_INCREMENT PRIMARY KEY,
                vehicle_id INT NOT NULL,
                maintenance_type VARCHAR(50) NOT NULL,
                description TEXT,
                cost DECIMAL(10, 2),
                maintenance_date DATE NOT NULL,
                next_maintenance_date DATE,
                mechanic_name VARCHAR(100),
                status ENUM('Scheduled', 'In Progress', 'Completed') DEFAULT 'Scheduled',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
                INDEX idx_vehicle_maintenance (vehicle_id),
                INDEX idx_maintenance_date (maintenance_date),
                INDEX idx_status (status)
            )
        `);
        console.log('✅ Maintenance records table structure verified');
    } catch (error) {
        console.error('❌ Error creating maintenance table:', error.message);
    }
}

async function insertSampleData(connection) {
    try {
        // Check if vehicles table has data
        const [vehicleCount] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        
        if (vehicleCount[0].count === 0) {
            console.log('📝 Inserting sample vehicles...');
            await connection.execute(`
                INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, capacity, status, fuel_type, next_maintenance_date) VALUES
                ('T 123 ABC', 'Bus', 'Toyota Coaster', 2020, 30, 'Active', 'Diesel', '2026-02-15'),
                ('T 456 DEF', 'Minibus', 'Toyota Hiace', 2021, 15, 'Active', 'Diesel', '2026-03-01'),
                ('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2019, 7, 'Active', 'Petrol', '2026-02-20')
            `);
            console.log('✅ Sample vehicles inserted');
        }
        
        // Check if drivers table has data
        const [driverCount] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
        
        if (driverCount[0].count === 0) {
            console.log('📝 Inserting sample drivers...');
            await connection.execute(`
                INSERT INTO drivers (full_name, license_number, phone_number, email, experience_years, license_expiry, status) VALUES
                ('John Mwambene', 'DL-123456', '255-789-456123', 'john@nit.ac.tz', 5, '2025-12-31', 'Active'),
                ('Grace Joseph', 'DL-789012', '255-756-789012', 'grace@nit.ac.tz', 3, '2025-08-15', 'Active'),
                ('Michael Kimaro', 'DL-345678', '255-712-345678', 'michael@nit.ac.tz', 7, '2026-01-15', 'Active')
            `);
            console.log('✅ Sample drivers inserted');
        }
        
        // Check if trips table has data
        const [tripCount] = await connection.execute('SELECT COUNT(*) as count FROM trips');
        
        if (tripCount[0].count === 0) {
            console.log('📝 Inserting sample trips...');
            await connection.execute(`
                INSERT INTO trips (route_from, route_to, driver_id, vehicle_id, trip_date, departure_time, arrival_time, status, distance, fuel_consumed) VALUES
                ('NIT Campus', 'City Center', 1, 1, '2026-01-31', '08:00', '09:30', 'Completed', 25.5, 8.2),
                ('City Center', 'NIT Campus', 2, 2, '2026-01-31', '17:00', '18:15', 'Completed', 25.5, 7.8),
                ('NIT Campus', 'Airport', 3, 3, '2026-02-01', '06:00', '07:30', 'Scheduled', 45.0, 12.5)
            `);
            console.log('✅ Sample trips inserted');
        }
        
        // Check if maintenance records table has data
        const [maintenanceCount] = await connection.execute('SELECT COUNT(*) as count FROM maintenance_records');
        
        if (maintenanceCount[0].count === 0) {
            console.log('📝 Inserting sample maintenance records...');
            await connection.execute(`
                INSERT INTO maintenance_records (vehicle_id, maintenance_type, description, cost, maintenance_date, next_maintenance_date, mechanic_name, status) VALUES
                (1, 'Routine Maintenance', 'Regular service check and oil change', 150000, '2026-01-10', '2026-04-10', 'Auto Garage Ltd', 'Completed'),
                (2, 'Oil Change', 'Engine oil replacement and filter change', 50000, '2026-01-12', '2026-04-12', 'Quick Service', 'Completed'),
                (3, 'Brake Inspection', 'Front brake pads inspection and adjustment', 80000, '2026-01-08', '2026-04-08', 'Brake Experts', 'Completed')
            `);
            console.log('✅ Sample maintenance records inserted');
        }
        
        // Final count check
        const [finalCounts] = await connection.execute(`
            SELECT 
                (SELECT COUNT(*) FROM vehicles) as vehicles,
                (SELECT COUNT(*) FROM drivers) as drivers,
                (SELECT COUNT(*) FROM trips) as trips,
                (SELECT COUNT(*) FROM maintenance_records) as maintenance
        `);
        
        console.log('📊 Final database counts:');
        console.log(`   Vehicles: ${finalCounts[0].vehicles}`);
        console.log(`   Drivers: ${finalCounts[0].drivers}`);
        console.log(`   Trips: ${finalCounts[0].trips}`);
        console.log(`   Maintenance: ${finalCounts[0].maintenance}`);
        
    } catch (error) {
        console.error('❌ Error inserting sample data:', error.message);
    }
}

checkAndFixDatabase();
