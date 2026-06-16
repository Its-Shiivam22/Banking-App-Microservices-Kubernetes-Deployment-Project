const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || "mysql-service",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "securebank_user",
  password: process.env.DB_PASSWORD || "SecureBank@123",
  database: process.env.DB_NAME || "securebankdb",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initDBWithRetry() {
  let lastError;

  for (let attempt = 1; attempt <= 20; attempt++) {
    try {
      pool = mysql.createPool(dbConfig);
      const connection = await pool.getConnection();
      await connection.ping();
      connection.release();
      console.log("Account Service connected to MySQL database successfully");
      return;
    } catch (error) {
      lastError = error;
      console.log(`DB connection attempt ${attempt}/20 failed: ${error.message}`);
      await sleep(5000);
    }
  }

  throw lastError;
}

app.get("/account/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      service: "account-service",
      status: "running",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      service: "account-service",
      status: "running",
      database: "disconnected",
      error: error.message
    });
  }
});

app.get("/account/summary", async (req, res) => {
  const customerId = req.query.customerId || "SHIVAM001";

  try {
    const [rows] = await pool.execute(
      `SELECT c.customer_id, c.full_name, a.account_number, a.account_type,
              a.balance, a.branch, a.ifsc
       FROM customers c
       JOIN accounts a ON c.customer_id = a.customer_id
       WHERE c.customer_id = ?`,
      [customerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Account not found"
      });
    }

    const account = rows[0];

    return res.json({
      customerId: account.customer_id,
      accountHolder: account.full_name,
      accountNumber: account.account_number,
      accountType: account.account_type,
      balance: `₹${Number(account.balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      branch: account.branch,
      ifsc: account.ifsc
    });
  } catch (error) {
    console.error("Account DB error:", error);
    return res.status(500).json({
      message: "Database error while loading account",
      error: error.message
    });
  }
});

initDBWithRetry()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Account Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect account-service to database:", error);
    process.exit(1);
  });
