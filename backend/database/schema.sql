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
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
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
-- TABLE: repair_jobs
-- ============================================
CREATE TABLE IF NOT EXISTS repair_jobs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  created_by INT,
  issue_description TEXT NOT NULL,
  submitted_date DATE NOT NULL,
  repair_center_name TEXT,
  assessment_number VARCHAR(50),
  assessment_date DATE,
  assessment_amount DECIMAL(12,2),
  invoice_number VARCHAR(50),
  invoice_date DATE,
  invoice_amount DECIMAL(12,2),
  completed_item TEXT,
  repair_status ENUM('pending', 'in_repair', 'completed', 'cancelled') DEFAULT 'pending',
  completed_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_asset (asset_id),
  INDEX idx_status (repair_status),
  INDEX idx_submitted (submitted_date)
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

-- Sample Users
-- All demo passwords: Password@123
INSERT INTO users (username, email, password_hash, full_name, designation, role, dept_id, is_active) VALUES
('admin_user', 'admin@osms.local', '$2b$10$rYW0qzYl8w8X5GqDvV7Zju6j8K5L5Q9M3N2O1P0R9S8T7U6V5W4X3', 'System Admin', 'Manager', 'admin', 1, TRUE),
('staff_user1', 'staff@osms.local', '$2b$10$rYW0qzYl8w8X5GqDvV7Zju6j8K5L5Q9M3N2O1P0R9S8T7U6V5W4X3', 'John Officer', 'Officer', 'staff', 1, TRUE),
('tech_user1', 'tech@osms.local', '$2b$10$rYW0qzYl8w8X5GqDvV7Zju6j8K5L5Q9M3N2O1P0R9S8T7U6V5W4X3', 'Tech Support', 'Technician', 'technician', 2, TRUE);

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
