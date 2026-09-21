// scripts/run-exam-migrations.js
const fs = require('fs');
const path = require('path');
const { sequelizeVidhyatra } = require('../config/db');

/**
 * Migration runner for exam-related tables
 * This script reads SQL migration files and executes them
 */

const runMigrations = async () => {
    try {
        console.log('🚀 Starting exam migrations...\n');

        // Test database connection
        await sequelizeVidhyatra.authenticate();
        console.log('✅ Database connection established\n');

        // Define migration files in order
        const migrations = [
            'create_exams_table.sql',
            'create_seat_allocations_table.sql'
        ];

        for (const migrationFile of migrations) {
            const migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
            
            console.log(`📄 Running migration: ${migrationFile}`);

            // Check if file exists
            if (!fs.existsSync(migrationPath)) {
                console.error(`❌ Migration file not found: ${migrationPath}`);
                continue;
            }

            // Read SQL file
            const sqlContent = fs.readFileSync(migrationPath, 'utf8');

            // Split by semicolon to handle multiple statements
            const statements = sqlContent
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

            // Execute each statement
            for (let i = 0; i < statements.length; i++) {
                const statement = statements[i];
                
                try {
                    await sequelizeVidhyatra.query(statement);
                    console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`);
                } catch (error) {
                    // Ignore "table already exists" errors
                    if (error.message.includes('already exists')) {
                        console.log(`   ⚠️ Table already exists, skipping...`);
                    } else {
                        console.error(`   ❌ Error executing statement ${i + 1}:`, error.message);
                        throw error;
                    }
                }
            }

            console.log(`✅ ${migrationFile} completed\n`);
        }

        // Verify tables were created
        console.log('🔍 Verifying tables...');
        
        const [examsTables] = await sequelizeVidhyatra.query(`
            SELECT TABLE_NAME 
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = 'vidhyatra' 
            AND TABLE_NAME IN ('exams', 'seat_allocations')
        `);

        if (examsTables.length === 2) {
            console.log('✅ Both tables verified successfully!');
            
            // Check record counts
            const [examsCount] = await sequelizeVidhyatra.query('SELECT COUNT(*) as count FROM exams');
            const [allocationsCount] = await sequelizeVidhyatra.query('SELECT COUNT(*) as count FROM seat_allocations');
            
            console.log(`\n📊 Current data:`);
            console.log(`   - Exams: ${examsCount[0].count} records`);
            console.log(`   - Seat Allocations: ${allocationsCount[0].count} records`);
        } else {
            console.warn(`⚠️ Expected 2 tables, but found ${examsTables.length}`);
        }

        console.log('\n✅ All migrations completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Test the APIs in Postman');
        console.log('   2. Create an exam: POST http://localhost:3001/api/exams');
        console.log('   3. List exams: GET http://localhost:3001/api/exams');
        console.log('   4. Get exam details: GET http://localhost:3001/api/exams/:id');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        console.error('Error details:', error.message);
        process.exit(1);
    }
};

// Run migrations
runMigrations();
