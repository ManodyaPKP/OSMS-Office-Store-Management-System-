-- Office Store Management System (OSMS) Database Schema
-- Execute this file in XAMPP phpMyAdmin or MySQL client to set up the database

-- Create Database
CREATE DATABASE IF NOT EXISTS osms_db;
USE osms_db;

-- ============================================
-- TABLE: departments
-- ============================================
CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  head_name VARCHAR(100),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: users (for authentication)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  role ENUM('staff', 'technician', 'head_of_dept', 'admin') DEFAULT 'staff',
  dept_id INT,
  bio TEXT,
  phone VARCHAR(20),
  profile_picture LONGBLOB,
  profile_picture_type VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================================
-- TABLE: pending_users (User Registration Approval)
-- ============================================
CREATE TABLE IF NOT EXISTS pending_users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(20),
  user_type ENUM('staff', 'technician', 'other') NOT NULL,
  
  -- Staff Fields
  department_name VARCHAR(100),
  section_name VARCHAR(100),
  unit_name VARCHAR(100),
  position VARCHAR(100),
  
  -- Technician Fields
  company_shop_name VARCHAR(100),
  company_phone VARCHAR(20),
  address TEXT,
  
  -- Other Fields
  id_number VARCHAR(50),
  registration_note TEXT,
  
  -- Approval Fields
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approval_notes TEXT,
  approved_by INT,
  approval_date TIMESTAMP NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_email (email)
);

-- ============================================
-- TABLE: assets
-- ============================================
CREATE TABLE IF NOT EXISTS assets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dept_id INT NOT NULL,
  asset_type ENUM('laptop', 'desktop', 'printer', 'monitor', 'other') NOT NULL,
  model VARCHAR(100) NOT NULL,
  serial_number VARCHAR(100) UNIQUE,
  incharge_name VARCHAR(100),
  status ENUM('active', 'under_repair', 'repaired', 'condemned') DEFAULT 'active',
  received_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_serial (serial_number),
  INDEX idx_status (status),
  INDEX idx_dept (dept_id)
);

-- ============================================
-- TABLE: asset_parts
-- ============================================
CREATE TABLE IF NOT EXISTS asset_parts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  part_name VARCHAR(100) NOT NULL,
  specification VARCHAR(200),
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  INDEX idx_asset (asset_id)
);

-- ============================================
-- TABLE: repair_jobs (UPDATED with all fields)
-- ============================================
CREATE TABLE IF NOT EXISTS repair_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT,
  created_by INT,
  
  -- Asset Information Fields
  asset_name VARCHAR(200),
  model VARCHAR(100),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  quantity INT DEFAULT 1,
  dept_id INT,
  
  -- User Information Fields
  section_name VARCHAR(100),
  unit_name VARCHAR(100),
  current_username VARCHAR(100),
  applicant_position VARCHAR(100),
  department_head VARCHAR(100),
  handed_over_by VARCHAR(100),
  unit_phone VARCHAR(20),
  user_mobile VARCHAR(20),
  
  -- Maintenance History Fields
  previous_maintenance ENUM('yes', 'no') DEFAULT 'no',
  handed_over_date DATE,
  receipt_book_info VARCHAR(200),
  
  -- Issue Details Fields
  issue_description TEXT NOT NULL,
  error_date DATE,
  previous_error ENUM('yes', 'no') DEFAULT 'no',
  
  -- Repair Center Fields
  repair_center_name TEXT,
  assessment_number VARCHAR(50),
  assessment_date DATE,
  assessment_amount DECIMAL(12,2),
  invoice_number VARCHAR(50),
  invoice_date DATE,
  invoice_amount DECIMAL(12,2),
  completed_item TEXT,
  
  -- Status Fields
  repair_status ENUM('pending', 'in_repair', 'completed', 'cancelled') DEFAULT 'pending',
  submitted_date DATE NOT NULL,
  completed_date DATE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL,
  
  INDEX idx_asset (asset_id),
  INDEX idx_status (repair_status),
  INDEX idx_submitted (submitted_date),
  INDEX idx_dept (dept_id)
);

-- ============================================
-- TABLE: inspections (Sections 2 & 3)
-- ============================================
CREATE TABLE IF NOT EXISTS inspections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  repair_job_id INT NOT NULL,
  section_type ENUM('post_repair', 'return') NOT NULL,
  inspector_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  signature_text VARCHAR(200),
  inspection_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (repair_job_id) REFERENCES repair_jobs(id) ON DELETE CASCADE,
  INDEX idx_repair (repair_job_id)
);

-- ============================================
-- TABLE: approvals (Sections 4 & 5)
-- ============================================
CREATE TABLE IF NOT EXISTS approvals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  repair_job_id INT NOT NULL,
  approval_type ENUM('pro05_request', 'final_decision') NOT NULL,
  approver_name VARCHAR(100) NOT NULL,
  designation VARCHAR(100),
  signature_text VARCHAR(200),
  decision ENUM('approved', 'rejected', 'pending') DEFAULT 'pending',
  approval_date DATE,
  decision_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (repair_job_id) REFERENCES repair_jobs(id) ON DELETE CASCADE,
  INDEX idx_repair (repair_job_id),
  INDEX idx_decision (decision)
);

-- ============================================
-- TABLE: user_profiles (User Profile Information)
-- ============================================
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

-- ============================================
-- TABLE: user_messages (Admin-User Messaging)
-- ============================================
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

-- ============================================
-- TABLE: user_settings (User Preferences)
-- ============================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id INT PRIMARY KEY,
  theme ENUM('light', 'dark') DEFAULT 'light',
  notifications BOOLEAN DEFAULT TRUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- Create Indexes for Performance
-- ============================================
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_repairs_created ON repair_jobs(created_at);

-- ============================================
-- Insert Sample Data for Testing
-- ============================================

-- Sample Departments
INSERT INTO departments (name, code, head_name, address) VALUES
('Finance Department', 'FIN-01', 'Mr. John Smith', '101 Finance Building'),
('IT Department', 'IT-01', 'Ms. Sarah Johnson', '202 Tech Plaza'),
('HR Department', 'HR-01', 'Mr. Ahmed Hassan', '103 Admin Block'),
('Facilities', 'FAC-01', 'Ms. Emma Davis', '104 Maintenance Wing');

-- Sample Users (Password: Password@123)
INSERT INTO users (username, email, password_hash, full_name, designation, role, dept_id, bio, phone, is_active) VALUES
('admin_user', 'admin@osms.local', '$2b$10$rYW0qzYl8w8X5GqDvV7Zju6j8K5L5Q9M3N2O1P0R9S8T7U6V5W4X3', 'System Admin', 'Manager', 'admin', 1, 'System Administrator', '555-0101', TRUE),
('staff_user1', 'staff@osms.local', '$2b$10$rYW0qzYl8w8X5GqDvV7Zju6j8K5L5Q9M3N2O1P0R9S8T7U6V5W4X3', 'John Officer', 'Officer', 'staff', 1, 'Finance Officer', '555-0102', TRUE),
('tech_user1', 'tech@osms.local', '$2b$10$rYW0qzYl8w8X5GqDvV7Zju6j8K5L5Q9M3N2O1P0R9S8T7U6V5W4X3', 'Tech Support', 'Technician', 'technician', 2, 'IT Support Technician', '555-0103', TRUE);

-- Sample Assets
INSERT INTO assets (dept_id, asset_type, model, serial_number, incharge_name, status, received_date) VALUES
(1, 'laptop', 'Dell Inspiron 15', 'DL123456789', 'Mr. John Smith', 'active', '2024-01-15'),
(1, 'desktop', 'HP Pavilion', 'HP987654321', 'Mr. John Smith', 'active', '2024-01-20'),
(2, 'printer', 'Canon LBP6030', 'CN456789012', 'Ms. Sarah Johnson', 'active', '2024-02-01'),
(2, 'monitor', 'Dell U2720Q', 'DL234567890', 'Ms. Sarah Johnson', 'under_repair', '2024-02-05');

-- Sample Asset Parts
INSERT INTO asset_parts (asset_id, part_name, specification, quantity) VALUES
(1, 'RAM', '8GB DDR4', 1),
(1, 'HDD', '512GB SSD', 1),
(1, 'Processor', 'Intel i5', 1),
(2, 'RAM', '16GB DDR4', 2),
(2, 'HDD', '1TB HDD', 1);

-- User Settings
INSERT INTO user_settings (user_id, theme, notifications, email_notifications) VALUES
(1, 'light', TRUE, TRUE),
(2, 'light', TRUE, TRUE),
(3, 'light', TRUE, TRUE);