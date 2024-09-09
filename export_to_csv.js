require('dotenv').config();
const mongoose = require('mongoose');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cron = require('node-cron');

// MongoDB Schema
const depositSchema = new mongoose.Schema({
  blockNumber: Number,
  blockTimestamp: Number,
  fee: String,
  hash: String,
  pubkey: String,
});

const Deposit = mongoose.model('Deposit', depositSchema);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Function to export data to CSV
async function exportToCSV() {
  try {
    const deposits = await Deposit.find().sort({ blockTimestamp: -1 });

    const csvWriter = createCsvWriter({
      path: 'deposits.csv',
      header: [
        {id: 'blockNumber', title: 'Block Number'},
        {id: 'blockTimestamp', title: 'Timestamp'},
        {id: 'fee', title: 'Fee'},
        {id: 'hash', title: 'Transaction Hash'},
        {id: 'pubkey', title: 'Public Key'}
      ]
    });

    await csvWriter.writeRecords(deposits);
    console.log('CSV export completed successfully');
  } catch (error) {
    console.error('Error during CSV export:', error);
  }
}

// Schedule the export to run every hour
cron.schedule('0 * * * *', exportToCSV);

// Initial export
exportToCSV();