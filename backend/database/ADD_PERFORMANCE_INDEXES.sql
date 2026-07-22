-- Database Optimization Indexes for Performance Improvement
-- Run this script to add indexes that will significantly improve query performance

-- Repair Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status ON repair_jobs(repair_status);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status_date ON repair_jobs(repair_status, submitted_date);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_created_at ON repair_jobs(created_at);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_created_by ON repair_jobs(created_by);
CREATE INDEX IF NOT EXISTS idx_repair_jobs_asset_name ON repair_jobs(asset_name);

-- Asset Indexes
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(asset_status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_department_id ON assets(department_id);
CREATE INDEX IF NOT EXISTS idx_assets_created_at ON assets(created_at);

-- Repairs Status Indexes
CREATE INDEX IF NOT EXISTS idx_repairs_status ON repairs(status);
CREATE INDEX IF NOT EXISTS idx_repairs_created_at ON repairs(created_at);

-- Cost Related Indexes
CREATE INDEX IF NOT EXISTS idx_maintenance_costs_created_at ON maintenance_costs(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_costs_repair_job_id ON maintenance_costs(repair_job_id);

-- User and Department Indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_departments_id ON departments(id);

-- Approval Indexes
CREATE INDEX IF NOT EXISTS idx_approvals_repair_job_id ON approvals(repair_job_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(approval_status);

-- Inspection Indexes
CREATE INDEX IF NOT EXISTS idx_inspections_repair_job_id ON inspections(repair_job_id);

-- Composite Indexes for Common Queries
CREATE INDEX IF NOT EXISTS idx_repair_jobs_status_created ON repair_jobs(repair_status, created_at);
CREATE INDEX IF NOT EXISTS idx_assets_department_status ON assets(department_id, asset_status);

-- Verify indexes were created (optional - run separately to check)
-- SELECT INDEX_NAME, TABLE_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() ORDER BY TABLE_NAME, INDEX_NAME;
