import pg from "pg";
import { config } from "../config/env";

// Create a connection pool
const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
});

// Test the connection
pool.query("SELECT NOW()", (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err);
  } else {
    console.log("Database connected successfully.");
  }
});

export { pool };