-- NIT University Integrated Transport & Vehicle Management System Database Schema
-- Optimized for Railway MySQL deployment
-- Created for PROJECT KALI - ITVMS

-- Set character set and collation
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Create database (will be created by Railway automatically)
-- CREATE DATABASE IF NOT EXISTS nit_itvms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nit_itvms;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'manager', 'driver', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    plate_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('Bus', 'Minibus', 'SUV', 'Sedan', 'Pickup', 'Van') NOT NULL,
    model VARCHAR(100) NOT NULL,
    manufacture_year INT NOT NULL,
    status ENUM('Active', 'Under Maintenance', 'Inactive') DEFAULT 'Active',
    fuel_capacity DECIMAL(8,2),
    current_fuel DECIMAL(8,2) DEFAULT 0,
    mileage DECIMAL(10,2) DEFAULT 0,
    last_service_date DATE,
    next_service_date DATE,
    insurance_expiry DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_vehicles_plate (plate_number),
    INDEX idx_vehicles_status (status),
    INDEX idx_vehicles_type (vehicle_type),
    INDEX idx_vehicles_next_service (next_service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    experience_years INT DEFAULT 0,
    phone VARCHAR(20),
    email VARCHAR(100),
    assigned_vehicle_id INT NULL,
    status ENUM('Active', 'Inactive', 'On Leave') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL,
    INDEX idx_drivers_driver_id (driver_id),
    INDEX idx_drivers_license (license_number),
    INDEX idx_drivers_status (status),
    INDEX idx_drivers_assigned (assigned_vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id VARCHAR(20) UNIQUE NOT NULL,
    route_from VARCHAR(100) NOT NULL,
    route_to VARCHAR(100) NOT NULL,
    driver_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    trip_date DATE NOT NULL,
    trip_time TIME NOT NULL,
    estimated_fuel DECIMAL(8,2) NOT NULL,
    actual_fuel DECIMAL(8,2),
    status ENUM('Scheduled', 'In Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    distance_km DECIMAL(8,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id) ON DELETE RESTRICT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    INDEX idx_trips_trip_id (trip_id),
    INDEX idx_trips_date (trip_date),
    INDEX idx_trips_status (status),
    INDEX idx_trips_driver (driver_id),
    INDEX idx_trips_vehicle (vehicle_id),
    INDEX idx_trips_route (route_from, route_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Maintenance records table
CREATE TABLE IF NOT EXISTS maintenance_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    service_date DATE NOT NULL,
    service_type ENUM('Routine Maintenance', 'Oil Change', 'Brake Repair', 'Engine Repair', 'Tire Replacement', 'Other') NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    mileage_at_service DECIMAL(10,2),
    next_service_date DATE,
    service_provider VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_maintenance_vehicle (vehicle_id),
    INDEX idx_maintenance_date (service_date),
    INDEX idx_maintenance_type (service_type),
    INDEX idx_maintenance_next_service (next_service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Fuel consumption records table
CREATE TABLE IF NOT EXISTS fuel_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    fuel_date DATE NOT NULL,
    fuel_liters DECIMAL(8,2) NOT NULL,
    cost_per_liter DECIMAL(8,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    mileage DECIMAL(10,2),
    fuel_station VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_fuel_vehicle (vehicle_id),
    INDEX idx_fuel_date (fuel_date),
    INDEX idx_fuel_cost (total_cost)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reports table for generated reports
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_type ENUM('fuel', 'maintenance', 'trips', 'vehicles', 'drivers') NOT NULL,
    report_period VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    file_path VARCHAR(255),
    generated_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reports_type (report_type),
    INDEX idx_reports_period (report_period),
    INDEX idx_reports_generated (generated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data (only if tables are empty)
INSERT IGNORE INTO users (username, email, password_hash, full_name, role) VALUES
('admin', 'admin@nit.ac.tz', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin'),
('jmanager', 'manager@nit.ac.tz', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Transport Manager', 'manager');

INSERT IGNORE INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status, fuel_capacity, current_fuel, mileage) VALUES
('T 123 ABC', 'Minibus', 'Toyota Hiace', 2021, 'Active', 80.00, 65.50, 15420.00),
('T 456 DEF', 'SUV', 'Nissan Patrol', 2019, 'Active', 100.00, 45.00, 28350.00),
('T 789 GHI', 'SUV', 'Toyota Land Cruiser', 2022, 'Active', 120.00, 95.00, 8750.00);

INSERT IGNORE INTO drivers (driver_id, full_name, license_number, experience_years, phone, email, assigned_vehicle_id) VALUES
('DRV-001', 'John Mwambene', 'DL-123456', 8, '+255712345678', 'john.mwambene@nit.ac.tz', 1),
('DRV-002', 'Sarah Juma', 'DL-234567', 5, '+255712345679', 'sarah.juma@nit.ac.tz', 2),
('DRV-003', 'Robert Kimambo', 'DL-345678', 12, '+255712345680', 'robert.kimambo@nit.ac.tz', 3);

INSERT IGNORE INTO trips (trip_id, route_from, route_to, driver_id, vehicle_id, trip_date, trip_time, estimated_fuel, status) VALUES
('TR-2026-001', 'NIT Campus', 'Julius Nyerere Airport', 1, 1, CURDATE(), '08:00:00', 25.00, 'Scheduled'),
('TR-2026-002', 'NIT Campus', 'City Center', 2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00', 15.00, 'Scheduled'),
('TR-2026-003', 'NIT Campus', 'Mlimani City', 3, 3, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', 20.00, 'Scheduled');

INSERT IGNORE INTO maintenance_records (vehicle_id, service_date, service_type, cost, next_service_date, service_provider) VALUES
(2, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 'Brake Repair', 350000.00, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'NIT Auto Workshop'),
(1, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 'Routine Maintenance', 180000.00, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'Toyota Service Center'),
(3, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 'Oil Change', 120000.00, DATE_ADD(CURDATE(), INTERVAL 90 DAY), 'Quick Lube Center');

INSERT IGNORE INTO fuel_records (vehicle_id, fuel_date, fuel_liters, cost_per_liter, total_cost, mileage) VALUES
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 50.00, 2450.00, 122500.00, 15420.00),
(2, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 60.00, 2450.00, 147000.00, 28350.00),
(3, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 45.00, 2450.00, 110250.00, 8750.00);

-- Create view for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM vehicles) as total_vehicles,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'Active') as active_vehicles,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'Under Maintenance') as maintenance_vehicles,
    (SELECT COUNT(*) FROM vehicles WHERE status = 'Inactive') as inactive_vehicles,
    (SELECT COUNT(*) FROM drivers WHERE status = 'Active') as active_drivers,
    (SELECT COUNT(*) FROM drivers WHERE status = 'Inactive') as inactive_drivers,
    (SELECT COUNT(*) FROM drivers WHERE status = 'On Leave') as drivers_on_leave,
    (SELECT COUNT(*) FROM trips WHERE status = 'In Progress') as ongoing_trips,
    (SELECT COUNT(*) FROM trips WHERE DATE(trip_date) = CURDATE()) as today_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'Scheduled') as scheduled_trips,
    (SELECT COUNT(*) FROM trips WHERE status = 'Completed') as completed_trips,
    (SELECT COUNT(*) FROM maintenance_records WHERE service_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_services,
    (SELECT COALESCE(SUM(cost), 0) FROM maintenance_records WHERE service_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_maintenance_cost,
    (SELECT COALESCE(SUM(total_cost), 0) FROM fuel_records WHERE fuel_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as recent_fuel_cost;

SET FOREIGN_KEY_CHECKS = 1;

-- Success message
SELECT 'Database schema created successfully for Railway deployment!' as message;
