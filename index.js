const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3000;


let transactionStore = {
    userSummaries: {},
    highestTransactionUser: null,
    invalidRecords: []
};


app.use(express.json());
app.use(cors());


const upload = multer({ dest: 'uploads/' });


const validateTransaction = (transaction) => {
    const requiredFields = ['TransactionID', 'UserID', 'Date', 'Amount', 'Transaction Type'];
    const missingFields = requiredFields.filter(field => !transaction[field]);
    
    if (missingFields.length > 0) {
        return { valid: false, error: `Missing fields: ${missingFields.join(', ')}` };
    }

    if (isNaN(parseFloat(transaction.Amount))) {
        return { valid: false, error: 'Invalid Amount' };
    }

    if (!['Credit', 'Debit'].includes(transaction['Transaction Type'])) {
        return { valid: false, error: 'Invalid Transaction Type' };
    }

    return { valid: true };
};


app.post('/analyze-transactions', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const results = [];
    const userTransactions = new Map();
    let invalidRecords = [];

    fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
            const validation = validateTransaction(data);
            if (validation.valid) {
                const amount = parseFloat(data.Amount);
                const userId = data.UserID;

                if (!userTransactions.has(userId)) {
                    userTransactions.set(userId, { credits: 0, debits: 0, total: 0 });
                }

                const userStats = userTransactions.get(userId);
                if (data['Transaction Type'] === 'Credit') {
                    userStats.credits += amount;
                } else {
                    userStats.debits += amount;
                }
                userStats.total += amount;
            } else {
                invalidRecords.push({ data, error: validation.error });
            }
        })
        .on('end', () => {
            
            fs.unlinkSync(req.file.path);

            
            let highestUser = null;
            let highestAmount = -Infinity;

            userTransactions.forEach((stats, userId) => {
                if (stats.total > highestAmount) {
                    highestAmount = stats.total;
                    highestUser = userId;
                }
            });

            
            const response = {
                userSummaries: Object.fromEntries(userTransactions),
                highestTransactionUser: {
                    userId: highestUser,
                    total: highestAmount
                },
                invalidRecords: invalidRecords
            };

            
            transactionStore = response;

            res.json(response);
        })
        .on('error', (error) => {
            fs.unlinkSync(req.file.path);
            res.status(500).json({ error: 'Error processing file' });
        });
});

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.get('/transactions', (req, res) => {
    if (!transactionStore.userSummaries || Object.keys(transactionStore.userSummaries).length === 0) {
        return res.status(404).json({ error: 'No transaction data available' });
    }
    res.json(transactionStore);
});

app.get('/transactions/user/:userId', (req, res) => {
    const userId = req.params.userId;
    if (!transactionStore.userSummaries || !transactionStore.userSummaries[userId]) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json(transactionStore.userSummaries[userId]);
});

app.get('/transactions/highest', (req, res) => {
    if (!transactionStore.highestTransactionUser) {
        return res.status(404).json({ error: 'No transaction data available' });
    }
    res.json(transactionStore.highestTransactionUser);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});