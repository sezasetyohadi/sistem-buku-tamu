import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

import { NextRequest, NextResponse } from 'next/server';

import { executeQuery } from '@/backend/config/db';
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
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `admin_${payload.userId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update admin profile with new picture URL
    const pictureUrl = `/uploads/profiles/${fileName}`;
    const updateQuery = 'UPDATE admin SET profile_picture = ? WHERE id = ?';
    await executeQuery(updateQuery, [pictureUrl, payload.userId]);

    return NextResponse.json({
      success: true,
      message: 'Foto profil berhasil diunggah',
      profilePicture: pictureUrl
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return NextResponse.json({
      success: false,
      message: 'Gagal mengunggah foto profil',
    }, { status: 500 });
  }
}
