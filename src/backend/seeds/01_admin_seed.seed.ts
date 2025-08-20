import { executeQuery } from '../config/db';
import bcrypt from 'bcrypt';

export async function seed() {
  // Check if there are already records to avoid duplicates
  const adminCount = await executeQuery<any[]>('SELECT COUNT(*) as count FROM admin');
  
  if (adminCount[0].count === 0) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('dummy123', 12); // Using $2a$12$ prefix as in the SQL dump
    
    // Insert initial admin user
    await executeQuery(`
      INSERT INTO admin (username, password, nama_lengkap, email, is_super_admin, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['dummy123', hashedPassword, 'Admin Dummy', 'dummy@example.com', 1, '2025-08-04 08:59:20']);
    
    console.log('Admin seed data inserted successfully');
  } else {
    console.log('Admin data already exists, skipping seed');
  }
}
