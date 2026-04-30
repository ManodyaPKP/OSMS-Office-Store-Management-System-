import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all repairs with filters
router.get('/', async (req, res) => {
  try {
    const { status, dept_id } = req.query;
    let query = `
      SELECT r.*, a.model, a.serial_number, d.name as dept_name 
      FROM repair_jobs r 
      JOIN assets a ON r.asset_id = a.id 
      JOIN departments d ON a.dept_id = d.id 
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND r.repair_status = ?';
      params.push(status);
    }
    if (dept_id) {
      query += ' AND d.id = ?';
      params.push(dept_id);
    }

    query += ' ORDER BY r.submitted_date DESC';
    const repairs = await executeQuery(query, params);
    res.json({ success: true, data: repairs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single repair with all sections
router.get('/:id', async (req, res) => {
  try {
    const repair = await executeQuery(
      'SELECT * FROM repair_jobs WHERE id = ?',
      [req.params.id]
    );

    if (repair.length === 0) {
      return res.status(404).json({ success: false, message: 'Repair not found' });
    }

    const inspections = await executeQuery(
      'SELECT * FROM inspections WHERE repair_job_id = ?',
      [req.params.id]
    );

    const approvals = await executeQuery(
      'SELECT * FROM approvals WHERE repair_job_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...repair[0],
        inspections,
        approvals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE repair job (Section 1)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      asset_id, issue_description, submitted_date, repair_center_name,
      assessment_number, assessment_date, assessment_amount,
      invoice_number, invoice_date, invoice_amount, completed_item
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO repair_jobs 
       (asset_id, created_by, issue_description, submitted_date, repair_center_name,
        assessment_number, assessment_date, assessment_amount,
        invoice_number, invoice_date, invoice_amount, completed_item)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [asset_id, req.user.id, issue_description, submitted_date, repair_center_name,
       assessment_number, assessment_date, assessment_amount,
       invoice_number, invoice_date, invoice_amount, completed_item]
    );

    // Update asset status to under_repair
    await executeQuery(
      'UPDATE assets SET status = ? WHERE id = ?',
      ['under_repair', asset_id]
    );

    res.status(201).json({
      success: true,
      message: 'Repair job created',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE repair status
router.put('/:id/status', verifyToken, async (req, res) => {
  try {
    const { repair_status, completed_date } = req.body;

    await executeQuery(
      'UPDATE repair_jobs SET repair_status = ?, completed_date = ? WHERE id = ?',
      [repair_status, completed_date || null, req.params.id]
    );

    res.json({ success: true, message: 'Repair status updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET repair statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_repairs,
        SUM(CASE WHEN repair_status = 'completed' THEN 1 ELSE 0 END) as completed_repairs,
        SUM(CASE WHEN repair_status = 'pending' THEN 1 ELSE 0 END) as pending_repairs,
        SUM(CASE WHEN repair_status = 'in_repair' THEN 1 ELSE 0 END) as in_progress_repairs,
        SUM(assessment_amount) as total_assessment_cost,
        SUM(invoice_amount) as total_invoice_cost
      FROM repair_jobs
    `);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
