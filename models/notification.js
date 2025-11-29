const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');

const Notification = sequelizeVidhyatra.define('Notification', {
    notification_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM(
            'BLOG_POST', 
            'FRIEND_REQUEST', 
            'EVENT_REMINDER', 
            'FEE_REMINDER', 
            'DEADLINE_ALERT',
            'APPOINTMENT_CONFIRMATION',
            'ACADEMIC_UPDATE',
            'SYSTEM_ANNOUNCEMENT',
            'LOST_AND_FOUND',
            'ANNOUNCEMENT'
        ),
        allowNull: false,
    },
    priority: {
        type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
        defaultValue: 'MEDIUM',
        allowNull: false,
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    data: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data like IDs, URLs, etc.'
    },
    expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'When this notification should expire'
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
        onUpdate: DataTypes.NOW,
    }
}, {
    tableName: 'notifications',
    timestamps: false,
    indexes: [
        {
            fields: ['user_id', 'is_read']
        },
        {
            fields: ['type']
        },
        {
            fields: ['created_at']
        }
    ]
});

// Instance methods
Notification.prototype.markAsRead = async function() {
    this.is_read = true;
    return await this.save();
};

// Static methods
Notification.getUnreadCount = async function(userId) {
    return await this.count({
        where: {
            user_id: userId,
            is_read: false
        }
    });
};

Notification.getUserNotifications = async function(userId, limit = 20, offset = 0) {
    return await this.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit,
        offset
    });
};

Notification.markAllAsRead = async function(userId) {
    return await this.update(
        { is_read: true },
        { 
            where: { 
                user_id: userId,
                is_read: false 
            } 
        }
    );
};

module.exports = Notification;
