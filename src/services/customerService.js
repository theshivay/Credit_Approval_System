const { Customer } = require('../models');

class CustomerService {
  /**
   * Register a new customer
   * @param {Object} customerData - Customer data
   * @returns {Object} - Created customer
   * @throws {Error} - If phone number already exists
   */
  static async registerCustomer(customerData) {
    try {
      // Check if phone number already exists
      const existingCustomer = await Customer.findOne({
        where: { phone_number: customerData.phone_number }
      });
      
      if (existingCustomer) {
        throw new Error('Phone number already registered');
      }
      
      // Calculate approved limit based on monthly income
      const approvedLimit = parseFloat(customerData.monthly_income) * 36;
      
      const customer = await Customer.create({
        first_name: customerData.first_name,
        last_name: customerData.last_name,
        age: customerData.age,
        phone_number: customerData.phone_number,
        monthly_income: customerData.monthly_income,
        approved_limit: approvedLimit
      });
      
      return {
        customer_id: customer.customer_id,
        name: `${customer.first_name} ${customer.last_name}`,
        age: customer.age,
        phone_number: customer.phone_number,
        monthly_income: customer.monthly_income,
        approved_limit: customer.approved_limit
      };
    } catch (error) {
      console.error('Error in registerCustomer:', error);
      throw error;
    }
  }
  
  /**
   * Get customer by ID
   * @param {Number} customerId - Customer ID
   * @returns {Object} - Customer details
   */
  static async getCustomerById(customerId) {
    try {
      const customer = await Customer.findByPk(customerId);
      
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      return customer;
    } catch (error) {
      console.error('Error in getCustomerById:', error);
      throw error;
    }
  }
}

module.exports = CustomerService;