const { Customer, Loan, CreditScore } = require('../models');
const { Op } = require('sequelize');

class CreditService {
  /**
   * Calculate credit score based on past loans and payment history
   * @param {Object} customer - Customer object
   * @param {Array} loanHistory - Loan history array
   * @returns {Number} - Credit score between 0 and 100
   */
  static calculateCreditScore(customer, loanHistory) {
    let score = 50; // Base score
    
    // If no loan history, use basic score based on income
    if (!loanHistory || loanHistory.length === 0) {
      const incomeScore = Math.min(customer.monthly_income / 10000 * 10, 30);
      return Math.round(score + incomeScore);
    }
    
    // Factor 1: Previous loans paid on time
    const paidLoans = loanHistory.filter(loan => loan.status === 'PAID');
    if (paidLoans.length > 0) {
      const totalEMIs = paidLoans.reduce((sum, loan) => sum + loan.tenure, 0);
      const onTimeEMIs = paidLoans.reduce((sum, loan) => sum + loan.emis_paid_on_time, 0);
      
      const paymentRatio = onTimeEMIs / totalEMIs;
      score += Math.round(paymentRatio * 30); // Up to 30 points for on-time payments
    }
    
    // Factor 2: Loan volume history
    if (loanHistory.length >= 5) {
      score += 10; // Bonus for having loan history
    } else if (loanHistory.length >= 3) {
      score += 5;
    }
    
    // Factor 3: Active loans and debt
    const activeLoans = loanHistory.filter(loan => 
      loan.status === 'APPROVED' || loan.status === 'ACTIVE');
    
    if (activeLoans.length > 0) {
      const totalEMIs = activeLoans.reduce((sum, loan) => sum + loan.monthly_payment, 0);
      const debtToIncomeRatio = totalEMIs / customer.monthly_income;
      
      // Deduct points for high debt-to-income ratio
      if (debtToIncomeRatio > 0.6) score -= 20;
      else if (debtToIncomeRatio > 0.4) score -= 10;
      else if (debtToIncomeRatio < 0.2) score += 10; // Bonus for low debt ratio
    }
    
    // Cap the score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
  
  /**
   * Get or create credit score for a customer
   * @param {Number} customerId - Customer ID
   * @returns {Object} - Credit score object
   */
  static async getOrCreateCreditScore(customerId) {
    try {
      // Get customer
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Get existing score or calculate a new one
      let creditScore = await CreditScore.findOne({
        where: { customer_id: customerId }
      });
      
      if (!creditScore) {
        // Get loan history
        const loanHistory = await Loan.findAll({
          where: { customer_id: customerId }
        });
        
        // Calculate score
        const score = this.calculateCreditScore(customer, loanHistory);
        
        // Save new score
        creditScore = await CreditScore.create({
          customer_id: customerId,
          score
        });
      }
      
      return creditScore;
    } catch (error) {
      console.error('Error in getOrCreateCreditScore:', error);
      throw error;
    }
  }
  
  /**
   * Check loan eligibility and calculate interest rate
   * @param {Number} customerId - Customer ID
   * @param {Number} loanAmount - Requested loan amount
   * @param {Number} tenure - Loan tenure in months
   * @returns {Object} - Eligibility result
   */
  static async checkEligibility(customerId, loanAmount, tenure) {
    try {
      // Get customer
      const customer = await Customer.findByPk(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }
      
      // Get credit score
      const creditScoreData = await this.getOrCreateCreditScore(customerId);
      const creditScore = creditScoreData.score;
      
      // Get active loans
      const activeLoans = await Loan.findAll({
        where: {
          customer_id: customerId,
          status: { [Op.in]: ['APPROVED', 'ACTIVE'] }
        }
      });
      
      // Calculate current EMI obligations
      const currentEMIs = activeLoans.reduce((sum, loan) => sum + loan.monthly_payment, 0);
      
      // Calculate debt-to-income ratio
      const debtToIncomeRatio = currentEMIs / customer.monthly_income;
      
      // Check if loan amount is within approved limit
      const isWithinLimit = loanAmount <= customer.approved_limit;
      
      // Determine base interest rate based on credit score
      let interestRate;
      if (creditScore >= 80) {
        interestRate = 6;  // Excellent score
      } else if (creditScore >= 60) {
        interestRate = 8;  // Good score
      } else if (creditScore >= 40) {
        interestRate = 12; // Fair score
      } else {
        interestRate = 16; // Poor score
      }
      
      // Adjust interest rate based on debt ratio
      if (debtToIncomeRatio > 0.5) {
        interestRate += 2;
      }
      
      // Monthly payment calculation: PMT = P * r * (1+r)^n / ((1+r)^n - 1)
      const monthlyRate = interestRate / 12 / 100;
      const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / (Math.pow(1 + monthlyRate, tenure) - 1);
      
      // Check if customer can afford new EMI (typically <= 50% of income including current EMIs)
      const totalEMI = currentEMIs + monthlyPayment;
      const canAffordEMI = totalEMI / customer.monthly_income <= 0.5;
      
      // Determine approval likelihood based on multiple factors
      let approval_probability;
      if (isWithinLimit && canAffordEMI && creditScore >= 60) {
        approval_probability = 100;
      } else if (isWithinLimit && creditScore >= 50) {
        approval_probability = 80;
      } else if (isWithinLimit && canAffordEMI) {
        approval_probability = 60;
      } else if (isWithinLimit) {
        approval_probability = 30;
      } else {
        approval_probability = 0;
      }
      
      return {
        customer_id: customerId,
        credit_score: creditScore,
        approval: approval_probability >= 60,
        approval_probability,
        interest_rate: parseFloat(interestRate.toFixed(2)),
        corrected_interest_rate: parseFloat(interestRate.toFixed(2)),
        tenure,
        monthly_payment: parseFloat(monthlyPayment.toFixed(2))
      };
    } catch (error) {
      console.error('Error in checkEligibility:', error);
      throw error;
    }
  }
}

module.exports = CreditService;