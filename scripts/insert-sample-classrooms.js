const { sequelizeVidhyatra } = require('../config/db');

async function insertSampleData() {
  try {
    console.log('📝 Inserting sample classroom data...');
    
    const classrooms = [
      { classroom_name: 'Fewa', room_number: '101', building: 'Main Block', floor: 'Ground Floor', capacity: 40, rows: 5, columns: 8, type: 'Classroom', is_available: true },
      { classroom_name: 'Tilicho', room_number: '102', building: 'Main Block', floor: 'Ground Floor', capacity: 40, rows: 5, columns: 8, type: 'Classroom', is_available: true },
      { classroom_name: 'Rara', room_number: '201', building: 'Main Block', floor: '1st Floor', capacity: 50, rows: 5, columns: 10, type: 'Lecture Hall', is_available: true },
      { classroom_name: 'Annapurna', room_number: '202', building: 'Main Block', floor: '1st Floor', capacity: 50, rows: 5, columns: 10, type: 'Lecture Hall', is_available: true },
      { classroom_name: 'Nilgiri', room_number: 'Lab-A', building: 'IT Building', floor: 'Ground Floor', capacity: 30, rows: 5, columns: 6, type: 'Lab', is_available: true },
      { classroom_name: 'Manaslu', room_number: 'Lab-B', building: 'IT Building', floor: 'Ground Floor', capacity: 30, rows: 5, columns: 6, type: 'Lab', is_available: true },
      { classroom_name: 'Phewa Hall', room_number: '301', building: 'Main Block', floor: '2nd Floor', capacity: 60, rows: 6, columns: 10, type: 'Exam Hall', is_available: true },
      { classroom_name: 'Everest Auditorium', room_number: 'Auditorium', building: 'Main Block', floor: 'Ground Floor', capacity: 200, rows: 20, columns: 10, type: 'Auditorium', is_available: true }
    ];
    
    for (const classroom of classrooms) {
      await sequelizeVidhyatra.query(
        `INSERT INTO classrooms (classroom_name, room_number, building, floor, capacity, \`rows\`, \`columns\`, type, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        {
          replacements: [
            classroom.classroom_name,
            classroom.room_number,
            classroom.building,
            classroom.floor,
            classroom.capacity,
            classroom.rows,
            classroom.columns,
            classroom.type,
            classroom.is_available
          ]
        }
      );
      console.log(`✅ Added: ${classroom.classroom_name} (${classroom.room_number})`);
    }
    
    console.log('\n🎉 All sample classrooms inserted successfully!');
    
    // Verify
    const [results] = await sequelizeVidhyatra.query('SELECT * FROM classrooms');
    console.log(`\n📊 Total classrooms: ${results.length}`);
    results.forEach(c => {
      console.log(`  - ${c.classroom_name || c.room_number} (${c.building}, Capacity: ${c.capacity})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertSampleData();
