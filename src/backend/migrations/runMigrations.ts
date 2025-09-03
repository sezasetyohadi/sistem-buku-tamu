import migrationManager from './migrationManager';

export async function main() {
  try {
    // List of migrations in proper order to prevent foreign key constraints issues
    const migrationOrder = [
      // Core lookup tables (no dependencies)
      '01_create_admin_table.migration.ts',
      '02_create_bidang_tujuan_table.migration.ts',
      '03_create_pendidikan_terakhir_table.migration.ts',
      '04_create_profesi_table.migration.ts',
      '05_create_tujuan_kunjungan_table.migration.ts',
      
      // Main entities (depend on lookup tables)
      '06_create_daftar_tamu_table.migration.ts',      // Depends on bidang_tujuan, pendidikan_terakhir, profesi
      '07_create_daftar_tamu_triggers.migration.ts',   // Triggers for daftar_tamu
      
      // Token and messaging tables
      '08_create_tamu_token_table.migration.ts',       // Depends on daftar_tamu
      '09_create_pesan_email_table.migration.ts',      // Depends on admin and daftar_tamu
      
      // Information handling tables
      '10_create_memperoleh_informasi_table.migration.ts',
      '11_create_mendapatkan_salinan_table.migration.ts',
      '12_create_jawaban_memperoleh_informasi_table.migration.ts', // Depends on daftar_tamu, memperoleh_informasi
      '13_create_jawaban_mendapatkan_salinan_table.migration.ts',  // Depends on daftar_tamu, mendapatkan_salinan
      
      // Rating system
      '14_create_jenis_rating_table.migration.ts',
      '15_create_opsi_rating_table.migration.ts',      // Depends on jenis_rating
      
      // Survey system
      '16_create_pertanyaan_survei_table.migration.ts',
      '17_create_pertanyaan_s_jenis_rating_table.migration.ts', // Depends on pertanyaan_survei and jenis_rating
      '18_create_jawaban_identitas_survei_table.migration.ts',  // Depends on pendidikan_terakhir, profesi, tujuan_kunjungan
      '19_create_jawaban_survei_table.migration.ts',           // Depends on jawaban_identitas_survei, pertanyaan_survei, opsi_rating
      
      // Security tables
      '20_create_login_attempts_table.migration.ts',
      '21_create_unlock_log_table.migration.ts',
      
      // Default data
      '22_insert_default_data.migration.ts',           // Insert default admin and survey data
    ];

    console.log('Starting migrations in specified order...');
    for (const migration of migrationOrder) {
      try {
        console.log(`\nRunning migration: ${migration}`);
        await migrationManager.runSingleMigration(migration);
      } catch (error: any) {
        console.error(`Error running migration ${migration}:`, error);
        if (typeof error === 'object' && error !== null && error.toString().includes('foreign key constraint')) {
          console.error('This is likely a dependency issue. Check that referenced tables exist.');
        }
        process.exit(1);
      }
    }
    console.log('\nAll migrations completed successfully');
    
    console.log('\nStarting seeds...');
    await migrationManager.runSeeds();
    console.log('All seeds completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations/seeds:', error);
    process.exit(1);
  }
}

main();
