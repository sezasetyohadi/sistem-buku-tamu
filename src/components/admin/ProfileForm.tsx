import React from 'react';
import { AdminProfile, EditForm } from '../../types/admin-profile-types';
import { getPasswordStrength } from '../../utils/admin-profile-utils';
import { LoadingButton } from '../ui/loading-states';
import { LOADING_MESSAGES } from '../../constants/loading';
import PasswordInput from '../ui/PasswordInput';

interface ProfileFormProps {
  profile: AdminProfile | null;
  isEditing: boolean;
  editForm: EditForm;
  loading: boolean;
  showPasswordStrength: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: (e: React.FormEvent) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profile,
  isEditing,
  editForm,
  loading,
  showPasswordStrength,
  onEdit,
  onCancel,
  onInputChange,
  onSave
}) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Informasi Akun</h3>
          {!isEditing && (
            <LoadingButton
              onClick={onEdit}
              variant="danger"
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </LoadingButton>
          )}
        </div>

        <div className="p-6">
          {!isEditing && profile ? (
            // View Mode
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{profile.nama_lengkap}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{profile.username}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-lg">{profile.email}</p>
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={onSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={onInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={editForm.email}
                    onChange={onInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                    required
                  />
                </div>
              </div>

              {/* Password Change Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Ubah Password (Opsional)</h4>
                <div className="space-y-4">
                  <PasswordInput
                    id="currentPassword"
                    name="currentPassword"
                    value={editForm.currentPassword}
                    onChange={onInputChange}
                    label="Password Saat Ini"
                    placeholder="Masukkan password saat ini"
                    autoComplete="current-password"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        value={editForm.newPassword}
                        onChange={onInputChange}
                        label="Password Baru"
                        placeholder="Masukkan password baru"
                        autoComplete="new-password"
                      />
                      {showPasswordStrength && editForm.newPassword && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Kekuatan Password:</span>
                            <span className={`text-sm font-semibold ${getPasswordStrength(editForm.newPassword).color}`}>
                              {getPasswordStrength(editForm.newPassword).level}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                getPasswordStrength(editForm.newPassword).score <= 1 ? 'bg-red-500' :
                                getPasswordStrength(editForm.newPassword).score <= 2 ? 'bg-orange-500' :
                                getPasswordStrength(editForm.newPassword).score <= 3 ? 'bg-yellow-500' :
                                getPasswordStrength(editForm.newPassword).score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${(getPasswordStrength(editForm.newPassword).score / 5) * 100}%` }}
                            ></div>
                          </div>
                          {getPasswordStrength(editForm.newPassword).feedback.length > 0 && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Perlu ditambahkan: </span>
                              {getPasswordStrength(editForm.newPassword).feedback.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <PasswordInput
                      id="confirmPassword"
                      name="confirmPassword"
                      value={editForm.confirmPassword}
                      onChange={onInputChange}
                      label="Konfirmasi Password"
                      placeholder="Konfirmasi password baru"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <LoadingButton
                  type="button"
                  onClick={onCancel}
                  variant="outline"
                  disabled={loading}
                >
                  Batal
                </LoadingButton>
                <LoadingButton
                  type="submit"
                  variant="danger"
                  isLoading={loading}
                >
                  Simpan Perubahan
                </LoadingButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};