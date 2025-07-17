import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Post = sequelize.define('Post', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false  // ⬅️ This makes sure it must be provided
  },
  CategoryId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'posts',
});

export default Post;
