# 👤 User Profile & Admin Messaging System - Implementation Guide

## Overview
I've successfully implemented a comprehensive profile management system and admin-user messaging platform for your Store Management System. Users can now maintain their profiles and communicate directly with administrators.

---

## 🎯 Features Implemented

### 1. **User Profile Management** (`/profile`)
Users can now access their profile page with the following capabilities:

#### Profile Picture Management
- Upload a profile picture (JPEG, PNG, GIF, WebP)
- View uploaded profile picture
- Update picture anytime

#### Personal Information Editing
- Update username
- Update full name
- Add/edit bio
- Update phone number

#### Security
- Change password with current password verification
- Password confirmation validation
- Minimum password length enforced (6 characters)

#### Profile Information Viewing
- View read-only information:
  - Email address
  - Designation
  - Role (staff, technician, head_of_dept, admin)
  - Department assignment

---

### 2. **Admin-User Messaging System** (`/messages`)
A complete chat system for secure admin-user communication:

#### For Regular Users
- Send messages to administrators
- View conversation history with each admin
- Mark messages as read
- Delete their own messages
- See list of available admins to contact

#### For Administrators
- Receive messages from users
- View all active conversations
- See unread message count in navbar (with pulsing badge)
- Reply to user messages
- View message history
- Mark messages as read

#### Features
- Real-time conversation display
- Unread message notifications
- Auto-refresh conversations every 10 seconds
- Message timestamps
- Subject line for initial messages (replied messages show "Re: [Subject]")
- Unread count badge on messages icon in navbar

---

## 📱 User Interface Changes

### Sidebar Updates
Added two new navigation items:
- **👤 My Profile** - Links to profile management page
- **💬 Messages** - Links to messaging center

### Navbar Notifications
- **Message Badge** - Shows unread message count when > 0 (blue)
- **Admin Approvals Badge** - Shows pending approvals for admins (amber)
- Both badges include pulsing animation to draw attention

---

## 🗄️ Database Changes

### New Tables Created

#### `user_profiles`
```sql
CREATE TABLE user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  profile_picture LONGBLOB,
  profile_picture_type VARCHAR(50),
  bio TEXT,
  phone VARCHAR(20),
  updated_at TIMESTAMP
);
```

#### `user_messages`
```sql
CREATE TABLE user_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  admin_id INT,
  sender_id INT NOT NULL,
  sender_role ENUM('user', 'admin'),
  subject VARCHAR(200),
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP
);
```

---

## 🔌 API Endpoints

### Profile Endpoints
- `GET /api/profile/profile` - Get user profile information
- `GET /api/profile/picture/:userId` - Get profile picture image
- `PUT /api/profile/profile` - Update profile information
- `POST /api/profile/upload-picture` - Upload profile picture
- `POST /api/profile/change-password` - Change user password

### Messaging Endpoints
- `POST /api/messages/send` - Send a message
- `GET /api/messages/:conversationId` - Get conversation messages
- `GET /api/messages/conversations/all` - Get all conversations for user
- `GET /api/messages/unread/count` - Get unread message count
- `DELETE /api/messages/:messageId` - Delete a message

### User Endpoints
- `GET /api/users/admins` - Get list of all active admins

---

## 🚀 How to Use

### For Regular Users

#### 1. Update Your Profile
1. Click **👤 My Profile** in the sidebar
2. Edit your information:
   - Click **✏️ Edit Profile** button
   - Update username, full name, bio, or phone
   - Click **✓ Save Changes**
3. Upload a profile picture:
   - Click **📁 Choose Picture**
   - Select an image file
   - Click **✓ Upload Picture**
4. Change your password:
   - Click **🔑 Change Password**
   - Enter current and new passwords
   - Click **✓ Change Password**

#### 2. Send a Message to Admin
1. Click **💬 Messages** in the sidebar
2. Click **✉️ New Message** button
3. Select an administrator from the list
4. Type your message subject (for first message)
5. Enter your message
6. Click **📤 Send**
7. View the conversation and continue chatting

### For Administrators

#### 1. View Incoming Messages
- Look for the **💬 New [count]** badge in the navbar
- Click it to go to the messages page
- Each conversation shows:
  - User's name and username
  - Preview of the last message
  - Unread count badge

#### 2. Read and Reply to Messages
1. Click on a conversation to open it
2. View all messages in the conversation
3. Type your reply in the message box
4. Click **📤 Send**
5. Messages are automatically marked as read

#### 3. Message Management
- View all conversations with users
- See unread message counts
- Delete your own messages
- Access message history anytime

---

## 🔒 Security Features

### Authentication & Authorization
- All endpoints require authentication token
- Users can only:
  - View their own profile
  - Send messages to admins only
  - Delete their own messages
- Admins can:
  - View and reply to all user messages
  - Access all conversations

### Data Protection
- Passwords are hashed with bcrypt
- Profile pictures stored as binary data
- Read status tracking for messages
- Timestamp tracking for all messages

---

## 📂 File Structure

### Frontend New Files
```
src/
├── pages/
│   ├── ProfilePage.jsx        # User profile management page
│   └── MessagesPage.jsx       # Messages conversations list
├── components/
│   └── MessageChat.jsx        # Chat interface component
└── Layout.jsx                 # Updated with new links & badges
```

### Backend New Files
```
backend/
├── src/routes/
│   ├── profiles.js            # Profile management endpoints
│   └── messages.js            # Messaging endpoints
└── database/
    └── schema.sql             # Updated with new tables
```

---

## 🔄 Real-time Updates

### Auto-Refresh Features
- Messages refresh every 5 seconds
- Conversations list refreshes every 10 seconds
- Unread counts refresh every 15 seconds
- Navbar badges update in real-time

---

## 💡 Tips & Best Practices

1. **Profile Picture**: Keep file size reasonable for optimal loading
2. **Messages**: Use clear subject lines for initial messages
3. **Notifications**: Check the navbar badges regularly for new messages
4. **Password Security**: Use strong passwords with mix of characters
5. **Communication**: Messages are stored permanently in the database

---

## 🐛 Troubleshooting

### Profile Picture Not Loading
- Ensure file is a valid image format (JPEG, PNG, GIF, WebP)
- Check file size is not too large
- Try uploading again

### Messages Not Appearing
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console for errors
- Ensure you're logged in

### Badges Not Showing
- Try logging out and back in
- Clear browser cache
- Restart the development servers

---

## 📝 Next Steps

To apply the database changes:

1. Open phpMyAdmin or MySQL client
2. Select the `osms_db` database
3. Execute the updated schema.sql file
4. Restart the backend server
5. Refresh the frontend application

The system is now ready to use! Users can manage their profiles and communicate with administrators seamlessly.
