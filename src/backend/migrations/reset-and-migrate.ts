import { executeQuery } from '../config/db';

async function resetAndMigrate() {
  try {
    console.log('Resetting migration tracking...');
    
    // Clear migration records
    await executeQuery(`DELETE FROM migrations WHERE 1=1`);
    console.log('Migration records cleared');
    
    console.log('Running fresh migrations...');
    
    // Import and run the migration script
    const { main } = await import('./runMigrations');
    await main();
    
  } catch (error) {
    console.error('Error during reset and migrate:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

resetAndMigrate();
