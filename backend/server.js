import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import departmentRoutes from './src/routes/departments.js';
import assetRoutes from './src/routes/assets.js';
import repairRoutes from './src/routes/repairs.js';
import inspectionRoutes from './src/routes/inspections.js';
import approvalRoutes from './src/routes/approvals.js';
import userRoutes from './src/routes/users.js';
import profileRoutes from './src/routes/profiles.js';
import messageRoutes from './src/routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = process.env.NODE_ENV === 'development' 
  ? /^http:\/\/localhost/ // Allow any localhost port in development
  : (process.env.FRONTEND_URL || 'http://localhost:5173');

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'OSMS Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/departments', departmentRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/repairs', repairRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════╗
  ║   OSMS Backend Server Started Successfully       ║
  ║   URL: http://localhost:${PORT}              ║
  ║   Environment: ${process.env.NODE_ENV}                 ║
  ╚═══════════════════════════════════════════════════╝
  `);
});

export default app;
