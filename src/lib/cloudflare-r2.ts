import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Konfigurasi Cloudflare R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload file ke Cloudflare R2
 */
export async function uploadToR2(
  file: File | Buffer,
  key: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    console.log('🚀 Starting R2 upload with key:', key);
    
    let buffer: Buffer;
    let fileContentType: string;

    if (file instanceof File) {
      buffer = Buffer.from(await file.arrayBuffer());
      fileContentType = contentType || file.type;
      console.log('📁 File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        bufferSize: buffer.length
      });
    } else {
      buffer = file;
      fileContentType = contentType || 'application/octet-stream';
      console.log('📦 Buffer upload, size:', buffer.length);
    }

    // Check environment configuration
    const config = {
      hasAccountId: !!process.env.CF_ACCOUNT_ID,
      hasAccessKey: !!process.env.R2_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.R2_SECRET_ACCESS_KEY,
      hasBucket: !!process.env.R2_BUCKET,
      hasPublicUrl: !!process.env.R2_PUBLIC_URL
    };
    console.log('🔧 R2 Configuration check:', config);

    if (!process.env.CF_ACCOUNT_ID || !process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || !process.env.R2_BUCKET) {
      throw new Error('Missing required Cloudflare R2 environment variables');
    }

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: fileContentType,
    });

    console.log('📤 Executing R2 upload command...');
    await r2Client.send(command);
    console.log('✅ R2 upload completed successfully');

    // Construct the public URL using custom domain
    const publicUrl = process.env.R2_PUBLIC_URL || `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET}`;
    const url = `${publicUrl}/${key}`;

    console.log('🔗 Generated public URL:', url);

    return { url, key };
  } catch (error) {
    console.error('💥 Error uploading to R2:', error);
    throw new Error('Failed to upload file to R2');
  }
}

/**
 * Delete file dari Cloudflare R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete file from R2');
  }
}

/**
 * Generate unique key untuk file
 */
export function generateFileKey(prefix: string, userId: string, extension: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `${prefix}/${userId}_${timestamp}_${randomString}.${extension}`;
}

/**
 * Extract key dari URL R2
 */
export function extractKeyFromUrl(url: string): string | null {
  const match = url.match(/\/([^\/]+)\/(.+)$/);
  return match ? match[2] : null;
}