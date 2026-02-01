// Driver Management functionality
class DriverManager {
  constructor() {
    this.drivers = [];
    this.init();
  }

  async init() {
    await this.loadDrivers();
    this.setupEventListeners();
  }

  async loadDrivers() {
    try {
      const response = await api.getDrivers();
      this.drivers = response.data;
      this.renderDriverTable();
      this.updateDriverSelects();
    } catch (error) {
      console.error('Error loading drivers:', error);
      showAlert('Failed to load drivers', 'danger');
    }
  }

  renderDriverTable() {
    const tbody = document.querySelector('#drivers .table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    this.drivers.forEach(driver => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${driver.driver_id}</td>
        <td>${driver.full_name}</td>
        <td>${driver.license_number}</td>
        <td>${driver.experience_years} years</td>
        <td>${driver.plate_number || 'Not Assigned'}</td>
        <td><span class="badge-status badge-${this.getStatusClass(driver.status)}">${driver.status}</span></td>
      `;
      tbody.appendChild(row);
    });
  }

  getStatusClass(status) {
    const statusClasses = {
      'Active': 'active',
      'Inactive': 'danger',
      'On Leave': 'warning'
    };
    return statusClasses[status] || 'secondary';
  }

  updateDriverSelects() {
    const select = document.getElementById('tripDriver');
    if (!select) return;

    // Keep the first option
    const firstOption = select.options[0];
    select.innerHTML = '';
    if (firstOption) select.appendChild(firstOption);

    this.drivers.forEach(driver => {
      if (driver.status === 'Active') {
        const option = document.createElement('option');
        option.value = driver.full_name;
        option.textContent = driver.full_name;
        select.appendChild(option);
      }
    });
  }

  setupEventListeners() {
    const form = document.getElementById('addDriverForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddDriver(e));
    }
  }

  async handleAddDriver(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      showLoading(submitBtn);
      
      const formData = new FormData(e.target);
      const driverData = {
        full_name: formData.get('driverName') || document.getElementById('driverName').value,
        license_number: formData.get('licenseNumber') || document.getElementById('licenseNumber').value,
        experience_years: parseInt(formData.get('experience') || document.getElementById('experience').value),
        phone: document.getElementById('driverPhone')?.value || null,
        email: document.getElementById('driverEmail')?.value || null,
        assigned_vehicle_id: this.getVehicleIdFromPlateNumber(formData.get('assignedVehicle') || document.getElementById('assignedVehicle').value)
      };

      await api.createDriver(driverData);
      showAlert('Driver added successfully!', 'success');
      e.target.reset();
      await this.loadDrivers();
      
    } catch (error) {
      console.error('Error adding driver:', error);
      showAlert(error.message || 'Failed to add driver', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  getVehicleIdFromPlateNumber(plateNumber) {
    if (!plateNumber || plateNumber === '') return null;
    
    const vehicle = window.vehicleManager?.getVehicleByPlateNumber(plateNumber);
    return vehicle ? vehicle.id : null;
  }

  async editDriver(driverId) {
    try {
      const driver = this.drivers.find(d => d.id === driverId);
      if (!driver) return;

      // Populate form with driver data
      document.getElementById('driverName').value = driver.full_name;
      document.getElementById('licenseNumber').value = driver.license_number;
      document.getElementById('experience').value = driver.experience_years;
      document.getElementById('driverPhone').value = driver.phone || '';
      document.getElementById('driverEmail').value = driver.email || '';
      document.getElementById('assignedVehicle').value = driver.plate_number || '';

      // Change button to update mode
      const submitBtn = document.querySelector('#addDriverForm button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Driver';
      submitBtn.onclick = () => this.updateDriver(driverId);

      // Scroll to form
      document.getElementById('addDriverForm').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error editing driver:', error);
      showAlert('Failed to load driver data', 'danger');
    }
  }

  async updateDriver(driverId) {
    const form = document.getElementById('addDriverForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      showLoading(submitBtn);
      
      const driverData = {
        full_name: document.getElementById('driverName').value,
        license_number: document.getElementById('licenseNumber').value,
        experience_years: parseInt(document.getElementById('experience').value),
        phone: document.getElementById('driverPhone').value || null,
        email: document.getElementById('driverEmail').value || null,
        assigned_vehicle_id: this.getVehicleIdFromPlateNumber(document.getElementById('assignedVehicle').value)
      };

      await api.updateDriver(driverId, driverData);
      showAlert('Driver updated successfully!', 'success');
      
      // Reset form
      form.reset();
      submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Add Driver';
      submitBtn.onclick = null;
      
      await this.loadDrivers();
      
    } catch (error) {
      console.error('Error updating driver:', error);
      showAlert(error.message || 'Failed to update driver', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  async deleteDriver(driverId) {
    if (!confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteDriver(driverId);
      showAlert('Driver deleted successfully!', 'success');
      await this.loadDrivers();
    } catch (error) {
      console.error('Error deleting driver:', error);
      showAlert(error.message || 'Failed to delete driver', 'danger');
    }
  }

  // Method to get active drivers for other modules
  getActiveDrivers() {
    return this.drivers.filter(driver => driver.status === 'Active');
  }

  // Method to get driver by name
  getDriverByName(name) {
    return this.drivers.find(driver => driver.full_name === name);
  }
}

// Initialize driver manager
let driverManager;
document.addEventListener('DOMContentLoaded', () => {
  driverManager = new DriverManager();
  window.driverManager = driverManager;
});

// Make driver manager available globally
window.DriverManager = DriverManager;
