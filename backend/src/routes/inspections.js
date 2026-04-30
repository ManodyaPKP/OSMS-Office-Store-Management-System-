import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all inspections
router.get('/', async (req, res) => {
  try {
    const inspections = await executeQuery(
      'SELECT * FROM inspections ORDER BY inspection_date DESC'
    );
    res.json({ success: true, data: inspections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE inspection (Section 2 - Post Repair or Section 3 - Return)
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      repair_job_id, section_type, inspector_name,
      designation, signature_text, inspection_date, notes
    } = req.body;

    const result = await executeQuery(
      `INSERT INTO inspections 
       (repair_job_id, section_type, inspector_name, designation, signature_text, inspection_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [repair_job_id, section_type, inspector_name, designation, signature_text, inspection_date, notes]
    );

    // If this is a return inspection, update asset status
    if (section_type === 'return') {
      const repair = await executeQuery(
        'SELECT asset_id FROM repair_jobs WHERE id = ?',
        [repair_job_id]
      );

      if (repair.length > 0) {
        await executeQuery(
          'UPDATE assets SET status = ? WHERE id = ?',
          ['repaired', repair[0].asset_id]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: `${section_type === 'post_repair' ? 'Post-Repair' : 'Return'} inspection created`,
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE inspection
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { notes } = req.body;
    await executeQuery(
      'UPDATE inspections SET notes = ? WHERE id = ?',
      [notes, req.params.id]
    );

    res.json({ success: true, message: 'Inspection updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET inspections for specific repair job
router.get('/repair/:repair_id', async (req, res) => {
  try {
    const inspections = await executeQuery(
      'SELECT * FROM inspections WHERE repair_job_id = ? ORDER BY section_type',
      [req.params.repair_id]
    );
    res.json({ success: true, data: inspections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
