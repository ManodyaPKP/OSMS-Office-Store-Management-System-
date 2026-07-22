-- Remove deprecated maintenance budget and maintenance cost tracking objects
-- Run this against the database after taking a full backup.
-- In phpMyAdmin, select the `osms_db` database first or run: USE osms_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP VIEW IF EXISTS vw_department_budget_status;
DROP VIEW IF EXISTS vw_cost_summary_by_asset;
DROP VIEW IF EXISTS vw_recurring_issues;

DROP TABLE IF EXISTS maintenance_budget;
DROP TABLE IF EXISTS maintenance_costs;

SET FOREIGN_KEY_CHECKS = 1;
