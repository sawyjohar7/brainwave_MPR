// db.js
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  ssl: { rejectUnauthorized: false }// ✅ changed here only
});

async function main() {
  try {
    await client.connect();
    console.log("✅ Connected to the PostgreSQL database successfully!");
  } catch (err) {
    console.error("❌ Database connection error:", err);
  }
}

main();

module.exports = client;
