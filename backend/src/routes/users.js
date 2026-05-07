import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { executeQuery } from '../database.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for memory storage (for profile pictures)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// ============================================
// LOGIN endpoint
// ============================================
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`\n🔍 LOGIN ATTEMPT: username="${username}"`);

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
    console.log(`✓ Checked users table: ${users.length} rows found`);

    if (users.length === 0) {
      // Check if this username exists in pending_users table
      const pendingUsers = await executeQuery(
        'SELECT id, status, approval_notes, first_name, last_name, created_at FROM pending_users WHERE username = ?',
        [username]
      );
      console.log(`✓ Checked pending_users table: ${pendingUsers.length} rows found`);
      
      if (pendingUsers.length > 0) {
        const pendingUser = pendingUsers[0];
        console.log(`  Status: ${pendingUser.status}, Notes: ${pendingUser.approval_notes}`);

        if (pendingUser.status === 'rejected') {
          console.log('  → Returning 403 REJECTED response');
          return res.status(403).json({
            success: false,
            message: 'Your registration has been rejected by the administrator.',
            reason: pendingUser.approval_notes || 'No reason provided',
            status: 'rejected'
          });
        }

        if (pendingUser.status === 'pending') {
          console.log('  → Returning 403 PENDING response');
          return res.status(403).json({
            success: false,
            message: 'Your registration is still pending admin approval. Please check back later.',
            status: 'pending'
          });
        }

        if (pendingUser.status === 'approved') {
          console.log('  → Returning 403 APPROVED_NOT_ACTIVE response');
          return res.status(403).json({
            success: false,
            message: 'Your registration has been approved but your account is not yet active. Please contact support.',
            status: 'approved_not_active'
          });
        }
      }

      console.log('  → Returning 401 USER_NOT_FOUND');
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

// GET current user profile (simple version)
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

// ============================================
// PROFILE MANAGEMENT ENDPOINTS (NEW)
// ============================================

// GET complete user profile
router.get('/profile/me', verifyToken, async (req, res) => {
  try {
    const users = await executeQuery(
      `SELECT u.id, u.username, u.email, u.full_name, u.designation, u.role, u.dept_id, 
              u.bio, u.phone, u.profile_picture_type,
              d.name as department_name
       FROM users u
       LEFT JOIN departments d ON u.dept_id = d.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ 
      success: true, 
      data: {
        ...users[0],
        hasProfilePicture: !!users[0].profile_picture_type
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE profile (username, full_name, bio, phone)
router.put('/profile/update', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, full_name, bio, phone } = req.body;

    // Check if username is unique (if changed)
    if (username) {
      const existingUser = await executeQuery(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existingUser.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update user table
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (full_name) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }

    if (updateFields.length > 0) {
      updateValues.push(userId);
      await executeQuery(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Get updated user data
    const updatedUser = await executeQuery(
      'SELECT id, username, full_name, email, bio, phone, role FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET user theme preference
router.get('/theme', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check if user_settings table exists and get theme
    let result = await executeQuery(
      'SELECT theme FROM user_settings WHERE user_id = ?',
      [userId]
    );
    
    if (result.length === 0) {
      // Create default settings
      await executeQuery(
        'INSERT INTO user_settings (user_id, theme) VALUES (?, ?)',
        [userId, 'light']
      );
      result = [{ theme: 'light' }];
    }
    
    res.json({
      success: true,
      data: { theme: result[0].theme }
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE user theme preference
router.put('/theme', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme } = req.body;
    
    if (!['light', 'dark'].includes(theme)) {
      return res.status(400).json({
        success: false,
        message: 'Theme must be "light" or "dark"'
      });
    }
    
    await executeQuery(
      `INSERT INTO user_settings (user_id, theme) 
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE theme = VALUES(theme)`,
      [userId, theme]
    );
    
    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: { theme }
    });
  } catch (error) {
    console.error('Error updating theme:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE account - Self-service account deletion
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { confirmPassword } = req.body;
    
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password confirmation is required to delete account'
      });
    }
    
    // Verify password
    const users = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const isPasswordValid = await bcrypt.compare(confirmPassword, users[0].password_hash);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
    
    // Check if user is admin (prevent deletion of last admin)
    const adminCount = await executeQuery(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = true'
    );
    
    if (users[0].role === 'admin' && adminCount[0].count <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete the only admin account. Please assign admin role to another user first.'
      });
    }
    
    // Soft delete - deactivate account instead of hard delete
    await executeQuery(
      'UPDATE users SET is_active = false, username = CONCAT(username, "_deleted_", id), email = CONCAT(email, "_deleted") WHERE id = ?',
      [userId]
    );
    
    // Optional: Move data to deleted_users table for audit
    await executeQuery(
      `INSERT INTO pending_users (username, email, first_name, last_name, user_type, status, approval_notes)
       SELECT username, email, full_name, '', 'staff', 'deleted', 'Account self-deleted'
       FROM users WHERE id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Your account has been deactivated. We are sad to see you go!'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPLOAD profile picture
router.post('/profile/upload-picture', verifyToken, upload.single('profile_picture'), async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate file size (5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 5MB limit'
      });
    }

    // Update user with profile picture
    await executeQuery(
      'UPDATE users SET profile_picture = ?, profile_picture_type = ? WHERE id = ?',
      [req.file.buffer, req.file.mimetype, userId]
    );

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET profile picture
router.get('/profile/picture/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const users = await executeQuery(
      'SELECT profile_picture, profile_picture_type FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0 || !users[0].profile_picture) {
      return res.status(404).json({
        success: false,
        message: 'Profile picture not found'
      });
    }

    const { profile_picture, profile_picture_type } = users[0];
    
    res.setHeader('Content-Type', profile_picture_type || 'image/jpeg');
    res.send(profile_picture);
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile picture'
    });
  }
});

// DELETE profile picture
router.delete('/profile/picture', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await executeQuery(
      'UPDATE users SET profile_picture = NULL, profile_picture_type = NULL WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// CHANGE password
router.post('/profile/change-password', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'All password fields are required'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Get current user password
    const users = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, users[0].password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await executeQuery(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET user settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    let settings = await executeQuery(
      'SELECT * FROM user_settings WHERE user_id = ?',
      [userId]
    );

    if (settings.length === 0) {
      // Create default settings
      await executeQuery(
        'INSERT INTO user_settings (user_id) VALUES (?)',
        [userId]
      );
      settings = await executeQuery(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );
    }

    res.json({
      success: true,
      data: settings[0]
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE user settings
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { theme, notifications, email_notifications } = req.body;

    await executeQuery(
      `INSERT INTO user_settings (user_id, theme, notifications, email_notifications) 
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       theme = VALUES(theme), 
       notifications = VALUES(notifications), 
       email_notifications = VALUES(email_notifications)`,
      [userId, theme || 'light', notifications !== undefined ? notifications : true, email_notifications !== undefined ? email_notifications : true]
    );

    res.json({
      success: true,
      message: 'Settings updated successfully'
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ============================================
// USER MANAGEMENT ENDPOINTS (Admin)
// ============================================

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

// CHANGE password (self)
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

// GET all admins
router.get('/admins', verifyToken, async (req, res) => {
  try {
    const admins = await executeQuery(
      'SELECT id, full_name, username, email FROM users WHERE role = "admin" AND is_active = true ORDER BY full_name'
    );

    res.json({
      success: true,
      data: admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins'
    });
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
      department_name, section_name, unit_name, position,
      company_shop_name, company_phone, address,
      id_number, registration_note, username, password
    } = req.body;

    console.log(`\n📝 REGISTRATION ATTEMPT: username="${username}", user_type="${user_type}"`);

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

    if (user_type === 'other') {
      if (!id_number || !email || !registration_note) {
        return res.status(400).json({
          success: false,
          message: 'For Other users, ID Number, Email, and Note are required'
        });
      }
    }

    const password_hash = await bcrypt.hash(password, 10);

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

    console.log(`✅ Registration inserted: ID=${result.insertId}, username="${username}"`);

    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully. Please wait for admin approval.',
      registration_id: result.insertId
    });
  } catch (error) {
    console.error(`❌ Registration error for username="${req.body.username}":`, error.message);
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

    const pending = await executeQuery(
      'SELECT * FROM pending_users WHERE id = ? AND status = "pending"',
      [id]
    );

    if (pending.length === 0) {
      return res.status(404).json({ success: false, message: 'Pending registration not found' });
    }

    const p = pending[0];

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