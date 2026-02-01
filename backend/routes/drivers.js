const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');

// GET /api/drivers - Get all drivers
router.get('/', async (req, res) => {
  try {
    const drivers = await Driver.getAll();
    res.json({
      success: true,
      data: drivers,
      message: 'Drivers retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers',
      error: error.message
    });
  }
});

// GET /api/drivers/:id - Get driver by ID
router.get('/:id', async (req, res) => {
  try {
    const driver = await Driver.getById(req.params.id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    res.json({
      success: true,
      data: driver,
      message: 'Driver retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver',
      error: error.message
    });
  }
});

// POST /api/drivers - Create new driver
router.post('/', async (req, res) => {
  try {
    const driverData = req.body;
    
    // Generate driver ID if not provided
    if (!driverData.driver_id) {
      const count = await Driver.getAll();
      driverData.driver_id = `DRV-${String(count.length + 1).padStart(3, '0')}`;
    }
    
    const newDriver = await Driver.create(driverData);
    res.status(201).json({
      success: true,
      data: newDriver,
      message: 'Driver created successfully'
    });
  } catch (error) {
    console.error('Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver',
      error: error.message
    });
  }
});

// PUT /api/drivers/:id - Update driver
router.put('/:id', async (req, res) => {
  try {
    const updatedDriver = await Driver.update(req.params.id, req.body);
    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    res.json({
      success: true,
      data: updatedDriver,
      message: 'Driver updated successfully'
    });
  } catch (error) {
    console.error('Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update driver',
      error: error.message
    });
  }
});

// DELETE /api/drivers/:id - Delete driver
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Driver.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    res.json({
      success: true,
      message: 'Driver deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete driver',
      error: error.message
    });
  }
});

// GET /api/drivers/active - Get active drivers
router.get('/active/list', async (req, res) => {
  try {
    const drivers = await Driver.getActiveDrivers();
    res.json({
      success: true,
      data: drivers,
      message: 'Active drivers retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching active drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active drivers',
      error: error.message
    });
  }
});

// PUT /api/drivers/:id/assign-vehicle - Assign vehicle to driver
router.put('/:id/assign-vehicle', async (req, res) => {
  try {
    const { vehicle_id } = req.body;
    const updatedDriver = await Driver.assignVehicle(req.params.id, vehicle_id);
    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    res.json({
      success: true,
      data: updatedDriver,
      message: 'Vehicle assigned to driver successfully'
    });
  } catch (error) {
    console.error('Error assigning vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign vehicle',
      error: error.message
    });
  }
});

// PUT /api/drivers/:id/unassign-vehicle - Unassign vehicle from driver
router.put('/:id/unassign-vehicle', async (req, res) => {
  try {
    const updatedDriver = await Driver.unassignVehicle(req.params.id);
    if (!updatedDriver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }
    res.json({
      success: true,
      data: updatedDriver,
      message: 'Vehicle unassigned from driver successfully'
    });
  } catch (error) {
    console.error('Error unassigning vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unassign vehicle',
      error: error.message
    });
  }
});

// GET /api/drivers/stats/summary - Get driver statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Driver.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Driver statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver statistics',
      error: error.message
    });
  }
});

module.exports = router;
