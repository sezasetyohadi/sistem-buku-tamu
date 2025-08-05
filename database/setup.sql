-- Database setup for Sistem Buku Tamu
-- Run this SQL script to create the required tables

CREATE DATABASE IF NOT EXISTS disnaker;
USE disnaker;

-- Tabel untuk daftar tamu
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
);

-- Tabel untuk admin
CREATE TABLE IF NOT EXISTS admin (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100),
  email VARCHAR(100),
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk pertanyaan survei
CREATE TABLE IF NOT EXISTS pertanyaan_survei (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pertanyaan TEXT NOT NULL,
  is_aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk opsi jawaban
CREATE TABLE IF NOT EXISTS opsi_jawaban (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pertanyaan_id INT NOT NULL,
  isi_opsi VARCHAR(255) NOT NULL,
  urutan INT DEFAULT 1,
  FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei(id) ON DELETE CASCADE
);

-- Tabel untuk jawaban survei
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
  FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei(id) ON DELETE CASCADE
);

-- Tabel untuk pendidikan terakhir (lookup table)
CREATE TABLE IF NOT EXISTS pendidikan_terakhir (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pendidikan_terakhir VARCHAR(50) NOT NULL UNIQUE
);

-- Tabel untuk profesi (lookup table)
CREATE TABLE IF NOT EXISTS profesi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_profesi VARCHAR(100) NOT NULL UNIQUE
);

-- Insert default data for pendidikan
INSERT IGNORE INTO pendidikan_terakhir (pendidikan_terakhir) VALUES
('SD'),
('SMP'),
('SMA/SMK'),
('D1'),
('D2'),
('D3'),
('S1'),
('S2'),
('S3');

-- Insert default data for profesi
INSERT IGNORE INTO profesi (nama_profesi) VALUES
('Pelajar/Mahasiswa'),
('PNS'),
('TNI/Polri'),
('Pegawai Swasta'),
('Wiraswasta'),
('Petani'),
('Buruh'),
('Guru/Dosen'),
('Dokter'),
('Pengacara'),
('Konsultan'),
('Lainnya');

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO admin (username, password, nama_lengkap, email, is_super_admin) VALUES
('admin', '$2a$10$YourHashedPasswordHere', 'Super Admin', 'admin@disnaker.go.id', TRUE);

-- Insert default survey questions
INSERT IGNORE INTO pertanyaan_survei (pertanyaan, is_aktif) VALUES
('Bagaimana tingkat kepuasan Anda terhadap pelayanan yang diberikan?', TRUE),
('Bagaimana tingkat kepuasan Anda terhadap fasilitas yang tersedia?', TRUE),
('Bagaimana tingkat kepuasan Anda terhadap kinerja petugas?', TRUE),
('Secara keseluruhan, bagaimana penilaian Anda terhadap kantor ini?', TRUE);

-- Insert default survey options
INSERT IGNORE INTO opsi_jawaban (pertanyaan_id, isi_opsi, urutan) VALUES
(1, 'Sangat Tidak Puas', 1),
(1, 'Tidak Puas', 2),
(1, 'Cukup Puas', 3),
(1, 'Puas', 4),
(1, 'Sangat Puas', 5),
(2, 'Sangat Tidak Puas', 1),
(2, 'Tidak Puas', 2),
(2, 'Cukup Puas', 3),
(2, 'Puas', 4),
(2, 'Sangat Puas', 5),
(3, 'Sangat Tidak Puas', 1),
(3, 'Tidak Puas', 2),
(3, 'Cukup Puas', 3),
(3, 'Puas', 4),
(3, 'Sangat Puas', 5),
(4, 'Sangat Tidak Puas', 1),
(4, 'Tidak Puas', 2),
(4, 'Cukup Puas', 3),
(4, 'Puas', 4),
(4, 'Sangat Puas', 5);

-- Insert sample data for testing
INSERT IGNORE INTO daftar_tamu (nama, email, alamat, jenis_kelamin, pendidikan_terakhir, profesi, asal_instansi, keperluan, tanggal_kunjungan) VALUES
('John Doe', 'john@example.com', 'Jl. Contoh No. 123', 'Laki-laki', 'S1', 'Software Developer', 'PT. Teknologi Maju', 'Konsultasi pengembangan sistem', CURDATE()),
('Jane Smith', 'jane@example.com', 'Jl. Sample No. 456', 'Perempuan', 'S2', 'Data Analyst', 'CV. Data Prima', 'Presentasi proposal kerjasama', CURDATE()),
('Ahmad Rahman', 'ahmad@example.com', 'Jl. Test No. 789', 'Laki-laki', 'S1', 'Marketing Manager', 'PT. Sukses Bersama', 'Permohonan informasi program', CURDATE());
