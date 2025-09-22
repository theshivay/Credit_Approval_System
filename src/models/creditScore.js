const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('./customer');

const CreditScore = sequelize.define('CreditScore', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Customer,
      key: 'customer_id'
    }
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Credit score from 0 to 100'
  }
}, {
  tableName: 'credit_scores',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define the relationship
CreditScore.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasOne(CreditScore, { foreignKey: 'customer_id' });

module.exports = CreditScore;