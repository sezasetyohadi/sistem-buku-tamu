import { executeQuery } from '../config/db';

export async function up() {
  console.log('Creating triggers for daftar_tamu table...');
  
  // Trigger: set_terjadwal
  await executeQuery(`
    DROP TRIGGER IF EXISTS set_terjadwal;
  `);
  
  await executeQuery(`
    CREATE TRIGGER set_terjadwal 
    BEFORE UPDATE ON daftar_tamu 
    FOR EACH ROW 
    BEGIN
        IF NEW.jadwal_checkin IS NOT NULL 
           AND OLD.status_kunjungan = 'Menunggu' THEN
            SET NEW.status_kunjungan = 'Terjadwal';
        END IF;
    END;
  `);
  
  // Trigger: set_datang
  await executeQuery(`
    DROP TRIGGER IF EXISTS set_datang;
  `);
  
  await executeQuery(`
    CREATE TRIGGER set_datang 
    BEFORE UPDATE ON daftar_tamu 
    FOR EACH ROW 
    BEGIN
        IF NEW.waktu_checkin IS NOT NULL
           AND OLD.status_kunjungan IN ('Menunggu', 'Terjadwal') THEN
            SET NEW.status_kunjungan = 'Datang';
        END IF;
    END;
  `);
  
  // Trigger: set_selesai
  await executeQuery(`
    DROP TRIGGER IF EXISTS set_selesai;
  `);
  
  await executeQuery(`
    CREATE TRIGGER set_selesai 
    BEFORE UPDATE ON daftar_tamu 
    FOR EACH ROW 
    BEGIN
        IF NEW.waktu_checkout IS NOT NULL
           AND OLD.status_kunjungan = 'Datang' THEN
            SET NEW.status_kunjungan = 'Selesai';
        END IF;
    END;
  `);
  
  console.log('Daftar_tamu triggers created successfully');
}

export async function down() {
  await executeQuery('DROP TRIGGER IF EXISTS set_terjadwal;');
  await executeQuery('DROP TRIGGER IF EXISTS set_datang;');
  await executeQuery('DROP TRIGGER IF EXISTS set_selesai;');
  console.log('Daftar_tamu triggers dropped successfully');
}
