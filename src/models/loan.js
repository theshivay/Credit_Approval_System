const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Customer = require('./customer');

const Loan = sequelize.define('Loan', {
  loan_id: {
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
  loan_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  interest_rate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  tenure: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Loan tenure in months'
  },
  monthly_payment: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  emis_paid_on_time: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    comment: 'Number of EMIs paid on time'
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'PAID'),
    allowNull: false,
    defaultValue: 'PENDING'
  }
}, {
  tableName: 'loans',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define the relationship
Loan.belongsTo(Customer, { foreignKey: 'customer_id' });
Customer.hasMany(Loan, { foreignKey: 'customer_id' });

module.exports = Loan;