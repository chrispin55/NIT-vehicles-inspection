const { query } = require('../config/database');

class Maintenance {
  static async getAll() {
    const sql = `
      SELECT m.*, v.plate_number, v.model as vehicle_model
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.service_date DESC
    `;
    return await query(sql);
  }

  static async getById(id) {
    const sql = `
      SELECT m.*, v.plate_number, v.model as vehicle_model
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.id = ?
    `;
    const records = await query(sql, [id]);
    return records[0];
  }

  static async create(maintenanceData) {
    const sql = `
      INSERT INTO maintenance_records (vehicle_id, service_date, service_type, cost, mileage_at_service, next_service_date, service_provider, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { 
      vehicle_id, 
      service_date, 
      service_type, 
      cost, 
      mileage_at_service, 
      next_service_date, 
      service_provider, 
      notes 
    } = maintenanceData;
    
    const result = await query(sql, [vehicle_id, service_date, service_type, cost, mileage_at_service, next_service_date, service_provider, notes]);
    
    // Update vehicle's next service date
    if (next_service_date) {
      await query('UPDATE vehicles SET next_service_date = ? WHERE id = ?', [next_service_date, vehicle_id]);
    }
    
    return await this.getById(result.insertId);
  }

  static async update(id, maintenanceData) {
    const fields = [];
    const values = [];
    
    Object.keys(maintenanceData).forEach(key => {
      if (maintenanceData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(maintenanceData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const sql = `UPDATE maintenance_records SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    // Update vehicle's next service date if provided
    if (maintenanceData.next_service_date) {
      const record = await this.getById(id);
      if (record) {
        await query('UPDATE vehicles SET next_service_date = ? WHERE id = ?', [maintenanceData.next_service_date, record.vehicle_id]);
      }
    }
    
    return await this.getById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM maintenance_records WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getByVehicle(vehicleId) {
    const sql = `
      SELECT m.*, v.plate_number, v.model as vehicle_model
      FROM maintenance_records m
      JOIN vehicles v ON m.vehicle_id = v.id
      WHERE m.vehicle_id = ?
      ORDER BY m.service_date DESC
    `;
    return await query(sql, [vehicleId]);
  }

  static async getUpcomingServices() {
    const sql = `
      SELECT v.*, DATEDIFF(v.next_service_date, CURDATE()) as days_until_service
      FROM vehicles v
      WHERE v.next_service_date IS NOT NULL 
        AND v.next_service_date <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        AND v.status = 'Active'
      ORDER BY v.next_service_date ASC
    `;
    return await query(sql);
  }

  static async getOverdueServices() {
    const sql = `
      SELECT v.*, DATEDIFF(CURDATE(), v.next_service_date) as days_overdue
      FROM vehicles v
      WHERE v.next_service_date IS NOT NULL 
        AND v.next_service_date < CURDATE()
        AND v.status = 'Active'
      ORDER BY v.next_service_date ASC
    `;
    return await query(sql);
  }

  static async getMonthlyCosts(year, month = null) {
    let sql = `
      SELECT 
        MONTH(service_date) as month,
        YEAR(service_date) as year,
        SUM(cost) as total_cost,
        COUNT(*) as service_count
      FROM maintenance_records
      WHERE YEAR(service_date) = ?
    `;
    const params = [year];
    
    if (month) {
      sql += ' AND MONTH(service_date) = ?';
      params.push(month);
    }
    
    sql += ' GROUP BY MONTH(service_date), YEAR(service_date) ORDER BY month';
    
    return await query(sql, params);
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_services,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost,
        COUNT(CASE WHEN service_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as last_30_days,
        COUNT(CASE WHEN service_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as last_7_days
      FROM maintenance_records
    `;
    const result = await query(sql);
    return result[0];
  }

  static async getServiceTypeStats() {
    const sql = `
      SELECT 
        service_type,
        COUNT(*) as count,
        SUM(cost) as total_cost,
        AVG(cost) as avg_cost
      FROM maintenance_records
      GROUP BY service_type
      ORDER BY count DESC
    `;
    return await query(sql);
  }
}

module.exports = Maintenance;
