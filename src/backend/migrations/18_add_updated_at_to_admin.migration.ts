import { executeQuery } from '../config/db';

export async function up() {
  // Add updated_at column to admin table if it doesn't exist
  await executeQuery(`
    ALTER TABLE admin 
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
  `);
  
  console.log('Added updated_at column to admin table');
}

export async function down() {
  await executeQuery(`
    ALTER TABLE admin 
    DROP COLUMN IF EXISTS updated_at;
  `);
  
  console.log('Removed updated_at column from admin table');
}
