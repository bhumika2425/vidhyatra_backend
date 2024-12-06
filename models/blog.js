
// models/Blog.js
const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require('../config/db');  // Adjust the path according to your config file location
const User = require("./user");

const Blog = sequelizeVidhyatra.define(
  "Blog",
  {
    blog_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    blog_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image_urls: {
      type: DataTypes.TEXT,  // Storing as a JSON string
      allowNull: true,
      get() {
        const rawValue = this.getDataValue('image_urls');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('image_urls', JSON.stringify(value));
      }
    }
  },
  {
    timestamps: false, // Automatically includes createdAt and updatedAt fields
    tableName: "blog",
  }
);

Blog.belongsTo(User, { foreignKey: "user_id" });

module.exports = Blog;