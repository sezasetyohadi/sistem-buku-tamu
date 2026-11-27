/**
 * Secure File Upload Handler
 * Provides secure file upload functionality with validation and protection
 */

import { randomBytes } from 'crypto';
import { writeFile, mkdir, access, constants } from 'fs/promises';
import { join, extname, basename } from 'path';

import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generateFileKey } from './cloudflare-r2';

// Configuration
const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf']
  },
  uploadDir: join(process.cwd(), 'public', 'uploads'),
  profilesDir: join(process.cwd(), 'public', 'uploads', 'profiles'),
  documentsDir: join(process.cwd(), 'public', 'uploads', 'documents'),
  tempDir: join(process.cwd(), 'public', 'uploads', 'temp')
};

export class SecureFileUpload {
  private static sanitizeUserId(userId?: string): string | undefined {
    return userId?.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || undefined;
  }

  /**
   * Validate file before upload
   */
  static async validateFile(file: File): Promise<{ isValid: boolean; error?: string }> {
    // Check file size
    if (file.size > UPLOAD_CONFIG.maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds limit of ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`
      };
    }

    // Check MIME type
    const allowedTypes = UPLOAD_CONFIG.allowedTypes as Record<string, string[]>;
    if (!allowedTypes[file.type]) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Check file extension matches MIME type
    const fileExt = extname(file.name).toLowerCase();
    const allowedExtensions = allowedTypes[file.type];
    
    if (!allowedExtensions.includes(fileExt)) {
      return {
        isValid: false,
        error: `File extension ${fileExt} does not match MIME type ${file.type}`
      };
    }

    // Basic content validation
    const arrayBuffer = await file.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    
    // Check for executable signatures that shouldn't be in documents
    const header = Array.from(content.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Check for Windows executable (MZ header)
    if (header.startsWith('4d5a')) { // MZ in hex
      return {
        isValid: false,
        error: 'Executable files are not allowed'
      };
    }
    
    // Check for ELF executable
    if (header.startsWith('7f454c46')) { // ELF in hex
      return {
        isValid: false,
        error: 'Executable files are not allowed'
      };
    }
    
    // Check for EICAR test string (only check first 100 bytes as text)
    const textContent = Array.from(content.slice(0, 100)).map(b => String.fromCharCode(b)).join('');
    if (textContent.includes('X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*')) {
      return {
        isValid: false,
        error: 'File contains test virus signature'
      };
    }

    // Validate file headers
    const headerValidation = this.validateFileHeader(content, file.type);
    if (!headerValidation.isValid) {
      return headerValidation;
    }

    return { isValid: true };
  }

  /**
   * Validate file headers match expected MIME type
   */
  private static validateFileHeader(content: Uint8Array, mimeType: string): { isValid: boolean; error?: string } {
    const header = Array.from(content.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    switch (mimeType) {
      case 'image/jpeg':
        if (!header.startsWith('ffd8ff')) {
          return { isValid: false, error: 'Invalid JPEG file header' };
        }
        break;
      case 'image/png':
        if (!header.startsWith('89504e47')) {
          return { isValid: false, error: 'Invalid PNG file header' };
        }
        break;
      case 'image/gif':
        if (!header.startsWith('474946383761') && !header.startsWith('474946383961')) {
          return { isValid: false, error: 'Invalid GIF file header' };
        }
        break;
      case 'application/pdf':
        if (!header.startsWith('255044462d')) { // %PDF- in hex
          return { isValid: false, error: 'Invalid PDF file header' };
        }
        break;
    }

    return { isValid: true };
  }

  /**
   * Generate secure filename
   */
  static generateSecureFilename(originalName: string, userId?: string): string {
    const ext = extname(originalName);
    const baseName = basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '');
    const timestamp = Date.now();
    const randomSuffix = randomBytes(8).toString('hex');
    const safeUserId = this.sanitizeUserId(userId);
    const userPrefix = safeUserId ? `${safeUserId}_` : '';
    
    return `${userPrefix}${baseName}_${timestamp}_${randomSuffix}${ext}`;
  }

  /**
   * Ensure upload directories exist and are properly secured
   */
  static async ensureSecureDirectories(): Promise<void> {
    const directories = [
      UPLOAD_CONFIG.uploadDir,
      UPLOAD_CONFIG.profilesDir,
      UPLOAD_CONFIG.documentsDir,
      UPLOAD_CONFIG.tempDir
    ];

    for (const dir of directories) {
      try {
        await access(dir, constants.F_OK);
      } catch {
        await mkdir(dir, { recursive: true, mode: 0o755 });
      }

      // Create .htaccess file to prevent direct execution of uploaded files
      const htaccessPath = join(dir, '.htaccess');
      const htaccessContent = `
# Deny execution of scripts
<Files "*">
    SetHandler default-handler
</Files>

# Prevent access to sensitive files
<Files "*.php">
    Order Allow,Deny
    Deny from all
</Files>

<Files "*.exe">
    Order Allow,Deny
    Deny from all
</Files>

<Files "*.sh">
    Order Allow,Deny
    Deny from all
</Files>

# Only allow specific file types
<FilesMatch "\\.(jpg|jpeg|png|gif|webp|pdf|txt|docx|xlsx)$">
    Order Allow,Deny
    Allow from all
</FilesMatch>
`;

      try {
        await writeFile(htaccessPath, htaccessContent.trim());
      } catch (error) {
        console.warn('Could not create .htaccess file:', error);
      }
    }
  }

  /**
   * Upload file with security checks using Cloudflare R2 or local fallback
   */
  static async uploadFile(
    file: File, 
    category: 'profiles' | 'documents' | 'temp' = 'documents',
    userId?: string
  ): Promise<{ success: boolean; url?: string; filename?: string; path?: string; error?: string }> {
    try {
      //console.log('🔍 Starting file upload process for:', file.name);
      
      // Validate file
      //console.log('✅ Validating file...');
      const validation = await this.validateFile(file);
      if (!validation.isValid) {
        //console.log('❌ File validation failed:', validation.error);
        return { success: false, error: validation.error };
      }
      //console.log('✅ File validation passed');

      // Generate secure filename and R2 key
      const safeUserId = this.sanitizeUserId(userId);
      const secureFilename = this.generateSecureFilename(file.name, safeUserId);
      const fileExtension = extname(file.name).toLowerCase().substring(1); // Remove the dot

      /* console.log('📝 Generated filenames:', {
        original: file.name,
        secure: secureFilename,
        extension: fileExtension
      }); */

      // Check if Cloudflare R2 is configured
      const hasR2Config = process.env.CF_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && 
                         process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET;

      if (hasR2Config) {
        //console.log('☁️ Using Cloudflare R2 storage...');
        try {
          const r2Key = generateFileKey(category, safeUserId || 'guest', fileExtension);
          const uploadResult = await uploadToR2(file, r2Key, file.type);
          //console.log('✅ Upload to R2 successful:', uploadResult.url);
          
          return {
            success: true,
            url: uploadResult.url,
            filename: secureFilename,
            path: uploadResult.url
          };
        } catch (r2Error) {
          console.error('💥 Cloudflare R2 upload failed:', r2Error);
          if (process.env.NODE_ENV === 'production') {
            return { success: false, error: 'Cloudflare R2 upload failed' };
          }
        }
      } else {
        //console.log('⚠️ Cloudflare R2 not configured, using local storage...');
        if (process.env.NODE_ENV === 'production') {
          return { success: false, error: 'Cloudflare R2 is not configured' };
        }
      }

      // Fallback to local storage
      //console.log('💾 Using local storage fallback...');
      await this.ensureSecureDirectories();

      // Determine upload directory
      const uploadDir = join(/*turbopackIgnore: true*/ UPLOAD_CONFIG.uploadDir, category);
      const filePath = join(/*turbopackIgnore: true*/ uploadDir, secureFilename);

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file
      await writeFile(filePath, buffer);

      const localUrl = `/uploads/${category}/${secureFilename}`;
      //console.log('✅ Local upload successful:', localUrl);

      return {
        success: true,
        filename: secureFilename,
        path: localUrl,
        url: localUrl
      };

    } catch (error) {
      console.error('💥 File upload error:', error);
      return { 
        success: false, 
        error: 'Failed to upload file' 
      };
    }
  }

  /**
   * Clean up temporary files older than specified age
   */
  static async cleanupTempFiles(maxAgeHours: number = 24): Promise<void> {
    try {
      const { readdir, stat, unlink } = await import('fs/promises');
      const files = await readdir(/*turbopackIgnore: true*/ UPLOAD_CONFIG.tempDir);
      const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000);

      for (const file of files) {
        if (file === '.htaccess') {continue;} // Skip .htaccess file
        
        const filePath = join(/*turbopackIgnore: true*/ UPLOAD_CONFIG.tempDir, file);
        const stats = await stat(/*turbopackIgnore: true*/ filePath);
        
        if (stats.mtime.getTime() < maxAge) {
          await unlink(/*turbopackIgnore: true*/ filePath);
          //console.log(`Cleaned up old temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }
}

// API route handler for file uploads
export async function handleFileUpload(request: NextRequest): Promise<NextResponse> {
  try {
    //console.log('🔄 File upload request received');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'documents';
    const userId = formData.get('userId') as string;

    /* console.log('📋 Upload request details:', {
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
      category,
      userId
    }); */

    if (!file) {
      //console.log('❌ No file provided in request');
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate category
    if (!['profiles', 'documents', 'temp'].includes(category)) {
      //console.log('❌ Invalid category:', category);
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    //console.log('🔍 Starting file validation...');
    const result = await SecureFileUpload.uploadFile(file, category as any, userId);

    /* console.log('📤 Upload result:', {
      success: result.success,
      hasUrl: !!result.url,
      hasFilename: !!result.filename,
      error: result.error
    }); */

    if (result.success) {
      return NextResponse.json({
        success: true,
        filename: result.filename,
        url: result.url,
        path: result.path
      });
    } else {
      //console.log('❌ Upload failed:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('💥 Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export default SecureFileUpload;
