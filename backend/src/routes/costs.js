import express from 'express';
import db from '../database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

const extractStatus = (notes) => {
  if (!notes) return null;
  const match = String(notes).match(/Status:\s*(Approved|Pending|Decline)/i);
  return match ? match[1] : null;
};

const formatNotesWithStatus = (notes, status) => {
  const cleaned = String(notes || '').replace(/Status:\s*(Approved|Pending|Decline)\s*/gi, '').trim();
  if (!status) return cleaned || null;
  return [cleaned, `Status: ${status}`].filter(Boolean).join('\n');
};

// Middleware
router.use(verifyToken);

// ============================================
// CORE COST TRACKING ENDPOINTS
// ============================================

/**
 * GET /api/costs/summary
 * Get overall cost summary with budget status
 */
router.get('/summary', async (req, res) => {
  try {
    // Get budget summary, but continue with defaults if the budget table is missing
    let budgetData = [{
      total_allocated: 0,
      total_spent: 0,
      total_remaining: 0,
      dept_count: 0,
      spend_percentage: 0
    }];

    try {
      [budgetData] = await db.query(`
        SELECT 
          COALESCE(SUM(allocated_budget), 0) as total_allocated,
          COALESCE(SUM(spent_budget), 0) as total_spent,
          COALESCE(SUM(remaining_budget), 0) as total_remaining,
          COUNT(*) as dept_count,
          CASE 
            WHEN COALESCE(SUM(allocated_budget), 0) > 0 
            THEN ROUND((COALESCE(SUM(spent_budget), 0) / COALESCE(SUM(allocated_budget), 1)) * 100, 2)
            ELSE 0
          END as spend_percentage
        FROM maintenance_budget
        WHERE fiscal_year = YEAR(CURDATE())
      `);
    } catch (budgetError) {
      if (budgetError.code === 'ER_NO_SUCH_TABLE') {
        console.warn('maintenance_budget table is missing; returning default budget summary values.');
      } else {
        throw budgetError;
      }
    }

    // Get costs by type
    const [costsByType] = await db.query(`
      SELECT 
        cost_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount,
        COALESCE(MIN(amount), 0) as min_amount,
        COALESCE(MAX(amount), 0) as max_amount
      FROM maintenance_costs
      WHERE YEAR(cost_date) = YEAR(CURDATE())
      GROUP BY cost_type
      ORDER BY total_amount DESC
    `);

    // Get monthly trend
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(cost_date, '%Y-%m') as month,
        DATE_FORMAT(cost_date, '%b %Y') as month_name,
        COALESCE(SUM(amount), 0) as total_cost,
        COUNT(*) as transaction_count,
        COALESCE(AVG(amount), 0) as avg_cost
      FROM maintenance_costs
      WHERE cost_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(cost_date, '%Y-%m'), DATE_FORMAT(cost_date, '%b %Y')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: {
        budget: budgetData[0] || {},
        costsByType: costsByType || [],
        monthlyTrend: monthlyTrend || []
      }
    });
  } catch (error) {
    console.error('Error fetching cost summary:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/by-asset
 * Get cost breakdown by asset with detailed analysis
 */
router.get('/by-asset', async (req, res) => {
  try {
    const [assetCosts] = await db.query(`
      SELECT 
        a.id,
        a.asset_type,
        a.model,
        a.serial_number,
        a.incharge_name,
        a.status,
        a.received_date,
        COALESCE(mc.item_name, a.asset_type) as item_name,
        COUNT(DISTINCT mc.id) as repair_count,
        COALESCE(SUM(mc.amount), 0) as total_cost,
        COALESCE(AVG(mc.amount), 0) as avg_cost,
        COALESCE(MIN(mc.amount), 0) as min_cost,
        COALESCE(MAX(mc.amount), 0) as max_cost,
        MAX(mc.cost_date) as last_maintenance,
        MIN(mc.cost_date) as first_maintenance,
        d.name as department_name,
        CASE 
          WHEN COUNT(DISTINCT mc.id) > 5 THEN 'Critical - Consider Replacement'
          WHEN COUNT(DISTINCT mc.id) > 3 THEN 'High Maintenance - Monitor Closely'
          WHEN COUNT(DISTINCT mc.id) > 1 THEN 'Moderate Maintenance'
          ELSE 'Low Maintenance'
        END as maintenance_level,
        CASE 
          WHEN COALESCE(SUM(mc.amount), 0) > 50000 THEN 'Budget Alert - High Cost Item'
          WHEN COALESCE(SUM(mc.amount), 0) > 25000 THEN 'Medium Cost Item'
          ELSE 'Normal Cost Item'
        END as cost_level
      FROM assets a
      LEFT JOIN maintenance_costs mc ON a.id = mc.asset_id
      LEFT JOIN departments d ON a.dept_id = d.id
      GROUP BY a.id, a.asset_type, a.model, a.serial_number, 
               a.incharge_name, a.status, a.received_date, mc.item_name, d.name
      ORDER BY total_cost DESC, repair_count DESC
    `);

    res.json({
      success: true,
      data: assetCosts
    });
  } catch (error) {
    console.error('Error fetching asset costs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/asset/:assetId/details
 * Get detailed cost history for a specific asset
 */
router.get('/asset/:assetId/details', async (req, res) => {
  try {
    const { assetId } = req.params;

    // Get asset details
    const [assetInfo] = await db.query(`
      SELECT 
        a.*,
        d.name as department_name
      FROM assets a
      LEFT JOIN departments d ON a.dept_id = d.id
      WHERE a.id = ?
    `, [assetId]);

    if (assetInfo.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Get cost history with repair details
    const [costHistory] = await db.query(`
      SELECT 
        mc.*,
        rj.issue_description,
        rj.repair_status,
        rj.submitted_date as repair_submitted_date,
        rj.completed_date
      FROM maintenance_costs mc
      LEFT JOIN repair_jobs rj ON mc.repair_job_id = rj.id
      WHERE mc.asset_id = ?
      ORDER BY mc.cost_date DESC
    `, [assetId]);

    // Get cost analysis
    const [costAnalysis] = await db.query(`
      SELECT 
        cost_type,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total,
        COALESCE(AVG(amount), 0) as average,
        COALESCE(MIN(amount), 0) as min,
        COALESCE(MAX(amount), 0) as max
      FROM maintenance_costs
      WHERE asset_id = ?
      GROUP BY cost_type
    `, [assetId]);

    res.json({
      success: true,
      data: {
        asset: assetInfo[0],
        costHistory: costHistory,
        costAnalysis: costAnalysis,
        summary: {
          total_cost: costHistory.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0),
          total_entries: costHistory.length,
          cost_types: [...new Set(costHistory.map(c => c.cost_type))],
          date_range: costHistory.length > 0 ? {
            first: costHistory[costHistory.length - 1]?.cost_date,
            last: costHistory[0]?.cost_date
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Error fetching asset details:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/monthly-trend
 * Get monthly spending trends for charts
 */
router.get('/monthly-trend', async (req, res) => {
  try {
    const [monthlyTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(cost_date, '%Y-%m') as month,
        DATE_FORMAT(cost_date, '%b %Y') as month_name,
        COALESCE(SUM(amount), 0) as total_cost,
        COUNT(*) as transaction_count,
        COALESCE(AVG(amount), 0) as avg_cost,
        COALESCE(SUM(CASE WHEN cost_type = 'assessment' THEN amount ELSE 0 END), 0) as assessment_total,
        COALESCE(SUM(CASE WHEN cost_type = 'invoice' THEN amount ELSE 0 END), 0) as invoice_total,
        COALESCE(SUM(CASE WHEN cost_type = 'parts' THEN amount ELSE 0 END), 0) as parts_total,
        COALESCE(SUM(CASE WHEN cost_type = 'labor' THEN amount ELSE 0 END), 0) as labor_total
      FROM maintenance_costs
      WHERE cost_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(cost_date, '%Y-%m'), DATE_FORMAT(cost_date, '%b %Y')
      ORDER BY month ASC
    `);

    res.json({
      success: true,
      data: monthlyTrend
    });
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/by-department
 * Get cost breakdown by department
 */
router.get('/by-department', async (req, res) => {
  try {
    const [deptCosts] = await db.query(`
      SELECT 
        d.id,
        d.name as department_name,
        d.code as department_code,
        mb.fiscal_year,
        COALESCE(mb.allocated_budget, 0) as allocated_budget,
        COALESCE(mb.spent_budget, 0) as spent_budget,
        COALESCE(mb.remaining_budget, 0) as remaining_budget,
        CASE 
          WHEN COALESCE(mb.allocated_budget, 0) > 0 
          THEN ROUND((COALESCE(mb.spent_budget, 0) / COALESCE(mb.allocated_budget, 1)) * 100, 2)
          ELSE 0
        END as spend_percentage,
        COUNT(DISTINCT mc.asset_id) as assets_maintained,
        COUNT(DISTINCT mc.id) as total_repairs,
        COALESCE(SUM(mc.amount), 0) as total_maintenance_cost,
        COALESCE(AVG(mc.amount), 0) as avg_repair_cost,
        MAX(mc.cost_date) as last_maintenance_date,
        CASE 
          WHEN COALESCE(mb.spent_budget, 0) / NULLIF(mb.allocated_budget, 0) >= 0.9 THEN 'Critical'
          WHEN COALESCE(mb.spent_budget, 0) / NULLIF(mb.allocated_budget, 0) >= 0.7 THEN 'High'
          WHEN COALESCE(mb.spent_budget, 0) / NULLIF(mb.allocated_budget, 0) >= 0.5 THEN 'Medium'
          ELSE 'Low'
        END as budget_status
      FROM departments d
      LEFT JOIN maintenance_budget mb ON d.id = mb.dept_id AND mb.fiscal_year = YEAR(CURDATE())
      LEFT JOIN maintenance_costs mc ON d.id = mc.dept_id AND YEAR(mc.cost_date) = YEAR(CURDATE())
      GROUP BY d.id, d.name, d.code, mb.fiscal_year, mb.allocated_budget, mb.spent_budget, mb.remaining_budget
      ORDER BY spend_percentage DESC
    `);

    res.json({
      success: true,
      data: deptCosts
    });
  } catch (error) {
    console.error('Error fetching department costs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/budget-items
 * Get all budget items for the current fiscal year
 */
router.get('/budget-items', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT mb.*, d.name as department_name
      FROM maintenance_budget mb
      LEFT JOIN departments d ON mb.dept_id = d.id
      WHERE mb.fiscal_year = YEAR(CURDATE())
      ORDER BY d.name, mb.dept_id
    `);

    const rowsWithStatus = (rows || []).map((row) => ({
      ...row,
      status: extractStatus(row.notes) || row.status || 'Pending'
    }));

    res.json({ success: true, data: rowsWithStatus });
  } catch (error) {
    // If table doesn't exist, return empty list to keep clients resilient
    if (error && error.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, data: [] });
    }
    console.error('Error fetching budget items:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/costs/budget
 * Create a new budget item
 */
router.post('/budget', async (req, res) => {
  try {
    const { dept_id, allocated_budget, fiscal_year, notes, status } = req.body;

    if (!dept_id || allocated_budget == null) {
      return res.status(400).json({ success: false, message: 'Missing required fields: dept_id, allocated_budget' });
    }

    const fy = fiscal_year || new Date().getFullYear();
    const spent = 0;
    const remaining = parseFloat(allocated_budget) - spent;

    const normalizedNotes = formatNotesWithStatus(notes, status);

    const [result] = await db.query(`
      INSERT INTO maintenance_budget (dept_id, fiscal_year, allocated_budget, spent_budget, remaining_budget, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [dept_id, fy, allocated_budget, spent, remaining, normalizedNotes]);

    res.json({ success: true, message: 'Budget item created', id: result.insertId });
  } catch (error) {
    console.error('Error creating budget item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/costs/budget/:id
 * Update an existing budget item
 */
router.put('/budget/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dept_id, allocated_budget, spent_budget, fiscal_year, notes, status } = req.body;

    const [existing] = await db.query('SELECT * FROM maintenance_budget WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Budget item not found' });
    }

    const current = existing[0];
    const newAllocated = allocated_budget != null ? allocated_budget : current.allocated_budget;
    const newSpent = spent_budget != null ? spent_budget : current.spent_budget || 0;
    const newRemaining = parseFloat(newAllocated) - parseFloat(newSpent);
    const fy = fiscal_year || current.fiscal_year;
    const dept = dept_id || current.dept_id;

    const normalizedNotes = formatNotesWithStatus(notes ?? current.notes, status);

    const [result] = await db.query(`
      UPDATE maintenance_budget
      SET dept_id = ?, fiscal_year = ?, allocated_budget = ?, spent_budget = ?, remaining_budget = ?, notes = ?
      WHERE id = ?
    `, [dept, fy, newAllocated, newSpent, newRemaining, normalizedNotes, id]);

    if (result.affectedRows === 0) {
      return res.status(500).json({ success: false, message: 'Failed to update budget item' });
    }

    res.json({ success: true, message: 'Budget item updated' });
  } catch (error) {
    console.error('Error updating budget item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/costs/budget/:id
 * Delete a budget item
 */
router.delete('/budget/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM maintenance_budget WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Budget item not found' });
    }

    res.json({ success: true, message: 'Budget item deleted' });
  } catch (error) {
    console.error('Error deleting budget item:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/history
 * Get budget history. If a dedicated history table exists, return it; otherwise fall back to aggregated monthly spend.
 */
router.get('/history', async (req, res) => {
  try {
    // Prefer explicit history table if present
    try {
      const [hist] = await db.query('SELECT * FROM maintenance_budget_history ORDER BY change_date DESC LIMIT 500');
      return res.json({ success: true, data: hist });
    } catch (innerErr) {
      if (!(innerErr && innerErr.code === 'ER_NO_SUCH_TABLE')) throw innerErr;
      // fallback to aggregated spend history
    }

    const [agg] = await db.query(`
      SELECT DATE_FORMAT(cost_date, '%Y-%m') as month, COUNT(*) as transactions, COALESCE(SUM(amount),0) as total_spent
      FROM maintenance_costs
      WHERE cost_date >= DATE_SUB(CURDATE(), INTERVAL 24 MONTH)
      GROUP BY DATE_FORMAT(cost_date, '%Y-%m')
      ORDER BY month DESC
    `);

    res.json({ success: true, data: agg });
  } catch (error) {
    console.error('Error fetching budget history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/entries
 * Get a flat list of all maintenance cost entries for tabular views
 */
router.get('/entries', async (req, res) => {
  try {
    const [entries] = await db.query(`
      SELECT 
        mc.id,
        mc.asset_id,
        mc.repair_job_id,
        mc.dept_id,
        mc.asset_name,
        mc.model,
        mc.model_number,
        mc.serial_number,
        mc.item_name,
        mc.cost_type,
        mc.amount,
        mc.cost_date,
        mc.description,
        mc.is_approved,
        mc.notes,
        mc.invoice_number,
        mc.supplier_name,
        mc.created_at,
        mc.updated_at,
        a.asset_type,
        d.name AS department_name
      FROM maintenance_costs mc
      LEFT JOIN assets a ON mc.asset_id = a.id
      LEFT JOIN departments d ON mc.dept_id = d.id
      ORDER BY mc.cost_date DESC, mc.created_at DESC, mc.id DESC
    `);

    res.json({
      success: true,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching cost entries:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/costs/add
 * Add a new maintenance cost entry
 */
router.post('/add', async (req, res) => {
  try {
    const { 
      assetId, costType, amount, description, costDate, 
      isApproved, repairJobId, invoiceNumber, supplierName 
    } = req.body;

    if (!assetId || !costType || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: assetId, costType, amount' 
      });
    }

    // Get asset details
    const [assetData] = await db.query(
      'SELECT * FROM assets WHERE id = ?',
      [assetId]
    );

    if (assetData.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const asset = assetData[0];

    // Insert cost entry (without model_number)
    const [result] = await db.query(`
      INSERT INTO maintenance_costs 
      (asset_id, repair_job_id, dept_id, asset_name, model, serial_number, 
       item_name, cost_type, amount, cost_date, description, 
       is_approved, invoice_number, supplier_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      assetId,
      repairJobId || null,
      asset.dept_id,
      asset.asset_type,
      asset.model,
      asset.serial_number,
      asset.asset_type,
      costType,
      amount,
      costDate || new Date().toISOString().split('T')[0],
      description || null,
      isApproved || false,
      invoiceNumber || null,
      supplierName || null
    ]);

    // Update department budget spent amount
    await db.query(`
      UPDATE maintenance_budget 
      SET spent_budget = spent_budget + ?
      WHERE dept_id = ? AND fiscal_year = YEAR(CURDATE())
    `, [amount, asset.dept_id]);

    res.json({
      success: true,
      message: 'Cost entry added successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Error adding cost entry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/costs/:costId
 * Update a maintenance cost entry
 */
router.put('/:costId', async (req, res) => {
  try {
    const { costId } = req.params;
    const { costType, amount, description, isApproved, costDate, invoiceNumber, supplierName } = req.body;

    // Get old amount to adjust budget
    const [oldCost] = await db.query(
      'SELECT amount, dept_id FROM maintenance_costs WHERE id = ?',
      [costId]
    );

    const [result] = await db.query(`
      UPDATE maintenance_costs 
      SET cost_type = ?, amount = ?, description = ?, is_approved = ?, 
          cost_date = ?, invoice_number = ?, supplier_name = ?
      WHERE id = ?
    `, [costType, amount, description, isApproved, costDate, invoiceNumber, supplierName, costId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cost entry not found' });
    }

    // Update budget if amount changed
    if (oldCost.length > 0 && parseFloat(oldCost[0].amount) !== parseFloat(amount)) {
      const amountDiff = parseFloat(amount) - parseFloat(oldCost[0].amount);
      await db.query(`
        UPDATE maintenance_budget 
        SET spent_budget = spent_budget + ?
        WHERE dept_id = ? AND fiscal_year = YEAR(CURDATE())
      `, [amountDiff, oldCost[0].dept_id]);
    }

    res.json({
      success: true,
      message: 'Cost entry updated successfully'
    });
  } catch (error) {
    console.error('Error updating cost entry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * DELETE /api/costs/:costId
 * Delete a maintenance cost entry
 */
router.delete('/:costId', async (req, res) => {
  try {
    const { costId } = req.params;

    // Get cost details before deletion
    const [costData] = await db.query(
      'SELECT amount, dept_id FROM maintenance_costs WHERE id = ?',
      [costId]
    );

    const [result] = await db.query(
      'DELETE FROM maintenance_costs WHERE id = ?',
      [costId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Cost entry not found' });
    }

    // Update budget
    if (costData.length > 0) {
      await db.query(`
        UPDATE maintenance_budget 
        SET spent_budget = GREATEST(spent_budget - ?, 0)
        WHERE dept_id = ? AND fiscal_year = YEAR(CURDATE())
      `, [costData[0].amount, costData[0].dept_id]);
    }

    res.json({
      success: true,
      message: 'Cost entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting cost entry:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/costs/analysis/smart
 * Get smart analysis and recommendations
 */
router.get('/analysis/smart', async (req, res) => {
  try {
    // Get top spending items
    const [topSpenders] = await db.query(`
      SELECT 
        a.id,
        a.model,
        a.serial_number,
        COALESCE(SUM(mc.amount), 0) as total_cost,
        COUNT(DISTINCT mc.id) as repair_count,
        CASE 
          WHEN COALESCE(SUM(mc.amount), 0) > 50000 THEN 'Critical - Immediate Action Required'
          WHEN COALESCE(SUM(mc.amount), 0) > 25000 THEN 'Warning - High Cost Item'
          ELSE 'Normal - Monitor Regularly'
        END as recommendation
      FROM assets a
      LEFT JOIN maintenance_costs mc ON a.id = mc.asset_id
      GROUP BY a.id, a.model, a.serial_number
      HAVING total_cost > 10000
      ORDER BY total_cost DESC
      LIMIT 10
    `);

    // Get budget alerts
    const [budgetAlerts] = await db.query(`
      SELECT 
        d.name as department,
        mb.allocated_budget,
        mb.spent_budget,
        mb.remaining_budget,
        ROUND((mb.spent_budget / NULLIF(mb.allocated_budget, 0)) * 100, 2) as percentage,
        CASE 
          WHEN (mb.spent_budget / NULLIF(mb.allocated_budget, 0)) >= 0.9 THEN 'CRITICAL - Over 90% Used'
          WHEN (mb.spent_budget / NULLIF(mb.allocated_budget, 0)) >= 0.75 THEN 'Warning - Over 75% Used'
          ELSE 'Normal'
        END as alert_level
      FROM maintenance_budget mb
      JOIN departments d ON mb.dept_id = d.id
      WHERE mb.fiscal_year = YEAR(CURDATE())
        AND (mb.spent_budget / NULLIF(mb.allocated_budget, 0)) >= 0.75
      ORDER BY percentage DESC
    `);

    res.json({
      success: true,
      data: {
        topSpenders: topSpenders,
        budgetAlerts: budgetAlerts,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating smart analysis:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;