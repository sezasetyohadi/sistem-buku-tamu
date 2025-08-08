import { executeQuery } from '../config/db';
import Admin from '../models/adminModel';
import bcrypt from 'bcrypt';

export async function findByUsername(username: string): Promise<Admin | null> {
  const query = 'SELECT * FROM admin WHERE username = ? LIMIT 1';
  
  try {
    const results = await executeQuery<Admin[]>(query, [username]);
    
    if (results && results.length > 0) {
      return results[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error finding admin by username:', error);
    throw error;
  }
}

export async function validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error validating password:', error);
    throw error;
  }
}

export default {
  findByUsername,
  validatePassword
};
