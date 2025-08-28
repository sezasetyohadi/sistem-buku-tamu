import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/backend/config/db';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
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
    const fileName = `admin_${adminId}_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Update admin profile with new picture URL
    const pictureUrl = `/uploads/profiles/${fileName}`;
    const updateQuery = 'UPDATE admin SET profile_picture = ? WHERE id = ?';
    await executeQuery(updateQuery, [pictureUrl, adminId]);

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
