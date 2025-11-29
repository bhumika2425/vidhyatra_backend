const { sequelizeVidhyatra } = require('../config/db');

async function addFcmTokenColumn() {
    try {
        console.log('🔧 Adding fcm_token column to users table...');
        
        await sequelizeVidhyatra.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255) NULL 
            AFTER isAdmin;
        `);
        
        console.log('✅ fcm_token column added successfully!');
        
        // Verify the column was added
        const [results] = await sequelizeVidhyatra.query(`
            SHOW COLUMNS FROM users LIKE 'fcm_token';
        `);
        
        if (results.length > 0) {
            console.log('✅ Verified: fcm_token column exists');
            console.log('Column details:', results[0]);
        }
        
        process.exit(0);
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('✅ fcm_token column already exists!');
            process.exit(0);
        }
        console.error('❌ Error adding fcm_token column:', error.message);
        process.exit(1);
    }
}

addFcmTokenColumn();
