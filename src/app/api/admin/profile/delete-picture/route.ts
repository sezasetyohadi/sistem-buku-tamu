import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '@/lib/jwt';

export async function DELETE(request: NextRequest) {
  try {
    // Get JWT token from cookie
    const accessToken = request.cookies.get('admin_access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json({
        success: false,
        message: 'No access token provided',
      }, { status: 401 });
    }

    // Verify JWT token
    const payload = verifyToken(accessToken, 'admin-panel');
    
    if (!payload || payload.userType !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'Invalid or expired token',
      }, { status: 401 });
    }

    // Get current profile picture path
    const getCurrentPictureQuery = 'SELECT profile_picture FROM admin WHERE id = ?';
    const currentPictureResult = await executeQuery<any[]>(getCurrentPictureQuery, [payload.userId]);
    
    if (currentPictureResult && currentPictureResult.length > 0 && currentPictureResult[0].profile_picture) {
      const currentPicturePath = currentPictureResult[0].profile_picture;
      
      // Try to delete the physical file
      try {
        // Extract filename from URL and construct file path
        const filename = path.basename(currentPicturePath);
        const filePath = path.join(process.cwd(), 'public', 'uploads', 'profiles', filename);
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (fileError) {
        console.error('Error deleting physical file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Update database to remove profile picture
    const updateQuery = 'UPDATE admin SET profile_picture = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    await executeQuery(updateQuery, [payload.userId]);

    return NextResponse.json({
      success: true,
      message: 'Profile picture deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
