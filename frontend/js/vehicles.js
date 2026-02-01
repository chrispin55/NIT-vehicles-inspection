// Vehicle Management functionality
class VehicleManager {
  constructor() {
    this.vehicles = [];
    this.init();
  }

  async init() {
    await this.loadVehicles();
    this.setupEventListeners();
  }

  async loadVehicles() {
    try {
      const response = await api.getVehicles();
      this.vehicles = response.data;
      this.renderVehicleTable();
      this.updateVehicleSelects();
    } catch (error) {
      console.error('Error loading vehicles:', error);
      showAlert('Failed to load vehicles', 'danger');
    }
  }

  renderVehicleTable() {
    const tbody = document.getElementById('vehicleList');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    this.vehicles.forEach(vehicle => {
      const row = document.createElement('tr');
      row.className = `vehicle-status-${vehicle.status.toLowerCase().replace(' ', '-')}`;
      row.innerHTML = `
        <td>${vehicle.plate_number}</td>
        <td>${vehicle.vehicle_type}</td>
        <td>${vehicle.model}</td>
        <td>${vehicle.manufacture_year}</td>
        <td><span class="badge-status badge-${this.getStatusClass(vehicle.status)}">${vehicle.status}</span></td>
        <td>
          <button class="btn btn-sm btn-nit-outline me-1" onclick="vehicleManager.editVehicle(${vehicle.id})">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="vehicleManager.deleteVehicle(${vehicle.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  getStatusClass(status) {
    const statusClasses = {
      'Active': 'active',
      'Under Maintenance': 'maintenance',
      'Inactive': 'danger'
    };
    return statusClasses[status] || 'secondary';
  }

  updateVehicleSelects() {
    const selects = [
      'assignedVehicle',
      'tripVehicle',
      'maintenanceVehicle'
    ];

    selects.forEach(selectId => {
      const select = document.getElementById(selectId);
      if (!select) return;

      // Keep the first option (usually "Not Assigned" or "Select Vehicle")
      const firstOption = select.options[0];
      select.innerHTML = '';
      if (firstOption) select.appendChild(firstOption);

      this.vehicles.forEach(vehicle => {
        if (vehicle.status === 'Active') {
          const option = document.createElement('option');
          option.value = vehicle.plate_number;
          option.textContent = `${vehicle.plate_number} (${vehicle.model})`;
          select.appendChild(option);
        }
      });
    });
  }

  setupEventListeners() {
    const form = document.getElementById('addVehicleForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddVehicle(e));
    }
  }

  async handleAddVehicle(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      showLoading(submitBtn);
      
      const formData = new FormData(e.target);
      const vehicleData = {
        plate_number: formData.get('plateNumber') || document.getElementById('plateNumber').value,
        vehicle_type: formData.get('vehicleType') || document.getElementById('vehicleType').value,
        model: formData.get('vehicleModel') || document.getElementById('vehicleModel').value,
        manufacture_year: parseInt(formData.get('manufactureYear') || document.getElementById('manufactureYear').value),
        status: formData.get('vehicleStatus') || document.getElementById('vehicleStatus').value,
        fuel_capacity: parseFloat(document.getElementById('fuelCapacity')?.value) || null,
        current_fuel: parseFloat(document.getElementById('currentFuel')?.value) || 0,
        mileage: parseFloat(document.getElementById('mileage')?.value) || 0
      };

      await api.createVehicle(vehicleData);
      showAlert('Vehicle added successfully!', 'success');
      e.target.reset();
      await this.loadVehicles();
      
    } catch (error) {
      console.error('Error adding vehicle:', error);
      showAlert(error.message || 'Failed to add vehicle', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  async editVehicle(vehicleId) {
    try {
      const vehicle = this.vehicles.find(v => v.id === vehicleId);
      if (!vehicle) return;

      // Populate form with vehicle data
      document.getElementById('plateNumber').value = vehicle.plate_number;
      document.getElementById('vehicleType').value = vehicle.vehicle_type;
      document.getElementById('vehicleModel').value = vehicle.model;
      document.getElementById('manufactureYear').value = vehicle.manufacture_year;
      document.getElementById('vehicleStatus').value = vehicle.status;

      // Change button to update mode
      const submitBtn = document.querySelector('#addVehicleForm button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Vehicle';
      submitBtn.onclick = () => this.updateVehicle(vehicleId);

      // Scroll to form
      document.getElementById('addVehicleForm').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error editing vehicle:', error);
      showAlert('Failed to load vehicle data', 'danger');
    }
  }

  async updateVehicle(vehicleId) {
    const form = document.getElementById('addVehicleForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      showLoading(submitBtn);
      
      const vehicleData = {
        plate_number: document.getElementById('plateNumber').value,
        vehicle_type: document.getElementById('vehicleType').value,
        model: document.getElementById('vehicleModel').value,
        manufacture_year: parseInt(document.getElementById('manufactureYear').value),
        status: document.getElementById('vehicleStatus').value
      };

      await api.updateVehicle(vehicleId, vehicleData);
      showAlert('Vehicle updated successfully!', 'success');
      
      // Reset form
      form.reset();
      submitBtn.innerHTML = '<i class="fas fa-plus me-2"></i>Add Vehicle';
      submitBtn.onclick = null;
      
      await this.loadVehicles();
      
    } catch (error) {
      console.error('Error updating vehicle:', error);
      showAlert(error.message || 'Failed to update vehicle', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  async deleteVehicle(vehicleId) {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteVehicle(vehicleId);
      showAlert('Vehicle deleted successfully!', 'success');
      await this.loadVehicles();
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      showAlert(error.message || 'Failed to delete vehicle', 'danger');
    }
  }

  // Method to get available vehicles for other modules
  getAvailableVehicles() {
    return this.vehicles.filter(vehicle => vehicle.status === 'Active');
  }

  // Method to get vehicle by plate number
  getVehicleByPlateNumber(plateNumber) {
    return this.vehicles.find(vehicle => vehicle.plate_number === plateNumber);
  }
}

// Initialize vehicle manager
let vehicleManager;
document.addEventListener('DOMContentLoaded', () => {
  vehicleManager = new VehicleManager();
  window.vehicleManager = vehicleManager;
});

// Make vehicle manager available globally
window.VehicleManager = VehicleManager;
