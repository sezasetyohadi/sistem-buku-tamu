-- Insert sample data for testing the survey response functionality

-- Insert sample data into memperoleh_informasi
INSERT INTO memperoleh_informasi (id, nama_opsi) VALUES
(1, 'Melihat/membaca/mendengarkan/mencatat'),
(2, 'Mendapatkan salinan informasi')
ON DUPLICATE KEY UPDATE nama_opsi = VALUES(nama_opsi);

-- Insert sample data into mendapatkan_salinan
INSERT INTO mendapatkan_salinan (id, nama_opsi) VALUES
(1, 'Mengambil langsung'),
(2, 'Kurir'),
(3, 'Pos'),
(4, 'Faksimili'),
(5, 'E-mail')
ON DUPLICATE KEY UPDATE nama_opsi = VALUES(nama_opsi);

-- Insert sample data into pendidikan_terakhir if not exists
INSERT INTO pendidikan_terakhir (id, pendidikan_terakhir) VALUES
(1, 'Tidak Sekolah'),
(2, 'SD / Sederajat'),
(3, 'SMP / Sederajat'),
(4, 'SMA / Sederajat'),
(5, 'Diploma'),
(6, 'Sarjana'),
(7, 'Pascasarjana')
ON DUPLICATE KEY UPDATE pendidikan_terakhir = VALUES(pendidikan_terakhir);

-- Insert sample data into profesi if not exists
INSERT INTO profesi (id, nama_profesi) VALUES
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
(13, 'Lainnya')
ON DUPLICATE KEY UPDATE nama_profesi = VALUES(nama_profesi);

-- Insert sample data into bidang_tujuan if not exists
INSERT INTO bidang_tujuan (id, bidang) VALUES
(1, 'Sekretariat'),
(2, 'Bidang Pelatihan Kerja'),
(3, 'Bidang Penempatan Tenaga Kerja'),
(4, 'Bidang Hubungan Industrial'),
(5, 'Bidang Norma Kerja'),
(6, 'Bidang Transmigrasi'),
(7, 'Kepala Dinas')
ON DUPLICATE KEY UPDATE bidang = VALUES(bidang);

-- Insert sample data into jenis_rating if not exists
INSERT INTO jenis_rating (id, tipe, nama_rating) VALUES
(1, 'rating', 'Skala 5'),
(2, 'rating', 'Skala 3'),
(3, 'text', 'Text'),
(4, 'rating', 'Kinerja'),
(5, 'rating', 'Tingkat Kepentingan')
ON DUPLICATE KEY UPDATE nama_rating = VALUES(nama_rating);

-- Insert sample data into opsi_rating if not exists
INSERT INTO opsi_rating (id, jenis_rating_id, skala_rating, urutan_rating) VALUES
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
(16, 5, 'Sangat Penting', 4)
ON DUPLICATE KEY UPDATE skala_rating = VALUES(skala_rating);

-- Insert sample survey responses into jawaban_identitas_survei
-- Using the correct structure from disnaker.sql (latest version)
INSERT INTO jawaban_identitas_survei (tanggal_survei, nama_lengkap, tanggal_lahir, email, nomor_telepon, jenis_kelamin, alamat, pendidikan_terakhir_id, pekerjaan_utama_id, jenis_layanan_id, saran, created_at) VALUES
('2025-08-13', 'Budi Santoso', '1984-05-15', 'budi.santoso@email.com', '081234567890', 'Laki-laki', 'Jl. Merdeka No. 123, Semarang', 6, 3, 1, 'Pelayanan sudah sangat baik, hanya perlu penambahan kursi di ruang tunggu.', '2025-08-13 14:30:00'),
('2025-08-13', 'Siti Nurhaliza', '1989-12-20', 'siti.nurhaliza@email.com', '081234567891', 'Perempuan', 'Jl. Pahlawan No. 456, Semarang', 5, 4, 2, 'Proses pelayanan bisa dipercepat lagi.', '2025-08-13 10:15:00'),
('2025-08-12', 'Ahmad Wijaya', '1981-08-10', 'ahmad.wijaya@email.com', '081234567892', 'Laki-laki', 'Jl. Pemuda No. 789, Semarang', 6, 1, 3, 'Pelayanan sangat memuaskan, pertahankan kualitas ini!', '2025-08-12 16:45:00')
ON DUPLICATE KEY UPDATE nama_lengkap = VALUES(nama_lengkap);

-- Add a sample question if not exists
INSERT INTO pertanyaan_survei (id, baris, pertanyaan, is_aktif, created_at) VALUES
(1, 1, 'Persyaratan untuk memperoleh layanan publik di Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah', 1, '2025-08-28 02:39:19')
ON DUPLICATE KEY UPDATE pertanyaan = VALUES(pertanyaan);

-- Link the question with rating types
INSERT INTO pertanyaan_s_jenis_rating (id, pertanyaan_id, jenis_rating_id, urutan, is_required) VALUES
(1, 1, 4, 1, 1),
(2, 1, 5, 2, 1)
ON DUPLICATE KEY UPDATE urutan = VALUES(urutan);

-- Insert sample survey answers
-- Note: responden_id should match the IDs from jawaban_identitas_survei table
INSERT INTO jawaban_survei (responden_id, pertanyaan_id, jawaban, created_at) VALUES
(1, 1, 5, '2025-08-13 14:30:00'),
(2, 1, 4, '2025-08-13 10:15:00'),
(3, 1, 5, '2025-08-12 16:45:00')
ON DUPLICATE KEY UPDATE jawaban = VALUES(jawaban);
