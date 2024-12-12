// models/Comment.js
const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require("../config/db");
const Blog = require("./blog");
const User = require("./user");

const Comment = sequelizeVidhyatra.define(
  "Comment",
  {
    comment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blog_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "comment",
  }
);

Comment.belongsTo(User, { foreignKey: "user_id" });

module.exports = Comment;
