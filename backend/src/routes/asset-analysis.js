import express from 'express';
import db from '../database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware
router.use(verifyToken);

/**
 * GET /api/asset-analysis/summary
 * Get overall assets summary with duplicates count
 */
router.get('/summary', async (req, res) => {
  try {
    const [assetStats] = await db.query(`
      SELECT 
        COUNT(DISTINCT a.id) as total_assets,
        SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) as active_assets,
        SUM(CASE WHEN a.status = 'under_repair' THEN 1 ELSE 0 END) as under_repair,
        SUM(CASE WHEN a.status = 'repaired' THEN 1 ELSE 0 END) as repaired,
        SUM(CASE WHEN a.status = 'condemned' THEN 1 ELSE 0 END) as condemned,
        COUNT(DISTINCT a.asset_type) as asset_types,
        COUNT(DISTINCT a.serial_number) as unique_serials
      FROM assets a
      INNER JOIN repair_jobs r ON a.id = r.asset_id
      WHERE a.received_date IS NOT NULL
    `);

    // Find duplicates
    const [duplicates] = await db.query(`
      SELECT 
        a.serial_number,
        a.model,
        COUNT(DISTINCT a.id) as duplicate_count,
        GROUP_CONCAT(a.id) as asset_ids,
        GROUP_CONCAT(a.status) as statuses,
        GROUP_CONCAT(a.incharge_name) as incharge_names,
        MIN(a.created_at) as first_registered,
        MAX(a.created_at) as last_registered
      FROM assets a
      INNER JOIN repair_jobs r ON a.id = r.asset_id
      WHERE a.serial_number IS NOT NULL AND a.serial_number != '' AND a.received_date IS NOT NULL
      GROUP BY a.serial_number, a.model
      HAVING COUNT(DISTINCT a.id) > 1
      ORDER BY duplicate_count DESC
    `);

    res.json({
      success: true,
      data: {
        stats: assetStats[0] || {},
        duplicateCount: duplicates.length,
        duplicateItems: duplicates || []
      }
    });
  } catch (error) {
    console.error('Error fetching assets summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/asset-analysis/all-with-details
 * Get all assets with detailed information and analysis
 */
router.get('/all-with-details', async (req, res) => {
  try {
    const [assets] = await db.query(`
      SELECT
        a.id,
        a.dept_id,
        a.asset_type,
        a.model,
        a.serial_number,
        a.incharge_name,
        a.status,
        a.received_date,
        a.created_at,
        d.name AS department_name,
        COALESCE(rc.repair_count, 0) AS repair_count,
        COALESCE(cc.total_repair_cost, 0) AS total_repair_cost,
        COALESCE(cc.avg_repair_cost, 0) AS avg_repair_cost,
        rc.last_repair_date,
        rc.first_repair_date,
        rc.maintenance_level,
        cc.cost_level
      FROM assets a
      INNER JOIN repair_jobs r ON a.id = r.asset_id
      LEFT JOIN departments d ON a.dept_id = d.id
      LEFT JOIN (
        SELECT
          asset_id,
          COUNT(*) AS repair_count,
          MAX(submitted_date) AS last_repair_date,
          MIN(submitted_date) AS first_repair_date,
          CASE
            WHEN COUNT(*) = 0 THEN 'No Repairs'
            WHEN COUNT(*) <= 2 THEN 'Low Maintenance'
            WHEN COUNT(*) <= 4 THEN 'Moderate Maintenance'
            ELSE 'High Maintenance - Needs Review'
          END AS maintenance_level
        FROM repair_jobs
        GROUP BY asset_id
      ) rc ON a.id = rc.asset_id
      LEFT JOIN (
        SELECT
          asset_id,
          SUM(amount) AS total_repair_cost,
          AVG(amount) AS avg_repair_cost,
          CASE
            WHEN SUM(amount) = 0 THEN 'No Cost'
            WHEN SUM(amount) < 10000 THEN 'Low Cost'
            WHEN SUM(amount) < 50000 THEN 'Medium Cost'
            ELSE 'High Cost - Budget Alert'
          END AS cost_level
        FROM maintenance_costs
        GROUP BY asset_id
      ) cc ON a.id = cc.asset_id
      WHERE a.received_date IS NOT NULL
      GROUP BY a.id
      ORDER BY a.id ASC
    `);

    res.json({
      success: true,
      data: assets
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/asset-analysis/duplicates
 * Get flagged duplicate/similar serial numbers from repair jobs
 */
router.get('/duplicates', async (req, res) => {
  try {
    const [duplicates] = await db.query(`
      SELECT
        serial_number,
        model,
        COUNT(*) as duplicate_count,
        GROUP_CONCAT(DISTINCT id ORDER BY id) as repair_ids,
        GROUP_CONCAT(DISTINCT repair_status ORDER BY id) as statuses,
        GROUP_CONCAT(DISTINCT current_username ORDER BY id) as current_users,
        GROUP_CONCAT(DISTINCT dept_id ORDER BY id) as dept_ids,
        MIN(submitted_date) as first_submitted,
        MAX(submitted_date) as last_submitted,
        TIMESTAMPDIFF(DAY, MIN(submitted_date), MAX(submitted_date)) as days_between,
        GROUP_CONCAT(DISTINCT DATE_FORMAT(submitted_date, '%Y-%m-%d') ORDER BY submitted_date SEPARATOR ', ') as registration_dates
      FROM repair_jobs
      WHERE serial_number IS NOT NULL AND serial_number != ''
      GROUP BY serial_number, model
      HAVING COUNT(*) > 1
      ORDER BY duplicate_count DESC, days_between DESC
    `);

    res.json({
      success: true,
      data: duplicates || []
    });
  } catch (error) {
    console.error('Error fetching duplicates:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/asset-analysis/:assetId/location-history
 * Get location/assignment history for an asset
 */
router.get('/:assetId/location-history', async (req, res) => {
  try {
    const { assetId } = req.params;

    const [assetInfo] = await db.query(`
      SELECT 
        id, asset_type, model, serial_number, 
        incharge_name, status, dept_id
      FROM assets
      WHERE id = ?
    `, [assetId]);

    if (assetInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const [locationHistory] = await db.query(`
      SELECT 
        alh.id,
        alh.assigned_to,
        alh.location_description,
        alh.assignment_date,
        alh.release_date,
        d.name as department_name,
        d.code as department_code,
        alh.notes,
        CASE 
          WHEN alh.release_date IS NULL THEN 'Current Location'
          ELSE 'Previous Location'
        END as location_status
      FROM asset_location_history alh
      LEFT JOIN departments d ON alh.dept_id = d.id
      WHERE alh.asset_id = ?
      ORDER BY alh.assignment_date DESC
    `, [assetId]);

    // Get current location
    const [currentLocation] = await db.query(`
      SELECT 
        assigned_to,
        location_description,
        assignment_date,
        d.name as department_name
      FROM asset_location_history alh
      LEFT JOIN departments d ON alh.dept_id = d.id
      WHERE alh.asset_id = ? AND alh.release_date IS NULL
      ORDER BY alh.assignment_date DESC
      LIMIT 1
    `, [assetId]);

    res.json({
      success: true,
      data: {
        asset: assetInfo[0],
        locationHistory: locationHistory,
        currentLocation: currentLocation[0] || null
      }
    });
  } catch (error) {
    console.error('Error fetching location history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/asset-analysis/:assetId/repair-analysis
 * Get detailed repair analysis for an asset
 */
router.get('/:assetId/repair-analysis', async (req, res) => {
  try {
    const { assetId } = req.params;

    const [assetInfo] = await db.query(`
      SELECT 
        a.id,
        a.asset_type,
        a.model,
        a.serial_number,
        a.incharge_name,
        a.status,
        a.received_date,
        d.name as department_name,
        COUNT(DISTINCT rj.id) as total_repair_requests
      FROM assets a
      LEFT JOIN departments d ON a.dept_id = d.id
      LEFT JOIN repair_jobs rj ON a.id = rj.asset_id
      WHERE a.id = ?
      GROUP BY a.id, a.asset_type, a.model, a.serial_number, 
               a.incharge_name, a.status, a.received_date, d.name
    `, [assetId]);

    if (assetInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const [repairHistory] = await db.query(`
      SELECT 
        rj.id as repair_id,
        rj.issue_description,
        rj.error_date,
        rj.submitted_date,
        rj.repair_status,
        rj.completed_date,
        mc.amount as cost_amount,
        mc.cost_type,
        mc.cost_date,
        mc.invoice_number,
        mc.supplier_name
      FROM repair_jobs rj
      LEFT JOIN maintenance_costs mc ON rj.id = mc.repair_job_id
      WHERE rj.asset_id = ?
      ORDER BY rj.submitted_date DESC
    `, [assetId]);

    // Calculate analysis metrics
    const totalRepairs = repairHistory.length;
    const totalCost = repairHistory.reduce((sum, r) => sum + (parseFloat(r.cost_amount) || 0), 0);
    const averageCost = totalRepairs > 0 ? totalCost / totalRepairs : 0;

    // Determine recommendation
    let recommendation = 'Monitor Regularly';
    let recommendationReason = '';

    if (totalRepairs > 5) {
      recommendation = 'Replace - High Maintenance';
      recommendationReason = 'Asset has excessive repairs';
    } else if (totalRepairs > 3) {
      recommendation = 'Consider Replacement';
      recommendationReason = 'Asset showing signs of frequent failures';
    } else if (totalCost > 50000) {
      recommendation = 'Cost Analysis Required';
      recommendationReason = 'Maintenance cost exceeds threshold';
    } else if (totalRepairs === 0) {
      recommendation = 'Well Maintained';
      recommendationReason = 'No repair history recorded';
    } else {
      recommendation = 'Continue Regular Maintenance';
      recommendationReason = 'Asset performing within expected parameters';
    }

    res.json({
      success: true,
      data: {
        asset: assetInfo[0],
        repairHistory: repairHistory,
        analysis: {
          totalRepairs: totalRepairs,
          totalRepairCost: totalCost,
          averageRepairCost: averageCost,
          lastRepairDate: repairHistory[0]?.submitted_date || null,
          firstRepairDate: repairHistory[repairHistory.length - 1]?.submitted_date || null,
          recommendation: recommendation,
          recommendationReason: recommendationReason,
          needsReplacement: recommendation === 'Replace - High Maintenance',
          maintenanceFrequency: totalRepairs > 0 ? (totalRepairs / (new Date().getFullYear() - new Date(assetInfo[0].received_date).getFullYear() || 1)).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching repair analysis:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/asset-analysis/trending/by-repair-count
 * Get assets ranked by number of repairs
 */
router.get('/trending/by-repair-count', async (req, res) => {
  try {
    const [trendingAssets] = await db.query(`
      SELECT
        a.id,
        a.asset_type,
        a.model,
        a.serial_number,
        a.status,
        a.incharge_name,
        COALESCE(t.repair_count, 0) AS repair_count,
        COALESCE(t.total_cost, 0) AS total_cost,
        COALESCE(t.avg_cost, 0) AS avg_cost,
        t.last_repair_date,
        d.name AS department_name,
        CASE
          WHEN COALESCE(t.repair_count, 0) > 5 THEN 'URGENT - Replace Recommended'
          WHEN COALESCE(t.repair_count, 0) > 3 THEN 'Warning - Monitor Closely'
          ELSE 'Normal'
        END AS priority_level,
        CASE
          WHEN COALESCE(t.total_cost, 0) > 50000 THEN 'High Cost Impact'
          WHEN COALESCE(t.total_cost, 0) > 25000 THEN 'Medium Cost Impact'
          ELSE 'Low Cost Impact'
        END AS cost_impact
      FROM assets a
      LEFT JOIN departments d ON a.dept_id = d.id
      LEFT JOIN (
        SELECT
          rj.asset_id,
          COUNT(*) AS repair_count,
          COALESCE(SUM(mc.amount), 0) AS total_cost,
          COALESCE(AVG(mc.amount), 0) AS avg_cost,
          MAX(rj.submitted_date) AS last_repair_date
        FROM repair_jobs rj
        LEFT JOIN maintenance_costs mc ON rj.id = mc.repair_job_id
        GROUP BY rj.asset_id
      ) t ON a.id = t.asset_id
      WHERE COALESCE(t.repair_count, 0) > 0
      ORDER BY t.repair_count DESC, t.total_cost DESC
      LIMIT 20
    `);

    res.json({
      success: true,
      data: trendingAssets
    });
  } catch (error) {
    console.error('Error fetching trending assets:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/asset-analysis/:assetId/location-update
 * Update asset location/assignment
 */
router.post('/:assetId/location-update', async (req, res) => {
  try {
    const { assetId } = req.params;
    const { deptId, assignedTo, locationDescription, notes } = req.body;

    if (!assetId || !deptId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: assetId, deptId' 
      });
    }

    // First, close any open assignment by setting release_date
    await db.query(`
      UPDATE asset_location_history 
      SET release_date = CURDATE()
      WHERE asset_id = ? AND release_date IS NULL
    `, [assetId]);

    // Insert new location record
    const [result] = await db.query(`
      INSERT INTO asset_location_history 
      (asset_id, dept_id, assigned_to, location_description, assignment_date, notes)
      VALUES (?, ?, ?, ?, CURDATE(), ?)
    `, [assetId, deptId, assignedTo || null, locationDescription || null, notes || null]);

    // Update asset's incharge and department
    if (assignedTo) {
      await db.query(`
        UPDATE assets 
        SET incharge_name = ?, dept_id = ?
        WHERE id = ?
      `, [assignedTo, deptId, assetId]);
    }

    res.json({
      success: true,
      message: 'Asset location updated successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error updating asset location:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/asset-analysis/statistics/summary
 * Get comprehensive asset statistics
 */
router.get('/statistics/summary', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'under_repair' THEN 1 ELSE 0 END) as under_repair,
        SUM(CASE WHEN status = 'repaired' THEN 1 ELSE 0 END) as repaired,
        SUM(CASE WHEN status = 'condemned' THEN 1 ELSE 0 END) as condemned,
        COUNT(DISTINCT asset_type) as asset_types,
        COUNT(DISTINCT dept_id) as departments_with_assets,
        ROUND(AVG(CASE WHEN status = 'active' THEN 1 ELSE 0 END) * 100, 2) as active_percentage
      FROM assets
    `);

    const [repairStats] = await db.query(`
      SELECT 
        COALESCE(AVG(repair_count), 0) as avg_repairs_per_asset,
        COALESCE(MAX(repair_count), 0) as max_repairs,
        COALESCE(MIN(repair_count), 0) as min_repairs
      FROM (
        SELECT COUNT(*) as repair_count
        FROM repair_jobs
        GROUP BY asset_id
      ) as repair_counts
    `);

    res.json({
      success: true,
      data: {
        assetStats: stats[0] || {},
        repairStats: repairStats[0] || {}
      }
    });
  } catch (error) {
    console.error('Error fetching asset statistics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;