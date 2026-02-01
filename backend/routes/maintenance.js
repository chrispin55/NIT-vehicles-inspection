const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');

// GET /api/maintenance - Get all maintenance records
router.get('/', async (req, res) => {
  try {
    const records = await Maintenance.getAll();
    res.json({
      success: true,
      data: records,
      message: 'Maintenance records retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance records',
      error: error.message
    });
  }
});

// GET /api/maintenance/:id - Get maintenance record by ID
router.get('/:id', async (req, res) => {
  try {
    const record = await Maintenance.getById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    res.json({
      success: true,
      data: record,
      message: 'Maintenance record retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance record',
      error: error.message
    });
  }
});

// POST /api/maintenance - Create new maintenance record
router.post('/', async (req, res) => {
  try {
    const maintenanceData = req.body;
    const newRecord = await Maintenance.create(maintenanceData);
    res.status(201).json({
      success: true,
      data: newRecord,
      message: 'Maintenance record created successfully'
    });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create maintenance record',
      error: error.message
    });
  }
});

// PUT /api/maintenance/:id - Update maintenance record
router.put('/:id', async (req, res) => {
  try {
    const updatedRecord = await Maintenance.update(req.params.id, req.body);
    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    res.json({
      success: true,
      data: updatedRecord,
      message: 'Maintenance record updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update maintenance record',
      error: error.message
    });
  }
});

// DELETE /api/maintenance/:id - Delete maintenance record
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Maintenance.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Maintenance record not found'
      });
    }
    res.json({
      success: true,
      message: 'Maintenance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting maintenance record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete maintenance record',
      error: error.message
    });
  }
});

// GET /api/maintenance/vehicle/:vehicleId - Get maintenance records for specific vehicle
router.get('/vehicle/:vehicleId', async (req, res) => {
  try {
    const records = await Maintenance.getByVehicle(req.params.vehicleId);
    res.json({
      success: true,
      data: records,
      message: 'Vehicle maintenance records retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vehicle maintenance records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle maintenance records',
      error: error.message
    });
  }
});

// GET /api/maintenance/upcoming - Get upcoming services
router.get('/upcoming/list', async (req, res) => {
  try {
    const services = await Maintenance.getUpcomingServices();
    res.json({
      success: true,
      data: services,
      message: 'Upcoming services retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching upcoming services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming services',
      error: error.message
    });
  }
});

// GET /api/maintenance/overdue - Get overdue services
router.get('/overdue/list', async (req, res) => {
  try {
    const services = await Maintenance.getOverdueServices();
    res.json({
      success: true,
      data: services,
      message: 'Overdue services retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching overdue services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue services',
      error: error.message
    });
  }
});

// GET /api/maintenance/costs/monthly - Get monthly maintenance costs
router.get('/costs/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = new Date().getFullYear();
    const selectedYear = year || currentYear;
    
    const costs = await Maintenance.getMonthlyCosts(selectedYear, month);
    res.json({
      success: true,
      data: costs,
      message: 'Monthly maintenance costs retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching monthly maintenance costs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monthly maintenance costs',
      error: error.message
    });
  }
});

// GET /api/maintenance/stats/summary - Get maintenance statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Maintenance.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Maintenance statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch maintenance statistics',
      error: error.message
    });
  }
});

// GET /api/maintenance/stats/types - Get service type statistics
router.get('/stats/types', async (req, res) => {
  try {
    const stats = await Maintenance.getServiceTypeStats();
    res.json({
      success: true,
      data: stats,
      message: 'Service type statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching service type stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service type statistics',
      error: error.message
    });
  }
});

module.exports = router;
