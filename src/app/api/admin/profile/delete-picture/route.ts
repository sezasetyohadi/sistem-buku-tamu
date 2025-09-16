import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { deleteFromR2, extractKeyFromUrl } from '@/lib/cloudflare-r2';
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
      const currentPictureUrl = currentPictureResult[0].profile_picture;
      
      // Try to delete the file from R2
      try {
        const fileKey = extractKeyFromUrl(currentPictureUrl);
        if (fileKey) {
          await deleteFromR2(fileKey);
        }
      } catch (fileError) {
        console.error('Error deleting R2 file:', fileError);
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
