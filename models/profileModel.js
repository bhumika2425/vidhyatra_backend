// const { DataTypes } = require('sequelize');
// const { sequelizeVidhyatra } = require('../config/db');
// const User = require('../models/user')

// const Profile = sequelizeVidhyatra.define('Profile', {
//     profile_id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true,
//     },
//     user_id: {
//         type: DataTypes.INTEGER,
//         allowNull: false,
//         references: {
//             model: 'users',
//             key: 'user_id',
//         },
//     },
//     full_name: {
//         type: DataTypes.STRING(50),
//     },
//     date_of_birth: {
//         type: DataTypes.DATE,
//     },
//     location: {
//         type: DataTypes.STRING(100),
//     },

//     department: {
//         type: DataTypes.STRING(100),
//     },
//     year: {
//         type: DataTypes.STRING(10),
//     },
//     semester: {
//         type: DataTypes.STRING(10),
//     },
//     profileImageUrl: {
//         type: DataTypes.STRING(255),
//     },
// }, {
//     timestamps: true,
//     tableName: 'profiles',
// });

// // Associate Profile with User
// Profile.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id' });

// module.exports = Profile;

const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const User = require('../models/user');

const Profile = sequelizeVidhyatra.define('Profile', {
    profile_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        type: DataTypes.STRING(50),
    },
    date_of_birth: {
        type: DataTypes.DATE,
    },
    location: {
        type: DataTypes.STRING(100),
    },
    department: {
        type: DataTypes.STRING(100),
    },
    year: {
        type: DataTypes.STRING(10),
    },
    semester: {
        type: DataTypes.STRING(10),
    },
    profileImageUrl: {
        type: DataTypes.STRING(255),
    },
    // created_at: {
    //     type: DataTypes.DATE, // Changed from TIMESTAMP to DATE
    //     defaultValue: DataTypes.NOW,
    //     field: 'created_at', // to match your SQL table's column name
    // },
    // updated_at: { // Add updated_at field to your model
    //     type: DataTypes.DATE,
    //     defaultValue: DataTypes.NOW,
    //     field: 'updated_at', // to match your SQL table's column name
    //     onUpdate: DataTypes.NOW // Automatically update this field on record update
    // }
}, {
    timestamps: true,
    tableName: 'profiles',
});

// Associate Profile with User using the correct alias
Profile.belongsTo(User, { foreignKey: 'user_id', targetKey: 'user_id' });

module.exports = Profile;
