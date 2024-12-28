// models/Blog.js
const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require('../config/db');  // Ensure correct path to db.js
const User = require("./user");
const Profile = require("./profileModel");
const Like = require("./like"); // Import the Like model
const Comment = require("./comment");

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
    timestamps: true, // Automatically includes createdAt and updatedAt fields
    tableName: "blog",
  }
);

// Associate Blog with User
Blog.belongsTo(User, { foreignKey: "user_id" });

// Associate Blog with Profile
Blog.belongsTo(Profile, { foreignKey: 'user_id', targetKey: 'user_id', as: 'profile' }); // Alias 'profile' added here

// Ensure the Like model is associated correctly
Blog.hasMany(Like, { foreignKey: 'blog_id' });  // Corrected here

Blog.hasMany(Comment, { foreignKey: 'blog_id' });  // Corrected here



module.exports = Blog;
