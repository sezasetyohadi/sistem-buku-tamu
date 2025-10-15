'use client';

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface FileUploadProps {
  label: string;
  name: string;
  accept?: string;
  maxSize?: number; // in bytes
  onFileSelect?: (file: File | null, url?: string, fileName?: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  hint?: string;
  value?: string; // URL of uploaded file
  onReset?: () => void; // Callback untuk reset
}

export interface FileUploadRef {
  reset: () => void;
}

const FileUpload = forwardRef<FileUploadRef, FileUploadProps>(({
  label,
  name,
  accept = '.jpg,.jpeg,.png,.pdf',
  maxSize = 5 * 1024 * 1024, // 5MB default
  onFileSelect,
  error,
  required = false,
  disabled = false,
  className = '',
  hint = 'Maksimal 5MB. Format: JPG, PNG, PDF',
  value,
  onReset
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{name: string, url: string} | null>(
    value ? { name: 'File terupload', url: value } : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Effect untuk handle reset dari luar
  useEffect(() => {
    if (onReset) {
      // Buat function untuk reset internal state
      const resetFileUpload = () => {
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        onFileSelect?.(null);
      };
      
      // Simpan ke window untuk bisa dipanggil dari luar
      (window as any).resetFileUpload = resetFileUpload;
    }
  }, [onReset, onFileSelect]);

  // Expose reset function through ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onFileSelect?.(null);
    }
  }), [onFileSelect]);

  // Reset internal ketika value prop berubah dari luar
  useEffect(() => {
    if (!value) {
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setUploadedFile({ name: 'File terupload', url: value });
    }
  }, [value]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File terlalu besar. Maksimal ${Math.round(maxSize / (1024 * 1024))}MB`;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.some(type => {
      if (type.startsWith('.')) {
        return type === fileExtension;
      }
      return file.type === type;
    })) {
      return `Format file tidak didukung. Gunakan: ${allowedTypes.join(', ')}`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'documents');
    formData.append('userId', 'guest');

    try {
      //console.log('🚀 Starting file upload:', file.name);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      /* console.log('📡 Upload response:', {
        status: response.status,
        ok: response.ok,
        result
      }); */

      if (!response.ok) {
        console.error('❌ Upload failed with status:', response.status, result);
        return { 
          success: false, 
          error: result.error || `Upload failed with status ${response.status}` 
        };
      }

      return result;
    } catch (error) {
      console.error('💥 Upload error:', error);
      return { success: false, error: 'Gagal upload file' };
    }
  };

  const processFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      //console.log('❌ File validation failed:', validationError);
      onFileSelect?.(null);
      return;
    }

    setUploading(true);

    try {
      //console.log('📁 Processing file:', file.name);
      const uploadResult = await uploadFile(file);
      
      //console.log('📤 Upload completed:', uploadResult);
      
      if (uploadResult.success && uploadResult.url) {
        const fileData = {
          name: file.name,
          url: uploadResult.url
        };
        setUploadedFile(fileData);
        onFileSelect?.(file, uploadResult.url, file.name); // Tambahkan nama file asli
        //console.log('✅ File upload successful:', uploadResult.url);
      } else {
        console.error('❌ Upload failed:', uploadResult.error);
        onFileSelect?.(null);
        setUploadedFile(null);
      }
    } catch (error) {
      console.error('💥 File processing error:', error);
      onFileSelect?.(null);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || uploading) return;

    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (disabled || uploading) return;
    
    setUploadedFile(null);
    onFileSelect?.(null);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700">
        {label}
        {required ? (
          <span className="text-red-500 ml-1">*</span>
        ) : (
          <span className="text-gray-500 font-normal ml-2">(Opsional)</span>
        )}
      </label>

      <div
        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleFileInput}
          disabled={disabled || uploading}
          className="hidden"
        />

        {uploadedFile ? (
          <div className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">File berhasil diupload</p>
                  <p className="text-xs text-gray-500 truncate max-w-xs">{uploadedFile.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile();
                }}
                disabled={disabled || uploading}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 text-center">
            {uploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-600">Mengupload file...</p>
              </div>
            ) : (
              <>
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag file ke sini
                </p>
                <p className="text-xs text-gray-500">{hint}</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs sm:text-sm mt-2 font-medium">{error}</p>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';

export default FileUpload;