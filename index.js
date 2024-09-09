require('dotenv').config();
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const mongoose = require('mongoose');
const winston = require('winston');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Initialize Alchemy Web3
const web3 = createAlchemyWeb3(`https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Initialize Telegram bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

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
function connectToMongoDB() {
  mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      logger.info('Connected to MongoDB');
    })
    .catch((error) => {
      logger.error('MongoDB connection error:', error);
      setTimeout(connectToMongoDB, 5000); // Retry after 5 seconds
    });
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Attempting to reconnect...');
  connectToMongoDB();
});

// Function to track deposits
async function trackDeposits() {
  let lastCheckedBlock = await web3.eth.getBlockNumber();
  
  const checkNewBlocks = async () => {
    try {
      const latestBlock = await web3.eth.getBlockNumber();
      
      if (latestBlock > lastCheckedBlock) {
        for (let blockNumber = lastCheckedBlock + 1; blockNumber <= latestBlock; blockNumber++) {
          const block = await web3.eth.getBlock(blockNumber, true);
          for (const tx of block.transactions) {
            if (tx.to && tx.to.toLowerCase() === process.env.BEACON_DEPOSIT_CONTRACT.toLowerCase()) {
              await processDeposit(tx);
            }
          }
        }
        
        lastCheckedBlock = latestBlock;
      }
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND') {
        logger.error('Network error while checking for deposits:', error);
      } else if (error.response && error.response.status === 429) {
        logger.warn('API rate limit reached. Waiting before next request.');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
      } else {
        logger.error('Error checking for deposits:', error);
      }
    }
    
    setTimeout(checkNewBlocks, 5000); // Check every 5 seconds
  };

  checkNewBlocks();
  logger.info('Started tracking deposits');
}

async function processDeposit(log) {
  try {
    const transaction = await web3.eth.getTransaction(log.transactionHash);
    const block = await web3.eth.getBlock(log.blockNumber);
    const receipt = await web3.eth.getTransactionReceipt(log.transactionHash);

    // Process all logs in the transaction
    for (const eventLog of receipt.logs) {
      if (eventLog.address.toLowerCase() === process.env.BEACON_DEPOSIT_CONTRACT.toLowerCase()) {
        const deposit = new Deposit({
          blockNumber: log.blockNumber,
          blockTimestamp: block.timestamp,
          fee: transaction.gasPrice,
          hash: log.transactionHash,
          pubkey: '0x' + eventLog.data.slice(2, 98), // Extract pubkey from log data
        });

        await deposit.save();
        logger.info(`New deposit saved: ${deposit.hash}`);

        // Send Telegram notification
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `New deposit detected:\nHash: ${deposit.hash}\nAmount: ${web3.utils.fromWei(transaction.value, 'ether')} ETH`);
      }
    }
  } catch (error) {
    if (error.name === 'MongoNetworkError') {
      logger.error('MongoDB network error:', error);
      // Attempt to reconnect to MongoDB
      connectToMongoDB();
    } else if (error.response && error.response.status === 429) {
      logger.warn('API rate limit reached. Waiting before next request.');
      await new Promise(resolve => setTimeout(resolve, 60000)); // Wait for 1 minute
    } else {
      logger.error('Error processing deposit:', error);
    }
  }
}

// Start tracking deposits
connectToMongoDB();