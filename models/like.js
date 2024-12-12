// const { DataTypes } = require("sequelize");
// const { sequelizeVidhyatra } = require("../config/db");
// const Blog = require("./blog");
// const User = require("./user"); // Ensure this is imported correctly

// const Like = sequelizeVidhyatra.define(
//   "Like",
//   {
//     like_id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     user_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//     blog_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },
//   },
//   {
//     timestamps: true,
//     tableName: "like",
//   }
// );

// // Ensure associations are correctly defined
// Like.belongsTo(Blog, { foreignKey: "blog_id" });
// Like.belongsTo(User, { foreignKey: "user_id" });

// module.exports = Like;

// models/like.js
const { DataTypes } = require("sequelize");
const { sequelizeVidhyatra } = require("../config/db");
const Blog = require("./blog");
const User = require("./user"); // Ensure this is imported correctly


const Like = sequelizeVidhyatra.define(
  "Like",
  {
    like_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    tableName: "like",
  }
);

// Ensure associations are correctly defined
// Like.belongsTo(Blog, { foreignKey: "blog_id" });
Like.belongsTo(User, { foreignKey: "user_id" });

module.exports = Like;
