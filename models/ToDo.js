// models/Todo.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');
const User = require('./User');

const Todo = db.define('Todo', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  completedAt: {
    type: DataTypes.DATE,
  },
  description: {
    type: DataTypes.TEXT,
  },
  isDone: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  owner: {
    type: DataTypes.STRING
  }
});

User.hasMany(Todo);
Todo.belongsTo(User);

module.exports = Todo;
