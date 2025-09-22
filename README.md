# Credit Approval System

A RESTful API for a credit approval system built with Node.js, Express, and SQLite.

## Features

- Customer registration and management
- Credit scoring and eligibility checking
- Loan application processing
- Loan status tracking
- Data analytics and reporting

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Embedded database
- **Sequelize** - ORM for database operations
- **XLSX** - For Excel file processing

## Prerequisites

- Node.js (v14 or higher)

## Getting Started

### Installation

1. Clone the repository
```bash
git clone https://github.com/theshivay/Credit_Approval_System.git
cd Credit_Approval_System
```

2. Install dependencies (Note: You'll need to have npm installed)
```bash
npm install
```

3. Configure environment variables
```bash
# Copy .env file
cp .env
# Edit the .env file with your configuration preferences
```

### Database Setup

The application uses SQLite, which is a file-based database that doesn't require a separate server installation. The database file will be created automatically when you run the import script.

1. Import data from Excel files
```bash
# Make sure your PATH includes Node.js binaries (For MacOS)
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
node scripts/import-data.js
```

### Running the Application

```bash
# Make sure your PATH includes Node.js binaries (For MacOS)
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Customer API

- **POST /api/customers/register** - Register a new customer
- **GET /api/customers/:id** - Get customer details by ID

### Loan API

- **POST /api/loans/check-eligibility** - Check loan eligibility
- **POST /api/loans/create** - Create a new loan application
- **GET /api/loans/:id** - Get loan details by ID
- **GET /api/loans/customer/:customer_id** - Get all loans for a customer

## Credit Score Calculation

The credit score is calculated based on several factors:

1. **Base Score**: Everyone starts with a base score of 50 points

2. **For Customers with No Loan History**:
   - Additional points calculated based on income: `Min(monthly_income / 10000 * 10, 30)`
   - Maximum additional points from income is 30

3. **For Customers with Loan History**:
   - **Payment History** (up to 30 points):
     - Calculated as ratio of on-time EMI payments to total EMIs
     - This ratio is multiplied by 30 to determine points awarded
   
   - **Loan Volume History** (up to 10 points):
     - 10 bonus points for customers with 5+ loans in their history
     - 5 bonus points for customers with 3-4 loans in their history
   
   - **Active Loans and Debt Burden** (between -20 and +10 points):
     - Debt-to-income ratio calculated (total EMIs ÷ monthly income)
     - -20 points if ratio > 0.6 (spending over 60% of income on EMIs)
     - -10 points if ratio > 0.4 (spending over 40% of income on EMIs)
     - +10 bonus points if ratio < 0.2 (spending less than 20% of income on EMIs)

4. **Final Score**: Capped between 0 and 100, with higher scores indicating better creditworthiness

This credit score directly impacts loan eligibility and interest rates offered to customers.

## Project Structure

```
credit-approval-system/
├── files/                  # Demo video
├── src/
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middlewares
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── app.js              # Express app
├── scripts/                # Scripts for data import, etc.
├── credit_approval.sqlite  # SQLite database file
├── .env                    # Environment variables
└── README.md               # Project documentation
```

## Troubleshooting

If you encounter issues running the application, here are some common solutions:

1. **Node.js not found**: Make sure Node.js is in your PATH:
   ```bash
   export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"
   ```

2. **Database sync errors**: If you see database sync errors, make sure to start the server with the modified configuration that skips table synchronization:
   ```javascript
   // Modified in app.js to avoid database sync errors
   await testConnection();
   console.log('Database connection verified, skipping sync');
   ```

3. **Data import failures**: If the data import script fails, check that:
   - The Excel files are in the correct location (`other/customer_data.xlsx` and `other/loan_data.xlsx`)
   - You have write permissions in the project directory for the SQLite file

## Testing the API

Once the server is running, you can test the API endpoints using curl, Postman, or any API testing tool.

### Example API Requests

#### 1. Register a New Customer
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "first_name": "John",
  "last_name": "Doe",
  "age": 30,
  "phone_number": "9876543210",
  "monthly_income": 50000
}' http://localhost:3000/api/customers/register
```

#### 2. Get Customer Details
```bash
curl http://localhost:3000/api/customers/1
```

#### 3. Check Loan Eligibility
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "customer_id": 1,
  "loan_amount": 500000,
  "interest_rate": 8.5,
  "tenure": 36
}' http://localhost:3000/api/loans/check-eligibility
```

#### 4. Create a New Loan
```bash
curl -X POST -H "Content-Type: application/json" -d '{
  "customer_id": 1,
  "loan_amount": 10000,
  "interest_rate": 8,
  "tenure": 12
}' http://localhost:3000/api/loans/create
```

#### 5. Get Loan Status
```bash
curl http://localhost:3000/api/loans/5930
```