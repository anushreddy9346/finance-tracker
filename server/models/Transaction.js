const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  type:     { type: DataTypes.ENUM('income','expense'), allowNull: false },
  amount:   { type: DataTypes.FLOAT, allowNull: false },
  category: { type: DataTypes.STRING, allowNull: false },
  note:     { type: DataTypes.STRING, defaultValue: '' },
  date:     { type: DataTypes.DATEONLY, allowNull: false },
  userId:   { type: DataTypes.INTEGER, allowNull: false },
});

module.exports = Transaction;