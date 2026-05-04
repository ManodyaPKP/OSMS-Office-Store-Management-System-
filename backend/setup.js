// Setup Script - Create Demo Users with Correct Password Hashes
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  console.log('\n🔧 OSMS Database Setup - Creating Demo Users\n');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'osms_db'
    });

    console.log('✅ Connected to database\n');

    // Generate correct password hash
    const password = 'Password@123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log(`📝 Generated hash for password: "${password}"\n`);

    // Create a default department
    console.log('📦 Creating default department...');
    await connection.execute(
      `INSERT IGNORE INTO departments (id, name, code, head_name) 
       VALUES (1, 'IT Department', 'IT', 'Admin')`
    );
    console.log('✅ Department ready\n');

    // Create demo users with correct password
    const users = [
      {
        username: 'admin_user',
        email: 'admin@osms.local',
        full_name: 'Admin User',
        designation: 'System Administrator',
        role: 'admin',
        dept_id: 1
      },
      {
        username: 'staff_user1',
        email: 'staff@osms.local',
        full_name: 'Staff User',
        designation: 'Office Staff',
        role: 'staff',
        dept_id: 1
      },
      {
        username: 'tech_user1',
        email: 'tech@osms.local',
        full_name: 'Tech User',
        designation: 'Technician',
        role: 'technician',
        dept_id: 1
      }
    ];

    console.log('👥 Creating demo users...\n');
    for (const user of users) {
      try {
        // Try to insert if doesn't exist
        await connection.execute(
          `INSERT IGNORE INTO users 
           (username, email, password_hash, full_name, designation, role, dept_id, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, true)`,
          [
            user.username,
            user.email,
            passwordHash,
            user.full_name,
            user.designation,
            user.role,
            user.dept_id
          ]
        );

        // Also update if already exists
        await connection.execute(
          `UPDATE users SET password_hash = ?, full_name = ?, designation = ?, role = ?, is_active = true
           WHERE username = ?`,
          [passwordHash, user.full_name, user.designation, user.role, user.username]
        );

        console.log(`✅ ${user.username} (${user.role})`);
      } catch (err) {
        console.log(`⚠️  ${user.username} - ${err.message}`);
      }
    }

    console.log('\n🎉 Setup Complete!\n');
    console.log('═══════════════════════════════════════════════');
    console.log('          DEMO LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════════\n');
    
    console.log('👨‍💼 ADMIN USER:');
    console.log('   Username: admin_user');
    console.log('   Password: Password@123');
    console.log('   Role: Admin\n');
    
    console.log('👤 STAFF USER:');
    console.log('   Username: staff_user1');
    console.log('   Password: Password@123');
    console.log('   Role: Staff\n');
    
    console.log('🔧 TECHNICIAN USER:');
    console.log('   Username: tech_user1');
    console.log('   Password: Password@123');
    console.log('   Role: Technician\n');
    
    console.log('═══════════════════════════════════════════════\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupDatabase();
