/**
 * Secure File Upload API Route
 * Handles file uploads with comprehensive security validation
 */

import { NextRequest } from 'next/server';

import { handleFileUpload } from '@/lib/secure-file-upload';

export async function POST(request: NextRequest) {
  return handleFileUpload(request);
}

// Rate limiting and size restrictions are handled by Next.js config and middleware
export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};
