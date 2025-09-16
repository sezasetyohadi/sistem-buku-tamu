import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
import { uploadToR2, generateFileKey, extractKeyFromUrl, deleteFromR2 } from '@/lib/cloudflare-r2';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('profilePicture') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        message: 'Tidak ada file yang diunggah',
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({
        success: false,
        message: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP',
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 5MB',
      }, { status: 400 });
    }

    // Create uploads directory if it doesn't exist
    // Not needed for R2 storage

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    if (!fileExtension) {
      return NextResponse.json({
        success: false,
        message: 'File tidak memiliki ekstensi',
      }, { status: 400 });
    }

    // Generate unique key for R2
    const fileKey = generateFileKey('profiles', payload.userId.toString(), fileExtension);

    // Get current profile picture to delete old one if exists
    const currentProfileQuery = 'SELECT profile_picture FROM admin WHERE id = ?';
    const currentProfile = await executeQuery<any[]>(currentProfileQuery, [payload.userId]);
    
    let oldFileKey: string | null = null;
    if (currentProfile && currentProfile.length > 0 && currentProfile[0].profile_picture) {
      oldFileKey = extractKeyFromUrl(currentProfile[0].profile_picture);
    }

    // Upload file to Cloudflare R2
    const uploadResult = await uploadToR2(file, fileKey, file.type);

    // Update admin profile with new picture URL
    const updateQuery = 'UPDATE admin SET profile_picture = ? WHERE id = ?';
    await executeQuery(updateQuery, [uploadResult.url, payload.userId]);

    // Delete old profile picture from R2 if exists
    if (oldFileKey) {
      try {
        await deleteFromR2(oldFileKey);
      } catch (error) {
        console.warn('Warning: Could not delete old profile picture:', error);
        // Continue execution as this is not critical
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil diunggah',
      profilePicture: uploadResult.url
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengunggah foto profil',
    }, { status: 500 });
  }
}
