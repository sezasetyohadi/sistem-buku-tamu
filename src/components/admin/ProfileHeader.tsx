import React from 'react';
import { formatDate } from '../../utils/admin-profile-utils';

interface ProfileHeaderProps {
  lastModified: string;
  onBack: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ lastModified, onBack }) => {
  return (
    <div className="mb-8">
      {/* Mobile Layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Button Kembali */}
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 w-fit"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        
        {/* Judul Page */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil Admin</h1>
          <p className="text-gray-600 text-base">Kelola informasi akun administrator Anda</p>
        </div>
        
        {/* Terakhir Diubah */}
        {lastModified && (
          <div className="text-sm text-gray-500">
            <span className="font-medium">Terakhir diubah:</span> {formatDate(lastModified)}
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profil Admin</h1>
          <p className="text-gray-600 text-lg">Kelola informasi akun administrator Anda</p>
        </div>
        <div className="flex items-center space-x-4">
          {lastModified && (
            <div className="text-sm text-gray-500">
              <span className="font-medium">Terakhir diubah:</span> {formatDate(lastModified)}
            </div>
          )}
          <button
            onClick={onBack}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};