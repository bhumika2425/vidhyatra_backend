const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Create a standalone sequelize instance (don't import app.js)
const sequelizeVidhyatra = new Sequelize(
    process.env.VIDHYATRA_DB_NAME || 'vidhyatra',
    process.env.VIDHYATRA_DB_USER || 'root',
    process.env.VIDHYATRA_DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        dialect: 'mysql',
        logging: false
    }
);

// Define User model inline
const User = sequelizeVidhyatra.define('User', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    college_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM('Student', 'Teacher'),
        defaultValue: 'Student',
        allowNull: false,
    },
    isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    }
}, {
    tableName: 'users',
    timestamps: false,
});

// Define Profile model inline
const Profile = sequelizeVidhyatra.define('Profile', {
    profile_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    department: {
        type: DataTypes.ENUM('BBA', 'BIT'),
        allowNull: true,
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'profiles',
    timestamps: false,
});

const createSuperAdmin = async () => {
    try {
        await sequelizeVidhyatra.authenticate();
        console.log('✅ Database connected successfully');

        // Check if super admin already exists
        const existingAdmin = await User.findOne({ 
            where: { 
                email: 'admin@vidhyatra.com'
            } 
        });

        if (existingAdmin) {
            console.log('⚠️ Super admin already exists!');
            console.log('📧 Email:', existingAdmin.email);
            console.log('🔑 College ID:', existingAdmin.college_id);
            console.log('🔐 Default Password: Admin@123');
            console.log('👤 Is Admin:', existingAdmin.isAdmin);
            
            if (!existingAdmin.isAdmin) {
                console.log('\n🔧 Updating user to admin...');
                existingAdmin.isAdmin = true;
                await existingAdmin.save();
                console.log('✅ User updated to admin successfully!');
            }
            
            return;
        }

        // Create super admin user
        const hashedPassword = await bcrypt.hash('Admin@123', 10);

        const superAdmin = await User.create({
            college_id: 'ADMIN001',
            name: 'Super Admin',
            email: 'admin@vidhyatra.com',
            password: hashedPassword,
            role: 'Teacher', // Base role (required by ENUM)
            isAdmin: true,   // Admin flag
        });

        // Create admin profile
        await Profile.create({
            user_id: superAdmin.user_id,
            full_name: 'Super Admin',
            department: 'BIT',
            bio: 'System Administrator',
        });

        console.log('\n✅ Super admin created successfully!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email:       admin@vidhyatra.com');
        console.log('🔑 College ID:  ADMIN001');
        console.log('🔐 Password:    Admin@123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n⚠️  Please change the password after first login!\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error.message);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    createSuperAdmin();
}

module.exports = createSuperAdmin;
