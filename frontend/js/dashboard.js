// Dashboard functionality
class Dashboard {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadDashboardData();
    this.initializeCharts();
    this.setupEventListeners();
  }

  async loadDashboardData() {
    try {
      showLoading(document.querySelector('[data-bs-target="#dashboard"]'));
      
      const response = await api.getDashboardData();
      const data = response.data;
      
      // Update statistics cards
      this.updateStatsCards(data.stats);
      
      // Update recent trips table
      this.updateRecentTrips(data.recentTrips);
      
      // Store chart data
      this.chartData = data.charts;
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showAlert('Failed to load dashboard data', 'danger');
    } finally {
      hideLoading(document.querySelector('[data-bs-target="#dashboard"]'), '<i class="fas fa-tachometer-alt me-2"></i>Dashboard');
    }
  }

  updateStatsCards(stats) {
    // Update vehicle stats
    document.querySelector('.stat-number').textContent = stats.vehicles.total;
    
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
      statCards[0].querySelector('.stat-number').textContent = stats.vehicles.total;
      statCards[1].querySelector('.stat-number').textContent = stats.drivers.active;
      statCards[2].querySelector('.stat-number').textContent = stats.trips.ongoing;
      statCards[3].querySelector('.stat-number').textContent = stats.vehicles.maintenance;
    }
  }

  updateRecentTrips(trips) {
    const tbody = document.querySelector('#dashboard .table tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    
    trips.slice(0, 5).forEach(trip => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${trip.trip_id}</td>
        <td>${trip.route_from} → ${trip.route_to}</td>
        <td>${trip.driver_name}</td>
        <td>${trip.plate_number} (${trip.vehicle_model})</td>
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

  initializeCharts() {
    if (!this.chartData) return;

    // Fuel Cost Chart
    this.initializeFuelCostChart();
    
    // Vehicle Status Chart
    this.initializeVehicleStatusChart();
    
    // Operational Cost Chart
    this.initializeOperationalCostChart();
  }

  initializeFuelCostChart() {
    const ctx = document.getElementById('fuelCostChart');
    if (!ctx || !this.chartData.fuelCosts) return;

    const fuelData = this.chartData.fuelCosts;
    const labels = fuelData.map(item => item.month);
    const data = fuelData.map(item => item.cost);

    new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Fuel Cost (TZS)',
          data: data,
          backgroundColor: 'rgba(0, 51, 102, 0.7)',
          borderColor: 'rgba(0, 51, 102, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value.toLocaleString() + ' TZS';
              }
            }
          }
        }
      }
    });
  }

  initializeVehicleStatusChart() {
    const ctx = document.getElementById('vehicleStatusChart');
    if (!ctx) return;

    // Get vehicle stats from the stats cards or API
    const activeCount = document.querySelector('.stat-card:nth-child(1) .stat-number')?.textContent || 18;
    const maintenanceCount = document.querySelector('.stat-card:nth-child(4) .stat-number')?.textContent || 3;
    const inactiveCount = 3; // Calculate or get from API

    new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Under Maintenance', 'Inactive'],
        datasets: [{
          data: [activeCount, maintenanceCount, inactiveCount],
          backgroundColor: [
            'rgba(25, 135, 84, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(220, 53, 69, 0.7)'
          ],
          borderColor: [
            'rgba(25, 135, 84, 1)',
            'rgba(255, 193, 7, 1)',
            'rgba(220, 53, 69, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  initializeOperationalCostChart() {
    const ctx = document.getElementById('operationalCostChart');
    if (!ctx || !this.chartData.operationalCosts) return;

    const costData = this.chartData.operationalCosts;
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

  setupEventListeners() {
    // Refresh dashboard data every 5 minutes
    setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if dashboard tab is visible
  const dashboardTab = document.getElementById('dashboard-tab');
  if (dashboardTab) {
    dashboardTab.addEventListener('shown.bs.tab', () => {
      if (!window.dashboard) {
        window.dashboard = new Dashboard();
      }
    });
  }
});

// Auto-refresh dashboard
window.dashboard = new Dashboard();
