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
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeTables(): Promise<void> {
  const createGuestTable = `
    CREATE TABLE IF NOT EXISTS daftar_tamu (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      alamat TEXT,
      jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
      pendidikan_terakhir VARCHAR(50),
      profesi VARCHAR(100),
      asal_instansi VARCHAR(100),
      keperluan TEXT NOT NULL,
      tanggal_kunjungan DATE NOT NULL,
      waktu_kunjungan TIME DEFAULT NULL,
      tanggapan BOOLEAN DEFAULT FALSE,
      file_upload VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const createAdminTable = `
    CREATE TABLE IF NOT EXISTS admin (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      nama_lengkap VARCHAR(100),
      email VARCHAR(100),
      is_super_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createSurveyQuestionTable = `
    CREATE TABLE IF NOT EXISTS pertanyaan_survei (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pertanyaan TEXT NOT NULL,
      is_aktif BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createSurveyOptionTable = `
    CREATE TABLE IF NOT EXISTS opsi_jawaban (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pertanyaan_id INT NOT NULL,
      isi_opsi VARCHAR(255) NOT NULL,
      urutan INT DEFAULT 1,
      INDEX idx_pertanyaan_id (pertanyaan_id)
    )
  `;

  const createSurveyAnswerTable = `
    CREATE TABLE IF NOT EXISTS jawaban_survei (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_lengkap VARCHAR(100) NOT NULL,
      jenis_kelamin ENUM('Laki-laki', 'Perempuan') NOT NULL,
      pendidikan_terakhir VARCHAR(50),
      profesi VARCHAR(100),
      instansi VARCHAR(100),
      pertanyaan_id INT NOT NULL DEFAULT 1,
      jawaban INT NOT NULL CHECK (jawaban BETWEEN 1 AND 5),
      saran TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_pertanyaan_id (pertanyaan_id)
    )
  `;

  const createEducationTable = `
    CREATE TABLE IF NOT EXISTS pendidikan_terakhir (
      id INT AUTO_INCREMENT PRIMARY KEY,
      pendidikan_terakhir VARCHAR(50) NOT NULL UNIQUE
    )
  `;

  const createProfessionTable = `
    CREATE TABLE IF NOT EXISTS profesi (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama_profesi VARCHAR(100) NOT NULL UNIQUE
    )
  `;

  try {
    await executeQuery(createGuestTable);
    await executeQuery(createAdminTable);
    await executeQuery(createSurveyQuestionTable);
    await executeQuery(createSurveyOptionTable);
    await executeQuery(createSurveyAnswerTable);
    await executeQuery(createEducationTable);
    await executeQuery(createProfessionTable);
    
    // Insert default data
    await insertDefaultData();
    
    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

// Insert default data
export async function insertDefaultData(): Promise<void> {
  try {
    // Insert default education levels
    const educationLevels = ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'S1', 'S2', 'S3'];
    for (const level of educationLevels) {
      await executeQuery(
        'INSERT IGNORE INTO pendidikan_terakhir (pendidikan_terakhir) VALUES (?)',
        [level]
      );
    }

    // Insert default professions
    const professions = [
      'Pelajar/Mahasiswa', 'PNS', 'TNI/Polri', 'Pegawai Swasta', 'Wiraswasta',
      'Petani', 'Buruh', 'Guru/Dosen', 'Dokter', 'Pengacara', 'Konsultan', 'Lainnya'
    ];
    for (const profession of professions) {
      await executeQuery(
        'INSERT IGNORE INTO profesi (nama_profesi) VALUES (?)',
        [profession]
      );
    }

    // Check if pertanyaan_survei table has is_aktif column
    try {
      await executeQuery('SELECT is_aktif FROM pertanyaan_survei LIMIT 1');
      const hasIsAktif = true;
      
      // Insert default survey questions with is_aktif
      const questions = [
        'Bagaimana tingkat kepuasan Anda terhadap pelayanan yang diberikan?',
        'Bagaimana tingkat kepuasan Anda terhadap fasilitas yang tersedia?',
        'Bagaimana tingkat kepuasan Anda terhadap kinerja petugas?',
        'Secara keseluruhan, bagaimana penilaian Anda terhadap kantor ini?'
      ];
      
      for (const question of questions) {
        const result = await executeQuery(
          'INSERT IGNORE INTO pertanyaan_survei (pertanyaan, is_aktif) VALUES (?, TRUE)',
          [question]
        ) as any;
        
        // Insert options for each question
        if (result.insertId) {
          const options = [
            'Sangat Tidak Puas', 'Tidak Puas', 'Cukup Puas', 'Puas', 'Sangat Puas'
          ];
          
          for (let i = 0; i < options.length; i++) {
            await executeQuery(
              'INSERT IGNORE INTO opsi_jawaban (pertanyaan_id, isi_opsi, urutan) VALUES (?, ?, ?)',
              [result.insertId, options[i], i + 1]
            );
          }
        }
      }
    } catch (error) {
      // If is_aktif column doesn't exist, insert without it
      const questions = [
        'Bagaimana tingkat kepuasan Anda terhadap pelayanan yang diberikan?',
        'Bagaimana tingkat kepuasan Anda terhadap fasilitas yang tersedia?',
        'Bagaimana tingkat kepuasan Anda terhadap kinerja petugas?',
        'Secara keseluruhan, bagaimana penilaian Anda terhadap kantor ini?'
      ];
      
      for (const question of questions) {
        const result = await executeQuery(
          'INSERT IGNORE INTO pertanyaan_survei (pertanyaan) VALUES (?)',
          [question]
        ) as any;
        
        // Insert options for each question
        if (result.insertId) {
          const options = [
            'Sangat Tidak Puas', 'Tidak Puas', 'Cukup Puas', 'Puas', 'Sangat Puas'
          ];
          
          for (let i = 0; i < options.length; i++) {
            await executeQuery(
              'INSERT IGNORE INTO opsi_jawaban (pertanyaan_id, isi_opsi, urutan) VALUES (?, ?, ?)',
              [result.insertId, options[i], i + 1]
            );
          }
        }
      }
    }

    console.log('Default data inserted successfully');
  } catch (error) {
    console.error('Error inserting default data:', error);
  }
}