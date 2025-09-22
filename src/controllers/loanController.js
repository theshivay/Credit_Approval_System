const CreditService = require('../services/creditService');
const LoanService = require('../services/loanService');

class LoanController {
  /**
   * Check loan eligibility
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with eligibility data or error
   */
  static async checkEligibility(req, res) {
    try {
      const { customer_id, loan_amount, interest_rate, tenure } = req.body;
      
      // Validate input
      if (!customer_id || !loan_amount || !interest_rate || !tenure) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: 'Please provide customer_id, loan_amount, interest_rate, and tenure'
        });
      }
      
      // Additional validation
      if (isNaN(customer_id) || customer_id <= 0) {
        return res.status(400).json({
          error: 'Invalid customer ID',
          message: 'Customer ID must be a positive number'
        });
      }
      
      if (isNaN(loan_amount) || loan_amount <= 0) {
        return res.status(400).json({
          error: 'Invalid loan amount',
          message: 'Loan amount must be a positive number'
        });
      }
      
      if (isNaN(interest_rate) || interest_rate <= 0) {
        return res.status(400).json({
          error: 'Invalid interest rate',
          message: 'Interest rate must be a positive number'
        });
      }
      
      if (isNaN(tenure) || tenure <= 0) {
        return res.status(400).json({
          error: 'Invalid tenure',
          message: 'Tenure must be a positive number'
        });
      }
      
      const eligibility = await CreditService.checkEligibility(
        customer_id, 
        loan_amount, 
        tenure,
        interest_rate
      );
      
      // Structure the response according to the specified format
      const response = {
        customer_id: eligibility.customer_id,
        approval: eligibility.approval,
        interest_rate: parseFloat(interest_rate),
        corrected_interest_rate: eligibility.corrected_interest_rate,
        tenure: eligibility.tenure,
        monthly_installment: eligibility.monthly_payment
      };
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error in checkEligibility controller:', error);
      
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
  
  /**
   * Create a new loan application
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with created loan data or error
   */
  static async createLoan(req, res) {
    try {
      const { customer_id, loan_amount, tenure, interest_rate } = req.body;
      
      // Validate input
      if (!customer_id || !loan_amount || !tenure) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          message: 'Please provide customer_id, loan_amount, and tenure' 
        });
      }
      
      // Additional validation
      if (isNaN(loan_amount) || loan_amount <= 0) {
        return res.status(400).json({
          error: 'Invalid loan amount',
          message: 'Loan amount must be a positive number'
        });
      }
      
      if (isNaN(tenure) || tenure <= 0) {
        return res.status(400).json({
          error: 'Invalid tenure',
          message: 'Tenure must be a positive number'
        });
      }
      
      try {
        const loan = await LoanService.createLoan({
          customer_id,
          loan_amount,
          tenure,
          interest_rate
        });
        
        return res.status(201).json(loan);
      } catch (serviceError) {
        if (serviceError.message === 'Customer not found') {
          return res.status(404).json({ 
            error: 'Not Found',
            message: 'Customer not found' 
          });
        } else if (serviceError.message === 'Similar loan application already exists for this customer') {
          return res.status(409).json({ 
            error: 'Duplicate loan application',
            message: 'A similar loan application already exists for this customer' 
          });
        }
        // Re-throw for the outer catch block to handle
        throw serviceError;
      }
    } catch (error) {
      console.error('Error in createLoan controller:', error);
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Get loan details by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with loan data or error
   */
  static async getLoanById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ 
          error: 'Missing loan ID',
          message: 'Please provide loan ID' 
        });
      }
      
      const loan = await LoanService.getLoanById(id);
      
      return res.status(200).json({
        loan_id: loan.loan_id,
        customer: {
          id: loan.Customer.customer_id,
          first_name: loan.Customer.first_name,
          last_name: loan.Customer.last_name
        },
        loan_amount: loan.loan_amount,
        interest_rate: loan.interest_rate,
        monthly_payment: loan.monthly_payment,
        tenure: loan.tenure,
        emis_paid_on_time: loan.emis_paid_on_time,
        start_date: loan.start_date,
        end_date: loan.end_date,
        status: loan.status
      });
    } catch (error) {
      console.error('Error in getLoanById controller:', error);
      
      if (error.message === 'Loan not found') {
        return res.status(404).json({ 
          error: 'Not Found',
          message: 'Loan not found' 
        });
      }
      
      return res.status(500).json({ 
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
  
  /**
   * Get all loans for a customer
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} - Response with loans data or error
   */
  static async getCustomerLoans(req, res) {
    try {
      const { customer_id } = req.params;
      
      if (!customer_id) {
        return res.status(400).json({ 
          error: 'Missing customer ID',
          message: 'Please provide customer ID' 
        });
      }
      
      const loans = await LoanService.getCustomerLoans(customer_id);
      
      return res.status(200).json({ loans });
    } catch (error) {
      console.error('Error in getCustomerLoans controller:', error);
      
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

module.exports = LoanController;