// models/User.js
const { DataTypes } = require('sequelize');
const db = require('../config/db');

const User = db.define('User', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
