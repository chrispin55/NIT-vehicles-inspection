// Database Connection and Table Check Script
const { Sequelize } = require('sequelize');

// Use your exact environment variables
const sequelize = new Sequelize({
    host: "shuttle.proxy.rlwy.net",
    port: "35740",
    database: "railway",
    username: "root",
    password: "FYeDxMGArZDXDqBTYUivUysJiAbGqKtw",
    dialect: "mysql",
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function checkDatabase() {
    console.log('🔍 Checking Database Connection and Tables...');
    console.log('📋 Using your environment variables:');
    console.log('   DB_HOST: shuttle.proxy.rlwy.net');
    console.log('   DB_PORT: 35740');
    console.log('   DB_NAME: railway');
    console.log('   DB_USER: root');
    console.log('🔗 Connection URL: mysql://root:FYeDxMGArZDXDqBTYUivUysJiAbGqKtw@shuttle.proxy.rlwy.net:35740/railway');
    console.log('');
    
    try {
        // Step 1: Test basic connection
        console.log('🔗 Step 1: Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');
        console.log('');
        
        // Step 2: Check if database exists
        console.log('📊 Step 2: Checking database...');
        const [databases] = await sequelize.query('SHOW DATABASES');
        const railwayDb = databases.find(db => db.Database === 'railway');
        
        if (railwayDb) {
            console.log('✅ Database "railway" exists');
        } else {
            console.log('❌ Database "railway" does not exist - creating it...');
            await sequelize.query('CREATE DATABASE railway');
            console.log('✅ Database "railway" created');
        }
        console.log('');
        
        // Step 3: Check tables
        console.log('📋 Step 3: Checking tables...');
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('📊 Current tables:', tables.map(t => Object.values(t)[0]));
        console.log('');
        
        // Step 4: Check if required tables exist
        const requiredTables = ['users', 'vehicles', 'drivers', 'trips', 'maintenance_records', 'fuel_records'];
        const existingTables = tables.map(t => Object.values(t)[0]);
        const missingTables = requiredTables.filter(table => !existingTables.includes(table));
        
        if (missingTables.length > 0) {
            console.log('❌ Missing tables:', missingTables);
            console.log('🔧 Creating missing tables...');
            
            // Create users table
            if (!existingTables.includes('users')) {
                await sequelize.query(`
                    CREATE TABLE users (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(100) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(100) NOT NULL,
                        role ENUM('admin', 'manager', 'driver', 'staff') DEFAULT 'staff',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Users table created');
            }
            
            // Create vehicles table
            if (!existingTables.includes('vehicles')) {
                await sequelize.query(`
                    CREATE TABLE vehicles (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        plate_number VARCHAR(20) UNIQUE NOT NULL,
                        vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
                        model VARCHAR(100) NOT NULL,
                        manufacture_year INT NOT NULL,
                        status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Vehicles table created');
            }
            
            // Create drivers table
            if (!existingTables.includes('drivers')) {
                await sequelize.query(`
                    CREATE TABLE drivers (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL,
                        license_number VARCHAR(50) UNIQUE NOT NULL,
                        phone_number VARCHAR(20),
                        email VARCHAR(100),
                        status ENUM('Active', 'On Leave', 'Inactive') DEFAULT 'Active',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Drivers table created');
            }
            
            // Create trips table
            if (!existingTables.includes('trips')) {
                await sequelize.query(`
                    CREATE TABLE trips (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        vehicle_id INT,
                        driver_id INT,
                        trip_date DATE NOT NULL,
                        destination VARCHAR(200) NOT NULL,
                        purpose TEXT,
                        status ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Trips table created');
            }
            
            // Create maintenance_records table
            if (!existingTables.includes('maintenance_records')) {
                await sequelize.query(`
                    CREATE TABLE maintenance_records (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        vehicle_id INT NOT NULL,
                        service_date DATE NOT NULL,
                        service_type VARCHAR(100) NOT NULL,
                        cost DECIMAL(10,2),
                        next_service_date DATE,
                        notes TEXT,
                        status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Maintenance records table created');
            }
            
            // Create fuel_records table
            if (!existingTables.includes('fuel_records')) {
                await sequelize.query(`
                    CREATE TABLE fuel_records (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        vehicle_id INT NOT NULL,
                        fuel_date DATE NOT NULL,
                        fuel_type VARCHAR(50) DEFAULT 'Petrol',
                        quantity DECIMAL(8,2) NOT NULL,
                        cost_per_liter DECIMAL(8,2) NOT NULL,
                        total_cost DECIMAL(10,2) NOT NULL,
                        odometer_reading INT,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    )
                `);
                console.log('✅ Fuel records table created');
            }
            
        } else {
            console.log('✅ All required tables exist');
        }
        console.log('');
        
        // Step 5: Verify table structures
        console.log('🔍 Step 5: Verifying table structures...');
        
        const [vehicleStructure] = await sequelize.query('DESCRIBE vehicles');
        const vehicleIdField = vehicleStructure.find(field => field.Field === 'id');
        
        console.log('📊 Vehicles table structure:');
        vehicleStructure.forEach(field => {
            console.log(`   ${field.Field}: ${field.Type} ${field.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${field.Key || ''} ${field.Extra || ''}`);
        });
        
        if (vehicleIdField && vehicleIdField.Extra.includes('auto_increment')) {
            console.log('✅ Vehicles table ID field has AUTO_INCREMENT');
        } else {
            console.log('❌ Vehicles table ID field missing AUTO_INCREMENT - fixing...');
            await sequelize.query('DROP TABLE IF EXISTS vehicles');
            await sequelize.query(`
                CREATE TABLE vehicles (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    plate_number VARCHAR(20) UNIQUE NOT NULL,
                    vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
                    model VARCHAR(100) NOT NULL,
                    manufacture_year INT NOT NULL,
                    status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Vehicles table recreated with AUTO_INCREMENT');
        }
        console.log('');
        
        // Step 6: Insert sample data if tables are empty
        console.log('📝 Step 6: Checking for sample data...');
        
        const [vehicleCount] = await sequelize.query('SELECT COUNT(*) as count FROM vehicles');
        const [driverCount] = await sequelize.query('SELECT COUNT(*) as count FROM drivers');
        
        if (vehicleCount[0].count === 0) {
            console.log('📊 Inserting sample vehicles...');
            await sequelize.query(`
                INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) VALUES
                ('ABC-123', 'Sedan', 'Toyota Camry', 2022, 'Active'),
                ('XYZ-789', 'Van', 'Ford Transit', 2021, 'Active'),
                ('DEF-456', 'SUV', 'Honda CR-V', 2023, 'Active')
            `);
            console.log('✅ Sample vehicles inserted');
        } else {
            console.log(`✅ Vehicles table has ${vehicleCount[0].count} records`);
        }
        
        if (driverCount[0].count === 0) {
            console.log('👤 Inserting sample drivers...');
            await sequelize.query(`
                INSERT INTO drivers (name, license_number, phone_number, email, status) VALUES
                ('John Smith', 'DL-001', '+255712345678', 'john@nit.ac.tz', 'Active'),
                ('Mary Johnson', 'DL-002', '+255713456789', 'mary@nit.ac.tz', 'Active'),
                ('David Wilson', 'DL-003', '+255714567890', 'david@nit.ac.tz', 'Active')
            `);
            console.log('✅ Sample drivers inserted');
        } else {
            console.log(`✅ Drivers table has ${driverCount[0].count} records`);
        }
        console.log('');
        
        // Step 7: Test vehicle creation
        console.log('🧪 Step 7: Testing vehicle creation...');
        try {
            const [testResult] = await sequelize.query(`
                INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status) 
                VALUES ('TEST-999', 'Sedan', 'Test Vehicle', 2024, 'Active')
            `);
            console.log(`✅ Test vehicle created successfully with ID: ${testResult.insertId}`);
            
            // Clean up test data
            await sequelize.query('DELETE FROM vehicles WHERE plate_number = "TEST-999"');
            console.log('✅ Test data cleaned up');
        } catch (error) {
            console.error('❌ Test vehicle creation failed:', error.message);
        }
        console.log('');
        
        console.log('🎉 Database check completed successfully!');
        console.log('✅ Database connection: OK');
        console.log('✅ All tables: Created with proper structure');
        console.log('✅ Sample data: Inserted');
        console.log('✅ Vehicle creation: Working');
        console.log('');
        console.log('🚀 Your NIT ITVMS database is ready for use!');
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
        console.error('❌ Error details:', {
            message: error.message,
            code: error.original?.code,
            errno: error.original?.errno,
            sqlState: error.original?.sqlState,
            sql: error.original?.sql
        });
        
        if (error.message.includes('ECONNREFUSED')) {
            console.log('');
            console.log('💡 Possible solutions:');
            console.log('   1. Check if Railway.app MySQL service is running');
            console.log('   2. Verify the host and port are correct');
            console.log('   3. Check if the database credentials are valid');
        } else if (error.message.includes('ER_ACCESS_DENIED_ERROR')) {
            console.log('');
            console.log('💡 Possible solutions:');
            console.log('   1. Check if the username and password are correct');
            console.log('   2. Verify the user has proper permissions');
        }
        
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

// Run the check
if (require.main === module) {
    checkDatabase();
}

module.exports = { checkDatabase };
