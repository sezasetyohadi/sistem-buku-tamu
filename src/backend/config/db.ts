import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'disnaker',
  port: Number(process.env.DB_PORT) || 3306,
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Function to get a database connection
export async function getConnection() {
  try {
    const connection = await pool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}

// Execute a query with optional parameters
export async function executeQuery<T>(
  query: string, 
  params: any[] = []
): Promise<T> {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.query(query, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Test the database connection
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection();
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    return false;
  }
}

export default {
  getConnection,
  executeQuery,
  testConnection,
};
