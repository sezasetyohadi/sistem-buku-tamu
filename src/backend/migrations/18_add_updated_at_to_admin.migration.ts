import { executeQuery } from '../config/db';

export async function up() {
  console.log('Adding updated_at column to admin table...');
  
  // Add updated_at column to admin table
  await executeQuery(`
    ALTER TABLE admin 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
    AFTER created_at;
  `);
  
  console.log('Added updated_at column to admin table');
}

export async function down() {
  console.log('Removing updated_at column from admin table...');
  
  // Remove updated_at column from admin table
  await executeQuery(`
    ALTER TABLE admin 
    DROP COLUMN IF EXISTS updated_at;
  `);
  
  console.log('Removed updated_at column from admin table');
}
