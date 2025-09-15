import bcrypt from 'bcrypt';

import { adminService } from '../../lib/database-service';
import { dbLogger } from '../../lib/logger';
import Admin from '../models/adminModel';

export async function findByUsername(username: string): Promise<Admin | null> {
  try {
    const result = await adminService.findByUsername(username);
    
    if (result.success && result.data && result.data.length > 0) {
      return result.data[0] as Admin;
    }
    
    return null;
  } catch (error) {
    dbLogger.error('Error finding admin by username:', error);
    throw error;
  }
}

export async function validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    dbLogger.error('Error validating password:', error);
    throw error;
  }
}

export default {
  findByUsername,
  validatePassword
};
