const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');

// GET /api/trips - Get all trips
router.get('/', async (req, res) => {
  try {
    const trips = await Trip.getAll();
    res.json({
      success: true,
      data: trips,
      message: 'Trips retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trips',
      error: error.message
    });
  }
});

// GET /api/trips/:id - Get trip by ID
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.getById(req.params.id);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    res.json({
      success: true,
      data: trip,
      message: 'Trip retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip',
      error: error.message
    });
  }
});

// POST /api/trips - Create new trip
router.post('/', async (req, res) => {
  try {
    const tripData = req.body;
    
    // Generate trip ID if not provided
    if (!tripData.trip_id) {
      const currentYear = new Date().getFullYear();
      const count = await Trip.getAll();
      tripData.trip_id = `TR-${currentYear}-${String(count.length + 1).padStart(3, '0')}`;
    }
    
    const newTrip = await Trip.create(tripData);
    res.status(201).json({
      success: true,
      data: newTrip,
      message: 'Trip created successfully'
    });
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trip',
      error: error.message
    });
  }
});

// PUT /api/trips/:id - Update trip
router.put('/:id', async (req, res) => {
  try {
    const updatedTrip = await Trip.update(req.params.id, req.body);
    if (!updatedTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    res.json({
      success: true,
      data: updatedTrip,
      message: 'Trip updated successfully'
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip',
      error: error.message
    });
  }
});

// DELETE /api/trips/:id - Delete trip
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Trip.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete trip',
      error: error.message
    });
  }
});

// PUT /api/trips/:id/status - Update trip status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const updatedTrip = await Trip.updateStatus(req.params.id, status);
    if (!updatedTrip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }
    res.json({
      success: true,
      data: updatedTrip,
      message: 'Trip status updated successfully'
    });
  } catch (error) {
    console.error('Error updating trip status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update trip status',
      error: error.message
    });
  }
});

// GET /api/trips/today - Get today's trips
router.get('/today/list', async (req, res) => {
  try {
    const trips = await Trip.getTodayTrips();
    res.json({
      success: true,
      data: trips,
      message: 'Today\'s trips retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching today\'s trips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s trips',
      error: error.message
    });
  }
});

// GET /api/trips/upcoming - Get upcoming trips
router.get('/upcoming/list', async (req, res) => {
  try {
    const trips = await Trip.getUpcomingTrips();
    res.json({
      success: true,
      data: trips,
      message: 'Upcoming trips retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching upcoming trips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming trips',
      error: error.message
    });
  }
});

// GET /api/trips/recent - Get recent completed trips
router.get('/recent/list', async (req, res) => {
  try {
    const trips = await Trip.getRecentTrips();
    res.json({
      success: true,
      data: trips,
      message: 'Recent trips retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching recent trips:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent trips',
      error: error.message
    });
  }
});

// GET /api/trips/stats/summary - Get trip statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Trip.getStats();
    res.json({
      success: true,
      data: stats,
      message: 'Trip statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching trip stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trip statistics',
      error: error.message
    });
  }
});

module.exports = router;
