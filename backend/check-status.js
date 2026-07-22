import db from './src/database.js';
const [rows] = await db.query('SELECT id, model, status FROM assets');
console.log('Asset Status:');
rows.forEach(r => console.log(`[${r.id}] ${r.model}: ${r.status}`));
process.exit(0);
