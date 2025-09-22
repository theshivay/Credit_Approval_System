const express = require('express');
const LoanController = require('../controllers/loanController');

const router = express.Router();

// Check loan eligibility
router.post('/check-eligibility', LoanController.checkEligibility);

// Create a new loan application
router.post('/create', LoanController.createLoan);

// Get loan details by ID
router.get('/:id', LoanController.getLoanById);

// Get all loans for a customer
router.get('/customer/:customer_id', LoanController.getCustomerLoans);

module.exports = router;