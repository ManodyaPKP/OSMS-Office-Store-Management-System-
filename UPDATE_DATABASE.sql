-- SQL Commands to Add Profile and Messaging System to Existing Database
-- Execute these commands in phpMyAdmin or MySQL client

USE osms_db;

-- Create user_profiles table for storing user profile information
CREATE TABLE IF NOT EXISTS user_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  profile_picture LONGBLOB,
  profile_picture_type VARCHAR(50),
  bio TEXT,
  phone VARCHAR(20),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- Create user_messages table for admin-user messaging system
CREATE TABLE IF NOT EXISTS user_messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  admin_id INT,
  sender_id INT NOT NULL,
  sender_role ENUM('user', 'admin') NOT NULL,
  subject VARCHAR(200),
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_admin (admin_id),
  INDEX idx_read_status (read_status),
  INDEX idx_created (created_at)
);

-- Verify tables were created
SELECT 'user_profiles table created' as status;
SELECT 'user_messages table created' as status;

-- Display table structures
DESCRIBE user_profiles;
DESCRIBE user_messages;
