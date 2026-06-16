const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3001;

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
      console.log("Auth Service connected to MySQL database successfully");
      return;
    } catch (error) {
      lastError = error;
      console.log(`DB connection attempt ${attempt}/20 failed: ${error.message}`);
      await sleep(5000);
    }
  }

  throw lastError;
}

app.get("/auth/health", async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    res.json({
      service: "auth-service",
      status: "running",
      database: "connected"
    });
  } catch (error) {
    res.status(500).json({
      service: "auth-service",
      status: "running",
      database: "disconnected",
      error: error.message
    });
  }
});

app.post("/auth/login", async (req, res) => {
  const { customerId, password } = req.body;

  if (!customerId || !password) {
    return res.status(400).json({
      message: "Customer ID and password are required"
    });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT customer_id, full_name
       FROM customers
       WHERE customer_id = ? AND password = ? AND active = TRUE`,
      [customerId, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid Customer ID or Password"
      });
    }

    const customer = rows[0];

    return res.json({
      message: `Login successful. Welcome ${customer.full_name}.`,
      customerId: customer.customer_id,
      fullName: customer.full_name,
      token: "secure-db-demo-token"
    });
  } catch (error) {
    console.error("Login DB error:", error);
    return res.status(500).json({
      message: "Database error during login",
      error: error.message
    });
  }
});

initDBWithRetry()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect auth-service to database:", error);
    process.exit(1);
  });
