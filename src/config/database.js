const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Using SQLite for simplicity - doesn't require a separate server
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../credit_approval.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection
};