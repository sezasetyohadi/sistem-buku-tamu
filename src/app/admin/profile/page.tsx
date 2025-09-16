'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import PasswordInput from '../../../components/ui/PasswordInput';
import { useAuth } from '../../../contexts/AuthContext';
import { getAdminData, getAdminSessionData, clearAdminSessionAndRedirect } from '../../../lib/utils';

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
  const { updateUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const [lastModified, setLastModified] = useState<string>('');
  const router = useRouter();

    // Auto-hide message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
    return undefined; // Explicit return for when message.text is falsy
  }, [message.text]);  // Fetch admin profile data
  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        setIsLoading(true);
        
        // Use JWT-based authentication check
        const adminData = await getAdminData();
        if (!adminData) {
          // Redirect to login if not authenticated
          clearAdminSessionAndRedirect(router);
          return undefined;
        }
        
        // Fetch profile data using JWT authentication (cookies automatically included)
        const response = await fetch('/api/admin/profile', {
          method: 'GET',
          credentials: 'include' // Include JWT cookies
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid, redirect to login
            clearAdminSessionAndRedirect(router);
            return;
          }
          throw new Error('Failed to fetch admin profile');
        }

        const data = await response.json();
        
        if (data.success) {
          setProfile({
            id: data.admin.id,
            username: data.admin.username,
            email: data.admin.email || adminData.email || '',
            nama_lengkap: data.admin.nama_lengkap || adminData.nama_lengkap || 'Administrator',
            role: data.admin.is_super_admin ? 'Super Admin' : 'Admin',
            created_at: data.admin.created_at,
            is_super_admin: data.admin.is_super_admin,
            profile_picture: data.admin.profile_picture
          });

          setEditForm({
            fullName: data.admin.nama_lengkap || adminData.nama_lengkap || 'Administrator',
            email: data.admin.email || adminData.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });

          // Dispatch event to update layout component
          window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
            detail: { profilePicture: data.admin.profile_picture } 
          }));

          // Set last modified date
          setLastModified(data.admin.updated_at || data.admin.created_at);
        } else {
          // Use JWT admin data as fallback
          setProfile({
            id: adminData.id,
            username: adminData.username,
            email: adminData.email || '',
            nama_lengkap: adminData.nama_lengkap || 'Administrator',
            role: adminData.is_super_admin ? 'Super Admin' : 'Admin',
            created_at: adminData.created_at || new Date().toISOString(),
            is_super_admin: adminData.is_super_admin,
            profile_picture: adminData.profile_picture || null
          });

          setEditForm({
            fullName: adminData.nama_lengkap || 'Administrator',
            email: adminData.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        // If there's an error, redirect to login as JWT authentication failed
        clearAdminSessionAndRedirect(router);
      } finally {
        setIsLoading(false);
      }
    };

    // Return the fetch promise to ensure proper cleanup
    const fetchPromise = fetchAdminProfile();
    return () => {
      // Cleanup function if needed
    };
  }, [router]);

  const handleEdit = () => {
    if (profile) {
      setIsEditing(true);
      setMessage({ type: '', text: '' });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setEditForm({
        fullName: profile.nama_lengkap,
        email: profile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setMessage({ type: '', text: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Show password strength for new password
    if (name === 'newPassword') {
      setShowPasswordStrength(value.length > 0);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const feedback = [];

    if (password.length >= 8) {
      strength += 1;
    } else {
      feedback.push('Minimal 8 karakter');
    }

    if (/[A-Z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Huruf besar');
    }

    if (/[a-z]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Huruf kecil');
    }

    if (/\d/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Angka');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    } else {
      feedback.push('Simbol khusus');
    }

    const levels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
    const colors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600'];
    const bgColors = ['bg-red-100', 'bg-orange-100', 'bg-yellow-100', 'bg-blue-100', 'bg-green-100'];

    return {
      score: strength,
      level: levels[strength] || levels[0],
      color: colors[strength] || colors[0],
      bgColor: bgColors[strength] || bgColors[0],
      feedback: feedback
    };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP' });
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 5MB' });
        return;
      }

      setSelectedFile(file);
      setMessage({ type: '', text: '' });
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // Reset file input to allow same file selection
      const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setMessage({ type: 'error', text: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP' });
        // Reset input
        e.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setMessage({ type: 'error', text: 'Ukuran file terlalu besar. Maksimal 5MB' });
        // Reset input
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      setMessage({ type: '', text: '' });
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleDeleteProfilePicture = async () => {
    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    try {
      // Check JWT authentication
      const adminData = await getAdminData();
      if (!adminData) {
        clearAdminSessionAndRedirect(router);
        return;
      }

      const response = await fetch('/api/admin/profile/delete-picture', {
        method: 'DELETE',
        credentials: 'include' // Include JWT cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAdminSessionAndRedirect(router);
          return;
        }
        throw new Error('Failed to delete profile picture');
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Foto profil berhasil dihapus!' });
        setShowDeleteConfirm(false);
        
        // Clean up any preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        setSelectedFile(null);

        // Reset file input
        const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Update profile to remove picture
        if (profile) {
          setProfile({
            ...profile,
            profile_picture: null
          });
        }

        // Update AuthContext to remove profile picture
        updateUser({ profile_picture: null });

        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
          detail: { profilePicture: null } 
        }));
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menghapus foto profil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menghapus foto profil. Silakan coba lagi.' });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', text: 'Pilih file terlebih dahulu' });
      return;
    }

    setUploadingPicture(true);
    setMessage({ type: '', text: '' });

    try {
      // Check JWT authentication
      const adminData = await getAdminData();
      if (!adminData) {
        clearAdminSessionAndRedirect(router);
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await fetch('/api/admin/profile/upload-picture', {
        method: 'POST',
        credentials: 'include', // Include JWT cookies
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAdminSessionAndRedirect(router);
          return;
        }
        throw new Error('Failed to upload profile picture');
      }

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: 'Foto profil berhasil diunggah!' });
        setSelectedFile(null);
        
        // Clean up preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }

        // Reset file input
        const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Update profile with new picture
        if (profile) {
          setProfile({
            ...profile,
            profile_picture: data.profilePicture
          });
        }

        // Update AuthContext with new profile picture
        updateUser({ profile_picture: data.profilePicture });

        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
          detail: { profilePicture: data.profilePicture } 
        }));
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal mengunggah foto profil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal mengunggah foto profil. Silakan coba lagi.' });
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate passwords if changing
      if (editForm.newPassword || editForm.confirmPassword) {
        if (!editForm.currentPassword) {
          setMessage({ type: 'error', text: 'Password saat ini diperlukan untuk mengubah password' });
          setLoading(false);
          return;
        }
        
        if (editForm.newPassword !== editForm.confirmPassword) {
          setMessage({ type: 'error', text: 'Password baru dan konfirmasi password tidak cocok' });
          setLoading(false);
          return;
        }
        
        if (editForm.newPassword.length < 8) {
          setMessage({ type: 'error', text: 'Password baru minimal 8 karakter' });
          setLoading(false);
          return;
        }

        // Enhanced password strength validation
        const passwordStrength = getPasswordStrength(editForm.newPassword);
        if (passwordStrength.score < 3) {
          setMessage({ type: 'error', text: 'Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.' });
          setLoading(false);
          return;
        }
      }

      // Check JWT authentication
      const adminData = await getAdminData();
      if (!adminData) {
        clearAdminSessionAndRedirect(router);
        return;
      }

      // Call the actual API
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include JWT cookies
        body: JSON.stringify({
          fullName: editForm.fullName,
          email: editForm.email,
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          clearAdminSessionAndRedirect(router);
          return;
        }
        throw new Error('Failed to update profile');
      }

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

        // Update AuthContext with new profile data
        updateUser({
          nama_lengkap: data.admin.nama_lengkap,
          email: data.admin.email,
        });

        // Dispatch custom event to update header with new name
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
          detail: { nama_lengkap: data.admin.nama_lengkap } 
        }));

        setMessage({ type: 'success', text: 'Profile berhasil diperbarui!' });
        setIsEditing(false);
        
        // Clear password fields
        setEditForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal memperbarui profile' });
      }
      
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memperbarui profile. Silakan coba lagi.' });
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

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      return undefined;
    };
  }, [previewUrl]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showDeleteConfirm) {
          setShowDeleteConfirm(false);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      return undefined;
    };
  }, [showDeleteConfirm]);

  // Get current display image
  const getCurrentImage = () => {
    return profile?.profile_picture || null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Admin</h1>
            <p className="text-gray-600 text-lg">Kelola informasi akun administrator Anda</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastModified && (
              <div className="text-sm text-gray-500">
                <span className="font-medium">Terakhir diubah:</span> {formatDate(lastModified)}
              </div>
            )}
            <button
              onClick={() => router.back()}
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

      {/* Alert Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            <svg className={`w-5 h-5 mr-3 flex-shrink-0 ${message.type === 'success' ? 'text-green-500' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
              {message.type === 'success' ? (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              )}
            </svg>
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className={`ml-4 ${message.type === 'success' ? 'text-green-500 hover:text-green-700' : 'text-red-500 hover:text-red-700'} transition-colors`}
            title="Tutup"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-gray-700 text-lg">Memuat profile...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <div className="text-center">
                {/* Profile Image */}
                <div 
                  className={`relative w-32 h-32 mx-auto mb-6 transition-all duration-300 ${
                    isDragOver ? 'scale-105 ring-4 ring-red-300' : ''
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
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
                      onClick={() => setShowDeleteConfirm(true)}
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
                    onChange={handleFileChange}
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
                    profile?.is_super_admin 
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
                      
                      {/* Preview Image - Single large preview */}
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
                          <button
                            onClick={() => {
                              setSelectedFile(null);
                              if (previewUrl) {
                                URL.revokeObjectURL(previewUrl);
                                setPreviewUrl(null);
                              }
                              // Reset file input
                              const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
                              if (fileInput) {
                                fileInput.value = '';
                              }
                            }}
                            className="flex-1 px-4 py-2 text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                          >
                            Batal
                          </button>
                          <button
                            onClick={handleUploadPicture}
                            disabled={uploadingPicture}
                            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {uploadingPicture ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Mengupload...
                              </>
                            ) : (
                              'Upload Foto'
                            )}
                          </button>
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
                        <PasswordInput
                          id="currentPassword"
                          name="currentPassword"
                          value={editForm.currentPassword}
                          onChange={handleInputChange}
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
                              onChange={handleInputChange}
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
                            onChange={handleInputChange}
                            label="Konfirmasi Password"
                            placeholder="Konfirmasi password baru"
                            autoComplete="new-password"
                          />
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

      {/* Delete Profile Picture Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hapus Foto Profil</h3>
                <p className="text-gray-600">Apakah Anda yakin ingin menghapus foto profil?</p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                disabled={uploadingPicture}
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProfilePicture}
                disabled={uploadingPicture}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {uploadingPicture ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
