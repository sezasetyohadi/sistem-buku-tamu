-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 01, 2025 at 08:57 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `disnaker`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(100) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `is_super_admin` tinyint(1) DEFAULT NULL,
  `failed_attempts` int(11) DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `last_failed_attempt` datetime DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `username`, `password`, `nama_lengkap`, `created_at`, `email`, `profile_picture`, `is_super_admin`, `failed_attempts`, `locked_until`, `last_failed_attempt`, `updated_at`) VALUES
(1, 'dummy123', '$2a$12$C3.v1OZGhB8FPXyarqZPaub/gnFx.0aKAZ6TcZ7hgbfOtR/KIzJnO', 'Admin Dummy', '2025-08-04 08:59:20', 'dummy@example.com', NULL, 1, 1, NULL, '2025-08-26 14:45:43', NULL),
(2, 'admin', '$2a$12$CFnCVYuKNc9IuadesOcV1OVTeagSs.8ZCcltzuH4bXo4Vg4oY2Vku', 'Nimda Admin', '2025-08-26 06:25:10', 'Nimda.admin@example.com', '/uploads/profiles/admin_2_1756435080789.jpg', 0, 0, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bidang_tujuan`
--

CREATE TABLE `bidang_tujuan` (
  `id` int(11) NOT NULL,
  `bidang` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bidang_tujuan`
--

INSERT INTO `bidang_tujuan` (`id`, `bidang`) VALUES
(1, 'Sekretariat'),
(2, 'Bidang Pelatihan Kerja'),
(3, 'Bidang Penempatan Tenaga Kerja'),
(4, 'Bidang Hubungan Industrial'),
(5, 'Bidang Norma Kerja'),
(6, 'Bidang Transmigrasi'),
(7, 'Kepala Dinas');

-- --------------------------------------------------------

--
-- Table structure for table `daftar_tamu`
--

CREATE TABLE `daftar_tamu` (
  `id` int(11) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `nama` varchar(100) NOT NULL,
  `nomor_telp` varchar(20) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') NOT NULL,
  `pendidikan_terakhir_id` int(11) DEFAULT NULL,
  `profesi_id` int(11) DEFAULT NULL,
  `asal_instansi` varchar(100) DEFAULT NULL,
  `keperluan` text DEFAULT NULL,
  `bidang_tujuan_id` int(11) DEFAULT NULL,
  `catatan_tambahan` text DEFAULT NULL,
  `status_kunjungan` enum('Menunggu','Terjadwal','Datang','Selesai') NOT NULL DEFAULT 'Menunggu',
  `jadwal_checkin` datetime DEFAULT NULL,
  `waktu_checkin` datetime DEFAULT NULL,
  `waktu_checkout` datetime DEFAULT NULL,
  `file_upload` varchar(255) DEFAULT NULL,
  `waktu_dibuat` datetime DEFAULT current_timestamp(),
  `jadwal_dibuat` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Triggers `daftar_tamu`
--
DELIMITER $$
CREATE TRIGGER `set_datang` BEFORE UPDATE ON `daftar_tamu` FOR EACH ROW BEGIN
    IF NEW.waktu_checkin IS NOT NULL
       AND OLD.status_kunjungan IN ('Menunggu', 'Terjadwal') THEN
        SET NEW.status_kunjungan = 'Datang';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `set_selesai` BEFORE UPDATE ON `daftar_tamu` FOR EACH ROW BEGIN
    IF NEW.waktu_checkout IS NOT NULL
       AND OLD.status_kunjungan = 'Datang' THEN
        SET NEW.status_kunjungan = 'Selesai';
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `set_terjadwal` BEFORE UPDATE ON `daftar_tamu` FOR EACH ROW BEGIN
    IF NEW.jadwal_checkin IS NOT NULL 
       AND OLD.status_kunjungan = 'Menunggu' THEN
        SET NEW.status_kunjungan = 'Terjadwal';
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_identitas_survei`
--

CREATE TABLE `jawaban_identitas_survei` (
  `id` int(11) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `tanggal_lahir` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `nomor_telepon` varchar(20) NOT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') NOT NULL,
  `alamat` text NOT NULL,
  `pendidikan_terakhir_id` int(11) DEFAULT NULL,
  `pekerjaan_utama_id` int(11) DEFAULT NULL,
  `jenis_layanan_id` int(11) DEFAULT NULL,
  `saran` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_memperoleh_informasi`
--

CREATE TABLE `jawaban_memperoleh_informasi` (
  `id` int(11) NOT NULL,
  `tamu_id` int(11) NOT NULL,
  `cara_memperoleh_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_mendapatkan_salinan`
--

CREATE TABLE `jawaban_mendapatkan_salinan` (
  `id` int(11) NOT NULL,
  `tamu_id` int(11) NOT NULL,
  `cara_salinan_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jawaban_survei`
--

CREATE TABLE `jawaban_survei` (
  `id` int(11) NOT NULL,
  `responden_id` int(11) NOT NULL,
  `pertanyaan_id` int(11) NOT NULL,
  `jawaban` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jenis_rating`
--

CREATE TABLE `jenis_rating` (
  `id` int(11) NOT NULL,
  `tipe` enum('rating','text') NOT NULL DEFAULT 'rating',
  `nama_rating` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jenis_rating`
--

INSERT INTO `jenis_rating` (`id`, `tipe`, `nama_rating`) VALUES
(1, 'rating', 'Skala 5'),
(2, 'rating', 'Skala 3'),
(3, 'text', 'Text'),
(4, 'rating', 'Kinerja'),
(5, 'rating', 'Tingkat Kepentingan');

-- --------------------------------------------------------

--
-- Table structure for table `login_attempts`
--

CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `success` tinyint(1) NOT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `attempt_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `username`, `ip_address`, `user_agent`, `success`, `failure_reason`, `attempt_time`) VALUES
(1, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-20 07:03:08'),
(2, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-24 23:56:04'),
(3, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-25 00:42:58'),
(4, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-25 01:28:33'),
(5, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 01:37:41'),
(6, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 06:25:44'),
(7, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 06:26:19'),
(8, 'admin\' --', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'User not found', '2025-08-26 07:44:04'),
(9, '11', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'User not found', '2025-08-26 07:44:33'),
(10, 'or 1=1', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'User not found', '2025-08-26 07:45:23'),
(11, 'dummy123', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Invalid password', '2025-08-26 07:45:43'),
(12, 'aaaa', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'User not found', '2025-08-26 07:46:00'),
(13, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Invalid password', '2025-08-26 07:46:29'),
(14, 'aaa', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Username or password is incorrect', '2025-08-26 07:47:15'),
(15, 'aaa', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Username or password is incorrect', '2025-08-26 07:47:18'),
(16, 'aaa', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Username or password is incorrect', '2025-08-26 07:47:20'),
(17, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 07:47:31'),
(18, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Invalid password', '2025-08-26 07:49:47'),
(19, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 07:49:52'),
(20, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 07:53:06'),
(21, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 08:01:31'),
(22, '\'1\' OR \'1\' = \'1\'', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 0, 'Username or password is incorrect', '2025-08-26 08:09:47'),
(23, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-26 08:16:08'),
(24, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-28 00:49:51'),
(25, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-28 06:36:26'),
(26, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-28 07:04:32'),
(27, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-08-29 01:40:35'),
(28, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-09-01 00:05:50'),
(29, 'admin', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 1, NULL, '2025-09-01 06:00:05');

-- --------------------------------------------------------

--
-- Table structure for table `memperoleh_informasi`
--

CREATE TABLE `memperoleh_informasi` (
  `id` int(11) NOT NULL,
  `nama_opsi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memperoleh_informasi`
--

INSERT INTO `memperoleh_informasi` (`id`, `nama_opsi`) VALUES
(1, 'Melihat/membaca/mendengarkan/mencatat'),
(2, 'Mendapatkan salinan informasi');

-- --------------------------------------------------------

--
-- Table structure for table `mendapatkan_salinan`
--

CREATE TABLE `mendapatkan_salinan` (
  `id` int(11) NOT NULL,
  `nama_opsi` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `mendapatkan_salinan`
--

INSERT INTO `mendapatkan_salinan` (`id`, `nama_opsi`) VALUES
(1, 'Mengambil langsung'),
(2, 'Kurir'),
(3, 'Pos'),
(4, 'Faksimili'),
(5, 'E-mail');

-- --------------------------------------------------------

--
-- Table structure for table `opsi_rating`
--

CREATE TABLE `opsi_rating` (
  `id` int(11) NOT NULL,
  `jenis_rating_id` int(11) NOT NULL,
  `skala_rating` varchar(50) NOT NULL,
  `urutan_rating` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `opsi_rating`
--

INSERT INTO `opsi_rating` (`id`, `jenis_rating_id`, `skala_rating`, `urutan_rating`) VALUES
(1, 1, 'Sangat Baik', 1),
(2, 1, 'Baik', 2),
(3, 1, 'Cukup', 3),
(4, 1, 'Kurang', 4),
(5, 1, 'Sangat Kurang', 5),
(6, 2, 'Memuaskan', 1),
(7, 2, 'Cukup', 2),
(8, 2, 'Kurang Memuaskan', 3),
(9, 4, 'Tidak Sesuai', 1),
(10, 4, 'Kurang Sesuai', 2),
(11, 4, 'Sesuai', 3),
(12, 4, 'Sangat Sesuai', 4),
(13, 5, 'Tidak Penting', 1),
(14, 5, 'Kurang Penting', 2),
(15, 5, 'Penting', 3),
(16, 5, 'Sangat Penting', 4);

-- --------------------------------------------------------

--
-- Table structure for table `pendidikan_terakhir`
--

CREATE TABLE `pendidikan_terakhir` (
  `id` int(11) NOT NULL,
  `pendidikan_terakhir` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pendidikan_terakhir`
--

INSERT INTO `pendidikan_terakhir` (`id`, `pendidikan_terakhir`) VALUES
(1, 'Tidak Sekolah'),
(2, 'SD / Sederajat'),
(3, 'SMP / Sederajat'),
(4, 'SMA / Sederajat'),
(5, 'Diploma'),
(6, 'Sarjana'),
(7, 'Pascasarjana');

-- --------------------------------------------------------

--
-- Table structure for table `pertanyaan_survei`
--

CREATE TABLE `pertanyaan_survei` (
  `id` int(11) NOT NULL,
  `baris` int(11) NOT NULL,
  `pertanyaan` text NOT NULL,
  `is_aktif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pertanyaan_survei`
--

INSERT INTO `pertanyaan_survei` (`id`, `baris`, `pertanyaan`, `is_aktif`, `created_at`) VALUES
(1, 1, 'Persyaratan untuk memperoleh layanan publik di Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah', 1, '2025-08-28 02:39:19');

-- --------------------------------------------------------

--
-- Table structure for table `pertanyaan_s_jenis_rating`
--

CREATE TABLE `pertanyaan_s_jenis_rating` (
  `id` int(11) NOT NULL,
  `pertanyaan_id` int(11) NOT NULL,
  `jenis_rating_id` int(11) NOT NULL,
  `urutan` int(11) DEFAULT 1,
  `is_required` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pertanyaan_s_jenis_rating`
--

INSERT INTO `pertanyaan_s_jenis_rating` (`id`, `pertanyaan_id`, `jenis_rating_id`, `urutan`, `is_required`) VALUES
(1, 1, 4, 1, 1),
(2, 1, 5, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `pesan_email`
--

CREATE TABLE `pesan_email` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `tamu_id` int(11) NOT NULL,
  `subjek` varchar(255) NOT NULL,
  `isi_pesan` text NOT NULL,
  `status_pengiriman` enum('terkirim','gagal') DEFAULT NULL,
  `waktu_kirim` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `profesi`
--

CREATE TABLE `profesi` (
  `id` int(11) NOT NULL,
  `nama_profesi` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `profesi`
--

INSERT INTO `profesi` (`id`, `nama_profesi`) VALUES
(1, 'PNS'),
(2, 'Wiraswasta'),
(3, 'Karyawan Swasta'),
(4, 'Guru/Dosen'),
(5, 'TNI/Polri'),
(6, 'Dokter/Nakes'),
(7, 'Petani'),
(8, 'Buruh'),
(9, 'Pengacara'),
(10, 'Konsultan'),
(11, 'Pelajar/Mahasiswa'),
(12, 'Tidak Bekerja'),
(13, 'Lainnya');

-- --------------------------------------------------------

--
-- Table structure for table `tamu_token`
--

CREATE TABLE `tamu_token` (
  `id` int(11) NOT NULL,
  `tamu_id` int(11) NOT NULL,
  `token` varchar(15) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tujuan_kunjungan`
--

CREATE TABLE `tujuan_kunjungan` (
  `id` int(11) NOT NULL,
  `tujuan` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tujuan_kunjungan`
--

INSERT INTO `tujuan_kunjungan` (`id`, `tujuan`) VALUES
(1, 'Konsultasi Layanan'),
(2, 'Pengaduan/Keluhan'),
(3, 'Pengajuan Permohonan'),
(4, 'Mencari Informasi'),
(5, 'Meeting/Rapat'),
(6, 'Survey/Penelitian');

-- --------------------------------------------------------

--
-- Table structure for table `unlock_log`
--

CREATE TABLE `unlock_log` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `unlock_method` enum('auto','manual','admin') NOT NULL,
  `unlock_time` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip_address` varchar(45) DEFAULT NULL,
  `admin_username` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `bidang_tujuan`
--
ALTER TABLE `bidang_tujuan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `daftar_tamu`
--
ALTER TABLE `daftar_tamu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_bidang_tujuan` (`bidang_tujuan_id`),
  ADD KEY `idx_tamu_nama` (`nama`),
  ADD KEY `idx_tamu_instansi` (`asal_instansi`),
  ADD KEY `idx_tamu_status` (`status_kunjungan`),
  ADD KEY `idx_tamu_waktu_dibuat` (`waktu_dibuat`),
  ADD KEY `idx_tamu_jadwal_checkin` (`jadwal_checkin`),
  ADD KEY `idx_tamu_waktu_checkin` (`waktu_checkin`),
  ADD KEY `idx_tamu_waktu_checkout` (`waktu_checkout`),
  ADD KEY `fk_tamu_pendidikan` (`pendidikan_terakhir_id`),
  ADD KEY `fk_tamu_profesi` (`profesi_id`);

--
-- Indexes for table `jawaban_identitas_survei`
--
ALTER TABLE `jawaban_identitas_survei`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pendidikan_responden` (`pendidikan_terakhir_id`),
  ADD KEY `fk_profesi_responden` (`pekerjaan_utama_id`),
  ADD KEY `fk_tujuan_responden` (`jenis_layanan_id`);

--
-- Indexes for table `jawaban_memperoleh_informasi`
--
ALTER TABLE `jawaban_memperoleh_informasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tamu_id` (`tamu_id`),
  ADD KEY `cara_memperoleh_id` (`cara_memperoleh_id`);

--
-- Indexes for table `jawaban_mendapatkan_salinan`
--
ALTER TABLE `jawaban_mendapatkan_salinan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tamu_id` (`tamu_id`),
  ADD KEY `cara_salinan_id` (`cara_salinan_id`);

--
-- Indexes for table `jawaban_survei`
--
ALTER TABLE `jawaban_survei`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pertanyaan_id` (`pertanyaan_id`),
  ADD KEY `fk_responden` (`responden_id`),
  ADD KEY `fk_opsi_rating` (`jawaban`);

--
-- Indexes for table `jenis_rating`
--
ALTER TABLE `jenis_rating`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_attempts`
--
ALTER TABLE `login_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_username_time` (`username`,`attempt_time`),
  ADD KEY `idx_ip_time` (`ip_address`,`attempt_time`),
  ADD KEY `idx_success` (`success`);

--
-- Indexes for table `memperoleh_informasi`
--
ALTER TABLE `memperoleh_informasi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `mendapatkan_salinan`
--
ALTER TABLE `mendapatkan_salinan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opsi_rating`
--
ALTER TABLE `opsi_rating`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jenis_rating_id` (`jenis_rating_id`);

--
-- Indexes for table `pendidikan_terakhir`
--
ALTER TABLE `pendidikan_terakhir`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pertanyaan_survei`
--
ALTER TABLE `pertanyaan_survei`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `pertanyaan_s_jenis_rating`
--
ALTER TABLE `pertanyaan_s_jenis_rating`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pjr_pertanyaan` (`pertanyaan_id`),
  ADD KEY `fk_pjr_jenis` (`jenis_rating_id`);

--
-- Indexes for table `pesan_email`
--
ALTER TABLE `pesan_email`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`),
  ADD KEY `tamu_id` (`tamu_id`);

--
-- Indexes for table `profesi`
--
ALTER TABLE `profesi`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tamu_token`
--
ALTER TABLE `tamu_token`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `tamu_id` (`tamu_id`);

--
-- Indexes for table `tujuan_kunjungan`
--
ALTER TABLE `tujuan_kunjungan`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `unlock_log`
--
ALTER TABLE `unlock_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_username_time` (`username`,`unlock_time`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bidang_tujuan`
--
ALTER TABLE `bidang_tujuan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `daftar_tamu`
--
ALTER TABLE `daftar_tamu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jawaban_identitas_survei`
--
ALTER TABLE `jawaban_identitas_survei`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jawaban_memperoleh_informasi`
--
ALTER TABLE `jawaban_memperoleh_informasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jawaban_mendapatkan_salinan`
--
ALTER TABLE `jawaban_mendapatkan_salinan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jawaban_survei`
--
ALTER TABLE `jawaban_survei`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jenis_rating`
--
ALTER TABLE `jenis_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `login_attempts`
--
ALTER TABLE `login_attempts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `memperoleh_informasi`
--
ALTER TABLE `memperoleh_informasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `mendapatkan_salinan`
--
ALTER TABLE `mendapatkan_salinan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `opsi_rating`
--
ALTER TABLE `opsi_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `pendidikan_terakhir`
--
ALTER TABLE `pendidikan_terakhir`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `pertanyaan_survei`
--
ALTER TABLE `pertanyaan_survei`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pertanyaan_s_jenis_rating`
--
ALTER TABLE `pertanyaan_s_jenis_rating`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `pesan_email`
--
ALTER TABLE `pesan_email`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `profesi`
--
ALTER TABLE `profesi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=58;

--
-- AUTO_INCREMENT for table `tamu_token`
--
ALTER TABLE `tamu_token`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tujuan_kunjungan`
--
ALTER TABLE `tujuan_kunjungan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `unlock_log`
--
ALTER TABLE `unlock_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `daftar_tamu`
--
ALTER TABLE `daftar_tamu`
  ADD CONSTRAINT `fk_bidang_tujuan` FOREIGN KEY (`bidang_tujuan_id`) REFERENCES `bidang_tujuan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tamu_pendidikan` FOREIGN KEY (`pendidikan_terakhir_id`) REFERENCES `pendidikan_terakhir` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tamu_profesi` FOREIGN KEY (`profesi_id`) REFERENCES `profesi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `jawaban_identitas_survei`
--
ALTER TABLE `jawaban_identitas_survei`
  ADD CONSTRAINT `fk_pendidikan_responden` FOREIGN KEY (`pendidikan_terakhir_id`) REFERENCES `pendidikan_terakhir` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_profesi_responden` FOREIGN KEY (`pekerjaan_utama_id`) REFERENCES `profesi` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tujuan_responden` FOREIGN KEY (`jenis_layanan_id`) REFERENCES `tujuan_kunjungan` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `jawaban_memperoleh_informasi`
--
ALTER TABLE `jawaban_memperoleh_informasi`
  ADD CONSTRAINT `jawaban_memperoleh_informasi_ibfk_1` FOREIGN KEY (`tamu_id`) REFERENCES `daftar_tamu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jawaban_memperoleh_informasi_ibfk_2` FOREIGN KEY (`cara_memperoleh_id`) REFERENCES `memperoleh_informasi` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jawaban_mendapatkan_salinan`
--
ALTER TABLE `jawaban_mendapatkan_salinan`
  ADD CONSTRAINT `jawaban_mendapatkan_salinan_ibfk_1` FOREIGN KEY (`tamu_id`) REFERENCES `daftar_tamu` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jawaban_mendapatkan_salinan_ibfk_2` FOREIGN KEY (`cara_salinan_id`) REFERENCES `mendapatkan_salinan` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `jawaban_survei`
--
ALTER TABLE `jawaban_survei`
  ADD CONSTRAINT `fk_opsi_rating` FOREIGN KEY (`jawaban`) REFERENCES `opsi_rating` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_responden` FOREIGN KEY (`responden_id`) REFERENCES `jawaban_identitas_survei` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `jawaban_survei_ibfk_1` FOREIGN KEY (`pertanyaan_id`) REFERENCES `pertanyaan_survei` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `opsi_rating`
--
ALTER TABLE `opsi_rating`
  ADD CONSTRAINT `opsi_rating_ibfk_1` FOREIGN KEY (`jenis_rating_id`) REFERENCES `jenis_rating` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pertanyaan_s_jenis_rating`
--
ALTER TABLE `pertanyaan_s_jenis_rating`
  ADD CONSTRAINT `fk_pjr_jenis` FOREIGN KEY (`jenis_rating_id`) REFERENCES `jenis_rating` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pjr_pertanyaan` FOREIGN KEY (`pertanyaan_id`) REFERENCES `pertanyaan_survei` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `pesan_email`
--
ALTER TABLE `pesan_email`
  ADD CONSTRAINT `pesan_email_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `pesan_email_ibfk_2` FOREIGN KEY (`tamu_id`) REFERENCES `daftar_tamu` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tamu_token`
--
ALTER TABLE `tamu_token`
  ADD CONSTRAINT `tamu_token_ibfk_1` FOREIGN KEY (`tamu_id`) REFERENCES `daftar_tamu` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
