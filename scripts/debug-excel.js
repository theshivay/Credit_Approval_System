const xlsx = require('xlsx');
const path = require('path');

function debugExcelFile(filePath) {
  try {
    console.log(`Reading file: ${filePath}`);
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    console.log(`Sheet name: ${sheetName}`);
    
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    
    console.log(`Total rows: ${data.length}`);
    
    // Print column headers
    if (data.length > 0) {
      console.log('Column headers:');
      console.log(Object.keys(data[0]));
      
      // Print first row as sample
      console.log('\nSample data (first row):');
      console.log(data[0]);
    }
    
    return data;
  } catch (error) {
    console.error(`Error reading Excel file: ${error.message}`);
    return [];
  }
}

// Debug customer data
console.log('\n======= CUSTOMER DATA =======\n');
const customerData = debugExcelFile(path.join(__dirname, '../other/customer_data.xlsx'));

// Debug loan data
console.log('\n======= LOAN DATA =======\n');
const loanData = debugExcelFile(path.join(__dirname, '../other/loan_data.xlsx'));