import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all approvals
router.get('/', verifyToken, async (req, res) => {
  try {
    const approvals = await executeQuery(`
      SELECT a.*, r.asset_id, r.issue_description
      FROM approvals a
      JOIN repair_jobs r ON a.repair_job_id = r.id
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET pending approvals (Section 4 & 5)
router.get('/pending', verifyToken, checkRole(['admin', 'head_of_dept']), async (req, res) => {
  try {
    const approvals = await executeQuery(`
      SELECT a.*, r.asset_id, a.submitted_date
      FROM approvals a
      JOIN repair_jobs r ON a.repair_job_id = r.id
      WHERE a.decision = 'pending'
      ORDER BY a.created_at DESC
    `);
    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE approval request (Section 4 - PRO 05)
router.post('/pro05', verifyToken, async (req, res) => {
  try {
    const {
      repair_job_id, approver_name, designation, signature_text
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO approvals 
       (repair_job_id, approval_type, approver_name, designation, signature_text)
       VALUES (?, ?, ?, ?, ?)`,
      [repair_job_id, 'pro05_request', approver_name, designation, signature_text]
    );

    res.status(201).json({
      success: true,
      message: 'PRO 05 approval request created',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE final approval decision (Section 5)
router.post('/decision', verifyToken, checkRole(['admin', 'head_of_dept']), async (req, res) => {
  try {
    const {
      repair_job_id, approver_name, designation, signature_text,
      decision, decision_notes
    } = req.body;

    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decision must be "approved" or "rejected"'
      });
    }

    const result = await executeQuery(
      `INSERT INTO approvals 
       (repair_job_id, approval_type, approver_name, designation, signature_text, decision, decision_notes, approval_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [repair_job_id, 'final_decision', approver_name, designation, signature_text, decision, decision_notes, new Date().toISOString().split('T')[0]]
    );

    res.status(201).json({
      success: true,
      message: `Repair ${decision} by authority`,
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE approval decision
router.put('/:id', verifyToken, checkRole(['admin', 'head_of_dept']), async (req, res) => {
  try {
    const { decision, decision_notes } = req.body;

    await executeQuery(
      'UPDATE approvals SET decision = ?, decision_notes = ? WHERE id = ?',
      [decision, decision_notes, req.params.id]
    );

    res.json({ success: true, message: 'Approval updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET approvals for specific repair
router.get('/repair/:repair_id', async (req, res) => {
  try {
    const approvals = await executeQuery(
      'SELECT * FROM approvals WHERE repair_job_id = ? ORDER BY approval_type',
      [req.params.repair_id]
    );
    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
