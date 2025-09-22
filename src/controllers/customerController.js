const CustomerService = require('../services/customerService');

class CustomerController {
  /**
   * Register a new customer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with customer data or error
   */
  static async registerCustomer(req, res) {
    try {
      const { first_name, last_name, age, phone_number, monthly_income } = req.body;
      
      // Validate input
      if (!first_name || !last_name || !age || !phone_number || !monthly_income) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: 'Please provide all required fields: first_name, last_name, age, phone_number, monthly_income' 
        });
      }
      
      const customer = await CustomerService.registerCustomer({
        first_name,
        last_name,
        age,
        phone_number,
        monthly_income
      });
      
      return res.status(201).json(customer);
    } catch (error) {
      console.error('Error in registerCustomer controller:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Get customer details by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with customer data or error
   */
  static async getCustomerById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          error: 'Missing customer ID',
          message: 'Please provide customer ID' 
        });
      }
      
      const customer = await CustomerService.getCustomerById(id);
      
      return res.status(200).json({
        customer_id: customer.customer_id,
        first_name: customer.first_name,
        last_name: customer.last_name,
        phone_number: customer.phone_number,
        age: customer.age,
        monthly_income: customer.monthly_income,
        approved_limit: customer.approved_limit,
        created_at: customer.created_at
      });
    } catch (error) {
      console.error('Error in getCustomerById controller:', error);
      
      if (error.message === 'Customer not found') {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Customer not found' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
}

module.exports = CustomerController;