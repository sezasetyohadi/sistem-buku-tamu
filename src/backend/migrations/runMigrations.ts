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
      '06_create_memperoleh_informasi_table.migration.ts',
      '07_create_mendapatkan_salinan_table.migration.ts',
      '08_create_section_survei_table.migration.ts',
      
      // Main entities (depend on lookup tables)
      '09_create_daftar_tamu_table.migration.ts',      // Depends on bidang_tujuan, pendidikan_terakhir, profesi, tujuan_kunjungan
      
      // Rating system
      '10_create_rating_tables.migration.ts',          // Creates jenis_rating and opsi_rating
      
      // Survey system
      '11_create_pertanyaan_survei_table.migration.ts',
      '12_create_pertanyaan_s_jenis_rating_table.migration.ts', // Depends on pertanyaan_survei and jenis_rating
      '13_create_jawaban_identitas_survei_table.migration.ts',  // Depends on pendidikan_terakhir, profesi, tujuan_kunjungan
      '14_create_jawaban_survei_table.migration.ts',           // Depends on jawaban_identitas_survei, pertanyaan_survei, opsi_rating
      
      // Relationship tables
      '15_create_jawaban_informasi_tables.migration.ts', // Depends on daftar_tamu, memperoleh_informasi, mendapatkan_salinan
      
      // Security and messaging
      '16_create_security_and_messaging_tables.migration.ts', // Depends on admin and daftar_tamu
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
