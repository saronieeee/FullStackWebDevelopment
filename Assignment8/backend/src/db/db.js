/*
* Database client for PostgreSQL
*/
import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const {Pool} = pg;

// Use pools instead of clients for better performance with connection pooling
const pool = new Pool({
  host: 'localhost',
  database: 'test',
  port: 5432,
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
});

// Export the query function to be used by other modules
export default {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
};