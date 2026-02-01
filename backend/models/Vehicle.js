const { query } = require('../config/database');

class Vehicle {
  static async getAll() {
    const sql = `
      SELECT v.*, d.full_name as assigned_driver_name, d.driver_id
      FROM vehicles v
      LEFT JOIN drivers d ON v.id = d.assigned_vehicle_id
      ORDER BY v.created_at DESC
    `;
    return await query(sql);
  }

  static async getById(id) {
    const sql = `
      SELECT v.*, d.full_name as assigned_driver_name, d.driver_id
      FROM vehicles v
      LEFT JOIN drivers d ON v.id = d.assigned_vehicle_id
      WHERE v.id = ?
    `;
    const vehicles = await query(sql, [id]);
    return vehicles[0];
  }

  static async getByPlateNumber(plateNumber) {
    const sql = 'SELECT * FROM vehicles WHERE plate_number = ?';
    const vehicles = await query(sql, [plateNumber]);
    return vehicles[0];
  }

  static async create(vehicleData) {
    const sql = `
      INSERT INTO vehicles (plate_number, vehicle_type, model, manufacture_year, status, fuel_capacity, current_fuel, mileage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { plate_number, vehicle_type, model, manufacture_year, status = 'Active', fuel_capacity, current_fuel = 0, mileage = 0 } = vehicleData;
    
    const result = await query(sql, [plate_number, vehicle_type, model, manufacture_year, status, fuel_capacity, current_fuel, mileage]);
    return await this.getById(result.insertId);
  }

  static async update(id, vehicleData) {
    const fields = [];
    const values = [];
    
    Object.keys(vehicleData).forEach(key => {
      if (vehicleData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(vehicleData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const sql = `UPDATE vehicles SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return await this.getById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM vehicles WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Under Maintenance' THEN 1 ELSE 0 END) as maintenance,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive
      FROM vehicles
    `;
    const result = await query(sql);
    return result[0];
  }

  static async getAvailableVehicles() {
    const sql = `
      SELECT v.*, d.full_name as assigned_driver_name, d.driver_id
      FROM vehicles v
      LEFT JOIN drivers d ON v.id = d.assigned_vehicle_id
      WHERE v.status = 'Active'
      ORDER BY v.plate_number
    `;
    return await query(sql);
  }
}

module.exports = Vehicle;
