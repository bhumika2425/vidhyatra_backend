const { sequelizeVidhyatra } = require('../config/db');

async function alterTable() {
  try {
    console.log('🔧 Checking classrooms table structure...');
    
    // Check current columns
    const [columns] = await sequelizeVidhyatra.query('SHOW COLUMNS FROM classrooms');
    console.log('Current columns:', columns.map(c => c.Field).join(', '));
    
    // Check if classroom_name exists
    const hasClassroomName = columns.some(c => c.Field === 'classroom_name');
    
    if (!hasClassroomName) {
      console.log('\n➕ Adding classroom_name column...');
      await sequelizeVidhyatra.query(
        `ALTER TABLE classrooms 
         ADD COLUMN classroom_name VARCHAR(100) NULL 
         COMMENT 'Descriptive name like Fewa, Tilicho, Rara, etc.' 
         AFTER id`
      );
      console.log('✅ Column added successfully!');
    } else {
      console.log('✅ classroom_name column already exists!');
    }
    
    // Check if rows and columns exist
    const hasRows = columns.some(c => c.Field === 'rows');
    const hasColumns = columns.some(c => c.Field === 'columns');
    
    if (!hasRows) {
      console.log('\n➕ Adding rows column...');
      await sequelizeVidhyatra.query(
        `ALTER TABLE classrooms 
         ADD COLUMN \`rows\` INT NOT NULL DEFAULT 5 
         COMMENT 'Number of rows in the classroom for seating layout' 
         AFTER capacity`
      );
      console.log('✅ rows column added!');
    }
    
    if (!hasColumns) {
      console.log('\n➕ Adding columns column...');
      await sequelizeVidhyatra.query(
        `ALTER TABLE classrooms 
         ADD COLUMN \`columns\` INT NOT NULL DEFAULT 6 
         COMMENT 'Number of columns per row in the classroom for seating layout' 
         AFTER \`rows\``
      );
      console.log('✅ columns column added!');
    }
    
    // Show final structure
    console.log('\n📋 Final table structure:');
    const [finalColumns] = await sequelizeVidhyatra.query('SHOW COLUMNS FROM classrooms');
    finalColumns.forEach(c => {
      console.log(`  - ${c.Field} (${c.Type}) ${c.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

alterTable();
