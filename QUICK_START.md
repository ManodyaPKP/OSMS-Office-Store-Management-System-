# OSMS - Quick Setup Guide

## ✅ What Has Been Created

Your complete Office Store Management System project structure is now ready! Here's what's included:

### Backend (Node.js + Express)
- ✓ Express server with CORS configuration
- ✓ RESTful API for all 5 sections of the repair workflow
- ✓ MySQL database connection pool
- ✓ JWT authentication with role-based access control
- ✓ Input validation and error handling
- ✓ Routes: departments, assets, repairs, inspections, approvals, users

### Frontend (React + Vite)
- ✓ Modern React 18 SPA with Vite bundler
- ✓ React Router for navigation
- ✓ Authentication context for global state
- ✓ Axios API client with token management
- ✓ Pre-built pages: Login, Dashboard, Departments, Assets, Repairs
- ✓ Professional styling with CSS

### Database (MySQL via XAMPP)
- ✓ Complete schema with 6 core tables
- ✓ Foreign key relationships for data integrity
- ✓ Sample data for testing
- ✓ Indexes for performance

---

## 🚀 Next Steps - FOLLOW THIS ORDER

### Step 1: Start XAMPP (2 minutes)
```
1. Open XAMPP Control Panel
2. Click "Start" next to Apache (optional, needed for phpmyadmin)
3. Click "Start" next to MySQL
4. Wait for "Running" status
```

### Step 2: Create Database (3 minutes)
```
1. Open http://localhost/phpmyadmin
2. Click "New" → Type "osms_db" → Click "Create"
3. Select osms_db → Click "Import" tab
4. Browse to: Store Management System\backend\database\schema.sql
5. Click "Import"
6. You should see 6 tables created
```

### Step 3: Install Backend (5 minutes)
```bash
cd "C:\xampp\htdocs\Store Management System\backend"
npm install
```

### Step 4: Start Backend Server (2 minutes)
```bash
npm run dev
```
Expected: "Server is running on http://localhost:5000"

### Step 5: Install Frontend (5 minutes)
```bash
cd "..\frontend"
npm install
```

### Step 6: Start Frontend Dev Server (2 minutes)
```bash
npm run dev
```
Expected: "Local: http://localhost:5173/"

### Step 7: Open Browser
Visit: **http://localhost:5173**

---

## 🔐 Login with Demo Account

After the application loads, you should see the login page.

Demo users created in database:
- Username: `admin_user` (Admin role - full access)
- Username: `staff_user1` (Staff role)
- Username: `tech_user1` (Technician role)

The passwords are hashed in the database. For the demo:
- Check `backend/database/schema.sql` for the setup details
- Or use: Contact your system admin for password

*Note: In production, always change these demo credentials!*

---

## 📁 Project Directory Map

```
C:\xampp\htdocs\Store Management System\
│
├── backend/
│   ├── src/
│   │   ├── routes/          ← API endpoints (edit to add new features)
│   │   ├── middleware/      ← Authentication logic
│   │   ├── utils/           ← Helper functions
│   │   └── database.js      ← Database connection
│   ├── database/
│   │   └── schema.sql       ← Database tables definition
│   ├── .env                 ← Backend configuration
│   ├── server.js            ← Express server entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/           ← React page components (edit to customize)
│   │   ├── services/        ← API calls (api.js)
│   │   ├── context/         ← Global state (AuthContext.jsx)
│   │   ├── utils/           ← Helper functions
│   │   ├── App.jsx          ← Main app routes
│   │   └── main.jsx         ← React entry point
│   ├── .env                 ← Frontend configuration
│   ├── vite.config.js       ← Vite build config
│   └── package.json
│
└── README.md                ← Full documentation
```

---

## 🎯 Key Features Ready to Use

1. **User Authentication**
   - Login/logout with JWT tokens
   - Role-based access control
   - Automatic token refresh

2. **Asset Management**
   - Register assets
   - Track component parts
   - Monitor repair history

3. **Repair Workflow** (5 Sections)
   - Section 1: Repair submission
   - Section 2: Post-repair inspection
   - Section 3: Equipment return
   - Section 4: Authorization request
   - Section 5: Final approval

4. **Dashboard**
   - Key statistics
   - Repair trends
   - Cost tracking

---

## 🔧 Customization Guide

### Add New API Endpoint

1. Create route file in `backend/src/routes/newfeature.js`
2. Add to `backend/server.js`:
   ```javascript
   import newFeatureRoutes from './src/routes/newfeature.js';
   app.use('/api/newfeature', newFeatureRoutes);
   ```
3. Add API calls to `frontend/src/services/api.js`
4. Create React page component in `frontend/src/pages/`
5. Add route to `frontend/src/App.jsx`

### Modify Database

1. Update `backend/database/schema.sql`
2. Stop backend server
3. Re-import schema in phpMyAdmin
4. Update API queries to match new schema

### Change Styling

- Global styles: `frontend/src/App.css`
- Page styles: `frontend/src/pages/pages.css`
- Component styles: Create `.css` files in component folders

---

## 🐛 Troubleshooting Checklist

❓ **Backend won't start?**
- Is MySQL running in XAMPP? ✓
- Did you run `npm install`? ✓
- Is port 5000 available? (Check Task Manager) ✓

❓ **Frontend won't load?**
- Is backend running? ✓
- Did you run `npm install`? ✓
- Is port 5173 available? ✓

❓ **Database connection error?**
- Is MySQL running? ✓
- Is database `osms_db` created? ✓
- Are credentials in `.env` correct? ✓

❓ **Login failing?**
- Did you import schema.sql? ✓
- Is user data in database? (Check phpMyAdmin) ✓

---

## 📊 Environment Variables

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=osms_db
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

*Change JWT_SECRET for production!*

---

## 💡 Tips for Success

1. **Always keep both servers running** - Backend in one terminal, Frontend in another
2. **Check browser console** for frontend errors (F12)
3. **Check terminal output** for backend errors
4. **Use phpMyAdmin** to verify database is working
5. **Clear localStorage** if having login issues (DevTools → Application)
6. **Review schema.sql** to understand database structure
7. **Check route files** to understand API structure

---

## 📞 Quick Reference

| Component | Port | URL | Start Command |
|-----------|------|-----|---|
| Backend API | 5000 | http://localhost:5000 | `npm run dev` |
| Frontend | 5173 | http://localhost:5173 | `npm run dev` |
| MySQL | 3306 | localhost | XAMPP Control Panel |
| phpMyAdmin | 80 | http://localhost/phpmyadmin | Automatic |

---

## ✨ You're All Set!

Your OSMS system is ready for development. Start with the 7 steps above, and you'll have a fully functional system in about 20-30 minutes.

**Next time you work on this:**
1. Start XAMPP
2. Open Terminal 1: `cd backend && npm run dev`
3. Open Terminal 2: `cd frontend && npm run dev`
4. Open browser to http://localhost:5173
5. Login with demo credentials

Good luck with your project! 🚀
