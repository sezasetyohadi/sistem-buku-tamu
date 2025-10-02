import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProfile, EditForm } from '../types/admin-profile-types';
import { getPasswordStrength } from '../utils/admin-profile-utils';
import { getAdminData, clearAdminSessionAndRedirect } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface UseProfileFormProps {
  profile: AdminProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<AdminProfile | null>>;
  setSuccessMessage: (text: string) => void;
  setErrorMessage: (text: string) => void;
}

export const useProfileForm = ({ 
  profile, 
  setProfile, 
  setSuccessMessage, 
  setErrorMessage 
}: UseProfileFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPasswordStrength, setShowPasswordStrength] = useState(false);
  const router = useRouter();
  const { updateUser } = useAuth();

  const handleEdit = () => {
    if (profile) {
      setIsEditing(true);
      setEditForm({
        fullName: profile.nama_lengkap,
        email: profile.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if changing
      if (editForm.newPassword || editForm.confirmPassword) {
        if (!editForm.currentPassword) {
          setErrorMessage('Password saat ini diperlukan untuk mengubah password');
          setLoading(false);
          return;
        }
        
        if (editForm.newPassword !== editForm.confirmPassword) {
          setErrorMessage('Password baru dan konfirmasi password tidak cocok');
          setLoading(false);
          return;
        }
        
        if (editForm.newPassword.length < 8) {
          setErrorMessage('Password baru minimal 8 karakter');
          setLoading(false);
          return;
        }

        // Enhanced password strength validation
        const passwordStrength = getPasswordStrength(editForm.newPassword);
        if (passwordStrength.score < 3) {
          setErrorMessage('Password terlalu lemah. Gunakan kombinasi huruf besar, kecil, angka, dan simbol.');
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
        credentials: 'include',
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

        setSuccessMessage('Profile berhasil diperbarui!');
        setIsEditing(false);
        
        // Clear password fields
        setEditForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
      } else {
        setErrorMessage(data.message || 'Gagal memperbarui profile');
      }
      
    } catch (error) {
      setErrorMessage('Gagal memperbarui profile. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return {
    isEditing,
    editForm,
    loading,
    showPasswordStrength,
    handleEdit,
    handleCancel,
    handleInputChange,
    handleSave
  };
};