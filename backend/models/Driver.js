const { query } = require('../config/database');

class Driver {
  static async getAll() {
    const sql = `
      SELECT d.*, v.plate_number, v.model as vehicle_model
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      ORDER BY d.created_at DESC
    `;
    return await query(sql);
  }

  static async getById(id) {
    const sql = `
      SELECT d.*, v.plate_number, v.model as vehicle_model
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      WHERE d.id = ?
    `;
    const drivers = await query(sql, [id]);
    return drivers[0];
  }

  static async getByDriverId(driverId) {
    const sql = `
      SELECT d.*, v.plate_number, v.model as vehicle_model
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      WHERE d.driver_id = ?
    `;
    const drivers = await query(sql, [driverId]);
    return drivers[0];
  }

  static async create(driverData) {
    const sql = `
      INSERT INTO drivers (driver_id, full_name, license_number, experience_years, phone, email, assigned_vehicle_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { 
      driver_id, 
      full_name, 
      license_number, 
      experience_years = 0, 
      phone, 
      email, 
      assigned_vehicle_id = null, 
      status = 'Active' 
    } = driverData;
    
    const result = await query(sql, [driver_id, full_name, license_number, experience_years, phone, email, assigned_vehicle_id, status]);
    return await this.getById(result.insertId);
  }

  static async update(id, driverData) {
    const fields = [];
    const values = [];
    
    Object.keys(driverData).forEach(key => {
      if (driverData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(driverData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const sql = `UPDATE drivers SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return await this.getById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM drivers WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getActiveDrivers() {
    const sql = `
      SELECT d.*, v.plate_number, v.model as vehicle_model
      FROM drivers d
      LEFT JOIN vehicles v ON d.assigned_vehicle_id = v.id
      WHERE d.status = 'Active'
      ORDER BY d.full_name
    `;
    return await query(sql);
  }

  static async assignVehicle(driverId, vehicleId) {
    const sql = 'UPDATE drivers SET assigned_vehicle_id = ? WHERE id = ?';
    await query(sql, [vehicleId, driverId]);
    return await this.getById(driverId);
  }

  static async unassignVehicle(driverId) {
    const sql = 'UPDATE drivers SET assigned_vehicle_id = NULL WHERE id = ?';
    await query(sql, [driverId]);
    return await this.getById(driverId);
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'On Leave' THEN 1 ELSE 0 END) as on_leave,
        SUM(CASE WHEN assigned_vehicle_id IS NOT NULL THEN 1 ELSE 0 END) as assigned
      FROM drivers
    `;
    const result = await query(sql);
    return result[0];
  }
}

module.exports = Driver;
