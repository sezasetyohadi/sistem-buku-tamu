import { NextRequest, NextResponse } from 'next/server';
import { testConnection, executeQuery } from '../../../backend/config/db';
import bcrypt from 'bcrypt';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({
        success: false,
        message: 'Database connection failed'
      }, { status: 500 });
    }

    // Test admin table query
    try {
      const adminCount = await executeQuery<Array<{count: number}>>(
        'SELECT COUNT(*) as count FROM admin'
      );
      
      // Get admin with masked password
      const adminList = await executeQuery<Array<any>>(
        'SELECT id, username, LEFT(password, 10) as password_preview, nama_lengkap, email, is_super_admin FROM admin'
      );

      // Test dummy123 password with bcrypt
      const dummyPassword = 'dummy123';
      
      // Get the stored hash for dummy123 user
      const admin = await executeQuery<Array<{id: number, username: string, password: string}>>(
        'SELECT id, username, password FROM admin WHERE username = ?', 
        ['dummy123']
      );

      // Check if admin exists
      let passwordTestResult = { exists: false, matchesHash: false };
      
      if (admin && admin.length > 0) {
        passwordTestResult.exists = true;
        // Test if the password matches the hash
        const isMatch = await bcrypt.compare(dummyPassword, admin[0].password);
        passwordTestResult.matchesHash = isMatch;
      }
      
      return NextResponse.json({
        success: true,
        message: 'Database connection successful',
        data: {
          adminCount: adminCount[0].count,
          admins: adminList,
          passwordTest: passwordTestResult
        }
      });
    } catch (queryError) {
      return NextResponse.json({
        success: false,
        message: 'Database query failed',
        error: String(queryError)
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database test failed',
      error: String(error)
    }, { status: 500 });
  }
}
