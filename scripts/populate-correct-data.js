// Populate Railway Database with Correct Column Names
// This script uses the actual column names from the database

const mysql = require('mysql2/promise');

async function populateCorrectData() {
    console.log('📝 Populating Railway database with correct column names...');
    
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
        
        // Add more vehicles
        await addMoreVehicles(connection);
        
        // Add more drivers
        await addMoreDrivers(connection);
        
        // Add more trips with correct column names
        await addMoreTrips(connection);
        
        // Add more maintenance records with correct column names
        await addMoreMaintenanceRecords(connection);
        
        await connection.end();
        console.log('✅ Database population completed successfully!');
        
    } catch (error) {
        console.error('❌ Database population failed:', error.message);
        process.exit(1);
    }
}

async function addMoreVehicles(connection) {
    try {
        console.log('🚗 Adding more vehicles...');
        
        const vehicles = [
            ['T 111 AAA', 'Bus', 'Isuzu Novo', 2022, 45, 'Active', 'Diesel', '2026-02-28'],
            ['T 222 BBB', 'Minibus', 'Toyota Hiace', 2023, 18, 'Active', 'Diesel', '2026-03-15'],
            ['T 333 CCC', 'SUV', 'Toyota Prado', 2021, 8, 'Active', 'Petrol', '2026-02-20'],
            ['T 444 DDD', 'Bus', 'Mercedes Sprinter', 2020, 35, 'Under Maintenance', 'Diesel', '2026-01-25'],
            ['T 555 EEE', 'Sedan', 'Toyota Camry', 2022, 5, 'Active', 'Hybrid', '2026-03-10'],
            ['T 666 FFF', 'Pickup', 'Toyota Hilux', 2021, 6, 'Active', 'Diesel', '2026-02-15'],
            ['T 777 GGG', 'Van', 'Nissan NV350', 2023, 12, 'Active', 'Petrol', '2026-03-01'],
            ['T 888 HHH', 'Minibus', 'Ford Transit', 2022, 16, 'Active', 'Diesel', '2026-02-25']
        ];
        
        for (const vehicle of vehicles) {
            await connection.execute(`
                INSERT IGNORE INTO vehicles 
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

async function addMoreDrivers(connection) {
    try {
        console.log('👨‍💼 Adding more drivers...');
        
        const drivers = [
            ['Peter Mushi', 'DL-111111', '255-765-111111', 'peter@nit.ac.tz', 8, '2025-10-15', 'Active'],
            ['Sarah Kimario', 'DL-222222', '255-712-222222', 'sarah@nit.ac.tz', 4, '2025-06-30', 'Active'],
            ['David Mwangi', 'DL-333333', '255-789-333333', 'david@nit.ac.tz', 6, '2025-12-20', 'Active'],
            ['Anna Kessy', 'DL-444444', '255-754-444444', 'anna@nit.ac.tz', 5, '2025-09-10', 'On Leave'],
            ['Robert Massawe', 'DL-555555', '255-713-555555', 'robert@nit.ac.tz', 9, '2026-01-30', 'Active'],
            ['Grace Mwalimu', 'DL-666666', '255-778-666666', 'grace@nit.ac.tz', 3, '2025-07-25', 'Active'],
            ['James Mcharo', 'DL-777777', '255-721-777777', 'james@nit.ac.tz', 7, '2025-11-15', 'Active'],
            ['Lucy Mgaya', 'DL-888888', '255-767-888888', 'lucy@nit.ac.tz', 2, '2025-05-20', 'Active']
        ];
        
        for (const driver of drivers) {
            await connection.execute(`
                INSERT IGNORE INTO drivers 
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

async function addMoreTrips(connection) {
    try {
        console.log('🛣️ Adding more trips...');
        
        const trips = [
            ['NIT Campus', 'City Center', 2, 2, '2026-01-30', '08:00', '09:15', 25.5, 7.8, 15, 'Regular trip', 'Completed'],
            ['City Center', 'NIT Campus', 1, 1, '2026-01-30', '17:30', '18:45', 25.5, 8.1, 12, 'Return trip', 'Completed'],
            ['NIT Campus', 'Airport', 3, 3, '2026-01-31', '06:00', '07:30', 45.0, 12.5, 8, 'Airport transfer', 'Completed'],
            ['Airport', 'NIT Campus', 4, 4, '2026-01-31', '14:00', '15:30', 45.0, 13.2, 10, 'Airport pickup', 'Completed'],
            ['NIT Campus', 'Industrial Area', 5, 5, '2026-02-01', '09:00', '10:30', 35.0, 10.5, 20, 'Industrial visit', 'Scheduled'],
            ['Industrial Area', 'NIT Campus', 6, 6, '2026-02-01', '16:00', '17:15', 35.0, 9.8, 18, 'Return from industrial', 'Scheduled'],
            ['NIT Campus', 'Shopping Mall', 7, 7, '2026-02-02', '11:00', '12:00', 15.0, 4.5, 25, 'Shopping trip', 'Scheduled'],
            ['Shopping Mall', 'NIT Campus', 8, 8, '2026-02-02', '13:00', '14:00', 15.0, 4.2, 22, 'Return from shopping', 'Scheduled'],
            ['NIT Campus', 'Bus Terminal', 1, 1, '2026-02-03', '07:30', '08:45', 20.0, 6.5, 30, 'Terminal transfer', 'Scheduled'],
            ['Bus Terminal', 'NIT Campus', 2, 2, '2026-02-03', '16:30', '17:45', 20.0, 6.8, 28, 'Terminal pickup', 'Scheduled']
        ];
        
        for (const trip of trips) {
            await connection.execute(`
                INSERT IGNORE INTO trips 
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

async function addMoreMaintenanceRecords(connection) {
    try {
        console.log('🔧 Adding more maintenance records...');
        
        const maintenance = [
            [1, 'Oil Change', 'Engine oil and filter replacement', 45000, 15000, '2026-01-15', '2026-04-15', 'Quick Lube', 'Completed'],
            [2, 'Tire Rotation', 'Front and rear tire rotation', 25000, 45000, '2026-01-18', '2026-04-18', 'Tire Service', 'Completed'],
            [3, 'Brake Repair', 'Brake pad replacement and fluid change', 85000, 75000, '2026-01-20', '2026-04-20', 'Brake Masters', 'Completed'],
            [4, 'Transmission Service', 'Transmission fluid change', 120000, 80000, '2026-01-22', '2026-04-22', 'Transmission Experts', 'In Progress'],
            [5, 'Air Filter Replacement', 'Engine air filter change', 15000, 55000, '2026-01-25', '2026-04-25', 'Auto Care', 'Scheduled'],
            [6, 'Battery Check', 'Battery testing and replacement', 75000, 65000, '2026-01-28', '2026-04-28', 'Battery Pro', 'Scheduled'],
            [7, 'Cooling System', 'Radiator flush and coolant replacement', 35000, 45000, '2026-02-01', '2026-05-01', 'Cooling Experts', 'Scheduled'],
            [8, 'Suspension Check', 'Shock absorbers and struts inspection', 55000, 70000, '2026-02-03', '2026-05-03', 'Suspension Pro', 'Scheduled']
        ];
        
        for (const record of maintenance) {
            await connection.execute(`
                INSERT IGNORE INTO maintenance_records 
                (vehicle_id, service_type, description, cost, mileage, service_date, next_service_date, performed_by, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Completed')
            `, record);
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as count FROM maintenance_records');
        console.log(`✅ Maintenance records added. Total: ${count[0].count}`);
        
    } catch (error) {
        console.error('❌ Error adding maintenance records:', error.message);
    }
}

populateCorrectData();
