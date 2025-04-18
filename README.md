# Transaction Analysis API

A Node.js API service that processes and analyzes CSV transaction data, providing insights into user transaction patterns and summaries.

## Features

- CSV file upload and processing
- Transaction validation
- User-wise transaction summary
- Highest transaction user identification
- Invalid record tracking

## Prerequisites

- Node.js (v12 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository or download the source code
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```
   For development with auto-reload:
   ```bash
   npm run dev
   ```

2. The server will start on `http://localhost:3000`

## API Endpoints

### Upload and Analyze Transactions

```http
POST /analyze-transactions
```

- **Request**: Multipart form data with CSV file
- **Field name**: `file`
- **Response**: JSON object containing:
  - User transaction summaries
  - Highest transaction user
  - Invalid records (if any)

### Get All Transactions

```http
GET /transactions
```

- **Response**: JSON object containing all processed transaction data

## CSV File Format

The CSV file should contain the following columns:
- TransactionID
- UserID
- Date
- Amount
- Transaction Type (Credit/Debit)

## Dependencies

- express: Web framework
- multer: File upload handling
- csv-parser: CSV file processing
- cors: Cross-origin resource sharing

## Error Handling

The API includes validation for:
- Missing required fields
- Invalid amount formats
- Invalid transaction types
- Missing file uploads

## Testing

Use the provided `test-upload.js` script to test the API endpoints:
```bash
node test-upload.js
```