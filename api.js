require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Schema (make sure this matches your schema in index.js)
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
  .then(() => console.log('API: Connected to MongoDB'))
  .catch((error) => console.error('API: MongoDB connection error:', error));

// Root path
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to the Ethereum Deposit Tracker API",
    endpoints: [
      { path: "/deposits", description: "Get the latest 100 deposits" },
      { path: "/deposits/count", description: "Get the total number of deposits" },
      { path: "/deposits/total-eth", description: "Get the total amount of ETH deposited" }
    ]
  });
});

// API endpoints
app.get('/deposits', async (req, res) => {
  try {
    const deposits = await Deposit.find().sort({ blockTimestamp: -1 }).limit(100);
    res.json(deposits);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching deposits' });
  }
});

app.get('/deposits/count', async (req, res) => {
  try {
    const count = await Deposit.countDocuments();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while counting deposits' });
  }
});

app.get('/deposits/total-eth', async (req, res) => {
  try {
    const result = await Deposit.aggregate([
      {
        $group: {
          _id: null,
          totalEth: { $sum: { $toDouble: "$fee" } }
        }
      }
    ]);
    const totalEth = result[0] ? result[0].totalEth : 0;
    res.json({ totalEth });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while calculating total ETH' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.API_PORT || 3001;
app.listen(PORT, () => console.log(`API server running on port ${PORT}`));