// Migration Script - Execute Database Schema
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
  console.log('\n📊 OSMS Database Migration\n');
  
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL\n');

    // Create database
    await connection.query('CREATE DATABASE IF NOT EXISTS osms_db');
    console.log('✅ Database osms_db created/verified');
    
    // Read schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute entire schema
    await connection.query(schema);
    console.log('✅ All tables created/verified\n');

    // List tables
    const [tables] = await connection.query('SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = "osms_db"');
    console.log('📋 Created tables:');
    tables.forEach(t => console.log('  ✓', t.TABLE_NAME));

    await connection.end();
    console.log('\n✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();
