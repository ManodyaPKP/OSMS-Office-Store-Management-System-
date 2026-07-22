# Store Management System

Store Management System is a full-stack web application for tracking office assets, managing repair workflows, handling inspections and approvals, and supporting internal communication across departments.

## Overview

This project combines a React and Vite frontend with an Express and MySQL backend to replace manual asset management processes with a centralized digital system. It is designed for organizations that need a practical, structured way to manage equipment, repairs, users, and operational records.

## What the System Includes

- Asset registration, tracking, and history management
- Repair request submission and status workflows
- Inspection and approval processing
- Department and user administration
- Profile management and messaging
- Dashboard views for summaries and activity monitoring

## Technology Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, JWT, MySQL
- Database: MySQL via XAMPP
- Package Management: npm workspaces

## Project Structure

```text
Store Management System/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── database/
│   │   └── schema.sql
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       └── utils/
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       └── utils/
├── package.json
└── README.md
```

## Prerequisites

Before running the project locally, make sure the following are installed:

- Node.js 20+ recommended
- npm 10+
- XAMPP or another MySQL-compatible local server

## Installation Guide

### 1. Install dependencies

From the project root, run:

```bash
npm install
```

### 2. Create the database

1. Start MySQL from XAMPP.
2. Open phpMyAdmin at http://localhost/phpmyadmin.
3. Create a database named `osms_db`.
4. Import the SQL schema from `backend/database/schema.sql`.

### 3. Configure environment variables

Create a `.env` file in the backend folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=osms_db
JWT_SECRET=your_secret_key
```

Create a `.env` file in the frontend folder:

```env
VITE_API_URL=http://localhost:5000
```

### 4. Run the application

Start both the frontend and backend with:

```bash
npm run dev
```

Or start them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

The application will be available at http://localhost:5173.

## Available Scripts

From the project root:

- `npm run dev` – starts both services
- `npm run dev:backend` – starts only the backend
- `npm run dev:frontend` – starts only the frontend
- `npm start` – starts the backend server

## Main Modules

- Dashboard and system summaries
- Asset lifecycle management
- Repair request handling
- Inspection and approval workflow
- User and department administration
- Profile and messaging features

## API Overview

The backend exposes modular API routes for core business areas such as:

- Users
- Departments
- Assets
- Repairs
- Inspections
- Approvals
- Messages
- Profiles
- Costs
- Asset analysis

## Notes

- The database schema must be imported before login and core features will work properly.
- This project is intended for local development and testing with XAMPP.
- If you encounter issues, verify the MySQL service, backend environment variables, and database import status.

## Support

If you need help or want to extend the system, review the existing guides and verify that the local environment is configured correctly.
