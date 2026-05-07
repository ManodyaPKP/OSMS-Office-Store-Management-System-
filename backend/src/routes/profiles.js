import express from 'express';
import bcrypt from 'bcrypt';
import { executeQuery } from '../database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user info
    const userResult = await executeQuery(
      'SELECT id, username, email, full_name, designation, role, dept_id FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];

    // Get profile info
    const profileResult = await executeQuery(
      'SELECT id, profile_picture_type, bio, phone FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    const profile = profileResult.length > 0 ? profileResult[0] : null;

    res.json({
      success: true,
      data: {
        ...user,
        profile: {
          bio: profile?.bio || '',
          phone: profile?.phone || '',
          hasProfilePicture: profile?.profile_picture_type ? true : false,
          profilePictureType: profile?.profile_picture_type || null
        }
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

// GET profile picture
router.get('/profile/picture/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const profileResult = await executeQuery(
      'SELECT profile_picture, profile_picture_type FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (profileResult.length === 0 || !profileResult[0].profile_picture) {
      return res.status(404).json({
        success: false,
        message: 'Profile picture not found'
      });
    }

    const { profile_picture, profile_picture_type } = profileResult[0];
    
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

// UPDATE profile (username, full_name, bio, phone)
router.put('/profile', verifyToken, async (req, res) => {
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

    if (updateFields.length > 0) {
      updateValues.push(userId);
      await executeQuery(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update or create profile
    const profileExists = await executeQuery(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (profileExists.length > 0) {
      const profileUpdateFields = [];
      const profileUpdateValues = [];

      if (bio !== undefined) {
        profileUpdateFields.push('bio = ?');
        profileUpdateValues.push(bio);
      }
      if (phone !== undefined) {
        profileUpdateFields.push('phone = ?');
        profileUpdateValues.push(phone);
      }

      if (profileUpdateFields.length > 0) {
        profileUpdateValues.push(userId);
        await executeQuery(
          `UPDATE user_profiles SET ${profileUpdateFields.join(', ')} WHERE user_id = ?`,
          profileUpdateValues
        );
      }
    } else {
      await executeQuery(
        'INSERT INTO user_profiles (user_id, bio, phone) VALUES (?, ?, ?)',
        [userId, bio || '', phone || '']
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// CHANGE PASSWORD
router.post('/change-password', verifyToken, async (req, res) => {
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
    const userResult = await executeQuery(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

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
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
});

// UPLOAD PROFILE PICTURE
router.post('/upload-picture', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { picture, pictureType } = req.body;

    if (!picture || !pictureType) {
      return res.status(400).json({
        success: false,
        message: 'Picture data and type are required'
      });
    }

    // Validate picture type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(pictureType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image type. Allowed: JPEG, PNG, GIF, WebP'
      });
    }

    // Convert base64 to buffer
    const pictureBuffer = Buffer.from(picture.split(',')[1] || picture, 'base64');

    // Check if profile exists
    const profileExists = await executeQuery(
      'SELECT id FROM user_profiles WHERE user_id = ?',
      [userId]
    );

    if (profileExists.length > 0) {
      await executeQuery(
        'UPDATE user_profiles SET profile_picture = ?, profile_picture_type = ? WHERE user_id = ?',
        [pictureBuffer, pictureType, userId]
      );
    } else {
      await executeQuery(
        'INSERT INTO user_profiles (user_id, profile_picture, profile_picture_type) VALUES (?, ?, ?)',
        [userId, pictureBuffer, pictureType]
      );
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture'
    });
  }
});

export default router;
