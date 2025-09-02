import migrationManager from './migrationManager';

export async function main() {
  try {
    // List of migrations in proper order to prevent foreign key constraints issues
    const migrationOrder = [
      // Tables without dependencies
      '01_create_admin_table.migration.ts',
      '02_create_bidang_tujuan_table.migration.ts', 
      '03c_create_section_survei_table.migration.ts',
      '04_create_rating_tables.migration.ts',
      '06_create_pendidikan_terakhir_table.migration.ts',
      '08_create_profesi_table.migration.ts',
      '09_create_tujuan_kunjungan_table.migration.ts',
      '10_create_memperoleh_informasi_table.migration.ts',
      // Tables with dependencies (after all referenced tables exist)
      '03_create_daftar_tamu_table.migration.ts', // Depends on bidang_tujuan, pendidikan_terakhir, profesi, tujuan_kunjungan
      '05_create_survey_tables.migration.ts',     // Depends on section_survei and jenis_rating
      '07_create_pesan_email_table.migration.ts', // Depends on admin and daftar_tamu
      '11_create_jawaban_informasi_tables.migration.ts', // Depends on daftar_tamu
      // Additional constraints (after all tables exist)
      '14_add_daftar_tamu_constraints.migration.ts',
      // Updates and feature additions
      '12_update_survey_structure.migration.ts',
      '15_create_tamu_token_table.migration.ts',
      '16_update_jawaban_identitas_survei.migration.ts',
      '17_add_profile_picture_to_admin.migration.ts',
      '18_add_updated_at_to_admin.migration.ts',
      '19_create_login_security_tables.migration.ts'
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
