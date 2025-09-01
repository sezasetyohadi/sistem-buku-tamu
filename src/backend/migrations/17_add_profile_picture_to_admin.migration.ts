import { executeQuery } from '../config/db';

export async function up() {
  // Add profile_picture column to admin table
  await executeQuery(`
    ALTER TABLE admin 
    ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255) DEFAULT NULL 
    AFTER email;
  `);
  
  console.log('Profile picture column added to admin table successfully');
}

export async function down() {
  // Remove profile_picture column from admin table
  await executeQuery(`
    ALTER TABLE admin 
    DROP COLUMN profile_picture;
  `);
  
  console.log('Profile picture column removed from admin table successfully');
}
