-- Financial Tracking Tables for OSMS
-- Add these tables to track maintenance costs and budget

-- ============================================
-- TABLE: maintenance_budget
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_budget (
  id INT PRIMARY KEY AUTO_INCREMENT,
  dept_id INT NOT NULL,
  fiscal_year INT NOT NULL,
  allocated_budget DECIMAL(15,2) NOT NULL,
  spent_budget DECIMAL(15,2) DEFAULT 0,
  remaining_budget DECIMAL(15,2) GENERATED ALWAYS AS (allocated_budget - spent_budget) STORED,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
  UNIQUE KEY unique_dept_year (dept_id, fiscal_year),
  INDEX idx_dept (dept_id),
  INDEX idx_year (fiscal_year)
);

-- ============================================
-- TABLE: maintenance_costs
-- ============================================
CREATE TABLE IF NOT EXISTS maintenance_costs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  repair_job_id INT,
  asset_id INT NOT NULL,
  dept_id INT NOT NULL,
  
  -- Asset Details for Tracking
  asset_name VARCHAR(200),
  model VARCHAR(100),
  model_number VARCHAR(100),
  serial_number VARCHAR(100),
  item_name VARCHAR(200),
  
  -- Cost Details
  cost_type ENUM('assessment', 'invoice', 'parts', 'labor', 'other') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  cost_date DATE NOT NULL,
  description TEXT,
  
  -- Status
  is_approved BOOLEAN DEFAULT FALSE,
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (repair_job_id) REFERENCES repair_jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
  
  INDEX idx_asset (asset_id),
  INDEX idx_repair (repair_job_id),
  INDEX idx_dept (dept_id),
  INDEX idx_cost_date (cost_date),
  INDEX idx_cost_type (cost_type)
);

-- ============================================
-- TABLE: asset_location_history
-- ============================================
CREATE TABLE IF NOT EXISTS asset_location_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  dept_id INT NOT NULL,
  assigned_to VARCHAR(100),
  location_description TEXT,
  assignment_date DATE NOT NULL,
  release_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_asset (asset_id),
  INDEX idx_dept (dept_id),
  INDEX idx_assignment_date (assignment_date)
);

-- ============================================
-- TABLE: asset_repair_history
-- ============================================
CREATE TABLE IF NOT EXISTS asset_repair_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  asset_id INT NOT NULL,
  repair_job_id INT,
  
  -- Repair Details
  issue_type VARCHAR(100),
  error_date DATE,
  repair_start_date DATE,
  repair_completion_date DATE,
  
  -- Error Tracking
  is_recurring BOOLEAN DEFAULT FALSE,
  previous_error_count INT DEFAULT 0,
  error_resolution_status ENUM('resolved', 'persistent', 'under_investigation') DEFAULT 'resolved',
  
  -- Cost Tracking
  repair_cost DECIMAL(12,2),
  repair_center_name VARCHAR(200),
  
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
  FOREIGN KEY (repair_job_id) REFERENCES repair_jobs(id) ON DELETE CASCADE,
  
  INDEX idx_asset (asset_id),
  INDEX idx_repair (repair_job_id),
  INDEX idx_error_date (error_date),
  INDEX idx_is_recurring (is_recurring)
);

-- ============================================
-- Update existing repair_jobs table with tracking fields
-- ============================================
ALTER TABLE repair_jobs 
ADD COLUMN IF NOT EXISTS is_duplicate BOOLEAN DEFAULT FALSE COMMENT 'Flag for duplicate/recurring issue';

-- ============================================
-- Insert Sample Budget Data
-- ============================================
INSERT INTO maintenance_budget (dept_id, fiscal_year, allocated_budget, spent_budget) VALUES
(1, 2024, 50000.00, 12500.00),
(2, 2024, 75000.00, 35750.00),
(3, 2024, 30000.00, 8900.00),
(4, 2024, 40000.00, 15600.00);

-- ============================================
-- Create Views for Analysis
-- ============================================

-- Cost Summary by Asset
CREATE OR REPLACE VIEW vw_cost_summary_by_asset AS
SELECT 
  a.id,
  a.asset_type,
  a.model,
  a.serial_number,
  COALESCE(mc.item_name, a.asset_type) as item_name,
  COUNT(DISTINCT mc.repair_job_id) as repair_count,
  SUM(mc.amount) as total_cost,
  AVG(mc.amount) as avg_cost_per_repair,
  MAX(mc.cost_date) as last_maintenance_date,
  d.name as department_name
FROM assets a
LEFT JOIN maintenance_costs mc ON a.id = mc.asset_id
LEFT JOIN departments d ON a.dept_id = d.id
GROUP BY a.id, a.asset_type, a.model, a.serial_number, mc.item_name, d.name;

-- Recurring Issues by Asset
CREATE OR REPLACE VIEW vw_recurring_issues AS
SELECT 
  a.id,
  a.serial_number,
  a.model,
  COUNT(DISTINCT arh.repair_job_id) as total_repairs,
  SUM(CASE WHEN arh.is_recurring = TRUE THEN 1 ELSE 0 END) as recurring_issue_count,
  SUM(arh.repair_cost) as total_repair_cost,
  GROUP_CONCAT(DISTINCT arh.issue_type SEPARATOR ', ') as issue_types,
  MAX(arh.repair_completion_date) as last_repair_date
FROM assets a
LEFT JOIN asset_repair_history arh ON a.id = arh.asset_id
GROUP BY a.id, a.serial_number, a.model;

-- Department Budget Status
CREATE OR REPLACE VIEW vw_department_budget_status AS
SELECT 
  d.id,
  d.name as department_name,
  mb.fiscal_year,
  mb.allocated_budget,
  mb.spent_budget,
  mb.remaining_budget,
  ROUND((mb.spent_budget / mb.allocated_budget) * 100, 2) as spend_percentage,
  CASE 
    WHEN (mb.spent_budget / mb.allocated_budget) >= 0.9 THEN 'Critical'
    WHEN (mb.spent_budget / mb.allocated_budget) >= 0.7 THEN 'High'
    WHEN (mb.spent_budget / mb.allocated_budget) >= 0.5 THEN 'Medium'
    ELSE 'Low'
  END as budget_status
FROM departments d
LEFT JOIN maintenance_budget mb ON d.id = mb.dept_id
ORDER BY mb.fiscal_year DESC, (mb.spent_budget / mb.allocated_budget) DESC;
