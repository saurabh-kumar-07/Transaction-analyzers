const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testTransactionAPI() {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream('sample-transactions.csv'));

        console.log('Uploading CSV file...');
        const uploadResponse = await axios.post('http://localhost:3000/analyze-transactions', formData, {
            headers: formData.getHeaders()
        });
        console.log('Upload successful!');
        console.log('Upload response:', JSON.stringify(uploadResponse.data, null, 2));

        console.log('\nFetching all transactions...');
        const allTransactions = await axios.get('http://localhost:3000/transactions');
        console.log('All transactions:', JSON.stringify(allTransactions.data, null, 2));

    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testTransactionAPI();