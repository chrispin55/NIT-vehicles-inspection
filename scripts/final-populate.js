// Final Database Population - Fix All Issues
// This script will populate the database with correct data

const mysql = require('mysql2/promise');

async function finalPopulate() {
    console.log('📝 Final database population...');
    
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
        
        // Clear existing data to avoid conflicts
        await clearExistingData(connection);
        
        // Add vehicles
        await addVehicles(connection);
        
        // Add drivers
        await addDrivers(connection);
        
        // Add trips
        await addTrips(connection);
        
        // Add maintenance records
        await addMaintenanceRecords(connection);
        
        // Final verification
        await verifyData(connection);
        
        await connection.end();
        console.log('✅ Final database population completed!');
        
    } catch (error) {
        console.error('❌ Final population failed:', error.message);
        process.exit(1);
    }
}

async function clearExistingData(connection) {
    try {
        console.log('🗑️ Clearing existing data...');
        await connection.execute('DELETE FROM maintenance_records');
        await connection.execute('DELETE FROM trips');
        await connection.execute('DELETE FROM drivers');
        await connection.execute('DELETE FROM vehicles WHERE id > 1'); // Keep first vehicle
        console.log('✅ Existing data cleared');
    } catch (error) {
        console.error('❌ Error clearing data:', error.message);
    }
}

async function addVehicles(connection) {
    try {
        console.log('🚗 Adding vehicles...');
        
        const vehicles = [
            ['T 111 AAA', 'Bus', 'Isuzu Novo', 2022, 45, 'Active', 'Diesel', '2026-02-28'],
            ['T 222 BBB', 'Minibus', 'Toyota Hiace', 2023, 18, 'Active', 'Diesel', '2026-03-15'],
            ['T 333 CCC', 'SUV', 'Toyota Prado', 2021, 8, 'Active', 'Petrol', '2026-02-20'],
            ['T 444 DDD', 'Bus', 'Mercedes Sprinter', 2020, 35, 'Under Maintenance', 'Diesel', '2026-01-25'],
            ['T 555 EEE', 'Sedan', 'Toyota Camry', 2022, 5, 'Active', 'Hybrid', '2026-03-10']
        ];
        
        for (const vehicle of vehicles) {
            await connection.execute(`
                INSERT INTO vehicles 
                (plate_number, vehicle_type, model, manufacture_year, capacity, status, fuel_type, next_maintenance_date) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, vehicle);
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        console.log(`✅ Vehicles added. Total: ${count[0].count}`);
        
    } catch (error) {
        console.error('❌ Error adding vehicles:', error.message);
    }
}

async function addDrivers(connection) {
    try {
        console.log('👨‍💼 Adding drivers...');
        
        const drivers = [
            ['Peter Mushi', 'DL-111111', '255-765-111111', 'peter@nit.ac.tz', 8, '2025-10-15', 'Active'],
            ['Sarah Kimario', 'DL-222222', '255-712-222222', 'sarah@nit.ac.tz', 4, '2025-06-30', 'Active'],
            ['David Mwangi', 'DL-333333', '255-789-333333', 'david@nit.ac.tz', 6, '2025-12-20', 'Active'],
            ['Anna Kessy', 'DL-444444', '255-754-444444', 'anna@nit.ac.tz', 5, '2025-09-10', 'On Leave'],
            ['Robert Massawe', 'DL-555555', '255-713-555555', 'robert@nit.ac.tz', 9, '2026-01-30', 'Active']
        ];
        
        for (const driver of drivers) {
            await connection.execute(`
                INSERT INTO drivers 
                (full_name, license_number, phone_number, email, experience_years, license_expiry, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, driver);
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
        console.log(`✅ Drivers added. Total: ${count[0].count}`);
        
    } catch (error) {
        console.error('❌ Error adding drivers:', error.message);
    }
}

async function addTrips(connection) {
    try {
        console.log('🛣️ Adding trips...');
        
        const trips = [
            ['NIT Campus', 'City Center', 2, 2, '2026-01-30', '08:00', '09:15', 25.5, 7.8, 15, 'Regular trip', 'Completed'],
            ['City Center', 'NIT Campus', 1, 1, '2026-01-30', '17:30', '18:45', 25.5, 8.1, 12, 'Return trip', 'Completed'],
            ['NIT Campus', 'Airport', 3, 3, '2026-01-31', '06:00', '07:30', 45.0, 12.5, 8, 'Airport transfer', 'Completed'],
            ['Airport', 'NIT Campus', 4, 4, '2026-01-31', '14:00', '15:30', 45.0, 13.2, 10, 'Airport pickup', 'Completed'],
            ['NIT Campus', 'Industrial Area', 5, 5, '2026-02-01', '09:00', '10:30', 35.0, 10.5, 20, 'Industrial visit', 'Scheduled'],
            ['Industrial Area', 'NIT Campus', 6, 6, '2026-02-01', '16:00', '17:15', 35.0, 9.8, 18, 'Return from industrial', 'Scheduled']
        ];
        
        for (const trip of trips) {
            await connection.execute(`
                INSERT INTO trips 
                (route_from, route_to, driver_id, vehicle_id, trip_date, departure_time, arrival_time, distance_km, fuel_consumed, passenger_count, notes, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, trip);
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM trips');
        console.log(`✅ Trips added. Total: ${count[0].count}`);
        
    } catch (error) {
        console.error('❌ Error adding trips:', error.message);
    }
}

async function addMaintenanceRecords(connection) {
    try {
        console.log('🔧 Adding maintenance records...');
        
        const maintenance = [
            [1, 'Oil Change', 'Engine oil and filter replacement', 45000, 15000, '2026-01-15', '2026-04-15', 'Quick Lube'],
            [2, 'Tire Rotation', 'Front and rear tire rotation', 25000, 45000, '2026-01-18', '2026-04-18', 'Tire Service'],
            [3, 'Brake Repair', 'Brake pad replacement and fluid change', 85000, 75000, '2026-01-20', '2026-04-20', 'Brake Masters'],
            [4, 'Transmission Service', 'Transmission fluid change', 120000, 80000, '2026-01-22', '2026-04-22', 'Transmission Experts'],
            [5, 'Air Filter Replacement', 'Engine air filter change', 15000, 55000, '2026-01-25', '2026-04-25', 'Auto Care']
        ];
        
        for (const record of maintenance) {
            await connection.execute(`
                INSERT INTO maintenance_records 
                (vehicle_id, service_type, description, cost, mileage, service_date, next_service_date, performed_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, record);
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM maintenance_records');
        console.log(`✅ Maintenance records added. Total: ${count[0].count}`);
        
    } catch (error) {
        console.error('❌ Error adding maintenance records:', error.message);
    }
}

async function verifyData(connection) {
    try {
        console.log('\n📊 Final data verification:');
        
        const [vehicles] = await connection.execute('SELECT COUNT(*) as count FROM vehicles');
        const [drivers] = await connection.execute('SELECT COUNT(*) as count FROM drivers');
        const [trips] = await connection.execute('SELECT COUNT(*) as count FROM trips');
        const [maintenance] = await connection.execute('SELECT COUNT(*) as count FROM maintenance_records');
        
        console.log(`   Vehicles: ${vehicles[0].count}`);
        console.log(`   Drivers: ${drivers[0].count}`);
        console.log(`   Trips: ${trips[0].count}`);
        console.log(`   Maintenance: ${maintenance[0].count}`);
        
        // Show sample data
        const [sampleVehicles] = await connection.execute('SELECT plate_number, vehicle_type, status FROM vehicles LIMIT 3');
        console.log('\n🚗 Sample vehicles:');
        sampleVehicles.forEach(v => console.log(`   ${v.plate_number} - ${v.vehicle_type} (${v.status})`));
        
    } catch (error) {
        console.error('❌ Error verifying data:', error.message);
    }
}

finalPopulate();
