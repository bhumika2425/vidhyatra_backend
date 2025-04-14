const { DataTypes } = require('sequelize');
const { sequelizeVidhyatra } = require('../config/db');
const RoutineConfig = require('./routineConfig');

const RoutineEntry = sequelizeVidhyatra.define(
  'RoutineEntry',
  {
    entry_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    config_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'routine_configs',
        key: 'config_id',
      },
    },
    day: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., 'Monday'
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    teacher: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  },
  {
    tableName: 'routine_entries',
    timestamps: false,
  }
);

// Association
RoutineEntry.belongsTo(RoutineConfig, { foreignKey: 'config_id' });

module.exports = RoutineEntry;