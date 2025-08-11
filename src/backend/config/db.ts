import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
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
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// NOTE: Table creation and data insertion have been removed
// as they are now handled by migrations and seeds

// Get education options
export async function getEducationOptions(): Promise<Array<{ id: number, pendidikan_terakhir: string }>> {
  try {
    const options = await executeQuery<Array<{ id: number, pendidikan_terakhir: string }>>(
      'SELECT id, pendidikan_terakhir FROM pendidikan_terakhir ORDER BY id ASC'
    );
    return options;
  } catch (error) {
    console.error('Error getting education options:', error);
    return [];
  }
}

// Get profession options
export async function getProfessionOptions(): Promise<Array<{ id: number, nama_profesi: string }>> {
  try {
    const options = await executeQuery<Array<{ id: number, nama_profesi: string }>>(
      'SELECT id, nama_profesi FROM profesi ORDER BY id ASC'
    );
    return options;
  } catch (error) {
    console.error('Error getting profession options:', error);
    return [];
  }
}

// Get tujuan kunjungan options
export async function getTujuanKunjunganOptions(): Promise<Array<{ id: number, tujuan: string }>> {
  try {
    const options = await executeQuery<Array<{ id: number, tujuan: string }>>(
      'SELECT id, tujuan FROM tujuan_kunjungan ORDER BY id ASC'
    );
    return options;
  } catch (error) {
    console.error('Error getting tujuan kunjungan options:', error);
    return [];
  }
}

// Get bidang tujuan options
export async function getBidangTujuanOptions(): Promise<Array<{ id: number, bidang: string }>> {
  try {
    const options = await executeQuery<Array<{ id: number, bidang: string }>>(
      'SELECT id, bidang FROM bidang_tujuan ORDER BY id ASC'
    );
    return options;
  } catch (error) {
    console.error('Error getting bidang tujuan options:', error);
    return [];
  }
}