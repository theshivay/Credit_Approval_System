const express = require('express');
const customerRoutes = require('./customerRoutes');
const loanRoutes = require('./loanRoutes');

const router = express.Router();

// API version prefix
router.use('/api/customers', customerRoutes);
router.use('/api/loans', loanRoutes);

// Default route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Credit Approval System API',
    version: '1.0',
    endpoints: {
      customers: '/api/customers',
      loans: '/api/loans'
    }
  });
});

module.exports = router;