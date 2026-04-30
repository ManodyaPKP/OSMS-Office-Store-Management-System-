import express from 'express';
import { executeQuery } from '../database.js';
import { verifyToken, checkRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET all departments
router.get('/', async (req, res) => {
  try {
    const departments = await executeQuery(
      'SELECT * FROM departments ORDER BY name'
    );
    res.json({
      success: true,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET single department with assets
router.get('/:id', async (req, res) => {
  try {
    const dept = await executeQuery(
      'SELECT * FROM departments WHERE id = ?',
      [req.params.id]
    );

    if (dept.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const assets = await executeQuery(
      'SELECT * FROM assets WHERE dept_id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      data: {
        ...dept[0],
        assets
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// CREATE new department (Admin only)
router.post('/', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { name, code, head_name, address } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and code are required'
      });
    }

    const result = await executeQuery(
      'INSERT INTO departments (name, code, head_name, address) VALUES (?, ?, ?, ?)',
      [name, code, head_name || null, address || null]
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      id: result.insertId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE department (Admin only)
router.put('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    const { name, code, head_name, address } = req.body;

    await executeQuery(
      'UPDATE departments SET name = ?, code = ?, head_name = ?, address = ? WHERE id = ?',
      [name, code, head_name, address, req.params.id]
    );

    res.json({
      success: true,
      message: 'Department updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE department (Admin only)
router.delete('/:id', verifyToken, checkRole(['admin']), async (req, res) => {
  try {
    await executeQuery(
      'DELETE FROM departments WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
