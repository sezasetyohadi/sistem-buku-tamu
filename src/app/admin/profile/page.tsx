"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminSessionData, clearAdminSessionAndRedirect } from "../../../lib/utils";

interface AdminProfile {
  id: number;
  username: string;
  email: string;
  nama_lengkap: string;
  role: string;
  created_at: string;
  is_super_admin: boolean;
  profile_picture?: string | null;
}

export default function AdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get admin session from localStorage
        const sessionData = getAdminSessionData() as any;
        if (!sessionData) {
          // Redirect to login if no session found
          clearAdminSessionAndRedirect(router);
          return;
        }
        
        const adminSession = localStorage.getItem('admin_session');
        const response = await fetch('/api/admin/profile', {
          headers: {
            'x-admin-session': adminSession || ''
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch admin profile');
        }

        const data = await response.json();
        
        if (data.success) {
          setProfile({
            id: data.admin.id,
            username: data.admin.username,
            email: data.admin.email || sessionData.email || '',
            nama_lengkap: data.admin.nama_lengkap || sessionData.nama_lengkap || 'Administrator',
            role: data.admin.is_super_admin ? 'Super Admin' : 'Admin',
            created_at: data.admin.created_at,
            is_super_admin: data.admin.is_super_admin,
            profile_picture: data.admin.profile_picture
          });

          setEditForm({
            fullName: data.admin.nama_lengkap || sessionData.nama_lengkap || 'Administrator',
            email: data.admin.email || sessionData.email || '',
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        } else {
          // Use session data as fallback
          setProfile({
            id: sessionData.id,
            username: sessionData.username,
            email: sessionData.email || '',
            nama_lengkap: sessionData.nama_lengkap || 'Administrator',
            role: sessionData.is_super_admin ? 'Super Admin' : 'Admin',
            created_at: sessionData.loginTime || new Date().toISOString(),
            is_super_admin: sessionData.is_super_admin,
            profile_picture: sessionData.profile_picture || null
          });

          setEditForm({
            fullName: sessionData.nama_lengkap || 'Administrator',
            email: sessionData.email || '',
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
        }
              } catch (error) {
          console.error('Error fetching admin profile:', error);
          // Try to get data from session as fallback
          try {
            const sessionData = getAdminSessionData() as any;
            if (sessionData) {
            setProfile({
              id: sessionData.id,
              username: sessionData.username,
              email: sessionData.email || '',
              nama_lengkap: sessionData.nama_lengkap || 'Administrator',
              role: sessionData.is_super_admin ? 'Super Admin' : 'Admin',
              created_at: sessionData.loginTime || new Date().toISOString(),
              is_super_admin: sessionData.is_super_admin,
              profile_picture: sessionData.profile_picture || null
            });

            setEditForm({
              fullName: sessionData.nama_lengkap || 'Administrator',
              email: sessionData.email || '',
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
                      } else {
              clearAdminSessionAndRedirect(router);
            }
          } catch (e) {
            clearAdminSessionAndRedirect(router);
          }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminProfile();
  }, [router]);

  const handleEdit = () => {
    if (profile) {
      setIsEditing(true);
      setMessage({ type: "", text: "" });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        fullName: profile.nama_lengkap,
        email: profile.email,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
    setMessage({ type: "", text: "" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: "error", text: "Format file tidak didukung. Gunakan JPEG, PNG, atau WebP" });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage({ type: "error", text: "Ukuran file terlalu besar. Maksimal 5MB" });
        return;
      }

      setSelectedFile(file);
      setMessage({ type: "", text: "" });
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Pilih file terlebih dahulu" });
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: "", text: "" });

    try {
      const sessionData = getAdminSessionData() as any;
      if (!sessionData) {
        clearAdminSessionAndRedirect(router);
        return;
      }

      const adminSession = localStorage.getItem('admin_session');
      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await fetch('/api/admin/profile/upload-picture', {
        method: 'POST',
        headers: {
          'x-admin-session': adminSession || ''
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: "Foto profil berhasil diunggah!" });
        setSelectedFile(null);
        
        // Update profile with new picture
        if (profile) {
          setProfile({
            ...profile,
            profile_picture: data.profilePicture
          });
        }

        // Update session data
        const currentSessionData = getAdminSessionData() as any;
        if (currentSessionData) {
          currentSessionData.profile_picture = data.profilePicture;
          localStorage.setItem('admin_session', JSON.stringify(currentSessionData));
        }
      } else {
        setMessage({ type: "error", text: data.message || "Gagal mengunggah foto profil" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Gagal mengunggah foto profil. Silakan coba lagi." });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate passwords if changing
      if (editForm.newPassword || editForm.confirmPassword) {
        if (!editForm.currentPassword) {
          setMessage({ type: "error", text: "Password saat ini diperlukan untuk mengubah password" });
          setLoading(false);
          return;
        }
        
        if (editForm.newPassword !== editForm.confirmPassword) {
          setMessage({ type: "error", text: "Password baru dan konfirmasi password tidak cocok" });
          setLoading(false);
          return;
        }
        
        if (editForm.newPassword.length < 6) {
          setMessage({ type: "error", text: "Password baru minimal 6 karakter" });
          setLoading(false);
          return;
        }
      }

      const sessionData = getAdminSessionData() as any;
      if (!sessionData) {
        clearAdminSessionAndRedirect(router);
        return;
      }
      
      const adminSession = localStorage.getItem('admin_session');

      // Call the actual API
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-session': adminSession
        },
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update profile with new data
        if (profile) {
          setProfile({
            ...profile,
            nama_lengkap: data.admin.nama_lengkap,
            email: data.admin.email,
          });
        }

        // Update session data
        const currentSessionData = getAdminSessionData() as any;
        if (currentSessionData) {
          currentSessionData.nama_lengkap = data.admin.nama_lengkap;
          currentSessionData.email = data.admin.email;
          localStorage.setItem('admin_session', JSON.stringify(currentSessionData));
        }

        setMessage({ type: "success", text: "Profile berhasil diperbarui!" });
        setIsEditing(false);
        
        // Clear password fields
        setEditForm(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        setMessage({ type: "error", text: data.message || "Gagal memperbarui profile" });
      }
      
    } catch (error) {
      setMessage({ type: "error", text: "Gagal memperbarui profile. Silakan coba lagi." });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full min-h-full">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Profile Admin</h1>
            <p className="text-sm sm:text-base text-gray-600">Kelola informasi akun administrator Anda</p>
          </div>
          <button
            onClick={() => router.back()}
            className="flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
        </div>
      </div>

      {/* Alert Message */}
      {message.text && (
        <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <svg className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 flex-shrink-0 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
            {message.type === 'success' ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          <span className="text-xs sm:text-sm">{message.text}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sm sm:text-base text-gray-700">Memuat profile...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4">
                  {profile?.profile_picture ? (
                    <img
                      src={profile.profile_picture}
                      alt="Profile"
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-red-100"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-600 rounded-full flex items-center justify-center ring-4 ring-red-100">
                      <span className="text-lg sm:text-2xl font-bold text-white">
                        {profile ? getInitials(profile.nama_lengkap) : 'A'}
                      </span>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <button
                    onClick={() => document.getElementById('profilePictureInput')?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors duration-200 shadow-lg"
                    title="Unggah foto profil"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  
                  <input
                    id="profilePictureInput"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1">
                  {profile?.nama_lengkap || 'Administrator'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-2">
                  {profile?.role || 'Admin'}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  @{profile?.username || 'admin'}
                </p>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-2">
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      ID: #{profile?.id || '1'}
                    </div>
                    <div className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Dibuat: {profile ? formatDate(profile.created_at) : '-'}
                    </div>
                  </div>
                  
                  {/* File Upload Section */}
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-700 truncate">{selectedFile.name}</span>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={handleUploadPicture}
                        disabled={uploadingPicture}
                        className="mt-2 w-full px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {uploadingPicture ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Mengunggah...
                          </>
                        ) : (
                          'Unggah Foto'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details & Edit Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Informasi Akun</h3>
                {!isEditing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit Profile
                  </button>
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
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          value={editForm.fullName}
                          onChange={handleInputChange}
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
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                          required
                        />
                      </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Ubah Password (Opsional)</h4>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={editForm.currentPassword}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                            placeholder="Masukkan password saat ini"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                            <input
                              type="password"
                              id="newPassword"
                              name="newPassword"
                              value={editForm.newPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                              placeholder="Masukkan password baru"
                            />
                          </div>
                          <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                            <input
                              type="password"
                              id="confirmPassword"
                              name="confirmPassword"
                              value={editForm.confirmPassword}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
                              placeholder="Konfirmasi password baru"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                        disabled={loading}
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Menyimpan...
                          </>
                        ) : (
                          'Simpan Perubahan'
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
