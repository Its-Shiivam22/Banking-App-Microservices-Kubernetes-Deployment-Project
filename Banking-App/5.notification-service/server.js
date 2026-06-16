const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3004;

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
      console.log("Notification Service connected to MySQL database successfully");
      return;
    } catch (error) {
      lastError = error;
      console.log(`DB connection attempt ${attempt}/20 failed: ${error.message}`);
      await sleep(5000);
    }
  }

  throw lastError;
}

app.get("/notifications/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      service: "notification-service",
      status: "running",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      service: "notification-service",
      status: "running",
      database: "disconnected",
      error: error.message
    });
  }
});

app.get("/notifications/list", async (req, res) => {
  const customerId = req.query.customerId || "SHIVAM001";

  try {
    const [rows] = await pool.execute(
      `SELECT message
       FROM notifications
       WHERE customer_id = ?
       ORDER BY created_at DESC, id DESC`,
      [customerId]
    );

    return res.json({
      notifications: rows.map((row) => ({
        message: row.message
      }))
    });
  } catch (error) {
    console.error("Notification DB error:", error);
    return res.status(500).json({
      message: "Database error while loading notifications",
      error: error.message
    });
  }
});

initDBWithRetry()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Notification Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect notification-service to database:", error);
    process.exit(1);
  });
