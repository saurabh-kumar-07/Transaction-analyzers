const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testTransactionAPI() {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream('sample-transactions.csv'));

        const response = await axios.post('http://localhost:3000/analyze-transactions', 
            form, 
            { headers: form.getHeaders() }
        );

        console.log('API Response:', JSON.stringify(response.data, null, 2));

        const { userSummaries, highestTransactionUser, invalidRecords } = response.data;
        console.log('\nValidation Results:');
        console.log('- User summaries present:', !!userSummaries);
        console.log('- Highest transaction user identified:', !!highestTransactionUser);
        console.log('- Invalid records tracking working:', Array.isArray(invalidRecords));

    } catch (error) {
        console.error('Error testing API:', error.message);
    }
}

testTransactionAPI();