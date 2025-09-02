import migrationManager from './migrationManager';

async function main() {
  try {
    // Get migration file name from command line arguments
    const migrationFileName = process.argv[2];
    
    if (!migrationFileName) {
      console.error('Please provide a migration file name');
      console.error('Usage: npm run migrate:single <migration-file-name>');
      process.exit(1);
    }
    
    console.log(`Running single migration: ${migrationFileName}`);
    await migrationManager.runSingleMigration(migrationFileName);
    console.log(`Migration ${migrationFileName} completed successfully`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

main();
