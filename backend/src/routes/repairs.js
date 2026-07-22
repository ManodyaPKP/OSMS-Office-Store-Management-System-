import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all repairs with filters
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `SELECT * FROM repair_jobs WHERE 1=1`;
    const params = [];

    if (status) {
      query += ' AND repair_status = ?';
      params.push(status);
    }

    query += ' ORDER BY submitted_date DESC';
    const repairs = await executeQuery(query, params);
    res.json({ success: true, data: repairs });
  } catch (error) {
    console.error('GET /repairs error:', error);
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
    console.error('GET /repairs/:id error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE repair job
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Received repair request');

    const {
      asset_name,
      model,
      model_number,
      serial_number,
      quantity,
      section_unit_name,
      current_username,
      applicant_position,
      department_head,
      handed_over_by,
      unit_phone,
      user_mobile,
      previous_maintenance,
      handed_over_date,
      receipt_book_info,
      issue_description,
      error_date,
      previous_error,
      submitted_date
    } = req.body;

    // Build insert query
    const query = `
      INSERT INTO repair_jobs (
        created_by,
        asset_name,
        model,
        model_number,
        serial_number,
        quantity,
        section_unit_name,
        current_username,
        applicant_position,
        department_head,
        handed_over_by,
        unit_phone,
        user_mobile,
        previous_maintenance,
        handed_over_date,
        receipt_book_info,
        issue_description,
        error_date,
        previous_error,
        repair_status,
        submitted_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      req.user.id,
      asset_name || null,
      model || null,
      model_number || null,
      serial_number || null,
      quantity || 1,
      section_unit_name || null,
      current_username || null,
      applicant_position || null,
      department_head || null,
      handed_over_by || null,
      unit_phone || null,
      user_mobile || null,
      previous_maintenance || 'no',
      handed_over_date || null,
      receipt_book_info || null,
      issue_description,
      error_date || null,
      previous_error || 'no',
      'pending',
      submitted_date || new Date().toISOString().split('T')[0]
    ];

    console.log('Executing query with values:', values);

    const result = await executeQuery(query, values);
    const repairId = result.insertId;

    // Auto-register asset when repair is created
    try {
      // Determine asset type from asset_name
      const assetTypeMap = {
        'laptop': 'laptop',
        'desktop': 'desktop',
        'printer': 'printer',
        'monitor': 'monitor',
        'phone': 'other',
        'mobile': 'other'
      };
      
      const assetType = Object.keys(assetTypeMap).find(key => 
        asset_name?.toLowerCase().includes(key)
      ) ? assetTypeMap[Object.keys(assetTypeMap).find(key => 
        asset_name?.toLowerCase().includes(key)
      )] : 'other';

      // Get default department (ID: 1)
      const deptId = 1;

      // Create asset record
      const assetQuery = `
        INSERT INTO assets (
          dept_id,
          asset_type,
          model,
          serial_number,
          incharge_name,
          status,
          received_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const assetValues = [
        deptId,
        assetType,
        model || asset_name || 'Unknown',
        serial_number || null,
        current_username || handed_over_by || 'Unknown',
        'active',
        new Date().toISOString().split('T')[0]
      ];

      const assetResult = await executeQuery(assetQuery, assetValues);
      
      // Update repair with asset_id
      await executeQuery(
        'UPDATE repair_jobs SET asset_id = ? WHERE id = ?',
        [assetResult.insertId, repairId]
      );

      console.log('Asset auto-registered with ID:', assetResult.insertId);
    } catch (assetError) {
      console.error('Error auto-registering asset:', assetError);
      // Continue even if asset creation fails
    }

    res.status(201).json({
      success: true,
      message: 'Repair job created',
      id: repairId
    });
  } catch (error) {
    console.error('Error creating repair:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message,
      sqlMessage: error.sqlMessage 
    });
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
    console.error('PUT /repairs/:id/status error:', error);
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
    console.error('GET /repairs/stats/summary error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// DELETE repair job
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const repairId = req.params.id;
    
    const repair = await executeQuery(
      'SELECT * FROM repair_jobs WHERE id = ?',
      [repairId]
    );
    
    if (repair.length === 0) {
      return res.status(404).json({ success: false, message: 'Repair not found' });
    }
    
    await executeQuery('DELETE FROM inspections WHERE repair_job_id = ?', [repairId]);
    await executeQuery('DELETE FROM approvals WHERE repair_job_id = ?', [repairId]);
    await executeQuery('DELETE FROM repair_jobs WHERE id = ?', [repairId]);
    
    res.json({ success: true, message: 'Repair request deleted successfully' });
  } catch (error) {
    console.error('Error deleting repair:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;