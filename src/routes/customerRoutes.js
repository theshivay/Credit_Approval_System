const express = require('express');
const CustomerController = require('../controllers/customerController');

const router = express.Router();

// Register a new customer
router.post('/register', CustomerController.registerCustomer);

// Get customer details by ID
router.get('/:id', CustomerController.getCustomerById);

module.exports = router;