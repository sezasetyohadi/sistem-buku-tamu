import { executeQuery } from '../config/db';

async function dropAllTables() {
  try {
    console.log('🗑️  Dropping all existing tables and triggers...');
    
    // Disable foreign key checks to avoid constraint issues
    await executeQuery('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get all tables in the database
    const tables = await executeQuery(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
    `) as Array<{TABLE_NAME: string}>;
    
    // Drop all triggers first
    const triggers = await executeQuery(`
      SELECT TRIGGER_NAME 
      FROM INFORMATION_SCHEMA.TRIGGERS 
      WHERE TRIGGER_SCHEMA = DATABASE()
    `) as Array<{TRIGGER_NAME: string}>;
    
    for (const trigger of triggers) {
      try {
        await executeQuery(`DROP TRIGGER IF EXISTS ${trigger.TRIGGER_NAME}`);
        console.log(`✅ Dropped trigger: ${trigger.TRIGGER_NAME}`);
      } catch (error) {
        console.log(`⚠️  Could not drop trigger ${trigger.TRIGGER_NAME}:`, error);
      }
    }
    
    // Drop all tables
    for (const table of tables) {
      try {
        await executeQuery(`DROP TABLE IF EXISTS ${table.TABLE_NAME}`);
        console.log(`✅ Dropped table: ${table.TABLE_NAME}`);
      } catch (error) {
        console.log(`⚠️  Could not drop table ${table.TABLE_NAME}:`, error);
      }
    }
    
    // Re-enable foreign key checks
    await executeQuery('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('🎉 All tables and triggers dropped successfully!');
    console.log('📝 You can now run migrations on a clean database.');
    
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

dropAllTables();
