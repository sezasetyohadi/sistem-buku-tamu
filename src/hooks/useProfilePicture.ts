import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminProfile } from '../types/admin-profile-types';
import { validateFile } from '../utils/admin-profile-utils';
import { getAdminData, clearAdminSessionAndRedirect } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface UseProfilePictureProps {
  profile: AdminProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<AdminProfile | null>>;
  setSuccessMessage: (text: string) => void;
  setErrorMessage: (text: string) => void;
}

export const useProfilePicture = ({ 
  profile, 
  setProfile, 
  setSuccessMessage, 
  setErrorMessage 
}: UseProfilePictureProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const router = useRouter();
  const { updateUser } = useAuth();

  // Clean up preview URL when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // Handle keyboard events for modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showDeleteConfirm) {
        setShowDeleteConfirm(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showDeleteConfirm]);

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
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setErrorMessage(validation.error!);
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // Reset file input
      const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        setErrorMessage(validation.error!);
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleDeleteProfilePicture = async () => {
    setUploadingPicture(true);

    try {
      const adminData = await getAdminData();
      if (!adminData) {
        clearAdminSessionAndRedirect(router);
        return;
      }

      const response = await fetch('/api/admin/profile/delete-picture', {
        method: 'DELETE',
        credentials: 'include'
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
        setSuccessMessage('Foto profil berhasil dihapus!');
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

        // Update AuthContext
        updateUser({ profile_picture: null });

        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
          detail: { profilePicture: null } 
        }));
      } else {
        setErrorMessage(data.message || 'Gagal menghapus foto profil');
      }
    } catch (error) {
      setErrorMessage('Gagal menghapus foto profil. Silakan coba lagi.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const handleUploadPicture = async () => {
    if (!selectedFile) {
      setErrorMessage('Pilih file terlebih dahulu');
      return;
    }

    setUploadingPicture(true);

    try {
      const adminData = await getAdminData();
      if (!adminData) {
        clearAdminSessionAndRedirect(router);
        return;
      }

      const formData = new FormData();
      formData.append('profilePicture', selectedFile);

      const response = await fetch('/api/admin/profile/upload-picture', {
        method: 'POST',
        credentials: 'include',
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
        setSuccessMessage('Foto profil berhasil diunggah!');
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

        // Update AuthContext
        updateUser({ profile_picture: data.profilePicture });

        // Dispatch custom event to update header
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
          detail: { profilePicture: data.profilePicture } 
        }));
      } else {
        setErrorMessage(data.message || 'Gagal mengunggah foto profil');
      }
    } catch (error) {
      setErrorMessage('Gagal mengunggah foto profil. Silakan coba lagi.');
    } finally {
      setUploadingPicture(false);
    }
  };

  const resetFileSelection = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    const fileInput = document.getElementById('profilePictureInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const getCurrentImage = () => {
    return profile?.profile_picture || null;
  };

  return {
    selectedFile,
    previewUrl,
    isDragOver,
    uploadingPicture,
    showDeleteConfirm,
    setShowDeleteConfirm,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    handleDeleteProfilePicture,
    handleUploadPicture,
    resetFileSelection,
    getCurrentImage
  };
};