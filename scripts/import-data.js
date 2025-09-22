const xlsx = require('xlsx');
const path = require('path');
const { sequelize } = require('../src/config/database');
const { Customer, Loan } = require('../src/models');

// Calculate approved limit based on monthly income
const calculateApprovedLimit = (monthlyIncome) => {
  // Approved limit is typically 36 times of monthly income
  return parseFloat(monthlyIncome) * 36;
};

// Import customer data from Excel
const importCustomerData = async () => {
  try {
    const filePath = path.join(__dirname, '../other/customer_data.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log('Importing customer data...');
    
    for (const customer of data) {
      // Use the correct field names from Excel
      await Customer.create({
        customer_id: customer['Customer ID'],
        first_name: customer['First Name'],
        last_name: customer['Last Name'],
        age: customer['Age'],
        phone_number: customer['Phone Number'].toString(),
        monthly_income: customer['Monthly Salary'],
        approved_limit: customer['Approved Limit'] || calculateApprovedLimit(customer['Monthly Salary'])
      });
    }
    
    console.log(`Imported ${data.length} customers successfully.`);
    return data.length;
  } catch (error) {
    console.error('Error importing customer data:', error);
    throw error;
  }
};

// Import loan data from Excel
const importLoanData = async () => {
  try {
    const filePath = path.join(__dirname, '../other/loan_data.xlsx');
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log('Importing loan data...');
    
    // Track unique loan IDs to avoid duplicates
    const processedLoanIds = new Set();
    let importCount = 0;
    
    for (const loan of data) {
      const loanId = loan['Loan ID'];
      
      // Skip if we've already processed this loan ID
      if (processedLoanIds.has(loanId)) {
        console.log(`Skipping duplicate loan ID: ${loanId}`);
        continue;
      }
      
      processedLoanIds.add(loanId);
      
      // Convert Excel date number to JavaScript Date object
      const startDate = xlsx.SSF.parse_date_code(loan['Date of Approval']);
      const endDate = xlsx.SSF.parse_date_code(loan['End Date']);
      
      if (!startDate || !endDate) {
        console.log(`Skipping loan ID ${loanId} due to invalid date format`);
        continue;
      }
      
      const start = new Date(startDate.y, startDate.m - 1, startDate.d);
      const end = new Date(endDate.y, endDate.m - 1, endDate.d);
      
      try {
        await Loan.create({
          loan_id: loanId,
          customer_id: loan['Customer ID'],
          loan_amount: loan['Loan Amount'],
          interest_rate: loan['Interest Rate'],
          tenure: loan['Tenure'],
          monthly_payment: loan['Monthly payment'],
          emis_paid_on_time: loan['EMIs paid on Time'],
          start_date: start,
          end_date: end,
          status: 'APPROVED' // Default status for existing loans
        });
        importCount++;
      } catch (err) {
        console.error(`Error importing loan ID ${loanId}:`, err.message);
      }
    }
    
    console.log(`Successfully imported ${importCount} loans out of ${data.length}.`);
    return importCount;
  } catch (error) {
    console.error('Error importing loan data:', error);
    throw error;
  }
};

// Main import function
const importAllData = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');
    
    await importCustomerData();
    await importLoanData();
    
    console.log('All data imported successfully.');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    process.exit();
  }
};

// Run the import if called directly
if (require.main === module) {
  importAllData();
}

module.exports = {
  importCustomerData,
  importLoanData,
  importAllData
};