/**
 * Improved Guest Registration Form with Validation System
 * Example of how to integrate the new validation system
 */

'use client';

import React, { useState } from 'react';

import { 
  ValidatedInput, 
  ValidatedSelect, 
  ValidatedTextarea,
  FormGroup,
  ValidatedSubmitButton 
} from '@/components/ui/ValidatedFormComponents';
import { useValidatedSubmit } from '@/hooks/useValidation';
import { guestLogger } from '@/lib/logger';
import { showToast } from '@/lib/toast';
import { GUEST_REGISTRATION_SCHEMA } from '@/lib/validation-schemas';

interface ImprovedGuestRegistrationFormProps {
  onSubmit?: (data: any) => Promise<{success: boolean, guestData?: any, tokenData?: any}>;
  isInModal?: boolean;
}

export default function ImprovedGuestRegistrationForm({ 
  onSubmit,
  isInModal = false 
}: ImprovedGuestRegistrationFormProps) {
  
  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    education: '',
    profession: '',
    company: '',
    purpose: '',
    department: '',
    notes: ''
  });

  // Options for select fields
  const [professionOptions] = useState([
    { value: 'PNS', label: 'Pegawai Negeri Sipil' },
    { value: 'Swasta', label: 'Karyawan Swasta' },
    { value: 'Wiraswasta', label: 'Wiraswasta' },
    { value: 'Mahasiswa', label: 'Mahasiswa' },
    { value: 'Lainnya', label: 'Lainnya' }
  ]);

  const [educationOptions] = useState([
    { value: 'SD', label: 'SD' },
    { value: 'SMP', label: 'SMP' },
    { value: 'SMA/SMK', label: 'SMA/SMK' },
    { value: 'D3', label: 'D3' },
    { value: 'S1', label: 'S1' },
    { value: 'S2', label: 'S2' },
    { value: 'S3', label: 'S3' }
  ]);

  const [departmentOptions] = useState([
    { value: 'bidang-1', label: 'Bidang Penempatan dan Perluasan Kerja' },
    { value: 'bidang-2', label: 'Bidang Pelatihan Kerja' },
    { value: 'bidang-3', label: 'Bidang Hubungan Industrial' },
    { value: 'bidang-4', label: 'Bidang Transmigrasi' }
  ]);

  // Use validation hook
  const validation = useValidatedSubmit(
    formData,
    GUEST_REGISTRATION_SCHEMA,
    async (validData) => {
      try {
        guestLogger.info('Submitting guest registration form');
        
        if (onSubmit) {
          const result = await onSubmit(validData);
          if (result.success) {
            showToast.success('Registrasi berhasil! Token Anda telah dikirim ke email.');
            
            // Reset form after successful submission
            setFormData({
              name: '',
              email: '',
              phone: '',
              address: '',
              gender: '',
              education: '',
              profession: '',
              company: '',
              purpose: '',
              department: '',
              notes: ''
            });
          } else {
            throw new Error('Registrasi gagal');
          }
        }
      } catch (error) {
        guestLogger.error('Guest registration failed:', error);
        throw error;
      }
    },
    {
      showToastOnError: true,
      resetOnSuccess: true
    }
  );

  // Handle form field changes
  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    validation.onFieldChange(fieldName, value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await validation.submit();
  };

  return (
    <div className={`max-w-2xl mx-auto ${isInModal ? 'p-4' : 'p-6 bg-white rounded-lg shadow-lg'}`}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registrasi Tamu
        </h2>
        <p className="text-gray-600">
          Silakan lengkapi formulir berikut untuk mendaftar sebagai tamu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <FormGroup 
          title="Informasi Pribadi"
          description="Data diri dan kontak"
        >
          <ValidatedInput
            label="Nama Lengkap"
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onBlur={() => validation.onFieldBlur('name')}
            error={validation.getError('name')}
            touched={!!formData.name || validation.hasError('name')}
            required
            placeholder="Masukkan nama lengkap"
            hint="Nama sesuai identitas resmi"
          />

          <ValidatedInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            onBlur={() => validation.onFieldBlur('email')}
            error={validation.getError('email')}
            touched={!!formData.email || validation.hasError('email')}
            required
            placeholder="contoh@email.com"
            hint="Token akan dikirim ke email ini"
          />

          <ValidatedInput
            label="Nomor Telepon"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleFieldChange('phone', e.target.value)}
            onBlur={() => validation.onFieldBlur('phone')}
            error={validation.getError('phone')}
            touched={!!formData.phone || validation.hasError('phone')}
            required
            placeholder="08123456789"
            hint="Nomor telepon aktif"
          />

          <ValidatedTextarea
            label="Alamat Lengkap"
            value={formData.address}
            onChange={(e) => handleFieldChange('address', e.target.value)}
            onBlur={() => validation.onFieldBlur('address')}
            error={validation.getError('address')}
            touched={!!formData.address || validation.hasError('address')}
            required
            placeholder="Alamat lengkap dengan RT/RW, kelurahan, kecamatan"
            rows={3}
            maxLength={200}
            showCharacterCount
          />

          <ValidatedSelect
            label="Jenis Kelamin"
            value={formData.gender}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            onBlur={() => validation.onFieldBlur('gender')}
            error={validation.getError('gender')}
            touched={!!formData.gender || validation.hasError('gender')}
            required
            options={[
              { value: 'Laki-laki', label: 'Laki-laki' },
              { value: 'Perempuan', label: 'Perempuan' }
            ]}
          />

          <ValidatedSelect
            label="Pendidikan Terakhir"
            value={formData.education}
            onChange={(e) => handleFieldChange('education', e.target.value)}
            onBlur={() => validation.onFieldBlur('education')}
            error={validation.getError('education')}
            touched={!!formData.education || validation.hasError('education')}
            required
            options={educationOptions}
          />
        </FormGroup>

        {/* Professional Information */}
        <FormGroup 
          title="Informasi Pekerjaan"
          description="Data pekerjaan dan instansi"
        >
          <ValidatedSelect
            label="Profesi/Pekerjaan"
            value={formData.profession}
            onChange={(e) => handleFieldChange('profession', e.target.value)}
            onBlur={() => validation.onFieldBlur('profession')}
            error={validation.getError('profession')}
            touched={!!formData.profession || validation.hasError('profession')}
            required
            options={professionOptions}
          />

          <ValidatedInput
            label="Nama Instansi/Perusahaan"
            type="text"
            value={formData.company}
            onChange={(e) => handleFieldChange('company', e.target.value)}
            onBlur={() => validation.onFieldBlur('company')}
            error={validation.getError('company')}
            touched={!!formData.company || validation.hasError('company')}
            placeholder="Nama tempat bekerja (opsional)"
            hint="Kosongkan jika tidak bekerja"
          />
        </FormGroup>

        {/* Visit Information */}
        <FormGroup 
          title="Informasi Kunjungan"
          description="Tujuan dan keperluan kunjungan"
        >
          <ValidatedSelect
            label="Bidang Tujuan"
            value={formData.department}
            onChange={(e) => handleFieldChange('department', e.target.value)}
            onBlur={() => validation.onFieldBlur('department')}
            error={validation.getError('department')}
            touched={!!formData.department || validation.hasError('department')}
            required
            options={departmentOptions}
          />

          <ValidatedTextarea
            label="Keperluan/Tujuan Kunjungan"
            value={formData.purpose}
            onChange={(e) => handleFieldChange('purpose', e.target.value)}
            onBlur={() => validation.onFieldBlur('purpose')}
            error={validation.getError('purpose')}
            touched={!!formData.purpose || validation.hasError('purpose')}
            required
            placeholder="Jelaskan keperluan kunjungan Anda"
            rows={3}
            maxLength={200}
            showCharacterCount
          />

          <ValidatedTextarea
            label="Catatan Tambahan"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            placeholder="Catatan atau informasi tambahan (opsional)"
            rows={2}
            maxLength={100}
            showCharacterCount
            hint="Informasi tambahan yang perlu diketahui"
          />
        </FormGroup>

        {/* Submit Button */}
        <div className="pt-4">
          <ValidatedSubmitButton
            isSubmitting={validation.isSubmitting}
            isValid={validation.isValid}
            loadingText="Mengirim data..."
          >
            Daftar Sekarang
          </ValidatedSubmitButton>
        </div>

        {/* Form Summary */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs">
            <p><strong>Debug Info:</strong></p>
            <p>Valid: {validation.isValid ? 'Yes' : 'No'}</p>
            <p>Errors: {Object.keys(validation.errors).length}</p>
            {Object.keys(validation.errors).length > 0 && (
              <pre className="text-red-600 mt-1">
                {JSON.stringify(validation.errors, null, 2)}
              </pre>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
