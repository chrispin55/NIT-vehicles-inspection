// Trip Management functionality
class TripManager {
  constructor() {
    this.trips = [];
    this.init();
  }

  async init() {
    await this.loadTrips();
    this.setupEventListeners();
  }

  async loadTrips() {
    try {
      const response = await api.getTrips();
      this.trips = response.data;
      this.renderTripTable();
    } catch (error) {
      console.error('Error loading trips:', error);
      showAlert('Failed to load trips', 'danger');
    }
  }

  renderTripTable() {
    const tbody = document.querySelector('#trips .table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    this.trips.forEach(trip => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${trip.trip_id}</td>
        <td>${trip.route_from} → ${trip.route_to}</td>
        <td>${trip.driver_name}</td>
        <td>${trip.plate_number}</td>
        <td>${formatDateTime(trip.trip_date, trip.trip_time)}</td>
        <td><span class="badge-status badge-${this.getStatusClass(trip.status)}">${trip.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  getStatusClass(status) {
    const statusClasses = {
      'Scheduled': 'trip',
      'In Progress': 'warning',
      'Completed': 'active',
      'Cancelled': 'danger'
    };
    return statusClasses[status] || 'secondary';
  }

  setupEventListeners() {
    const form = document.getElementById('addTripForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddTrip(e));
    }
  }

  async handleAddTrip(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      showLoading(submitBtn);
      
      const formData = new FormData(e.target);
      const route = formData.get('tripRoute') || document.getElementById('tripRoute').value;
      const [routeFrom, routeTo] = route.split('→').map(s => s.trim());
      
      const tripData = {
        route_from: routeFrom,
        route_to: routeTo,
        driver_id: this.getDriverIdFromName(formData.get('tripDriver') || document.getElementById('tripDriver').value),
        vehicle_id: this.getVehicleIdFromPlateNumber(formData.get('tripVehicle') || document.getElementById('tripVehicle').value),
        trip_date: formData.get('tripDate') || document.getElementById('tripDate').value,
        trip_time: formData.get('tripTime') || document.getElementById('tripTime').value,
        estimated_fuel: parseFloat(formData.get('fuelUsed') || document.getElementById('fuelUsed').value),
        notes: document.getElementById('tripNotes')?.value || null
      };

      await api.createTrip(tripData);
      showAlert('Trip scheduled successfully!', 'success');
      e.target.reset();
      
      // Reset date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('tripDate').value = today;
      
      await this.loadTrips();
      
    } catch (error) {
      console.error('Error adding trip:', error);
      showAlert(error.message || 'Failed to schedule trip', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  getDriverIdFromName(driverName) {
    if (!driverName) return null;
    
    const driver = window.driverManager?.getDriverByName(driverName);
    return driver ? driver.id : null;
  }

  getVehicleIdFromPlateNumber(plateNumber) {
    if (!plateNumber) return null;
    
    const vehicle = window.vehicleManager?.getVehicleByPlateNumber(plateNumber);
    return vehicle ? vehicle.id : null;
  }

  async editTrip(tripId) {
    try {
      const trip = this.trips.find(t => t.id === tripId);
      if (!trip) return;

      // Populate form with trip data
      document.getElementById('tripRoute').value = `${trip.route_from} → ${trip.route_to}`;
      document.getElementById('tripDriver').value = trip.driver_name;
      document.getElementById('tripVehicle').value = trip.plate_number;
      document.getElementById('tripDate').value = trip.trip_date;
      document.getElementById('tripTime').value = trip.trip_time;
      document.getElementById('fuelUsed').value = trip.estimated_fuel;
      document.getElementById('tripNotes').value = trip.notes || '';

      // Change button to update mode
      const submitBtn = document.querySelector('#addTripForm button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Trip';
      submitBtn.onclick = () => this.updateTrip(tripId);

      // Scroll to form
      document.getElementById('addTripForm').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error editing trip:', error);
      showAlert('Failed to load trip data', 'danger');
    }
  }

  async updateTrip(tripId) {
    const form = document.getElementById('addTripForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      showLoading(submitBtn);
      
      const route = document.getElementById('tripRoute').value;
      const [routeFrom, routeTo] = route.split('→').map(s => s.trim());
      
      const tripData = {
        route_from: routeFrom,
        route_to: routeTo,
        driver_id: this.getDriverIdFromName(document.getElementById('tripDriver').value),
        vehicle_id: this.getVehicleIdFromPlateNumber(document.getElementById('tripVehicle').value),
        trip_date: document.getElementById('tripDate').value,
        trip_time: document.getElementById('tripTime').value,
        estimated_fuel: parseFloat(document.getElementById('fuelUsed').value),
        notes: document.getElementById('tripNotes').value || null
      };

      await api.updateTrip(tripId, tripData);
      showAlert('Trip updated successfully!', 'success');
      
      // Reset form
      form.reset();
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('tripDate').value = today;
      submitBtn.innerHTML = '<i class="fas fa-road me-2"></i>Schedule Trip';
      submitBtn.onclick = null;
      
      await this.loadTrips();
      
    } catch (error) {
      console.error('Error updating trip:', error);
      showAlert(error.message || 'Failed to update trip', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  async deleteTrip(tripId) {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteTrip(tripId);
      showAlert('Trip deleted successfully!', 'success');
      await this.loadTrips();
    } catch (error) {
      console.error('Error deleting trip:', error);
      showAlert(error.message || 'Failed to delete trip', 'danger');
    }
  }

  async updateTripStatus(tripId, status) {
    try {
      await api.updateTripStatus(tripId, status);
      showAlert(`Trip status updated to ${status}!`, 'success');
      await this.loadTrips();
    } catch (error) {
      console.error('Error updating trip status:', error);
      showAlert(error.message || 'Failed to update trip status', 'danger');
    }
  }

  // Method to get today's trips
  getTodayTrips() {
    const today = new Date().toISOString().split('T')[0];
    return this.trips.filter(trip => trip.trip_date === today);
  }

  // Method to get upcoming trips
  getUpcomingTrips() {
    const today = new Date().toISOString().split('T')[0];
    return this.trips.filter(trip => 
      trip.trip_date >= today && ['Scheduled', 'In Progress'].includes(trip.status)
    );
  }

  // Method to get completed trips
  getCompletedTrips() {
    return this.trips.filter(trip => trip.status === 'Completed');
  }
}

// Initialize trip manager
let tripManager;
document.addEventListener('DOMContentLoaded', () => {
  tripManager = new TripManager();
  window.tripManager = tripManager;
});

// Make trip manager available globally
window.TripManager = TripManager;
