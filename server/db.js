import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "luxemart_db",
  user: process.env.DB_USER || "luxemart_user",
  password: process.env.DB_PASSWORD || "luxemart_password"
});
