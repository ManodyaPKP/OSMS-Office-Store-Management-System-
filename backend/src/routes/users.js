import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { executeQuery } from '../database.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// LOGIN endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    const users = await executeQuery(
      'SELECT * FROM users WHERE username = ? AND is_active = true',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        dept_id: user.dept_id,
        full_name: user.full_name
      },
      process.env.JWT_SECRET || 'your_jwt_secret_key_change_this_in_production',
      { expiresIn: process.env.JWT_EXPIRE || '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        dept_id: user.dept_id,
        designation: user.designation
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, full_name, designation, role, dept_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: users[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all users (Admin only)
router.get('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const users = await executeQuery(
      'SELECT id, username, email, full_name, designation, role, dept_id, is_active FROM users'
    );
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE new user (Admin only)
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { username, email, password, full_name, designation, role, dept_id } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await executeQuery(
      `INSERT INTO users (username, email, password_hash, full_name, designation, role, dept_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [username, email, password_hash, full_name, designation, role, dept_id || null]
    );

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE user (Admin or self)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, designation, role, dept_id } = req.body;

    if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    await executeQuery(
      'UPDATE users SET full_name = ?, designation = ?, role = ?, dept_id = ? WHERE id = ?',
      [full_name, designation, role, dept_id, id]
    );

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CHANGE password
router.post('/:id/change-password', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { old_password, new_password } = req.body;

    if (req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const users = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(old_password, users[0].password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await executeQuery(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DEACTIVATE user (Admin only)
router.put('/:id/deactivate', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    await executeQuery(
      'UPDATE users SET is_active = false WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// REGISTRATION ENDPOINTS
// ============================================

// REGISTER new user (Public endpoint)
router.post('/register/new', async (req, res) => {
  try {
    const { 
      first_name, last_name, email, mobile_number, user_type,
      // Staff fields
      department_name, section_name, unit_name, position,
      // Technician fields
      company_shop_name, company_phone, address,
      // Other fields
      id_number, registration_note, username, password
    } = req.body;

    // Validation
    if (!first_name || !last_name || !mobile_number || !user_type) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, mobile number, and user type are required'
      });
    }

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Validate user type specific fields
    if (user_type === 'other') {
      if (!id_number || !email || !registration_note) {
        return res.status(400).json({
          success: false,
          message: 'For Other users, ID Number, Email, and Note are required'
        });
      }
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert into pending_users
    const result = await executeQuery(
      `INSERT INTO pending_users 
       (username, email, password_hash, first_name, last_name, mobile_number, user_type,
        department_name, section_name, unit_name, position,
        company_shop_name, company_phone, address,
        id_number, registration_note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username, email, password_hash, first_name, last_name, mobile_number, user_type,
        department_name || null, section_name || null, unit_name || null, position || null,
        company_shop_name || null, company_phone || null, address || null,
        id_number || null, registration_note || null
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Please wait for admin approval.',
      registration_id: result.insertId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET pending registrations (Admin only)
router.get('/registrations/pending', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const pending = await executeQuery(
      `SELECT * FROM pending_users WHERE status = 'pending' ORDER BY created_at DESC`
    );

    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// APPROVE registration (Admin only)
router.post('/registrations/:id/approve', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { dept_id } = req.body;

    // Get pending user
    const pending = await executeQuery(
      'SELECT * FROM pending_users WHERE id = ? AND status = "pending"',
      [id]
    );

    if (pending.length === 0) {
      return res.status(404).json({ success: false, message: 'Pending registration not found' });
    }

    const p = pending[0];

    // Create active user account
    const result = await executeQuery(
      `INSERT INTO users (username, email, password_hash, full_name, designation, role, dept_id, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
      [
        p.username,
        p.email,
        p.password_hash,
        `${p.first_name} ${p.last_name}`,
        p.position || p.company_shop_name || 'User',
        p.user_type === 'technician' ? 'technician' : 'staff',
        dept_id || null
      ]
    );

    // Update pending registration status
    await executeQuery(
      `UPDATE pending_users SET status = 'approved', approved_by = ?, approval_date = NOW() 
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({
      success: true,
      message: 'Registration approved successfully',
      user_id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// REJECT registration (Admin only)
router.post('/registrations/:id/reject', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { approval_notes } = req.body;

    const pending = await executeQuery(
      'SELECT * FROM pending_users WHERE id = ? AND status = "pending"',
      [id]
    );

    if (pending.length === 0) {
      return res.status(404).json({ success: false, message: 'Pending registration not found' });
    }

    // Update pending registration status
    await executeQuery(
      `UPDATE pending_users SET status = 'rejected', approval_notes = ?, approved_by = ?, approval_date = NOW()
       WHERE id = ?`,
      [approval_notes || null, req.user.id, id]
    );

    res.json({ success: true, message: 'Registration rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
