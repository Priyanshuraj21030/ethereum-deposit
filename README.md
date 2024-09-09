# Ethereum Deposit Tracker

## Priyanshu Raj 21BSA10107 Luganodes Assignment

This project is an Ethereum Deposit Tracker that monitors and records ETH deposits on the Beacon Deposit Contract.

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Alchemy API key
- Telegram Bot Token

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Priyanshuraj21030/ethereum-deposit-assignment.git
   cd ethereum-deposit-tracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root and add the following environment variables:
   ```
   ALCHEMY_API_KEY=your_alchemy_api_key
   MONGODB_URI=your_mongodb_connection_string
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   TELEGRAM_CHAT_ID=your_telegram_chat_id
   BEACON_DEPOSIT_CONTRACT=0x00000000219ab540356cBB839Cbe05303d7705Fa
   ```

### Usage

To start the Ethereum Deposit Tracker:

```
node index.js

or

pm2 start index.js
```
 ( pm2 is a process manager for Node.js, which helps in automatically restarting applications when they crash or when you stop or restart your computer.)

The tracker will begin monitoring the Beacon Deposit Contract for new deposits. When a deposit is detected, it will be saved to the MongoDB database and a notification will be sent via Telegram.

### Features

- Real-time monitoring of ETH deposits
- MongoDB integration for data storage
- Error handling and logging
- Telegram notifications for new deposits

### Troubleshooting

If you encounter any issues:

1. Check the `error.log` and `combined.log` files for error messages and debugging information.
