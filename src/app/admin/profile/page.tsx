'use client';

import { useRouter } from 'next/navigation';
import { ProfileHeader } from '../../../components/admin/ProfileHeader';
import { ProfileCard } from '../../../components/admin/ProfileCard';
import { ProfileForm } from '../../../components/admin/ProfileForm';
import { AlertMessage } from '../../../components/ui/AlertMessage';
import { LoadingSpinner } from '../../../components/ui/loading-states';
import { LOADING_MESSAGES } from '../../../constants/loading';
import { DeleteConfirmDialog } from '../../../components/ui/DeleteConfirmDialog';
import { useAdminProfile } from '../../../hooks/useAdminProfile';
import { useProfilePicture } from '../../../hooks/useProfilePicture';
import { useProfileForm } from '../../../hooks/useProfileForm';
import { useMessage } from '../../../hooks/useMessage';

export default function AdminProfile() {
  const router = useRouter();
  const { profile, isLoading, lastModified, setProfile } = useAdminProfile();
  const { message, clearMessage, setSuccessMessage, setErrorMessage } = useMessage();
  
  const profilePicture = useProfilePicture({
    profile,
    setProfile,
    setSuccessMessage,
    setErrorMessage
  });
  
  const profileForm = useProfileForm({
    profile,
    setProfile,
    setSuccessMessage,
    setErrorMessage
  });

  if (isLoading) {
    return <LoadingSpinner message={LOADING_MESSAGES.PROFILE} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen">
      <ProfileHeader 
        lastModified={lastModified} 
        onBack={() => router.back()} 
      />
      
      <AlertMessage 
        message={message} 
        onClose={clearMessage} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ProfileCard
          profile={profile}
          selectedFile={profilePicture.selectedFile}
          previewUrl={profilePicture.previewUrl}
          isDragOver={profilePicture.isDragOver}
          uploadingPicture={profilePicture.uploadingPicture}
          showDeleteConfirm={profilePicture.showDeleteConfirm}
          onFileChange={profilePicture.handleFileChange}
          onDragOver={profilePicture.handleDragOver}
          onDragLeave={profilePicture.handleDragLeave}
          onDrop={profilePicture.handleDrop}
          onDeleteConfirm={() => profilePicture.setShowDeleteConfirm(true)}
          onUploadPicture={profilePicture.handleUploadPicture}
          onResetFileSelection={profilePicture.resetFileSelection}
          getCurrentImage={profilePicture.getCurrentImage}
        />
        
        <ProfileForm
          profile={profile}
          isEditing={profileForm.isEditing}
          editForm={profileForm.editForm}
          loading={profileForm.loading}
          showPasswordStrength={profileForm.showPasswordStrength}
          onEdit={profileForm.handleEdit}
          onCancel={profileForm.handleCancel}
          onInputChange={profileForm.handleInputChange}
          onSave={profileForm.handleSave}
        />
      </div>

      <DeleteConfirmDialog
        show={profilePicture.showDeleteConfirm}
        loading={profilePicture.uploadingPicture}
        onConfirm={profilePicture.handleDeleteProfilePicture}
        onCancel={() => profilePicture.setShowDeleteConfirm(false)}
        title="Hapus Foto Profil"
        message="Apakah Anda yakin ingin menghapus foto profil?"
        variant="simple"
      />
    </div>
  );
}
