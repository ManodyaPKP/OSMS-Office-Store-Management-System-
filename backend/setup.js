import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  console.log('\n🔧 OSMS Database Setup - Creating Demo Users\n');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'osms_db'
    });

    console.log('✅ Connected to database\n');

    const password = 'Password@123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    console.log(`📝 Generated hash for password: "${password}"\n`);

    console.log('📦 Creating default department if not exists...');
    await connection.execute(
      `INSERT IGNORE INTO departments (id, name, code, head_name) 
       VALUES (1, 'IT Department', 'IT', 'Admin')`
    );
    console.log('✅ Department ready\n');

    const users = [
      {
        username: 'admin_user',
        email: 'admin@osms.local',
        full_name: 'Admin User',
        designation: 'System Administrator',
        role: 'admin',
        dept_id: 1,
        bio: 'System Administrator',
        phone: '555-0100'
      },
      {
        username: 'staff_user1',
        email: 'staff@osms.local',
        full_name: 'Staff User',
        designation: 'Office Staff',
        role: 'staff',
        dept_id: 1,
        bio: 'Office Staff Member',
        phone: '555-0101'
      },
      {
        username: 'tech_user1',
        email: 'tech@osms.local',
        full_name: 'Tech User',
        designation: 'Technician',
        role: 'technician',
        dept_id: 1,
        bio: 'IT Technician',
        phone: '555-0102'
      }
    ];

    console.log('👥 Creating demo users...\n');
    for (const user of users) {
      try {
        await connection.execute(
          `INSERT IGNORE INTO users 
           (username, email, password_hash, full_name, designation, role, dept_id, bio, phone, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)`,
          [
            user.username,
            user.email,
            passwordHash,
            user.full_name,
            user.designation,
            user.role,
            user.dept_id,
            user.bio,
            user.phone
          ]
        );

        await connection.execute(
          `UPDATE users SET password_hash = ?, full_name = ?, designation = ?, role = ?, bio = ?, phone = ?, is_active = true
           WHERE username = ?`,
          [passwordHash, user.full_name, user.designation, user.role, user.bio, user.phone, user.username]
        );

        // Also add user_settings
        await connection.execute(
          `INSERT IGNORE INTO user_settings (user_id, theme, notifications, email_notifications)
           SELECT id, 'light', TRUE, TRUE FROM users WHERE username = ?`,
          [user.username]
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