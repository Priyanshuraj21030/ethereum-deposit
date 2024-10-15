# Ethereum Deposit Tracker

This project is an Ethereum Deposit Tracker that monitors and records ETH deposits on the Beacon Deposit Contract. It provides real-time tracking, data storage, API access, and CSV export functionality for integration with visualization tools like Grafana.

### Features

- Real-time monitoring of ETH deposits on the Beacon Deposit Contract
- MongoDB integration for persistent data storage
- RESTful API for data access
- Periodic CSV export for historical data analysis
- Telegram notifications for new deposits
- Comprehensive error handling and logging
- Grafana integration support

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Alchemy API key
- Telegram Bot Token
- PM2 (optional, for process management)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/Priyanshuraj21030/ethereum-deposit-assignment.git
   cd ethereum-deposit-assignment
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
   API_PORT=3001
   ```

### Usage

The project consists of three main components: the deposit tracker, the API server, and the CSV exporter. You can run these components individually or use PM2 to manage them together.

#### Running Components Individually

1. Start the Ethereum Deposit Tracker:
   ```
   node index.js
   ```

2. Start the API server:
   ```
   node api.js
   ```

3. Start the CSV exporter:
   ```
   node export_to_csv.js
   ```

### Grafana Integration

To visualize your data in Grafana:

1. Install Grafana and the necessary data source plugins (JSON API and CSV).

2. Start a simple HTTP server to serve your CSV file:
   ```
   npx http-server -p 8081
   ```
   This will serve files from your current directory, including `deposits.csv`.

3. Add two data sources in Grafana:
   
   a. JSON API Data Source:
      - Name: Ethereum Deposits API
      - URL: http://localhost:3001 (or your API server address)

   b. CSV Data Source:
      - Name: Ethereum Deposits CSV
      - URL: http://localhost:8081/deposits.csv

4. Create a new dashboard and add panels using these data sources.

   For the CSV data source, use the URL http://localhost:8081/deposits.csv when configuring the data source in Grafana.

5. Create panels for various metrics:
   - Total Deposits (using API)
   - Latest Deposits (using API)
   - Total ETH Deposited (using API)
   - Deposits Over Time (using CSV)

Remember to keep both your API server and the HTTP server for the CSV file running alongside your main application for Grafana to access the latest data.
