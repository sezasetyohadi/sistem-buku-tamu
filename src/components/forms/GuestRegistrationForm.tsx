// Komponen form untuk registrasi tamu
// Filename: GuestRegistrationForm.tsx

'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { FormSkeleton, LoadingButton } from '@/components/ui/Loading';
import { LoadingWrapper } from '@/components/ui/LoadingState';
import TurnstileCaptcha from '@/components/ui/TurnstileCaptcha';
import { useApiCall, useMutation } from '@/hooks/useDataFetching';
import { useTurnstileCaptcha } from '@/hooks/useTurnstileCaptcha';
import { guestLogger, safeLog } from '@/lib/logger';
import { showToast } from '@/lib/toast';

import Card from '../ui/Card';
import FileUpload, { FileUploadRef } from '../ui/FileUpload';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import PrimaryButton from '../ui/PrimaryButton';
import TokenModal from '../ui/TokenModal';


interface GuestRegistrationFormProps {
  onSubmit?: (data: any) => Promise<{success: boolean, guestData?: any, tokenData?: any}>;
  isLoading?: boolean;
  isInModal?: boolean; // New prop to indicate if the form is displayed in a modal
}

export default function GuestRegistrationForm({ 
  onSubmit, 
  isLoading = false,
  isInModal = false 
}: GuestRegistrationFormProps) {
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
    cara_memperoleh: [] as number[], // Changed to number array for IDs
    notes: '',
    fileUpload: '', // URL dari file yang diupload
    fileName: '' // Nama file asli
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [token, setToken] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileUploadRef = useRef<FileUploadRef>(null);
  const router = useRouter();

  // CAPTCHA hook
  const {
    captchaToken,
    isCaptchaVerified,
    captchaError,
    handleCaptchaVerify,
    handleCaptchaError,
    handleCaptchaExpire,
    resetCaptcha,
    getCaptchaValidationError
  } = useTurnstileCaptcha({
    required: true,
    onVerificationChange: (isVerified) => {
      console.log('CAPTCHA verification status changed:', isVerified);
    }
  });

  // Use API hooks for loading form options
  const {
    data: formOptions,
    loading: optionsLoading,
    error: optionsError,
  } = useApiCall<{
    professions: Array<{id: number, nama_profesi: string}>;
    educationLevels: Array<{id: number, pendidikan_terakhir: string}>;
    tujuanKunjungan: Array<{id: number, tujuan: string}>;
    memperolehInformasi: Array<{id: number, nama_opsi: string}>;
    mendapatkanSalinan: Array<{id: number, nama_opsi: string}>;
  }>('/api/lookup', {
    immediate: true,
    loadingKey: 'form-options',
  });

  // Debug: Log the API response
  React.useEffect(() => {
    if (formOptions) {
      console.log('Form options loaded:', formOptions);
      console.log('Professions:', formOptions.professions);
      console.log('Education levels:', formOptions.educationLevels);
    }
  }, [formOptions]);

  // Use mutation hook for form submission
  const { mutate: submitForm, loading: submitLoading } = useMutation(
    async (formData: any) => {
      if (onSubmit) {
        return await onSubmit(formData);
      }
      throw new Error('No submit handler provided');
    },
    {
      loadingKey: 'form-submit',
    }
  );

  // Process options from API data using useMemo to ensure proper recalculation
  const processedProfessionOptions = React.useMemo(() => [
    { value: '', label: 'Pilih profesi' },
    ...(formOptions?.professions?.map(p => ({
      value: p.id.toString(),
      label: p.nama_profesi
    })) || [])
  ], [formOptions?.professions]);

  const processedEducationOptions = React.useMemo(() => [
    { value: '', label: 'Pilih pendidikan terakhir' },
    ...(formOptions?.educationLevels?.map(e => ({
      value: e.id.toString(),
      label: e.pendidikan_terakhir
    })) || [])
  ], [formOptions?.educationLevels]);

  const processedPurposeOptions = React.useMemo(() => [
    { value: '', label: 'Pilih tujuan kunjungan' },
    ...(formOptions?.tujuanKunjungan?.map(t => ({
      value: t.id.toString(),
      label: t.tujuan
    })) || []),
    { value: '999', label: 'Lainnya' } // Using ID 999 for "Lainnya" option
  ], [formOptions?.tujuanKunjungan]);

  // Debug processed options
  React.useEffect(() => {
    console.log('Processed profession options:', processedProfessionOptions);
    console.log('Processed education options:', processedEducationOptions);
  }, [processedProfessionOptions, processedEducationOptions]);

  const memperolehOptions = React.useMemo(() => 
    formOptions?.memperolehInformasi || [], 
    [formOptions?.memperolehInformasi]
  );

  // Token modal will only be hidden when user clicks close button
  // No auto-hide functionality

  // Form submission mutation
  const submitFormMutation = useMutation(async (data: any) => {
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      // Check if despite the error, we got valid data (edge case handling)
      if (responseData && responseData.success) {
        console.warn('API returned error status but success data:', responseData);
        return responseData;
      }
      throw new Error(responseData.message || 'Submission failed');
    }
    
    return responseData;
  });

  const genderOptions = [
    { value: '', label: 'Pilih jenis kelamin' },
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && name === 'cara_memperoleh') {
      const checkbox = e.target as HTMLInputElement;
      const numericValue = parseInt(value); // Convert to number since we're storing IDs
      
      const updatedValues = checkbox.checked 
        ? [...(formData[name as keyof typeof formData] as number[]), numericValue]
        : (formData[name as keyof typeof formData] as number[]).filter(item => item !== numericValue);
      
      setFormData(prev => ({
        ...prev,
        [name]: updatedValues
      }));
      
      // Clear error when at least one option is selected
      if (updatedValues.length > 0 && errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nama lengkap harus diisi';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Nomor telepon harus diisi';
    } else if (!/^(\+62|62|0)[0-9]{8,14}$/.test(formData.phone)) {
      newErrors.phone = 'Format nomor telepon tidak valid (contoh: 08123456789 atau +6281234567890)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Alamat harus diisi';
    }

    if (!formData.gender) {
      newErrors.gender = 'Jenis kelamin harus dipilih';
    }

    if (!formData.education) {
      newErrors.education = 'Pendidikan terakhir harus dipilih';
    }

    if (!formData.profession) {
      newErrors.profession = 'Profesi harus dipilih';
    }

    if (!formData.purpose) {
      newErrors.purpose = 'Tujuan kunjungan harus dipilih';
    }

    // If "Lainnya" is selected, notes field must be filled
    if (formData.purpose === '999') {
      if (!formData.notes || formData.notes.trim().length < 5) {
        newErrors.notes = 'Jelaskan tujuan kunjungan Anda minimal 5 karakter';
      }
    }

    // Wajib memilih minimal satu opsi pada Cara Memperoleh
    if (!formData.cara_memperoleh || formData.cara_memperoleh.length === 0) {
      newErrors.cara_memperoleh = 'Pilih minimal satu cara memperoleh informasi';
    }

    // Cara mendapatkan salinan dipindah ke proses jadwalkan

    // Validate cara_memperoleh (minimal 1 harus dipilih)
    if (formData.cara_memperoleh.length === 0) {
      newErrors.cara_memperoleh = 'Minimal pilih satu cara memperoleh informasi';
    }

    // Cara mendapatkan salinan dipindah ke proses jadwalkan

    // Validate CAPTCHA
    const captchaValidationError = getCaptchaValidationError();
    if (captchaValidationError) {
      newErrors.captcha = captchaValidationError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions - check both states
    if (submitFormMutation.loading || isSubmitting) {
      console.log('Submission already in progress, preventing duplicate');
      return;
    }
    
    // Set immediate submission lock
    setIsSubmitting(true);
    
    try {
      if (validateForm()) {
      // Resolve names from selected IDs
      const selectedEducation = processedEducationOptions.find(e => e.value === formData.education);
      const selectedProfession = processedProfessionOptions.find(p => p.value === formData.profession);
      const selectedPurpose = processedPurposeOptions.find(p => p.value === formData.purpose);
      
      // Transform data untuk sesuai dengan format API
      const apiFormData = {
        nama: formData.name,
        email: formData.email,
        phone: formData.phone,
        alamat: formData.address,
        jenis_kelamin: formData.gender,
        pendidikan_terakhir_id: formData.education ? parseInt(formData.education) : undefined,
        profesi_id: formData.profession ? parseInt(formData.profession) : undefined,
        instansi: formData.company, // Changed from asal_instansi to instansi
        keterangan: formData.notes, // Changed from catatan to keterangan  
        tujuan_kunjungan_id: formData.purpose ? parseInt(formData.purpose) : undefined,
        tujuan_kunjungan_lainnya: formData.purpose === '999' ? formData.notes : null,
        cara_memperoleh: formData.cara_memperoleh,
        file_upload: formData.fileUpload || null, // Add file upload URL
        file_name: formData.fileName || null, // Add original file name
        captchaToken: captchaToken // Add CAPTCHA token
      };
      
      safeLog.sensitive('Sending data to API', apiFormData);
      
      console.log('[DEBUG] Form data values:');
      console.log('- formData.education:', formData.education);
      console.log('- formData.profession:', formData.profession);
      console.log('- formData.purpose:', formData.purpose);
      
      console.log('[DEBUG] About to submit form, checking required fields:');
      console.log('- nama:', apiFormData.nama);
      console.log('- email:', apiFormData.email);
      console.log('- phone:', apiFormData.phone);
      console.log('- pendidikan_terakhir_id:', apiFormData.pendidikan_terakhir_id);
      console.log('- profesi_id:', apiFormData.profesi_id);
      console.log('- tujuan_kunjungan_id:', apiFormData.tujuan_kunjungan_id);
      console.log('- tujuan_kunjungan_lainnya:', apiFormData.tujuan_kunjungan_lainnya);
      
      try {
        let result;
        
        // If onSubmit prop is provided, use that instead of direct API call
        if (onSubmit) {
          console.log('[DEBUG] Using onSubmit prop for form submission');
          result = await onSubmit(apiFormData);
        } else {
          console.log('[DEBUG] Using direct API call for form submission');
          result = await submitFormMutation.mutate(apiFormData);
        }
        
        console.log('API Response:', result); // Debug log
        console.log('Response status success:', result.success);
        console.log('Response data:', result.data);
        
        if (result.success && result.data?.token?.token) {
          console.log('Token found, showing success modal');
          setToken(result.data.token.token);
          setShowTokenModal(true);
          showToast.success('Registrasi berhasil! Token Anda telah dibuat.');
          
          // Reset form
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
            cara_memperoleh: [],
            notes: '',
            fileUpload: '',
            fileName: ''
          });
          setErrors({});
          fileUploadRef.current?.reset(); // Reset file upload component
          resetCaptcha(); // Reset CAPTCHA on successful submission
        } else if (result.success) {
          // Registration successful but no token
          console.warn('Registration successful but no token received');
          showToast.success('Registrasi berhasil! Namun token tidak dapat dibuat.');
          
          // Reset form
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
            cara_memperoleh: [],
            notes: '',
            fileUpload: '',
            fileName: ''
          });
          setErrors({});
          fileUploadRef.current?.reset(); // Reset file upload component
          resetCaptcha(); // Reset CAPTCHA on successful submission
        }
        
        // Note: Removed the duplicate onSubmit call here since we're already using it above
      } catch (error: any) {
        console.error('Form submission error details:', {
          error: error.message,
          stack: error.stack,
          originalError: error
        });
        guestLogger.error('Form submission error:', error);
        setErrors({ submit: error.message || 'Terjadi kesalahan saat mengirim data' });
        
        // Clear any success states if there was an error
        setShowTokenModal(false);
        setToken('');
        resetCaptcha(); // Reset CAPTCHA on error to allow retry
      }
    }
    } catch (outerError) {
      console.error('Outer form submission error:', outerError);
    } finally {
      // Always reset the submission lock
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingWrapper
        isLoading={optionsLoading}
        error={optionsError}
        loadingComponent={<FormSkeleton />}
        errorComponent={
          <div className="text-center p-8">
            <p className="text-red-600 mb-4">Gagal memuat form. Silakan coba lagi.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Muat Ulang
            </button>
          </div>
        }
      >
        <Card 
          variant={isInModal ? 'default' : 'elevated'} 
          padding={isInModal ? 'sm' : 'md'}
          className={`${isInModal ? 'shadow-none border-0' : ''} w-full max-w-full overflow-hidden`}
        >
          {!isInModal && (
            <div className="mb-3 sm:mb-4 md:mb-6">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Registrasi Tamu</h2>
              <p className="text-xs sm:text-sm md:text-base text-gray-800 leading-relaxed">Daftarkan kunjungan Anda ke DISNAKERTRANS Provinsi Jawa Tengah</p>
            </div>
          )}

          {/* Error Display */}
          {(errors.submit || submitFormMutation.error) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">
                {errors.submit || submitFormMutation.error?.message || 'Terjadi kesalahan saat mengirim data'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={`space-y-4 sm:space-y-6 w-full max-w-full overflow-x-hidden ${isInModal ? 'overflow-y-visible' : ''}`}>
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormInput
            label="Nama Lengkap"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            placeholder="Masukkan nama lengkap"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            placeholder="contoh@email.com"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormInput
            label="Nomor Telepon"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            placeholder="08xxxxxxxxxx"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          <FormSelect
            label="Jenis Kelamin"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            error={errors.gender}
            options={genderOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />
        </div>

        <div className="w-full">
          <FormInput
            label="Alamat"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            error={errors.address}
            placeholder="Masukkan alamat lengkap"
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>

        {/* Professional Information Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormSelect
            label="Profesi"
            name="profession"
            value={formData.profession}
            onChange={handleInputChange}
            error={errors.profession}
            options={processedProfessionOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 002 2h2a2 2 0 002-2V8a2 2 0 00-2-2h-2z" />
              </svg>
            }
          />

          <FormSelect
            label="Pendidikan Terakhir"
            name="education"
            value={formData.education}
            onChange={handleInputChange}
            error={errors.education}
            options={processedEducationOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>

        <div className="w-full">
          <FormInput
            label="Perusahaan/Instansi"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Nama perusahaan/instansi"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        {/* Visit Information Section */}
        <div className="w-full">
          <FormSelect
            label="Tujuan Kunjungan"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            error={errors.purpose}
            options={processedPurposeOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />
          
          {/* Tampilkan peringatan jika "Lainnya" dipilih */}
          {formData.purpose === '999' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-r-lg mt-2">
              <div className="flex items-start">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-yellow-800 text-xs sm:text-sm font-medium leading-relaxed">
                  Anda memilih &ldquo;Lainnya&rdquo;. Silakan jelaskan tujuan kunjungan Anda pada bagian &ldquo;Catatan Tambahan&rdquo; di bawah <span className="text-red-600 font-semibold">(WAJIB DIISI)</span>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cara Memperoleh Section */}
        <div className={`bg-gray-50 p-4 sm:p-5 md:p-6 rounded-lg border ${errors.cara_memperoleh ? 'border-red-500' : 'border-gray-200'}`}>
          <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Cara Memperoleh Informasi <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-5">Pilih minimal satu opsi</p>
          <div className="space-y-4 sm:space-y-5">
            {memperolehOptions.map((option) => (
              <div key={option.id} className="checkbox-container flex items-start checkbox-layout gap-3 p-2.5 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all duration-200">
                <input
                  type="checkbox"
                  name="cara_memperoleh"
                  value={option.id.toString()}
                  checked={formData.cara_memperoleh.includes(option.id)}
                  onChange={handleInputChange}
                  className="w-4 h-4 mt-1 cursor-pointer flex-shrink-0"
                  id={`cara_memperoleh_${option.id}`}
                />
                <label 
                  htmlFor={`cara_memperoleh_${option.id}`}
                  className="text-sm sm:text-base text-gray-700 leading-relaxed cursor-pointer select-none flex-1 break-words overflow-wrap-break-word"
                >
                  {option.nama_opsi}
                </label>
              </div>
            ))}
          </div>
          {errors.cara_memperoleh && (
            <p className="text-red-500 text-xs sm:text-sm mt-4 font-medium">{errors.cara_memperoleh}</p>
          )}
        </div>

        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold mb-2 text-gray-700">
            Catatan Tambahan
            {formData.purpose === 'other' ? (
              <span className="text-red-500 font-normal ml-2">*</span>
            ) : (
              <span className="text-gray-500 font-normal ml-2">(Opsional)</span>
            )}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-900 placeholder-gray-500 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white hover:bg-gray-50 focus:bg-white focus:ring-[#3D5DC3] focus:border-[#3D5DC3] text-xs sm:text-sm ${
              formData.purpose === '999' && errors.notes ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={formData.purpose === '999' 
              ? 'Jelaskan tujuan kunjungan Anda (wajib diisi)...' 
              : 'Tambahkan catatan atau informasi tambahan jika diperlukan...'
            }
            required={formData.purpose === '999'}
          />
          {formData.purpose === '999' && errors.notes && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">{errors.notes}</p>
          )}
        </div>

        {/* File Upload Section */}
        <div className="w-full">
          <FileUpload
            label="Upload Berkas"
            name="fileUpload"
            accept=".jpg,.jpeg,.png,.pdf"
            maxSize={5 * 1024 * 1024} // 5MB
            onFileSelect={(file, url, fileName) => {
              if (url && fileName) {
                setFormData(prev => ({ ...prev, fileUpload: url, fileName: fileName }));
                // Clear any file upload errors
                if (errors.fileUpload) {
                  setErrors(prev => ({ ...prev, fileUpload: '' }));
                }
              } else {
                setFormData(prev => ({ ...prev, fileUpload: '', fileName: '' }));
              }
            }}
            error={errors.fileUpload}
            hint="Maksimal 1 file, ukuran 5MB. Format: JPG, PNG, PDF"
            value={formData.fileUpload}
            ref={fileUploadRef}
          />
        </div>

        {/* CAPTCHA Section */}
        <div className="w-full">
          <label className="block text-xs sm:text-sm font-semibold mb-4 text-gray-700">
            Verifikasi Keamanan
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="flex justify-center">
            <TurnstileCaptcha
              onVerify={handleCaptchaVerify}
              onError={handleCaptchaError}
              onExpire={handleCaptchaExpire}
              theme="light"
              size="normal"
              className="mx-auto"
              disabled={submitFormMutation.loading || isSubmitting}
            />
          </div>
          {captchaError && (
            <p className="text-red-500 text-xs sm:text-sm mt-2 text-center">{captchaError}</p>
          )}
          {errors.captcha && (
            <p className="text-red-500 text-xs sm:text-sm mt-2 text-center">{errors.captcha}</p>
          )}
          {isCaptchaVerified && (
            <p className="text-green-600 text-xs sm:text-sm mt-2 text-center flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Verifikasi berhasil
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6">
          <LoadingButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={submitFormMutation.loading || isSubmitting}
            loadingText="Sedang Memproses..."
            className="w-full min-h-[44px] sm:min-h-[48px] text-sm sm:text-base font-semibold"
            disabled={submitFormMutation.loading || isSubmitting || !isCaptchaVerified}
          >
            Daftar Sekarang
          </LoadingButton>
          
          <PrimaryButton
            type="button"
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto sm:mx-auto min-h-[44px] sm:min-h-[48px] text-sm sm:text-base"
            onClick={() => {
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
                cara_memperoleh: [],
                notes: '',
                fileUpload: '',
                fileName: ''
              });
              setErrors({});
              fileUploadRef.current?.reset(); // Reset file upload component
            }}
          >
            Reset
          </PrimaryButton>
        </div>
        </form>
      </Card>
      </LoadingWrapper>

    {/* Token Success Modal */}
    <TokenModal 
      isOpen={showTokenModal} 
      onClose={() => setShowTokenModal(false)} 
      token={token} 
      onRedirect={() => router.push('/guest/status')}
    />
    </>
  );
}
