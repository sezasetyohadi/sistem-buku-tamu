-- Database setup for Sistem Buku Tamu
-- Run this SQL script to create the required tables

CREATE DATABASE IF NOT EXISTS disnaker;
USE disnaker;

-- Table for admin users
CREATE TABLE IF NOT EXISTS admin (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) NOT NULL,
  password varchar(255) NOT NULL,
  nama_lengkap varchar(100) DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  email varchar(100) DEFAULT NULL,
  is_super_admin tinyint(1) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for target departments
CREATE TABLE IF NOT EXISTS bidang_tujuan (
  id int(11) NOT NULL AUTO_INCREMENT,
  bidang varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for guest registry
CREATE TABLE IF NOT EXISTS daftar_tamu (
  id int(11) NOT NULL AUTO_INCREMENT,
  email varchar(100) DEFAULT NULL,
  nama varchar(100) NOT NULL,
  nomor_telp varchar(20) DEFAULT NULL,
  alamat text DEFAULT NULL,
  jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
  pendidikan_terakhir varchar(100) DEFAULT NULL,
  profesi varchar(100) DEFAULT NULL,
  asal_instansi varchar(100) DEFAULT NULL,
  keperluan text DEFAULT NULL,
  tanggapan enum('Check-in','Check-out','Menunggu') DEFAULT NULL,
  file_upload varchar(255) DEFAULT NULL,
  waktu_dibuat datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for survey sections
CREATE TABLE IF NOT EXISTS section_survei (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_section varchar(255) NOT NULL,
  urutan int(11) DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for survey questions
CREATE TABLE IF NOT EXISTS pertanyaan_survei (
  id int(11) NOT NULL AUTO_INCREMENT,
  section_id int(11) DEFAULT NULL,
  urutan int(11) DEFAULT 1,
  pertanyaan text NOT NULL,
  tipe_jawaban enum('rating','teks') DEFAULT 'teks',
  is_aktif tinyint(1) DEFAULT 1,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY section_id (section_id),
  CONSTRAINT pertanyaan_survei_ibfk_1 FOREIGN KEY (section_id) REFERENCES section_survei (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for survey answers
CREATE TABLE IF NOT EXISTS jawaban_survei (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_lengkap varchar(100) NOT NULL,
  email varchar(100) NOT NULL,
  tanggal_kunjungan date NOT NULL,
  pertanyaan_id int(11) NOT NULL,
  jawaban int(11) NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  saran text DEFAULT NULL,
  PRIMARY KEY (id),
  KEY pertanyaan_id (pertanyaan_id),
  CONSTRAINT jawaban_survei_ibfk_1 FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for rating types
CREATE TABLE IF NOT EXISTS jenis_rating (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_rating varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for rating options
CREATE TABLE IF NOT EXISTS opsi_rating (
  id int(11) NOT NULL AUTO_INCREMENT,
  jenis_rating_id int(11) NOT NULL,
  skala_rating varchar(50) NOT NULL,
  urutan_rating int(11) NOT NULL,
  PRIMARY KEY (id),
  KEY jenis_rating_id (jenis_rating_id),
  CONSTRAINT opsi_rating_ibfk_1 FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for education level
CREATE TABLE IF NOT EXISTS pendidikan_terakhir (
  id int(11) NOT NULL AUTO_INCREMENT,
  pendidikan_terakhir varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for email messages
CREATE TABLE IF NOT EXISTS pesan_email (
  id int(11) NOT NULL AUTO_INCREMENT,
  admin_id int(11) NOT NULL,
  tamu_id int(11) NOT NULL,
  subjek varchar(255) NOT NULL,
  isi_pesan text NOT NULL,
  status_pengiriman enum('terkirim','gagal') DEFAULT NULL,
  waktu_kirim datetime DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY admin_id (admin_id),
  KEY tamu_id (tamu_id),
  CONSTRAINT pesan_email_ibfk_1 FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE CASCADE,
  CONSTRAINT pesan_email_ibfk_2 FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for professions
CREATE TABLE IF NOT EXISTS profesi (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_profesi varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for visit purposes
CREATE TABLE IF NOT EXISTS tujuan_kunjungan (
  id int(11) NOT NULL AUTO_INCREMENT,
  tujuan varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Default admin user (password: admin123)
INSERT INTO admin (username, password, nama_lengkap, email, is_super_admin) 
VALUES ('admin', '$2y$10$YourHashedPasswordHere', 'Super Admin', 'admin@disnaker.go.id', 1);

-- Default data for bidang_tujuan
INSERT INTO bidang_tujuan (bidang) VALUES
('Sekretariat'),
('Bidang Pelatihan Kerja'),
('Bidang Penempatan Tenaga Kerja'),
('Bidang Hubungan Industrial'),
('Bidang Norma Kerja'),
('Bidang Transmigrasi'),
('Kepala Dinas');

-- Default data for section_survei
INSERT INTO section_survei (nama_section, urutan) VALUES
('Section 1', 1),
('Section 2', 2),
('Section 3', 3),
('Section 4', 4),
('Section 5', 5);

-- Default data for pertanyaan_survei
INSERT INTO pertanyaan_survei (section_id, urutan, pertanyaan, tipe_jawaban, is_aktif) VALUES
(1, 1, 'Rating Keseluruhan', 'rating', 1),
(1, 2, 'Rating Pelayanan Staff', 'rating', 1),
(2, 1, 'Rating Fasilitas', 'rating', 1),
(2, 2, 'Rating Kecepatan Layanan', 'rating', 1),
(3, 1, 'Apakah Anda akan merekomendasikan pelayanan DISNAKERTRANS Jateng?', 'teks', 1),
(4, 1, 'Bagaimana penilaian Anda terhadap kecepatan pelayanan?', 'teks', 1),
(5, 1, 'Saran Perbaikan', 'teks', 1);

-- Default data for jenis_rating
INSERT INTO jenis_rating (nama_rating) VALUES
('Skala 5'),
('Skala 3');

-- Default data for opsi_rating
INSERT INTO opsi_rating (jenis_rating_id, skala_rating, urutan_rating) VALUES
(1, 'Sangat Baik', 1),
(1, 'Baik', 2),
(1, 'Cukup', 3),
(1, 'Kurang', 4),
(1, 'Sangat Kurang', 5),
(2, 'Memuaskan', 1),
(2, 'Cukup', 2),
(2, 'Kurang Memuaskan', 3);

-- Default data for pendidikan_terakhir
INSERT INTO pendidikan_terakhir (pendidikan_terakhir) VALUES
('Tidak Sekolah'),
('SD / Sederajat'),
('SMP / Sederajat'),
('SMA / Sederajat'),
('Diploma'),
('Sarjana'),
('Pascasarjana');

-- Default data for profesi
INSERT INTO profesi (nama_profesi) VALUES
('PNS'),
('Wiraswasta'),
('Karyawan Swasta'),
('Guru/Dosen'),
('TNI/Polri'),
('Dokter/Nakes'),
('Petani'),
('Buruh'),
('Pengacara'),
('Konsultan'),
('Pelajar/Mahasiswa'),
('Tidak Bekerja'),
('Lainnya');

-- Default data for tujuan_kunjungan
INSERT INTO tujuan_kunjungan (tujuan) VALUES
('Konsultasi Layanan'),
('Pengaduan/Keluhan'),
('Pengajuan Permohonan'),
('Mencari Informasi'),
('Meeting/Rapat'),
('Survey/Penelitian');
