const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    // Find user by username or email
    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const users = await query(sql, [username, username]);
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    const user = users[0];
    
    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    // Remove password hash from response
    const { password_hash, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// POST /api/auth/register - User registration (admin only)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, full_name, role = 'staff' } = req.body;
    
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }
    
    // Check if username or email already exists
    const checkSql = 'SELECT id FROM users WHERE username = ? OR email = ?';
    const existingUsers = await query(checkSql, [username, email]);
    
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const insertSql = `
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query(insertSql, [username, email, password_hash, full_name, role]);
    
    // Get created user
    const userSql = 'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?';
    const users = await query(userSql, [result.insertId]);
    const newUser = users[0];
    
    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// GET /api/auth/profile - Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user profile
    const sql = 'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?';
    const users = await query(sql, [decoded.userId]);
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: users[0],
      message: 'Profile retrieved successfully'
    });
  } catch (error) {
    console.error('Profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile',
      error: error.message
    });
  }
});

// PUT /api/auth/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const { email, full_name, current_password, new_password } = req.body;
    const updates = {};
    const values = [];
    
    if (email) {
      updates.email = email;
      values.push(email);
    }
    
    if (full_name) {
      updates.full_name = full_name;
      values.push(full_name);
    }
    
    // Handle password change
    if (current_password && new_password) {
      // Get current user
      const userSql = 'SELECT password_hash FROM users WHERE id = ?';
      const users = await query(userSql, [decoded.userId]);
      
      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(current_password, users[0].password_hash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const saltRounds = 10;
      updates.password_hash = await bcrypt.hash(new_password, saltRounds);
      values.push(updates.password_hash);
    }
    
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    // Update user
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    values.push(decoded.userId);
    
    const updateSql = `UPDATE users SET ${setClause} WHERE id = ?`;
    await query(updateSql, values);
    
    // Get updated user
    const profileSql = 'SELECT id, username, email, full_name, role, is_active, created_at FROM users WHERE id = ?';
    const updatedUsers = await query(profileSql, [decoded.userId]);
    
    res.json({
      success: true,
      data: updatedUsers[0],
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

module.exports = router;
