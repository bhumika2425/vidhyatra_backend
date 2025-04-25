const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require('../config/db');
const User = require("./user");
const Profile = require("./profileModel");

const LostAndFound = sequelizeVidhyatra.define(
  "LostAndFound",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('lost', 'found'),
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    image_urls: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('image_urls');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('image_urls', JSON.stringify(value));
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    tableName: "lost_and_found",
  }
);

// Associations
LostAndFound.belongsTo(User, { foreignKey: "user_id" });
LostAndFound.belongsTo(Profile, { foreignKey: 'user_id', targetKey: 'user_id', as: 'profile' });

module.exports = LostAndFound;