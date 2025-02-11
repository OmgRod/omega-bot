import pkg from 'pg';  // Import the entire pg module
const { Client: PgClient } = pkg;  // Destructure the Client from the module
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create and connect to PostgreSQL client
const pgClient = new PgClient({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432", 10),
});

pgClient.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL:", err);
  });

// Export pgClient to be used in other parts of the bot
export { pgClient };
