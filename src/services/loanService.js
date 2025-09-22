const { Loan, Customer } = require('../models');
const CreditService = require('./creditService');

class LoanService {
  /**
   * Create a new loan application
   * @param {Object} loanData - Loan application data
   * @returns {Object} - Created loan
   */
  static async createLoan(loanData) {
    try {
      // Check if customer exists
      const customer = await Customer.findByPk(loanData.customer_id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Check for existing pending or active loan applications with similar amounts
      // This is to prevent duplicate submissions of the same loan application
      const existingLoan = await Loan.findOne({
        where: {
          customer_id: loanData.customer_id,
          loan_amount: loanData.loan_amount,
          tenure: loanData.tenure,
          status: ['PENDING', 'APPROVED', 'ACTIVE']
        }
      });
      
      if (existingLoan) {
        throw new Error('Similar loan application already exists for this customer');
      }
      
      // Check eligibility first
      const eligibility = await CreditService.checkEligibility(
        loanData.customer_id,
        loanData.loan_amount,
        loanData.tenure
      );
      
      // Set start and end dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + loanData.tenure);
      
      // Create the loan with status based on eligibility
      const loan = await Loan.create({
        customer_id: loanData.customer_id,
        loan_amount: loanData.loan_amount,
        interest_rate: eligibility.interest_rate,
        tenure: loanData.tenure,
        monthly_payment: eligibility.monthly_payment,
        emis_paid_on_time: 0,
        start_date: startDate,
        end_date: endDate,
        status: eligibility.approval ? 'APPROVED' : 'REJECTED'
      });
      
      return {
        loan_id: loan.loan_id,
        customer_id: loan.customer_id,
        loan_amount: loan.loan_amount,
        interest_rate: loan.interest_rate,
        monthly_payment: loan.monthly_payment,
        tenure: loan.tenure,
        status: loan.status
      };
    } catch (error) {
      console.error('Error in createLoan:', error);
      throw error;
    }
  }
  
  /**
   * Get loan by ID
   * @param {Number} loanId - Loan ID
   * @returns {Object} - Loan details
   */
  static async getLoanById(loanId) {
    try {
      const loan = await Loan.findByPk(loanId, {
        include: [
          {
            model: Customer,
            attributes: ['customer_id', 'first_name', 'last_name']
          }
        ]
      });
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      return loan;
    } catch (error) {
      console.error('Error in getLoanById:', error);
      throw error;
    }
  }
  
  /**
   * Get all loans for a customer
   * @param {Number} customerId - Customer ID
   * @returns {Array} - Array of loans
   */
  static async getCustomerLoans(customerId) {
    try {
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      const loans = await Loan.findAll({
        where: { customer_id: customerId },
        order: [['created_at', 'DESC']]
      });
      
      return loans;
    } catch (error) {
      console.error('Error in getCustomerLoans:', error);
      throw error;
    }
  }
}

module.exports = LoanService;