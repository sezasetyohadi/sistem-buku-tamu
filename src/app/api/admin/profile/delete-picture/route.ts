import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import fs from 'fs';
import path from 'path';

export async function DELETE(request: NextRequest) {
  try {
    // Check if admin is authenticated through cookie
    const authCookie = request.cookies.get('admin_auth');

    if (!authCookie) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access',
      }, { status: 401 });
    }

    // Get admin ID from the session header
    const adminSessionHeader = request.headers.get('x-admin-session');
    
    if (!adminSessionHeader) {
      return NextResponse.json({
        success: false,
        message: 'Admin session not found',
      }, { status: 401 });
    }

    let adminId;
    try {
      const adminSession = JSON.parse(adminSessionHeader);
      adminId = adminSession.id;
    } catch (error) {
      return NextResponse.json({
        success: false,
        message: 'Invalid admin session format',
      }, { status: 400 });
    }

    // Get current profile picture path
    const getCurrentPictureQuery = 'SELECT profile_picture FROM admin WHERE id = ?';
    const currentPictureResult = await executeQuery<any[]>(getCurrentPictureQuery, [adminId]);
    
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
    await executeQuery(updateQuery, [adminId]);

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
