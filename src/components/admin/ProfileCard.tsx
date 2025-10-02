import React from 'react';
import { AdminProfile } from '../../types/admin-profile-types';
import { formatJoinDate, getInitials } from '../../utils/admin-profile-utils';
import { LoadingButton, InlineLoading } from '../ui/loading-states';
import { LOADING_MESSAGES } from '../../constants/loading';

interface ProfileCardProps {
  profile: AdminProfile | null;
  selectedFile: File | null;
  previewUrl: string | null;
  isDragOver: boolean;
  uploadingPicture: boolean;
  showDeleteConfirm: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDeleteConfirm: () => void;
  onUploadPicture: () => void;
  onResetFileSelection: () => void;
  getCurrentImage: () => string | null;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  selectedFile,
  previewUrl,
  isDragOver,
  uploadingPicture,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onDeleteConfirm,
  onUploadPicture,
  onResetFileSelection,
  getCurrentImage
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
        <div className="text-center">
          {/* Profile Image */}
          <div 
            className={`relative w-32 h-32 mx-auto mb-6 transition-all duration-300 ${
              isDragOver ? 'scale-105 ring-4 ring-red-300' : ''
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {getCurrentImage() ? (
              <div className="relative">
                <img
                  src={getCurrentImage()!}
                  alt="Profile"
                  className={`w-32 h-32 rounded-full object-cover ring-4 shadow-lg transition-all duration-300 ${
                    isDragOver ? 'ring-red-300' : 'ring-red-100 hover:ring-red-200'
                  }`}
                />
                {/* Drag over overlay */}
                {isDragOver && (
                  <div className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-full flex items-center justify-center border-2 border-dashed border-red-400">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              <div className={`w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center ring-4 shadow-lg transition-all duration-300 ${
                isDragOver ? 'ring-red-300 scale-105' : 'ring-red-100'
              }`}>
                {isDragOver ? (
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {profile ? getInitials(profile.nama_lengkap) : 'A'}
                  </span>
                )}
              </div>
            )}
            
            {/* Upload Button */}
            <button
              onClick={() => document.getElementById('profilePictureInput')?.click()}
              className="absolute -bottom-1 -right-1 w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200 shadow-lg group"
              title="Unggah foto profil"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>

            {/* Delete Picture Button */}
            {profile?.profile_picture && (
              <button
                onClick={onDeleteConfirm}
                className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-200 shadow-lg group"
                title="Hapus foto profil"
              >
                <svg className="w-4 h-4 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
            
            <input
              id="profilePictureInput"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {profile?.nama_lengkap || 'Administrator'}
          </h2>
          
          {/* Upload hint */}
          {!selectedFile && (
            <p className="text-xs text-gray-500 mb-3">
              Klik + atau drag foto untuk upload
            </p>
          )}
          
          <div className="flex items-center justify-center mb-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              profile?.role !== 'Admin' 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {profile?.role || 'Admin'}
            </span>
          </div>
          <p className="text-gray-500 mb-4">
            @{profile?.username || 'admin'}
          </p>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  ID Admin
                </span>
                <span className="font-medium text-gray-900">#{profile?.id || '1'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  Bergabung
                </span>
                <span className="font-medium text-gray-900">{profile ? formatJoinDate(profile.created_at) : '-'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                  Status
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                  Aktif
                </span>
              </div>
            </div>
            
            {/* File Upload Section */}
            {selectedFile && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-3 text-center">Preview Foto Profil Baru</h4>
                
                {/* Preview Image */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl!}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover ring-2 ring-blue-300 shadow-lg"
                    />
                    {/* Blue checkmark */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Foto baru yang akan digunakan</p>
                    <div className="text-xs text-gray-500">
                      <div className="truncate max-w-[200px] mx-auto" title={selectedFile.name}>
                        {selectedFile.name}
                      </div>
                      <div className="mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 w-full">
                    <LoadingButton
                      onClick={onResetFileSelection}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Batal
                    </LoadingButton>
                    <LoadingButton
                      onClick={onUploadPicture}
                      isLoading={uploadingPicture}
                      variant="danger"
                      size="sm"
                      className="flex-1"
                    >
                      Upload Foto
                    </LoadingButton>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload instructions */}
            {!selectedFile && !profile?.profile_picture && (
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  Drag & drop foto atau klik tombol + untuk upload
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Format: JPEG, PNG, WebP (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};