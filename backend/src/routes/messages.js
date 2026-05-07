import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// SEND MESSAGE (User to Admin or Admin to User)
router.post('/messages/send', verifyToken, async (req, res) => {
  try {
    const { recipientId, subject, message } = req.body;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    if (!recipientId || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient ID, subject, and message are required'
      });
    }

    // Validate recipient exists
    const recipientResult = await executeQuery(
      'SELECT id, role FROM users WHERE id = ?',
      [recipientId]
    );

    if (recipientResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const recipient = recipientResult[0];

    // Validate permissions
    // Users can only send to admins, admins can send to anyone
    if (senderRole === 'staff' || senderRole === 'technician' || senderRole === 'head_of_dept') {
      if (recipient.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You can only send messages to administrators'
        });
      }
    }

    // Determine user_id and admin_id
    let userId, adminId;
    if (senderRole === 'admin') {
      adminId = senderId;
      userId = recipientId;
    } else {
      userId = senderId;
      adminId = recipientId;
    }

    // Insert message
    const result = await executeQuery(
      `INSERT INTO user_messages (user_id, admin_id, sender_id, sender_role, subject, message) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, adminId, senderId, senderRole === 'admin' ? 'admin' : 'user', subject, message]
    );

    res.json({
      success: true,
      message: 'Message sent successfully',
      messageId: result.insertId
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// GET MESSAGES (Conversation for a specific user-admin pair)
router.get('/messages/:conversationId', verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    // conversationId format: userId_adminId
    const [userId, adminId] = conversationId.split('_').map(Number);

    // Validate user is part of this conversation
    if (currentUserRole === 'admin') {
      if (currentUserId !== adminId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else {
      if (currentUserId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Get messages
    const messages = await executeQuery(
      `SELECT id, sender_id, sender_role, subject, message, read_status, created_at
       FROM user_messages 
       WHERE user_id = ? AND admin_id = ?
       ORDER BY created_at ASC`,
      [userId, adminId]
    );

    // Mark messages as read for current user
    if (messages.length > 0) {
      if (currentUserRole === 'admin') {
        await executeQuery(
          `UPDATE user_messages 
           SET read_status = TRUE, read_at = NOW() 
           WHERE user_id = ? AND admin_id = ? AND sender_role = 'user' AND read_status = FALSE`,
          [userId, adminId]
        );
      } else {
        await executeQuery(
          `UPDATE user_messages 
           SET read_status = TRUE, read_at = NOW() 
           WHERE user_id = ? AND admin_id = ? AND sender_role = 'admin' AND read_status = FALSE`,
          [userId, adminId]
        );
      }
    }

    // Get other user info
    const otherUserId = currentUserRole === 'admin' ? userId : adminId;
    const otherUserResult = await executeQuery(
      'SELECT id, full_name, username, role FROM users WHERE id = ?',
      [otherUserId]
    );

    const otherUser = otherUserResult.length > 0 ? otherUserResult[0] : null;

    res.json({
      success: true,
      data: {
        messages,
        otherUser
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// GET ALL CONVERSATIONS (for current user)
router.get('/messages/conversations/all', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    let conversations;

    if (currentUserRole === 'admin') {
      // Get all conversations where admin is involved
      conversations = await executeQuery(
        `SELECT DISTINCT u.id, u.full_name, u.username,
         (SELECT COUNT(*) FROM user_messages 
          WHERE admin_id = ? AND user_id = u.id AND sender_role = 'user' AND read_status = FALSE) as unread_count,
         (SELECT MAX(created_at) FROM user_messages 
          WHERE admin_id = ? AND user_id = u.id) as last_message_date,
         (SELECT message FROM user_messages 
          WHERE admin_id = ? AND user_id = u.id 
          ORDER BY created_at DESC LIMIT 1) as last_message
         FROM users u
         WHERE EXISTS (
           SELECT 1 FROM user_messages 
           WHERE (user_id = u.id AND admin_id = ?) OR (user_id = ? AND admin_id = u.id)
         )
         ORDER BY last_message_date DESC`,
        [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId]
      );
    } else {
      // Get all conversations where user is involved (should be with admins only)
      conversations = await executeQuery(
        `SELECT DISTINCT u.id, u.full_name, u.username,
         (SELECT COUNT(*) FROM user_messages 
          WHERE user_id = ? AND admin_id = u.id AND sender_role = 'admin' AND read_status = FALSE) as unread_count,
         (SELECT MAX(created_at) FROM user_messages 
          WHERE user_id = ? AND admin_id = u.id) as last_message_date,
         (SELECT message FROM user_messages 
          WHERE user_id = ? AND admin_id = u.id 
          ORDER BY created_at DESC LIMIT 1) as last_message
         FROM users u
         WHERE u.role = 'admin' AND EXISTS (
           SELECT 1 FROM user_messages 
           WHERE user_id = ? AND admin_id = u.id
         )
         ORDER BY last_message_date DESC`,
        [currentUserId, currentUserId, currentUserId, currentUserId]
      );
    }

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// GET UNREAD MESSAGE COUNT (for notifications)
router.get('/messages/unread/count', verifyToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role;

    let query, params;

    if (currentUserRole === 'admin') {
      query = `SELECT COUNT(*) as unread_count 
               FROM user_messages 
               WHERE admin_id = ? AND sender_role = 'user' AND read_status = FALSE`;
      params = [currentUserId];
    } else {
      query = `SELECT COUNT(*) as unread_count 
               FROM user_messages 
               WHERE user_id = ? AND sender_role = 'admin' AND read_status = FALSE`;
      params = [currentUserId];
    }

    const result = await executeQuery(query, params);
    const unreadCount = result[0]?.unread_count || 0;

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count'
    });
  }
});

// DELETE MESSAGE (only sender can delete)
router.delete('/messages/:messageId', verifyToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user.id;

    // Get message
    const messageResult = await executeQuery(
      'SELECT sender_id FROM user_messages WHERE id = ?',
      [messageId]
    );

    if (messageResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const message = messageResult[0];

    if (message.sender_id !== currentUserId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    await executeQuery(
      'DELETE FROM user_messages WHERE id = ?',
      [messageId]
    );

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

export default router;
