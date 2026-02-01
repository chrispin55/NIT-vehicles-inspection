// Reports functionality
class ReportManager {
  constructor() {
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadOperationalCostChart();
  }

  setupEventListeners() {
    // Report period change handler
    const reportPeriod = document.getElementById('reportPeriod');
    if (reportPeriod) {
      reportPeriod.addEventListener('change', (e) => {
        const customRange = document.getElementById('customRange');
        if (e.target.value === 'custom') {
          customRange.classList.remove('d-none');
        } else {
          customRange.classList.add('d-none');
        }
      });
    }

    // Generate report button
    const generateBtn = document.getElementById('generateReport');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateReport());
    }
  }

  async loadOperationalCostChart() {
    try {
      const response = await api.getDashboardData();
      const operationalCosts = response.data.charts.operationalCosts;
      
      this.renderOperationalCostChart(operationalCosts);
    } catch (error) {
      console.error('Error loading operational cost chart:', error);
    }
  }

  renderOperationalCostChart(costData) {
    const ctx = document.getElementById('operationalCostChart');
    if (!ctx || !costData) return;

    const labels = costData.map(item => item.month);
    const fuelCosts = costData.map(item => item.fuel_cost);
    const maintenanceCosts = costData.map(item => item.maintenance_cost);

    new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Fuel Cost',
            data: fuelCosts,
            borderColor: 'rgba(0, 51, 102, 1)',
            backgroundColor: 'rgba(0, 51, 102, 0.1)',
            borderWidth: 2,
            fill: true
          },
          {
            label: 'Maintenance Cost',
            data: maintenanceCosts,
            borderColor: 'rgba(220, 53, 69, 1)',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            borderWidth: 2,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return (value / 1000000).toFixed(1) + 'M TZS';
              }
            }
          }
        }
      }
    });
  }

  async generateReport() {
    const reportType = document.getElementById('reportType').value;
    const reportPeriod = document.getElementById('reportPeriod').value;
    
    let startDate, endDate;
    
    if (reportPeriod === 'custom') {
      startDate = document.getElementById('startDate').value;
      endDate = document.getElementById('endDate').value;
      
      if (!startDate || !endDate) {
        showAlert('Please select both start and end dates', 'warning');
        return;
      }
    } else {
      const dates = this.getDateRange(reportPeriod);
      startDate = dates.startDate;
      endDate = dates.endDate;
    }

    const generateBtn = document.getElementById('generateReport');
    const originalText = generateBtn.innerHTML;
    
    try {
      showLoading(generateBtn);
      
      let reportData;
      let reportTitle;
      
      switch (reportType) {
        case 'fuel':
          reportData = await api.getFuelConsumptionReport({ startDate, endDate });
          reportTitle = 'Fuel Consumption Report';
          this.displayFuelReport(reportData.data);
          break;
          
        case 'maintenance':
          reportData = await api.getMaintenanceRecords();
          reportTitle = 'Maintenance Costs Report';
          this.displayMaintenanceReport(reportData.data, startDate, endDate);
          break;
          
        case 'trips':
          reportData = await api.getTripSummaryReport({ startDate, endDate });
          reportTitle = 'Trip Summary Report';
          this.displayTripReport(reportData.data);
          break;
          
        case 'vehicles':
          reportData = await api.getVehicleUtilizationReport({ startDate, endDate });
          reportTitle = 'Vehicle Utilization Report';
          this.displayVehicleUtilizationReport(reportData.data);
          break;
          
        default:
          throw new Error('Invalid report type');
      }
      
      showAlert(`${reportTitle} generated successfully!`, 'success');
      
    } catch (error) {
      console.error('Error generating report:', error);
      showAlert(error.message || 'Failed to generate report', 'danger');
    } finally {
      hideLoading(generateBtn, originalText);
    }
  }

  getDateRange(period) {
    const today = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'monthly':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
        
      case 'quarterly':
        const quarter = Math.floor(today.getMonth() / 3);
        startDate = new Date(today.getFullYear(), quarter * 3, 1);
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        break;
        
      case 'yearly':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
        
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    };
  }

  displayFuelReport(data) {
    const modal = this.createReportModal('Fuel Consumption Report');
    const modalBody = modal.querySelector('.modal-body');
    
    let html = `
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Records</h5>
              <h3 class="text-primary">${data.summary.total_records}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Fuel (L)</h5>
              <h3 class="text-info">${data.summary.total_fuel?.toFixed(2) || 0}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Cost</h5>
              <h3 class="text-success">${formatCurrency(data.summary.total_cost || 0)}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Avg Cost/L</h5>
              <h3 class="text-warning">${formatCurrency(data.summary.avg_cost_per_liter || 0)}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <h5>Fuel Records</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Date</th>
              <th>Vehicle</th>
              <th>Fuel (L)</th>
              <th>Cost/L</th>
              <th>Total Cost</th>
              <th>Mileage</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    data.records.forEach(record => {
      html += `
        <tr>
          <td>${formatDate(record.fuel_date)}</td>
          <td>${record.plate_number} (${record.vehicle_model})</td>
          <td>${record.fuel_liters}</td>
          <td>${formatCurrency(record.cost_per_liter)}</td>
          <td>${formatCurrency(record.total_cost)}</td>
          <td>${record.mileage || 'N/A'}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    modalBody.innerHTML = html;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  displayMaintenanceReport(data, startDate, endDate) {
    const modal = this.createReportModal('Maintenance Costs Report');
    const modalBody = modal.querySelector('.modal-body');
    
    // Filter records by date range
    const filteredRecords = data.filter(record => 
      record.service_date >= startDate && record.service_date <= endDate
    );
    
    const totalCost = filteredRecords.reduce((sum, record) => sum + record.cost, 0);
    
    let html = `
      <div class="row mb-4">
        <div class="col-md-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Services</h5>
              <h3 class="text-primary">${filteredRecords.length}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Cost</h5>
              <h3 class="text-danger">${formatCurrency(totalCost)}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Average Cost</h5>
              <h3 class="text-warning">${formatCurrency(filteredRecords.length > 0 ? totalCost / filteredRecords.length : 0)}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <h5>Service Records</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Service Date</th>
              <th>Vehicle</th>
              <th>Service Type</th>
              <th>Cost</th>
              <th>Next Service</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    filteredRecords.forEach(record => {
      html += `
        <tr>
          <td>${formatDate(record.service_date)}</td>
          <td>${record.plate_number} (${record.vehicle_model})</td>
          <td>${record.service_type}</td>
          <td>${formatCurrency(record.cost)}</td>
          <td>${formatDate(record.next_service_date)}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    modalBody.innerHTML = html;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  displayTripReport(data) {
    const modal = this.createReportModal('Trip Summary Report');
    const modalBody = modal.querySelector('.modal-body');
    
    let html = `
      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Total Trips</h5>
              <h3 class="text-primary">${data.summary.total_trips}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Completed</h5>
              <h3 class="text-success">${data.summary.completed_trips}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Ongoing</h5>
              <h3 class="text-warning">${data.summary.ongoing_trips}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center">
            <div class="card-body">
              <h5 class="card-title">Est. Fuel (L)</h5>
              <h3 class="text-info">${data.summary.total_estimated_fuel?.toFixed(2) || 0}</h3>
            </div>
          </div>
        </div>
      </div>
      
      <h5>Trip Records</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Trip ID</th>
              <th>Route</th>
              <th>Driver</th>
              <th>Vehicle</th>
              <th>Date & Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    data.trips.forEach(trip => {
      html += `
        <tr>
          <td>${trip.trip_id}</td>
          <td>${trip.route_from} → ${trip.route_to}</td>
          <td>${trip.driver_name}</td>
          <td>${trip.plate_number}</td>
          <td>${formatDateTime(trip.trip_date, trip.trip_time)}</td>
          <td><span class="badge bg-${this.getStatusBadgeClass(trip.status)}">${trip.status}</span></td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    modalBody.innerHTML = html;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  displayVehicleUtilizationReport(data) {
    const modal = this.createReportModal('Vehicle Utilization Report');
    const modalBody = modal.querySelector('.modal-body');
    
    let html = `
      <h5>Vehicle Utilization Summary</h5>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Model</th>
              <th>Status</th>
              <th>Total Trips</th>
              <th>Completed Trips</th>
              <th>Total Fuel (L)</th>
              <th>Total Distance</th>
              <th>Utilization %</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    data.forEach(vehicle => {
      const utilization = vehicle.total_trips > 0 ? 
        ((vehicle.completed_trips / vehicle.total_trips) * 100).toFixed(1) : 0;
      
      html += `
        <tr>
          <td>${vehicle.plate_number}</td>
          <td>${vehicle.model}</td>
          <td><span class="badge bg-${this.getStatusBadgeClass(vehicle.status)}">${vehicle.status}</span></td>
          <td>${vehicle.total_trips}</td>
          <td>${vehicle.completed_trips}</td>
          <td>${vehicle.total_fuel_consumed?.toFixed(2) || 0}</td>
          <td>${vehicle.total_distance?.toFixed(2) || 0} km</td>
          <td>
            <div class="progress" style="height: 20px;">
              <div class="progress-bar" role="progressbar" 
                   style="width: ${utilization}%" 
                   aria-valuenow="${utilization}" 
                   aria-valuemin="0" 
                   aria-valuemax="100">
                ${utilization}%
              </div>
            </div>
          </td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
    
    modalBody.innerHTML = html;
    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
  }

  getStatusBadgeClass(status) {
    const statusClasses = {
      'Active': 'success',
      'Under Maintenance': 'warning',
      'Inactive': 'danger',
      'Scheduled': 'info',
      'In Progress': 'warning',
      'Completed': 'success',
      'Cancelled': 'danger'
    };
    return statusClasses[status] || 'secondary';
  }

  createReportModal(title) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Report content will be inserted here -->
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" onclick="window.print()">
              <i class="fas fa-print me-2"></i>Print Report
            </button>
          </div>
        </div>
      </div>
    `;
    return modal;
  }
}

// Initialize report manager
let reportManager;
document.addEventListener('DOMContentLoaded', () => {
  reportManager = new ReportManager();
  window.reportManager = reportManager;
});

// Make report manager available globally
window.ReportManager = ReportManager;
