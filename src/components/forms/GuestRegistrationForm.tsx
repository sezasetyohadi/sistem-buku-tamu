// Komponen form untuk registrasi tamu
// Filename: GuestRegistrationForm.tsx

'use client';

import React, { useState, useEffect } from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import Card from '../ui/Card';

interface GuestRegistrationFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export default function GuestRegistrationForm({ onSubmit, isLoading = false }: GuestRegistrationFormProps) {
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
    cara_memperoleh: [] as number[], // Changed to number array for IDs
    cara_salinan: [] as number[], // Changed to number array for IDs
    notes: ''
  });

  const [professionOptions, setProfessionOptions] = useState<Array<{value: string, label: string}>>([
    { value: '', label: 'Pilih profesi' }
  ]);
  const [educationOptions, setEducationOptions] = useState<Array<{value: string, label: string}>>([
    { value: '', label: 'Pilih pendidikan terakhir' }
  ]);
  const [departmentOptions, setDepartmentOptions] = useState<Array<{value: string, label: string}>>([
    { value: '', label: 'Pilih bidang tujuan' }
  ]);
  const [purposeOptions, setPurposeOptions] = useState<Array<{value: string, label: string}>>([
    { value: '', label: 'Pilih tujuan kunjungan' }
  ]);
  const [memperolehOptions, setMemperolehOptions] = useState<Array<{id: number, nama_opsi: string}>>([]);
  const [salinanOptions, setSalinanOptions] = useState<Array<{id: number, nama_opsi: string}>>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showNotification, setShowNotification] = useState(false);

  // Auto hide notification after 5 seconds
  useEffect(() => {
    if (showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showNotification]);

  // Fetch options from API
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch('/api/lookup');
        const result = await response.json();
        
        console.log('API lookup response:', result);
        
        // Process profession options
        if (result.success && result.data?.professions) {
          const options = [
            { value: '', label: 'Pilih profesi' },
            ...result.data.professions.map((p: { id: number, nama_profesi: string }) => ({
              value: p.id.toString(),
              label: p.nama_profesi
            }))
          ];
          setProfessionOptions(options);
        }
        
        // Process education options
        if (result.success && result.data?.educationLevels) {
          const options = [
            { value: '', label: 'Pilih pendidikan terakhir' },
            ...result.data.educationLevels.map((e: { id: number, pendidikan_terakhir: string }) => ({
              value: e.id.toString(),
              label: e.pendidikan_terakhir
            }))
          ];
          setEducationOptions(options);
        }
        
        // Process bidang tujuan options
        if (result.success && result.data?.bidangTujuan) {
          const options = [
            { value: '', label: 'Pilih bidang tujuan' },
            ...result.data.bidangTujuan.map((d: { id: number, bidang: string }) => ({
              value: d.id.toString(),
              label: d.bidang
            }))
          ];
          setDepartmentOptions(options);
        }
        
        // Process tujuan kunjungan options
        if (result.success && result.data?.tujuanKunjungan) {
          const options = [
            { value: '', label: 'Pilih tujuan kunjungan' },
            ...result.data.tujuanKunjungan.map((t: { id: number, tujuan: string }) => ({
              value: t.id.toString(),
              label: t.tujuan
            }))
          ];
          setPurposeOptions(options);
        }
        
        // Process memperoleh informasi options
        if (result.success && result.data?.memperolehInformasi) {
          setMemperolehOptions(result.data.memperolehInformasi);
        }
        
        // Process mendapatkan salinan options
        if (result.success && result.data?.mendapatkanSalinan) {
          setSalinanOptions(result.data.mendapatkanSalinan);
        }
      } catch (error) {
        console.error('Error fetching form options:', error);
      }
    };

    fetchOptions();
  }, []);

  const genderOptions = [
    { value: '', label: 'Pilih jenis kelamin' },
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && (name === 'cara_memperoleh' || name === 'cara_salinan')) {
      const checkbox = e.target as HTMLInputElement;
      const numericValue = parseInt(value); // Convert to number since we're storing IDs
      
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked 
          ? [...(prev[name as keyof typeof prev] as number[]), numericValue]
          : (prev[name as keyof typeof prev] as number[]).filter(item => item !== numericValue)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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

    if (!formData.department) {
      newErrors.department = 'Bidang tujuan harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Resolve names from selected IDs
      const selectedEducation = educationOptions.find(e => e.value === formData.education);
      const selectedProfession = professionOptions.find(p => p.value === formData.profession);
      const selectedPurpose = purposeOptions.find(p => p.value === formData.purpose);
      const selectedDepartment = departmentOptions.find(d => d.value === formData.department);
      
      // Transform data untuk sesuai dengan format API
      const apiFormData = {
        nama: formData.name,
        email: formData.email,
        nomor_telp: formData.phone,
        alamat: formData.address,
        jenis_kelamin: formData.gender,
        pendidikan_terakhir_id: formData.education ? parseInt(formData.education) : undefined,
        profesi_id: formData.profession ? parseInt(formData.profession) : undefined,
        asal_instansi: formData.company,
        // Use tujuan_kunjungan for keperluan field, notes will go in catatan_tambahan
        keperluan: undefined, // Let the backend set this based on tujuan_kunjungan_id
        catatan: formData.notes, // Use notes for catatan_tambahan field only
        bidang_tujuan_id: formData.department ? parseInt(formData.department) : undefined,
        tujuan_kunjungan_id: formData.purpose ? parseInt(formData.purpose) : undefined,
        status_kunjungan: 'Menunggu',
        cara_memperoleh: formData.cara_memperoleh, // Send as array of numbers
        cara_salinan: formData.cara_salinan // Send as array of numbers
      };
      
      console.log('Sending data to API:', apiFormData);
      onSubmit?.(apiFormData);
      
      // Show success notification
      setShowNotification(true);
      
      // Auto reset form setelah submit berhasil
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
        cara_memperoleh: [],
        cara_salinan: [],
        notes: ''
      });
      setErrors({});
    }
  };

  return (
    <>
      <Card variant="elevated" padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registrasi Tamu</h2>
          <p className="text-gray-800">Daftarkan kunjungan Anda ke DISNAKERTRANS Provinsi Jawa Tengah</p>
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div className="grid grid-cols-1 gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Profesi"
            name="profession"
            value={formData.profession}
            onChange={handleInputChange}
            error={errors.profession}
            options={professionOptions}
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
            options={educationOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Tujuan Kunjungan"
            name="purpose"
            value={formData.purpose}
            onChange={handleInputChange}
            error={errors.purpose}
            options={purposeOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
          />

          <FormSelect
            label="Bidang Tujuan"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            error={errors.department}
            options={departmentOptions}
            required
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        </div>

        {/* Cara Memperoleh Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cara Memperoleh</h3>
          <div className="space-y-3">
            {memperolehOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="cara_memperoleh"
                  value={option.id.toString()}
                  checked={formData.cara_memperoleh.includes(option.id)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-400 rounded-none focus:ring-blue-500 focus:ring-2 appearance-none checked:bg-blue-600 checked:border-blue-600"
                  style={{
                    backgroundImage: formData.cara_memperoleh.includes(option.id)
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")` 
                      : 'none'
                  }}
                />
                <span className="text-sm text-gray-700">{option.nama_opsi}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Cara Mendapatkan Salinan Informasi Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Cara Mendapatkan Salinan Informasi*</h3>
          <div className="space-y-3">
            {salinanOptions.map((option) => (
              <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="cara_salinan"
                  value={option.id.toString()}
                  checked={formData.cara_salinan.includes(option.id)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-2 border-gray-400 rounded-none focus:ring-blue-500 focus:ring-2 appearance-none checked:bg-blue-600 checked:border-blue-600"
                  style={{
                    backgroundImage: formData.cara_salinan.includes(option.id)
                      ? `url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='m13.854 3.646-7.5 7.5a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6 10.293l7.146-7.147a.5.5 0 0 1 .708.708z'/%3e%3c/svg%3e")` 
                      : 'none'
                  }}
                />
                <span className="text-sm text-gray-700">{option.nama_opsi}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Catatan Tambahan
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white hover:bg-gray-50 focus:bg-white"
            placeholder="Tambahkan catatan atau informasi tambahan jika diperlukan..."
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <PrimaryButton
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Sedang Memproses...' : 'Daftar Sekarang'}
          </PrimaryButton>
          
          <PrimaryButton
            type="button"
            variant="secondary"
            size="lg"
            className="flex-1 sm:flex-none sm:w-32"
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
                department: '',
                cara_memperoleh: [],
                cara_salinan: [],
                notes: ''
              });
              setErrors({});
            }}
          >
            Reset
          </PrimaryButton>
        </div>
      </form>
    </Card>

    {/* Success Notification Toast */}
    {showNotification && (
      <div className="fixed top-4 right-4 z-50 transform transition-all duration-500 ease-in-out">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl border border-green-400 min-w-80 max-w-md">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">Registrasi Berhasil! 🎉</h4>
                  <p className="text-green-50 text-sm mt-1">
                    Selamat datang di DISNAKERTRANS Jawa Tengah
                  </p>
                  <p className="text-green-50 text-xs mt-1">
                    Data Anda telah tersimpan dengan aman
                  </p>
                </div>
                <button
                  onClick={() => setShowNotification(false)}
                  className="ml-3 text-white/80 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-white/60 rounded-full transition-all ease-linear"
              style={{
                width: '100%',
                animation: 'progressBar 5s linear forwards'
              }}
            ></div>
          </div>
        </div>
      </div>
    )}

    {/* Inline styles for animation */}
    <style dangerouslySetInnerHTML={{
      __html: `
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `
    }} />
    </>
  );
}
