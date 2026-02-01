const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// GET /api/reports/dashboard - Get dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get all statistics in parallel
    const [vehicleStats, driverStats, tripStats, maintenanceStats, recentTrips] = await Promise.all([
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance,
          SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive
        FROM vehicles
      `),
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active
        FROM drivers
      `),
      query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as ongoing,
          SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed
        FROM trips
      `),
      query(`
        SELECT 
          COUNT(*) as total_services,
          SUM(cost) as total_cost,
          COUNT(CASE WHEN service_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as last_30_days
        FROM maintenance_records
      `),
      query(`
        SELECT t.*, d.full_name as driver_name, v.plate_number
        FROM trips t
        JOIN drivers d ON t.driver_id = d.id
        JOIN vehicles v ON t.vehicle_id = v.id
        ORDER BY t.created_at DESC
        LIMIT 5
      `)
    ]);

    // Get monthly fuel costs
    const fuelCosts = await query(`
      SELECT 
        MONTHNAME(fuel_date) as month,
        SUM(total_cost) as cost
      FROM fuel_records
      WHERE YEAR(fuel_date) = YEAR(CURDATE())
      GROUP BY MONTH(fuel_date), MONTHNAME(fuel_date)
      ORDER BY MONTH(fuel_date)
    `);

    // Get monthly operational costs
    const operationalCosts = await query(`
      SELECT 
        MONTHNAME(t.trip_date) as month,
        SUM(f.total_cost) as fuel_cost,
        COALESCE(SUM(m.cost), 0) as maintenance_cost,
        SUM(f.total_cost) + COALESCE(SUM(m.cost), 0) as total_cost
      FROM trips t
      LEFT JOIN fuel_records f ON MONTH(t.trip_date) = MONTH(f.fuel_date) AND YEAR(t.trip_date) = YEAR(f.fuel_date)
      LEFT JOIN maintenance_records m ON MONTH(t.trip_date) = MONTH(m.service_date) AND YEAR(t.trip_date) = YEAR(m.service_date)
      WHERE YEAR(t.trip_date) = YEAR(CURDATE())
      GROUP BY MONTH(t.trip_date), MONTHNAME(t.trip_date)
      ORDER BY MONTH(t.trip_date)
    `);

    const dashboardData = {
      stats: {
        vehicles: vehicleStats[0],
        drivers: driverStats[0],
        trips: tripStats[0],
        maintenance: maintenanceStats[0]
      },
      charts: {
        fuelCosts: fuelCosts,
        operationalCosts: operationalCosts
      },
      recentTrips: recentTrips
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// GET /api/reports/fuel-consumption - Get fuel consumption report
router.get('/fuel-consumption', async (req, res) => {
  try {
    const { startDate, endDate, vehicleId } = req.query;
    
    let sql = `
      SELECT 
        f.*,
        v.plate_number,
        v.model as vehicle_model
      FROM fuel_records f
      JOIN vehicles v ON f.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      sql += ' AND f.fuel_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND f.fuel_date <= ?';
      params.push(endDate);
    }
    
    if (vehicleId) {
      sql += ' AND f.vehicle_id = ?';
      params.push(vehicleId);
    }
    
    sql += ' ORDER BY f.fuel_date DESC';
    
    const records = await query(sql, params);
    
    // Get summary statistics
    const summary = await query(`
      SELECT 
        COUNT(*) as total_records,
        SUM(fuel_liters) as total_fuel,
        SUM(total_cost) as total_cost,
        AVG(cost_per_liter) as avg_cost_per_liter
      FROM fuel_records f
      WHERE 1=1
      ${startDate ? 'AND f.fuel_date >= ?' : ''}
      ${endDate ? 'AND f.fuel_date <= ?' : ''}
      ${vehicleId ? 'AND f.vehicle_id = ?' : ''}
    `, params);
    
    res.json({
      success: true,
      data: {
        records,
        summary: summary[0]
      },
      message: 'Fuel consumption report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching fuel consumption report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fuel consumption report',
      error: error.message
    });
  }
});

// GET /api/reports/trip-summary - Get trip summary report
router.get('/trip-summary', async (req, res) => {
  try {
    const { startDate, endDate, driverId, vehicleId } = req.query;
    
    let sql = `
      SELECT 
        t.*,
        d.full_name as driver_name,
        v.plate_number,
        v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      sql += ' AND t.trip_date >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND t.trip_date <= ?';
      params.push(endDate);
    }
    
    if (driverId) {
      sql += ' AND t.driver_id = ?';
      params.push(driverId);
    }
    
    if (vehicleId) {
      sql += ' AND t.vehicle_id = ?';
      params.push(vehicleId);
    }
    
    sql += ' ORDER BY t.trip_date DESC, t.trip_time DESC';
    
    const trips = await query(sql, params);
    
    // Get summary statistics
    const summary = await query(`
      SELECT 
        COUNT(*) as total_trips,
        SUM(estimated_fuel) as total_estimated_fuel,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as ongoing_trips,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_trips
      FROM trips t
      WHERE 1=1
      ${startDate ? 'AND t.trip_date >= ?' : ''}
      ${endDate ? 'AND t.trip_date <= ?' : ''}
      ${driverId ? 'AND t.driver_id = ?' : ''}
      ${vehicleId ? 'AND t.vehicle_id = ?' : ''}
    `, params);
    
    res.json({
      success: true,
      data: {
        trips,
        summary: summary[0]
      },
      message: 'Trip summary report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching trip summary report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip summary report',
      error: error.message
    });
  }
});

// GET /api/reports/vehicle-utilization - Get vehicle utilization report
router.get('/vehicle-utilization', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let sql = `
      SELECT 
        v.id,
        v.plate_number,
        v.model,
        v.status,
        COUNT(t.id) as total_trips,
        SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) as completed_trips,
        SUM(t.estimated_fuel) as total_fuel_consumed,
        SUM(t.distance_km) as total_distance
      FROM vehicles v
      LEFT JOIN trips t ON v.id = t.vehicle_id
      WHERE 1=1
    `;
    const params = [];
    
    if (startDate) {
      sql += ' AND (t.trip_date >= ? OR t.trip_date IS NULL)';
      params.push(startDate);
    }
    
    if (endDate) {
      sql += ' AND (t.trip_date <= ? OR t.trip_date IS NULL)';
      params.push(endDate);
    }
    
    sql += ' GROUP BY v.id, v.plate_number, v.model, v.status ORDER BY v.plate_number';
    
    const utilization = await query(sql, params);
    
    res.json({
      success: true,
      data: utilization,
      message: 'Vehicle utilization report retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vehicle utilization report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle utilization report',
      error: error.message
    });
  }
});

module.exports = router;
