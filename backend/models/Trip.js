const { query } = require('../config/database');

class Trip {
  static async getAll() {
    const sql = `
      SELECT t.*, 
             d.full_name as driver_name, d.driver_id,
             v.plate_number, v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      ORDER BY t.trip_date DESC, t.trip_time DESC
    `;
    return await query(sql);
  }

  static async getById(id) {
    const sql = `
      SELECT t.*, 
             d.full_name as driver_name, d.driver_id,
             v.plate_number, v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.id = ?
    `;
    const trips = await query(sql, [id]);
    return trips[0];
  }

  static async getByTripId(tripId) {
    const sql = `
      SELECT t.*, 
             d.full_name as driver_name, d.driver_id,
             v.plate_number, v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.trip_id = ?
    `;
    const trips = await query(sql, [tripId]);
    return trips[0];
  }

  static async create(tripData) {
    const sql = `
      INSERT INTO trips (trip_id, route_from, route_to, driver_id, vehicle_id, trip_date, trip_time, estimated_fuel, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const { 
      trip_id, 
      route_from, 
      route_to, 
      driver_id, 
      vehicle_id, 
      trip_date, 
      trip_time, 
      estimated_fuel, 
      notes 
    } = tripData;
    
    const result = await query(sql, [trip_id, route_from, route_to, driver_id, vehicle_id, trip_date, trip_time, estimated_fuel, notes]);
    return await this.getById(result.insertId);
  }

  static async update(id, tripData) {
    const fields = [];
    const values = [];
    
    Object.keys(tripData).forEach(key => {
      if (tripData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(tripData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const sql = `UPDATE trips SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    return await this.getById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM trips WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  static async getTodayTrips() {
    const sql = `
      SELECT t.*, 
             d.full_name as driver_name, d.driver_id,
             v.plate_number, v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE DATE(t.trip_date) = CURDATE()
      ORDER BY t.trip_time ASC
    `;
    return await query(sql);
  }

  static async getUpcomingTrips() {
    const sql = `
      SELECT t.*, 
             d.full_name as driver_name, d.driver_id,
             v.plate_number, v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.trip_date >= CURDATE() AND t.status IN ('Scheduled', 'In Progress')
      ORDER BY t.trip_date ASC, t.trip_time ASC
      LIMIT 10
    `;
    return await query(sql);
  }

  static async getRecentTrips() {
    const sql = `
      SELECT t.*, 
             d.full_name as driver_name, d.driver_id,
             v.plate_number, v.model as vehicle_model
      FROM trips t
      JOIN drivers d ON t.driver_id = d.id
      JOIN vehicles v ON t.vehicle_id = v.id
      WHERE t.status = 'Completed'
      ORDER BY t.trip_date DESC, t.trip_time DESC
      LIMIT 10
    `;
    return await query(sql);
  }

  static async getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Scheduled' THEN 1 ELSE 0 END) as scheduled,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN DATE(trip_date) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(estimated_fuel) as total_estimated_fuel
      FROM trips
    `;
    const result = await query(sql);
    return result[0];
  }

  static async updateStatus(id, status) {
    const sql = 'UPDATE trips SET status = ? WHERE id = ?';
    await query(sql, [status, id]);
    
    if (status === 'In Progress') {
      await query('UPDATE trips SET start_time = NOW() WHERE id = ?', [id]);
    } else if (status === 'Completed') {
      await query('UPDATE trips SET end_time = NOW() WHERE id = ?', [id]);
    }
    
    return await this.getById(id);
  }
}

module.exports = Trip;
