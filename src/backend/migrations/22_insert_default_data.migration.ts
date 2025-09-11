import { executeQuery } from '../config/db';

export async function up() {
  console.log('Inserting default admin data...');
  
  // Insert default admin users
  await executeQuery(`
    INSERT IGNORE INTO admin (id, username, password, nama_lengkap, created_at, email, profile_picture, is_super_admin, failed_attempts, locked_until, last_failed_attempt, updated_at) VALUES
    (1, 'dummy123', '$2a$12$C3.v1OZGhB8FPXyarqZPaub/gnFx.0aKAZ6TcZ7hgbfOtR/KIzJnO', 'Admin Dummy', '2025-08-04 08:59:20', 'dummy@example.com', NULL, 1, 1, NULL, '2025-08-26 14:45:43', NULL),
    (2, 'admin', '$2a$12$CFnCVYuKNc9IuadesOcV1OVTeagSs.8ZCcltzuH4bXo4Vg4oY2Vku', 'Nimda Admin', '2025-08-26 06:25:10', 'Nimda.admin@example.com', '/uploads/profiles/admin_2_1756435080789.jpg', 0, 0, NULL, NULL, NULL);
  `);
  
  // Insert default survey question
  await executeQuery(`
    INSERT IGNORE INTO pertanyaan_survei (id, baris, pertanyaan, is_aktif, is_required, created_at) VALUES
    (1, 1, 'Persyaratan untuk memperoleh layanan publik di Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah', 1, 1, '2025-08-28 02:39:19');
  `);
  
  // Insert default survey question ratings
  await executeQuery(`
    INSERT IGNORE INTO pertanyaan_s_jenis_rating (id, pertanyaan_id, jenis_rating_id, urutan) VALUES
    (1, 1, 4, 1),
    (2, 1, 5, 2);
  `);
  
  console.log('Default admin data inserted successfully');
}

export async function down() {
  await executeQuery(`DELETE FROM pertanyaan_s_jenis_rating WHERE id IN (1, 2);`);
  await executeQuery(`DELETE FROM pertanyaan_survei WHERE id = 1;`);
  await executeQuery(`DELETE FROM admin WHERE id IN (1, 2);`);
  console.log('Default admin data removed successfully');
}
