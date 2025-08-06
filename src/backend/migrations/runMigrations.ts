import migrationManager from './migrationManager';

async function main() {
  try {
    console.log('Starting migrations...');
    await migrationManager.runMigrations();
    console.log('All migrations completed successfully');
    
    console.log('Starting seeds...');
    await migrationManager.runSeeds();
    console.log('All seeds completed successfully');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running migrations/seeds:', error);
    process.exit(1);
  }
}

main();
