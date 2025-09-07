/**
 * Secure File Upload Handler
 * Provides secure file upload functionality with validation and protection
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, access, constants } from 'fs/promises';
import { join, extname, basename } from 'path';
import { createHash, randomBytes } from 'crypto';

// Configuration
const UPLOAD_CONFIG = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/gif': ['.gif'],
    'image/webp': ['.webp'],
    'application/pdf': ['.pdf'],
    'text/plain': ['.txt'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
  },
  uploadDir: join(process.cwd(), 'public', 'uploads'),
  profilesDir: join(process.cwd(), 'public', 'uploads', 'profiles'),
  documentsDir: join(process.cwd(), 'public', 'uploads', 'documents'),
  tempDir: join(process.cwd(), 'public', 'uploads', 'temp')
};

// Virus signature patterns (basic detection)
const VIRUS_SIGNATURES = [
  // Common virus/malware signatures in hex
  'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*', // EICAR test string
  '%PDF-1.', // PDF magic number
  '\\x7fELF', // ELF executable
  'MZ', // Windows executable
];

export class SecureFileUpload {
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
    if (!UPLOAD_CONFIG.allowedTypes[file.type]) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    // Check file extension matches MIME type
    const fileExt = extname(file.name).toLowerCase();
    const allowedExtensions = UPLOAD_CONFIG.allowedTypes[file.type];
    
    if (!allowedExtensions.includes(fileExt)) {
      return {
        isValid: false,
        error: `File extension ${fileExt} does not match MIME type ${file.type}`
      };
    }

    // Basic content validation
    const arrayBuffer = await file.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    
    // Check for virus signatures
    const contentString = Array.from(content).map(b => String.fromCharCode(b)).join('');
    
    for (const signature of VIRUS_SIGNATURES) {
      if (contentString.includes(signature)) {
        return {
          isValid: false,
          error: 'File contains suspicious content'
        };
      }
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
        if (!header.startsWith('255044462d')) {
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
    const userPrefix = userId ? `${userId}_` : '';
    
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
   * Upload file with security checks
   */
  static async uploadFile(
    file: File, 
    category: 'profiles' | 'documents' | 'temp' = 'temp',
    userId?: string
  ): Promise<{ success: boolean; filename?: string; path?: string; error?: string }> {
    try {
      // Validate file
      const validation = await this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Ensure directories exist
      await this.ensureSecureDirectories();

      // Generate secure filename
      const secureFilename = this.generateSecureFilename(file.name, userId);

      // Determine upload directory
      const uploadDir = join(UPLOAD_CONFIG.uploadDir, category);
      const filePath = join(uploadDir, secureFilename);

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file
      await writeFile(filePath, buffer);

      // Generate file hash for integrity verification
      const fileHash = createHash('sha256').update(buffer).digest('hex');
      
      console.log(`File uploaded successfully: ${secureFilename} (SHA256: ${fileHash})`);

      return {
        success: true,
        filename: secureFilename,
        path: `/uploads/${category}/${secureFilename}`
      };

    } catch (error) {
      console.error('File upload error:', error);
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
      const files = await readdir(UPLOAD_CONFIG.tempDir);
      const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000);

      for (const file of files) {
        if (file === '.htaccess') continue; // Skip .htaccess file
        
        const filePath = join(UPLOAD_CONFIG.tempDir, file);
        const stats = await stat(filePath);
        
        if (stats.mtime.getTime() < maxAge) {
          await unlink(filePath);
          console.log(`Cleaned up old temp file: ${file}`);
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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = (formData.get('category') as string) || 'temp';
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate category
    if (!['profiles', 'documents', 'temp'].includes(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    const result = await SecureFileUpload.uploadFile(file, category as any, userId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        filename: result.filename,
        path: result.path
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export default SecureFileUpload;
