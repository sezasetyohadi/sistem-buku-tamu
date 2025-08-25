-- Updated Database setup for Sistem Buku Tamu
-- Synced with current disnaker.sql structure

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
  failed_attempts int(11) DEFAULT 0,
  locked_until datetime DEFAULT NULL,
  last_failed_attempt datetime DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for target departments
CREATE TABLE IF NOT EXISTS bidang_tujuan (
  id int(11) NOT NULL AUTO_INCREMENT,
  bidang varchar(100) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for guest registry with updated fields
CREATE TABLE IF NOT EXISTS daftar_tamu (
  id int(11) NOT NULL AUTO_INCREMENT,
  email varchar(100) DEFAULT NULL,
  nama varchar(100) NOT NULL,
  nomor_telp varchar(20) DEFAULT NULL,
  alamat text DEFAULT NULL,
  jenis_kelamin enum('Laki-laki','Perempuan') NOT NULL,
  pendidikan_terakhir_id int(11) DEFAULT NULL,
  profesi_id int(11) DEFAULT NULL,
  asal_instansi varchar(100) DEFAULT NULL,
  keperluan text DEFAULT NULL,
  status enum('Menunggu','Datang','Selesai','Terjadwal') DEFAULT 'Menunggu',
  bidang_tujuan_id int(11) DEFAULT NULL,
  tujuan_kunjungan_id int(11) DEFAULT NULL,
  file_upload varchar(255) DEFAULT NULL,
  waktu_dibuat datetime DEFAULT current_timestamp(),
  jadwal_checkin datetime DEFAULT NULL,
  waktu_checkin datetime DEFAULT NULL,
  waktu_checkout datetime DEFAULT NULL,
  jadwal_dibuat datetime DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_tamu_waktu_checkout (waktu_checkout),
  KEY fk_tamu_pendidikan (pendidikan_terakhir_id),
  KEY fk_tamu_profesi (profesi_id),
  KEY fk_tamu_bidang (bidang_tujuan_id),
  KEY fk_tamu_tujuan (tujuan_kunjungan_id),
  CONSTRAINT fk_tamu_pendidikan FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir (id) ON DELETE SET NULL,
  CONSTRAINT fk_tamu_profesi FOREIGN KEY (profesi_id) REFERENCES profesi (id) ON DELETE SET NULL,
  CONSTRAINT fk_tamu_bidang FOREIGN KEY (bidang_tujuan_id) REFERENCES bidang_tujuan (id) ON DELETE SET NULL,
  CONSTRAINT fk_tamu_tujuan FOREIGN KEY (tujuan_kunjungan_id) REFERENCES tujuan_kunjungan (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for survey questions with baris and kolom fields
CREATE TABLE IF NOT EXISTS pertanyaan_survei (
  id int(11) NOT NULL AUTO_INCREMENT,
  section_id int(11) DEFAULT NULL,
  urutan int(11) DEFAULT 1,
  pertanyaan text NOT NULL,
  jenis_rating_id int(11) DEFAULT NULL,
  is_aktif tinyint(1) DEFAULT 1,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  baris int(11) DEFAULT 1,
  kolom int(11) DEFAULT 1,
  PRIMARY KEY (id),
  KEY section_id (section_id),
  KEY fk_jenis_rating (jenis_rating_id),
  CONSTRAINT pertanyaan_survei_ibfk_1 FOREIGN KEY (section_id) REFERENCES section_survei (id) ON DELETE SET NULL,
  CONSTRAINT fk_jenis_rating FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for question-rating association
CREATE TABLE IF NOT EXISTS pertanyaan_s_jenis_rating (
  id int(11) NOT NULL AUTO_INCREMENT,
  pertanyaan_id int(11) NOT NULL,
  jenis_rating_id int(11) NOT NULL,
  urutan int(11) DEFAULT 1,
  is_required tinyint(1) DEFAULT 1,
  PRIMARY KEY (id),
  KEY pertanyaan_id (pertanyaan_id),
  KEY jenis_rating_id (jenis_rating_id),
  CONSTRAINT fk_ps_pertanyaan FOREIGN KEY (pertanyaan_id) REFERENCES pertanyaan_survei (id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_jenis_rating FOREIGN KEY (jenis_rating_id) REFERENCES jenis_rating (id) ON DELETE CASCADE
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

-- Table for survey sections
CREATE TABLE IF NOT EXISTS section_survei (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_section varchar(255) NOT NULL,
  urutan int(11) DEFAULT 1,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for rating types with tipe field
CREATE TABLE IF NOT EXISTS jenis_rating (
  id int(11) NOT NULL AUTO_INCREMENT,
  tipe enum('rating','text') NOT NULL DEFAULT 'rating',
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

-- Table for survey respondent identity
CREATE TABLE IF NOT EXISTS jawaban_identitas_survei (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_lengkap varchar(100) DEFAULT NULL,
  jenis_kelamin enum('Laki-laki','Perempuan') DEFAULT NULL,
  pendidikan_terakhir_id int(11) DEFAULT NULL,
  profesi_id int(11) DEFAULT NULL,
  instansi varchar(100) DEFAULT NULL,
  jenis_layanan_id int(11) DEFAULT NULL,
  saran text DEFAULT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_tujuan_responden (jenis_layanan_id),
  CONSTRAINT fk_pendidikan_responden FOREIGN KEY (pendidikan_terakhir_id) REFERENCES pendidikan_terakhir (id) ON DELETE SET NULL,
  CONSTRAINT fk_profesi_responden FOREIGN KEY (profesi_id) REFERENCES profesi (id) ON DELETE SET NULL
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

-- Table for login attempts
CREATE TABLE IF NOT EXISTS login_attempts (
  id int(11) NOT NULL AUTO_INCREMENT,
  username varchar(50) DEFAULT NULL,
  ip_address varchar(50) DEFAULT NULL,
  user_agent text DEFAULT NULL,
  success tinyint(1) DEFAULT NULL,
  failure_reason varchar(255) DEFAULT NULL,
  attempt_time timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for account unlock logs
CREATE TABLE IF NOT EXISTS unlock_log (
  id int(11) NOT NULL AUTO_INCREMENT,
  admin_id int(11) DEFAULT NULL,
  admin_username varchar(50) DEFAULT NULL,
  unlocked_by int(11) DEFAULT NULL,
  unlock_time timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_unlocked_admin (admin_id),
  KEY fk_unlocked_by (unlocked_by),
  CONSTRAINT fk_unlocked_admin FOREIGN KEY (admin_id) REFERENCES admin (id) ON DELETE SET NULL,
  CONSTRAINT fk_unlocked_by FOREIGN KEY (unlocked_by) REFERENCES admin (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for guest tokens
CREATE TABLE IF NOT EXISTS tamu_token (
  id int(11) NOT NULL AUTO_INCREMENT,
  tamu_id int(11) NOT NULL,
  token varchar(255) NOT NULL,
  tipe enum('verifikasi','reset') NOT NULL DEFAULT 'verifikasi',
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_token_tamu (tamu_id),
  CONSTRAINT fk_token_tamu FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for memperoleh informasi options
CREATE TABLE IF NOT EXISTS memperoleh_informasi (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_opsi varchar(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for mendapatkan salinan options
CREATE TABLE IF NOT EXISTS mendapatkan_salinan (
  id int(11) NOT NULL AUTO_INCREMENT,
  nama_opsi varchar(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for jawaban memperoleh informasi
CREATE TABLE IF NOT EXISTS jawaban_memperoleh_informasi (
  id int(11) NOT NULL AUTO_INCREMENT,
  tamu_id int(11) NOT NULL,
  cara_memperoleh_id int(11) NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_jmi_tamu (tamu_id),
  KEY cara_memperoleh_id (cara_memperoleh_id),
  CONSTRAINT fk_jmi_tamu FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE,
  CONSTRAINT fk_jmi_cara FOREIGN KEY (cara_memperoleh_id) REFERENCES memperoleh_informasi (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table for jawaban mendapatkan salinan
CREATE TABLE IF NOT EXISTS jawaban_mendapatkan_salinan (
  id int(11) NOT NULL AUTO_INCREMENT,
  tamu_id int(11) NOT NULL,
  cara_salinan_id int(11) NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY fk_jms_tamu (tamu_id),
  KEY cara_salinan_id (cara_salinan_id),
  CONSTRAINT fk_jms_tamu FOREIGN KEY (tamu_id) REFERENCES daftar_tamu (id) ON DELETE CASCADE,
  CONSTRAINT fk_jms_cara FOREIGN KEY (cara_salinan_id) REFERENCES mendapatkan_salinan (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Triggers for guest status updates
DELIMITER $$

CREATE TRIGGER set_datang BEFORE UPDATE ON daftar_tamu
FOR EACH ROW
BEGIN
    IF NEW.waktu_checkin IS NOT NULL AND OLD.waktu_checkin IS NULL THEN
        SET NEW.status = 'Datang';
    END IF;
END$$

CREATE TRIGGER set_selesai BEFORE UPDATE ON daftar_tamu
FOR EACH ROW
BEGIN
    IF NEW.waktu_checkout IS NOT NULL AND OLD.waktu_checkout IS NULL THEN
        SET NEW.status = 'Selesai';
    END IF;
END$$

CREATE TRIGGER set_terjadwal BEFORE UPDATE ON daftar_tamu
FOR EACH ROW
BEGIN
    IF NEW.jadwal_checkin IS NOT NULL AND OLD.jadwal_checkin IS NULL THEN
        SET NEW.status = 'Terjadwal';
    END IF;
END$$

DELIMITER ;
