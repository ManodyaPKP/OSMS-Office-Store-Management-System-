// Setup Script - Generate correct password hashes
import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const setupDatabase = async () => {
  console.log('\n🔧 OSMS Database Setup\n');
  
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

    // Update demo users with correct password
    const users = [
      { username: 'admin_user', hash: passwordHash },
      { username: 'staff_user1', hash: passwordHash },
      { username: 'tech_user1', hash: passwordHash }
    ];

    for (const user of users) {
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE username = ?',
        [user.hash, user.username]
      );
      console.log(`✅ Updated ${user.username}`);
    }

    console.log('\n🎉 Setup Complete!\n');
    console.log('Demo Login Credentials:');
    console.log('========================');
    console.log('Username: admin_user');
    console.log('Password: Password@123');
    console.log('Role: Admin\n');
    console.log('Username: staff_user1');
    console.log('Password: Password@123');
    console.log('Role: Staff\n');
    console.log('Username: tech_user1');
    console.log('Password: Password@123');
    console.log('Role: Technician\n');

    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

setupDatabase();
