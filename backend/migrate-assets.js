#!/usr/bin/env node

/**
 * Migration script to auto-register assets for existing repairs
 * This creates Asset records for all repair jobs that don't have associated assets
 */

import { executeQuery } from './src/database.js';

async function migrateExistingRepairs() {
  try {
    console.log('🔧 Starting Asset Migration for Existing Repairs...\n');

    // Get all repairs without asset_id
    const orphanRepairs = await executeQuery(`
      SELECT * FROM repair_jobs 
      WHERE asset_id IS NULL
      ORDER BY id ASC
    `);

    if (orphanRepairs.length === 0) {
      console.log('✅ No orphan repairs found. All repairs have associated assets!');
      process.exit(0);
    }

    console.log(`Found ${orphanRepairs.length} repairs without assets. Registering...\n`);

    let createdCount = 0;
    let errorCount = 0;

    for (const repair of orphanRepairs) {
      try {
        // Determine asset type from asset_name
        const assetTypeMap = {
          'laptop': 'laptop',
          'desktop': 'desktop',
          'printer': 'printer',
          'monitor': 'monitor',
          'phone': 'other',
          'mobile': 'other'
        };
        
        const assetType = Object.keys(assetTypeMap).find(key => 
          repair.asset_name?.toLowerCase().includes(key)
        ) ? assetTypeMap[Object.keys(assetTypeMap).find(key => 
          repair.asset_name?.toLowerCase().includes(key)
        )] : 'other';

        // Get or create default department
        let dept = await executeQuery('SELECT id FROM departments LIMIT 1');
        const deptId = dept.length > 0 ? dept[0].id : 1;

        // Create asset record
        const assetQuery = `
          INSERT INTO assets (
            dept_id,
            asset_type,
            model,
            serial_number,
            incharge_name,
            status,
            received_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const assetValues = [
          deptId,
          assetType,
          repair.model || repair.asset_name || 'Unknown',
          repair.serial_number || null,
          repair.current_username || repair.handed_over_by || 'Unknown',
          'active',
          repair.submitted_date || new Date().toISOString().split('T')[0]
        ];

        const assetResult = await executeQuery(assetQuery, assetValues);
        
        // Update repair with asset_id
        await executeQuery(
          'UPDATE repair_jobs SET asset_id = ? WHERE id = ?',
          [assetResult.insertId, repair.id]
        );

        console.log(`✅ Repair #${repair.id} → Asset #${assetResult.insertId} (${repair.asset_name})`);
        createdCount++;

      } catch (err) {
        console.error(`❌ Error registering asset for Repair #${repair.id}:`, err.message);
        errorCount++;
      }
    }

    console.log(`\n📊 Migration Summary:`);
    console.log(`   ✅ Created: ${createdCount} assets`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`\n🎉 Asset migration complete!`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateExistingRepairs();
