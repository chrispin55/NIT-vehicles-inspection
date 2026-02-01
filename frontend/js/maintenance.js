// Maintenance Management functionality
class MaintenanceManager {
  constructor() {
    this.maintenanceRecords = [];
    this.init();
  }

  async init() {
    await this.loadMaintenanceRecords();
    this.setupEventListeners();
  }

  async loadMaintenanceRecords() {
    try {
      const response = await api.getMaintenanceRecords();
      this.maintenanceRecords = response.data;
      this.renderMaintenanceTable();
    } catch (error) {
      console.error('Error loading maintenance records:', error);
      showAlert('Failed to load maintenance records', 'danger');
    }
  }

  renderMaintenanceTable() {
    const tbody = document.querySelector('#maintenance .table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    this.maintenanceRecords.forEach(record => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${record.plate_number}</td>
        <td>${formatDate(record.service_date)}</td>
        <td>${record.service_type}</td>
        <td>${formatCurrency(record.cost)}</td>
        <td>${formatDate(record.next_service_date)}</td>
      `;
      tbody.appendChild(row);
    });
  }

  setupEventListeners() {
    const form = document.getElementById('addMaintenanceForm');
    if (form) {
      form.addEventListener('submit', (e) => this.handleAddMaintenanceRecord(e));
    }
  }

  async handleAddMaintenanceRecord(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
      showLoading(submitBtn);
      
      const formData = new FormData(e.target);
      const maintenanceData = {
        vehicle_id: this.getVehicleIdFromPlateNumber(formData.get('maintenanceVehicle') || document.getElementById('maintenanceVehicle').value),
        service_date: formData.get('serviceDate') || document.getElementById('serviceDate').value,
        service_type: formData.get('serviceType') || document.getElementById('serviceType').value,
        cost: parseFloat(formData.get('serviceCost') || document.getElementById('serviceCost').value),
        next_service_date: formData.get('nextServiceDate') || document.getElementById('nextServiceDate').value,
        service_provider: document.getElementById('serviceProvider')?.value || null,
        notes: document.getElementById('maintenanceNotes')?.value || null
      };

      await api.createMaintenanceRecord(maintenanceData);
      showAlert('Service record added successfully!', 'success');
      e.target.reset();
      
      // Reset dates
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('serviceDate').value = today;
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 3);
      document.getElementById('nextServiceDate').value = nextMonth.toISOString().split('T')[0];
      
      await this.loadMaintenanceRecords();
      
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      showAlert(error.message || 'Failed to add service record', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  getVehicleIdFromPlateNumber(plateNumber) {
    if (!plateNumber) return null;
    
    const vehicle = window.vehicleManager?.getVehicleByPlateNumber(plateNumber);
    return vehicle ? vehicle.id : null;
  }

  async editMaintenanceRecord(recordId) {
    try {
      const record = this.maintenanceRecords.find(r => r.id === recordId);
      if (!record) return;

      // Populate form with record data
      document.getElementById('maintenanceVehicle').value = record.plate_number;
      document.getElementById('serviceDate').value = record.service_date;
      document.getElementById('serviceType').value = record.service_type;
      document.getElementById('serviceCost').value = record.cost;
      document.getElementById('nextServiceDate').value = record.next_service_date;
      document.getElementById('serviceProvider').value = record.service_provider || '';
      document.getElementById('maintenanceNotes').value = record.notes || '';

      // Change button to update mode
      const submitBtn = document.querySelector('#addMaintenanceForm button[type="submit"]');
      submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Update Service Record';
      submitBtn.onclick = () => this.updateMaintenanceRecord(recordId);

      // Scroll to form
      document.getElementById('addMaintenanceForm').scrollIntoView({ behavior: 'smooth' });
      
    } catch (error) {
      console.error('Error editing maintenance record:', error);
      showAlert('Failed to load service record data', 'danger');
    }
  }

  async updateMaintenanceRecord(recordId) {
    const form = document.getElementById('addMaintenanceForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    try {
      showLoading(submitBtn);
      
      const maintenanceData = {
        vehicle_id: this.getVehicleIdFromPlateNumber(document.getElementById('maintenanceVehicle').value),
        service_date: document.getElementById('serviceDate').value,
        service_type: document.getElementById('serviceType').value,
        cost: parseFloat(document.getElementById('serviceCost').value),
        next_service_date: document.getElementById('nextServiceDate').value,
        service_provider: document.getElementById('serviceProvider').value || null,
        notes: document.getElementById('maintenanceNotes').value || null
      };

      await api.updateMaintenanceRecord(recordId, maintenanceData);
      showAlert('Service record updated successfully!', 'success');
      
      // Reset form
      form.reset();
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('serviceDate').value = today;
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 3);
      document.getElementById('nextServiceDate').value = nextMonth.toISOString().split('T')[0];
      
      submitBtn.innerHTML = '<i class="fas fa-tools me-2"></i>Add Service Record';
      submitBtn.onclick = null;
      
      await this.loadMaintenanceRecords();
      
    } catch (error) {
      console.error('Error updating maintenance record:', error);
      showAlert(error.message || 'Failed to update service record', 'danger');
    } finally {
      hideLoading(submitBtn, originalText);
    }
  }

  async deleteMaintenanceRecord(recordId) {
    if (!confirm('Are you sure you want to delete this service record? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteMaintenanceRecord(recordId);
      showAlert('Service record deleted successfully!', 'success');
      await this.loadMaintenanceRecords();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      showAlert(error.message || 'Failed to delete service record', 'danger');
    }
  }

  async loadUpcomingServices() {
    try {
      const response = await api.getUpcomingServices();
      this.renderUpcomingServices(response.data);
    } catch (error) {
      console.error('Error loading upcoming services:', error);
    }
  }

  renderUpcomingServices(services) {
    const container = document.getElementById('upcomingServices');
    if (!container) return;

    container.innerHTML = '';
    
    if (services.length === 0) {
      container.innerHTML = '<p class="text-muted">No upcoming services</p>';
      return;
    }

    services.forEach(service => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'alert alert-warning';
      serviceCard.innerHTML = `
        <h6><i class="fas fa-exclamation-triangle me-2"></i>${service.plate_number}</h6>
        <p class="mb-1">Service due in ${service.days_until_service} days</p>
        <small>Next service: ${formatDate(service.next_service_date)}</small>
      `;
      container.appendChild(serviceCard);
    });
  }

  async loadOverdueServices() {
    try {
      const response = await api.getOverdueServices();
      this.renderOverdueServices(response.data);
    } catch (error) {
      console.error('Error loading overdue services:', error);
    }
  }

  renderOverdueServices(services) {
    const container = document.getElementById('overdueServices');
    if (!container) return;

    container.innerHTML = '';
    
    if (services.length === 0) {
      container.innerHTML = '<p class="text-muted">No overdue services</p>';
      return;
    }

    services.forEach(service => {
      const serviceCard = document.createElement('div');
      serviceCard.className = 'alert alert-danger';
      serviceCard.innerHTML = `
        <h6><i class="fas fa-times-circle me-2"></i>${service.plate_number}</h6>
        <p class="mb-1">Service overdue by ${service.days_overdue} days</p>
        <small>Was due: ${formatDate(service.next_service_date)}</small>
      `;
      container.appendChild(serviceCard);
    });
  }

  // Method to get maintenance statistics
  getMaintenanceStats() {
    const totalCost = this.maintenanceRecords.reduce((sum, record) => sum + record.cost, 0);
    const last30Days = this.maintenanceRecords.filter(record => {
      const serviceDate = new Date(record.service_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return serviceDate >= thirtyDaysAgo;
    });

    return {
      totalServices: this.maintenanceRecords.length,
      totalCost: totalCost,
      last30Days: last30Days.length
    };
  }
}

// Initialize maintenance manager
let maintenanceManager;
document.addEventListener('DOMContentLoaded', () => {
  maintenanceManager = new MaintenanceManager();
  window.maintenanceManager = maintenanceManager;
});

// Make maintenance manager available globally
window.MaintenanceManager = MaintenanceManager;
