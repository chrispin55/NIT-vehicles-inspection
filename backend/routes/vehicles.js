const express = require('express');
const router = express.Router();
const Vehicle = require('../models/Vehicle');

// GET /api/vehicles - Get all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.getAll();
    res.json({
      success: true,
      data: vehicles,
      message: 'Vehicles retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicles',
      error: error.message
    });
  }
});

// GET /api/vehicles/:id - Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.getById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: vehicle,
      message: 'Vehicle retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle',
      error: error.message
    });
  }
});

// POST /api/vehicles - Create new vehicle
router.post('/', async (req, res) => {
  try {
    const vehicleData = req.body;
    
    // Check if plate number already exists
    const existingVehicle = await Vehicle.getByPlateNumber(vehicleData.plate_number);
    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle with this plate number already exists'
      });
    }
    
    const newVehicle = await Vehicle.create(vehicleData);
    res.status(201).json({
      success: true,
      data: newVehicle,
      message: 'Vehicle created successfully'
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create vehicle',
      error: error.message
    });
  }
});

// PUT /api/vehicles/:id - Update vehicle
router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.update(req.params.id, req.body);
    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      data: updatedVehicle,
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update vehicle',
      error: error.message
    });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Vehicle.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }
    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete vehicle',
      error: error.message
    });
  }
});

// GET /api/vehicles/stats - Get vehicle statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Vehicle.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Vehicle statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vehicle statistics',
      error: error.message
    });
  }
});

// GET /api/vehicles/available - Get available vehicles
router.get('/available/list', async (req, res) => {
  try {
    const vehicles = await Vehicle.getAvailableVehicles();
    res.json({
      success: true,
      data: vehicles,
      message: 'Available vehicles retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available vehicles',
      error: error.message
    });
  }
});

module.exports = router;
