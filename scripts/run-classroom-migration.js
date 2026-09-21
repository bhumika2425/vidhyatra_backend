const fs = require('fs');
const path = require('path');
const { sequelizeVidhyatra } = require('../config/db');

async function runMigration() {
  try {
    console.log('🚀 Running classroom migration...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../migrations/create_classrooms_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split into individual statements (remove comments and empty lines)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));
    
    // Execute each statement
    for (const statement of statements) {
      if (statement) {
        console.log('📝 Executing statement...');
        await sequelizeVidhyatra.query(statement);
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Checking classrooms table...');
    
    // Check if data was inserted
    const [results] = await sequelizeVidhyatra.query('SELECT COUNT(*) as count FROM classrooms');
    console.log(`📈 Total classrooms in database: ${results[0].count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
