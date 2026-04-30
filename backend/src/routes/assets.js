import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET asset statistics (MUST come before :id route)
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_assets,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
        SUM(CASE WHEN status = 'under_repair' THEN 1 ELSE 0 END) as under_repair_count,
        SUM(CASE WHEN status = 'repaired' THEN 1 ELSE 0 END) as repaired_count,
        SUM(CASE WHEN status = 'condemned' THEN 1 ELSE 0 END) as condemned_count
      FROM assets
    `);

    res.json({ success: true, data: stats[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET all assets with filters
router.get('/', async (req, res) => {
  try {
    const { dept_id, status, asset_type } = req.query;
    let query = 'SELECT a.*, d.name as dept_name FROM assets a JOIN departments d ON a.dept_id = d.id WHERE 1=1';
    const params = [];

    if (dept_id) {
      query += ' AND a.dept_id = ?';
      params.push(dept_id);
    }
    if (status) {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (asset_type) {
      query += ' AND a.asset_type = ?';
      params.push(asset_type);
    }

    query += ' ORDER BY a.model';
    const assets = await executeQuery(query, params);
    res.json({ success: true, data: assets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single asset with parts and repair history
router.get('/:id', async (req, res) => {
  try {
    const asset = await executeQuery(
      'SELECT * FROM assets WHERE id = ?',
      [req.params.id]
    );

    if (asset.length === 0) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const parts = await executeQuery(
      'SELECT * FROM asset_parts WHERE asset_id = ?',
      [req.params.id]
    );

    const repairs = await executeQuery(
      'SELECT * FROM repair_jobs WHERE asset_id = ? ORDER BY submitted_date DESC',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...asset[0],
        parts,
        repairs,
        repair_count: repairs.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// CREATE asset
router.post('/', verifyToken, async (req, res) => {
  try {
    const { dept_id, asset_type, model, serial_number, incharge_name, received_date } = req.body;

    const result = await executeQuery(
      'INSERT INTO assets (dept_id, asset_type, model, serial_number, incharge_name, received_date) VALUES (?, ?, ?, ?, ?, ?)',
      [dept_id, asset_type, model, serial_number, incharge_name, received_date]
    );

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ADD asset part
router.post('/:id/parts', verifyToken, async (req, res) => {
  try {
    const { part_name, specification, quantity } = req.body;

    const result = await executeQuery(
      'INSERT INTO asset_parts (asset_id, part_name, specification, quantity) VALUES (?, ?, ?, ?)',
      [req.params.id, part_name, specification, quantity || 1]
    );

    res.status(201).json({ success: true, message: 'Part added', id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE asset
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { incharge_name, status } = req.body;
    await executeQuery(
      'UPDATE assets SET incharge_name = ?, status = ? WHERE id = ?',
      [incharge_name, status, req.params.id]
    );

    res.json({ success: true, message: 'Asset updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
