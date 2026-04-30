# Office Store Management System (OSMS)

A professional, locally-hosted web application for managing office assets, tracking repair histories, and processing official maintenance documentation.

## 📋 Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
- [Installation Guide](#installation-guide)
- [Database Setup](#database-setup)
- [Project Structure](#project-structure)
- [Running the Application](#running-the-application)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [User Roles & Permissions](#user-roles--permissions)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

OSMS digitizes the asset management and repair lifecycle workflows. It replaces paper-based forms with a centralized digital system while maintaining compatibility with existing workflows.

**Key Features:**
- Asset registration and tracking
- Complete repair lifecycle management (5-section forms)
- Role-based access control
- PDF generation for official forms
- Repair history and statistics
- User authentication with JWT

## 💻 System Requirements

### Server Requirements
- **OS:** Windows 10+ or Linux
- **RAM:** Minimum 2GB
- **Disk Space:** 1GB free

### Software Requirements
- **XAMPP 8.2.x** or later (includes Apache, MySQL, PHP)
- **Node.js 20.x LTS** or later
- **npm 10.x** or later

### Browsers (Frontend)
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 📦 Installation Guide

### Step 1: Install XAMPP

1. Download XAMPP from [https://www.apachefriends.org](https://www.apachefriends.org)
2. Run the installer
3. Install to default location or your preferred directory
4. Choose components: Apache, MySQL, PHP
5. Complete installation

### Step 2: Install Node.js

1. Download Node.js LTS from [https://nodejs.org](https://nodejs.org)
2. Run installer and follow prompts
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### Step 3: Clone/Setup Project

1. Navigate to XAMPP htdocs folder:
   ```bash
   cd C:\xampp\htdocs
   ```

2. The project structure is already at:
   ```
   Store Management System/
   ├── backend/
   ├── frontend/
   └── README.md
   ```

### Step 4: Install Backend Dependencies

```bash
cd "Store Management System\backend"
npm install
```

This installs all required packages:
- express (API framework)
- mysql2 (database driver)
- jsonwebtoken (authentication)
- bcrypt (password hashing)
- cors (cross-origin requests)
- express-validator (input validation)
- pdfkit (PDF generation)

### Step 5: Install Frontend Dependencies

```bash
cd "..\frontend"
npm install
```

This installs:
- react & react-dom
- react-router-dom (routing)
- axios (HTTP client)
- vite (build tool)

## 🗄️ Database Setup

### Step 1: Start MySQL Server

1. Open XAMPP Control Panel
2. Click **Start** button next to MySQL
3. Wait for "Running" status

### Step 2: Create Database

1. Open browser and go to: `http://localhost/phpmyadmin`
2. Click **New** in left sidebar
3. Enter database name: `osms_db`
4. Click **Create**

### Step 3: Import Schema

1. In phpMyAdmin, select `osms_db` database
2. Click **Import** tab
3. Click **Choose File** button
4. Select: `Store Management System\backend\database\schema.sql`
5. Click **Import**

**Important:** The schema includes sample data with:
- 4 departments
- Sample users (admin_user, staff_user1, tech_user1)
- Sample assets and repair jobs

### Step 4: Verify Database Connection

Check that all tables are created by clicking on `osms_db` in phpMyAdmin.

Expected tables:
- departments
- users
- assets
- asset_parts
- repair_jobs
- inspections
- approvals

## 📁 Project Structure

```
Store Management System/
│
├── backend/
│   ├── src/
│   │   ├── routes/              # API endpoints
│   │   │   ├── departments.js
│   │   │   ├── assets.js
│   │   │   ├── repairs.js
│   │   │   ├── inspections.js
│   │   │   ├── approvals.js
│   │   │   └── users.js
│   │   ├── middleware/          # Express middleware
│   │   │   └── authMiddleware.js
│   │   ├── utils/               # Utility functions
│   │   ├── database.js          # Database connection
│   ├── database/
│   │   └── schema.sql           # Database schema
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server entry
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/               # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── DepartmentsPage.jsx
│   │   │   ├── AssetsPage.jsx
│   │   │   ├── RepairsPage.jsx
│   │   │   └── pages.css
│   │   ├── services/            # API service layer
│   │   │   └── api.js
│   │   ├── context/             # React context
│   │   │   └── AuthContext.jsx
│   │   ├── utils/               # Utility functions
│   │   │   └── helpers.js
│   │   ├── App.jsx              # Main app component
│   │   ├── App.css
│   │   ├── main.jsx             # React entry point
│   │   └── index.css
│   ├── index.html               # HTML entry point
│   ├── .env                     # Environment variables
│   ├── vite.config.js           # Vite configuration
│   └── package.json
│
└── README.md (this file)
```

## 🚀 Running the Application

### Terminal 1: Start Backend Server

```bash
cd "C:\xampp\htdocs\Store Management System\backend"
npm run dev
```

Expected output:
```
OSMS Backend Server Started Successfully
URL: http://localhost:5000
Environment: development
```

### Terminal 2: Start Frontend Dev Server

```bash
cd "C:\xampp\htdocs\Store Management System\frontend"
npm run dev
```

Expected output:
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Access the Application

Open browser and go to: **http://localhost:5173**

### Login Credentials (for demo)

```
Username: admin_user
Password: (check the schema.sql or contact admin)

Other test users:
- staff_user1 (staff role)
- tech_user1 (technician role)
```

## ✨ Features

### 1. Department Management
- Create, view, edit, delete departments
- Assign department codes (e.g., FIN-01, IT-01)
- View all assets in a department

### 2. Asset Management
- Register assets with type, model, serial number
- Record component parts (RAM, HDD, SSD, etc.)
- Track asset status (Active, Under Repair, Repaired, Condemned)
- View complete repair history per asset

### 3. Repair Lifecycle (5 Sections)
- **Section 1:** Repair submission with assessment & invoice
- **Section 2:** Post-repair inspection by technician
- **Section 3:** Equipment return sign-off by guardian
- **Section 4:** PRO 05 authorization request
- **Section 5:** Final approval by senior officer

### 4. Dashboard
- Key statistics (total repairs, completed, pending, costs)
- Quick access to all modules
- Repair status overview

### 5. User Management
- Role-based access control (4 roles)
- User authentication with JWT tokens
- Password change capability

### 6. Reports & Export
- Filter repairs by status, department, date range
- Generate PDF documents for any form section
- Export statistics

## 🔌 API Endpoints

### Authentication
```
POST   /api/users/login              Login user
GET    /api/users/profile            Get current user
POST   /api/users/:id/change-password Change password
```

### Departments
```
GET    /api/departments              Get all departments
GET    /api/departments/:id          Get department details
POST   /api/departments              Create department (admin only)
PUT    /api/departments/:id          Update department (admin only)
DELETE /api/departments/:id          Delete department (admin only)
```

### Assets
```
GET    /api/assets                   Get all assets (with filters)
GET    /api/assets/:id               Get asset with parts & repair history
POST   /api/assets                   Create asset
PUT    /api/assets/:id               Update asset
POST   /api/assets/:id/parts         Add component part
```

### Repairs
```
GET    /api/repairs                  Get all repairs (with filters)
GET    /api/repairs/:id              Get repair job details
POST   /api/repairs                  Create repair job (Section 1)
PUT    /api/repairs/:id/status       Update repair status
GET    /api/repairs/stats/summary    Get statistics
```

### Inspections
```
GET    /api/inspections              Get all inspections
POST   /api/inspections              Create inspection (Section 2 or 3)
GET    /api/inspections/repair/:id   Get inspections for specific repair
```

### Approvals
```
GET    /api/approvals                Get all approvals
GET    /api/approvals/pending        Get pending approvals
POST   /api/approvals/pro05          Create PRO 05 request (Section 4)
POST   /api/approvals/decision       Create final decision (Section 5)
```

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Staff** | Submit repairs, view own department assets |
| **Technician** | Complete inspection forms, update repair status |
| **Head of Dept** | Sign off returns, submit authorizations |
| **Admin** | Full access to all features and user management |

## 🔒 Security Features

- Passwords hashed with bcrypt (10 rounds)
- JWT token authentication (8-hour expiration)
- Role-based access control on all endpoints
- SQL injection prevention (parameterized queries)
- CORS configured for local frontend
- Input validation on all requests
- Unauthorized requests return 401/403 status

## 🐛 Troubleshooting

### Backend won't start

**Error:** "EADDRINUSE: address already in use :::5000"
```bash
# Kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Error:** Database connection failed
```bash
# Verify MySQL is running in XAMPP
# Check .env file has correct credentials
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=osms_db
```

### Frontend won't load

**Error:** "Cannot GET http://localhost:5173"
```bash
# Clear node_modules and reinstall
cd frontend
rm -r node_modules
npm install
npm run dev
```

### Database import fails

- Ensure MySQL is running
- Check file permissions on schema.sql
- Try importing in phpMyAdmin step by step
- Check phpMyAdmin error logs

### Password not working after login

- Default password is hashed in schema
- For new users, admin must create account
- Use password reset feature if available

### API returns 401 Unauthorized

- Token expired (8 hours) - login again
- Missing Authorization header
- Invalid token format

## 📞 Support

For issues or questions, refer to:
- Database schema: `backend/database/schema.sql`
- API documentation: Review route files in `backend/src/routes/`
- Frontend components: Check React components in `frontend/src/pages/`

## 📝 Development Notes

### Adding New Features

1. **Backend:**
   - Create route file in `src/routes/`
   - Add SQL queries in route handlers
   - Update .env if new config needed

2. **Frontend:**
   - Create page component in `src/pages/`
   - Add API calls via `src/services/api.js`
   - Create route in `App.jsx`

### Building for Production

**Backend:**
```bash
cd backend
npm install
# Set NODE_ENV=production in .env
node server.js
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
# Deploy dist/ folder to web server
```

## 📄 License

This project is proprietary software for office management use.

---

**Version:** 1.0.0  
**Last Updated:** 2026-04-30  
**Status:** Production Ready
