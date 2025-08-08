import migrationManager from './migrationManager';

async function main() {
  // Get the migration file name from command line arguments
  const args = process.argv.slice(2);
  const migrationFile = args[0];
  
  if (!migrationFile) {
    console.error('Please specify a migration file name');
    process.exit(1);
  }
  
  try {
    console.log(`Running single migration: ${migrationFile}`);
    
    if (migrationFile.endsWith('.migration.ts') || migrationFile.endsWith('.migration.js')) {
      await migrationManager.runSingleMigration(migrationFile);
    } else if (migrationFile.endsWith('.seed.ts') || migrationFile.endsWith('.seed.js')) {
      await migrationManager.runSingleSeed(migrationFile);
    } else {
      console.error('Invalid file type. Must be .migration.ts/.js or .seed.ts/.js');
      process.exit(1);
    }
    
    console.log('Migration/Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration/seed:', error);
    process.exit(1);
  }
}

main();
