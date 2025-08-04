"use client";

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isValidEmail } from '@/lib/utils';

interface EducationOption {
  id: number;
  pendidikan_terakhir: string;
}

interface ProfessionOption {
  id: number;
  nama_profesi: string;
}

enum Gender {
  MALE = 'Laki-laki',
  FEMALE = 'Perempuan'
}

interface FormData {
  nama: string;
  alamat: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir: string;
  profesi: string;
  asal_instansi: string;
  keperluan: string;
  tanggal_kunjungan: string;
  waktu_kunjungan: string;
  email: string;
  file_upload?: File | null;
}

interface FormErrors {
  nama?: string;
  alamat?: string;
  jenis_kelamin?: string;
  pendidikan_terakhir?: string;
  profesi?: string;
  asal_instansi?: string;
  keperluan?: string;
  tanggal_kunjungan?: string;
  waktu_kunjungan?: string;
  email?: string;
  file_upload?: string;
}

export default function GuestForm() {
  // Get today's date and current time for defaults
  const today = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
  
  // State untuk mengontrol opsi "Lainnya"
  const [isCustomEducation, setIsCustomEducation] = useState(false);
  const [isCustomProfession, setIsCustomProfession] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    alamat: '',
    jenis_kelamin: Gender.MALE,
    pendidikan_terakhir: '',
    profesi: '',
    asal_instansi: '',
    keperluan: '',
    tanggal_kunjungan: today,
    waktu_kunjungan: currentTime,
    email: '',
    file_upload: null
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [educationOptions, setEducationOptions] = useState<EducationOption[]>([]);
  const [professionOptions, setProfessionOptions] = useState<ProfessionOption[]>([]);
  
  // Fetch education and profession options on component mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Fetch education options
        const educationResponse = await fetch('/api/guests?options=education');
        if (educationResponse.ok) {
          const data = await educationResponse.json();
          if (data.success) {
            setEducationOptions(data.data);
          }
        }
        
        // Fetch profession options
        const professionResponse = await fetch('/api/guests?options=profession');
        if (professionResponse.ok) {
          const data = await professionResponse.json();
          if (data.success) {
            setProfessionOptions(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch options:', error);
      }
    };
    
    fetchOptions();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama is required';
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.jenis_kelamin) {
      newErrors.jenis_kelamin = 'Jenis kelamin is required';
    }
    
    if (!formData.tanggal_kunjungan) {
      newErrors.tanggal_kunjungan = 'Tanggal kunjungan is required';
    }
    
    if (!formData.waktu_kunjungan) {
      newErrors.waktu_kunjungan = 'Waktu kunjungan is required';
    }
    
    if (!formData.keperluan.trim()) {
      newErrors.keperluan = 'Keperluan is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special cases for "Lainnya" options
    if (name === 'pendidikan_terakhir') {
      if (value === 'Lainnya') {
        setIsCustomEducation(true);
        // Jangan mengubah nilai sebenarnya jika memilih "Lainnya"
        return;
      } else {
        setIsCustomEducation(false);
      }
    } 
    
    if (name === 'profesi') {
      if (value === 'Lainnya') {
        setIsCustomProfession(true);
        // Jangan mengubah nilai sebenarnya jika memilih "Lainnya"
        return;
      } else {
        setIsCustomProfession(false);
      }
    }
    
    // Jika input kustom untuk pendidikan terakhir atau profesi, perbarui nilai saja
    if ((name === 'pendidikan_terakhir_custom' && isCustomEducation) || 
        (name === 'profesi_custom' && isCustomProfession)) {
      const actualFieldName = name === 'pendidikan_terakhir_custom' ? 'pendidikan_terakhir' : 'profesi';
      setFormData((prev) => ({
        ...prev,
        [actualFieldName]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    // Clear error for this field when user types
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        file_upload: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset states
    setSubmitSuccess(false);
    setSubmitError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Create FormData object if there's a file to upload
      let requestBody: any = {...formData};
      delete requestBody.file_upload; // Remove file from JSON data
      
      // If we have a file, we need to use FormData instead of JSON
      if (formData.file_upload) {
        const formDataObj = new FormData();
        formDataObj.append('file', formData.file_upload);
        
        // Append all other form fields
        Object.entries(requestBody).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataObj.append(key, value as string);
          }
        });
        
        // Send FormData request
        // For now, let's stick with JSON and implement file upload later
      }
      
      // Send the request
      const response = await fetch('/api/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit form');
      }
      
      // Clear form on success
      setFormData({
        nama: '',
        alamat: '',
        jenis_kelamin: Gender.MALE,
        pendidikan_terakhir: '',
        profesi: '',
        asal_instansi: '',
        keperluan: '',
        tanggal_kunjungan: today,
        waktu_kunjungan: currentTime,
        email: '',
        file_upload: null
      });
      
      // Reset custom input states
      setIsCustomEducation(false);
      setIsCustomProfession(false);
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Formulir Tamu</h2>
      
      {submitSuccess && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded">
          Terima kasih! Data Anda telah berhasil disimpan.
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            name="nama"
            value={formData.nama}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            error={errors.nama}
            required
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Kelamin
            </label>
            <select
              name="jenis_kelamin"
              value={formData.jenis_kelamin}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.jenis_kelamin ? "border-red-500" : "border-gray-300"
              }`}
              required
            >
              <option value={Gender.MALE}>Laki-laki</option>
              <option value={Gender.FEMALE}>Perempuan</option>
            </select>
            {errors.jenis_kelamin && (
              <p className="mt-1 text-sm text-red-600">{errors.jenis_kelamin}</p>
            )}
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat Anda"
              rows={2}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.alamat ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.alamat && (
              <p className="mt-1 text-sm text-red-600">{errors.alamat}</p>
            )}
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pendidikan Terakhir
            </label>
            <select
              name="pendidikan_terakhir"
              value={isCustomEducation ? 'Lainnya' : formData.pendidikan_terakhir}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Pilih Pendidikan Terakhir -</option>
              {educationOptions.map((option) => (
                <option key={option.id} value={option.pendidikan_terakhir}>
                  {option.pendidikan_terakhir}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {isCustomEducation && (
              <Input
                name="pendidikan_terakhir_custom"
                placeholder="Tuliskan pendidikan terakhir Anda"
                value={formData.pendidikan_terakhir !== 'Lainnya' ? formData.pendidikan_terakhir : ''}
                onChange={(e) => setFormData(prev => ({...prev, pendidikan_terakhir: e.target.value}))}
                className="mt-2"
                autoFocus
              />
            )}
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profesi
            </label>
            <select
              name="profesi"
              value={isCustomProfession ? 'Lainnya' : formData.profesi}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">- Pilih Profesi -</option>
              {professionOptions.map((option) => (
                <option key={option.id} value={option.nama_profesi}>
                  {option.nama_profesi}
                </option>
              ))}
              <option value="Lainnya">Lainnya</option>
            </select>
            {isCustomProfession && (
              <Input
                name="profesi_custom"
                placeholder="Tuliskan profesi Anda"
                value={formData.profesi !== 'Lainnya' ? formData.profesi : ''}
                onChange={(e) => setFormData(prev => ({...prev, profesi: e.target.value}))}
                className="mt-2"
                autoFocus
              />
            )}
          </div>
          
          <Input
            label="Asal Instansi/Lembaga"
            name="asal_instansi"
            value={formData.asal_instansi}
            onChange={handleChange}
            placeholder="Masukkan asal instansi/lembaga"
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Kunjungan
              </label>
              <input
                type="date"
                name="tanggal_kunjungan"
                value={formData.tanggal_kunjungan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.tanggal_kunjungan ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.tanggal_kunjungan && (
                <p className="mt-1 text-sm text-red-600">{errors.tanggal_kunjungan}</p>
              )}
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu Kunjungan
              </label>
              <input
                type="time"
                name="waktu_kunjungan"
                value={formData.waktu_kunjungan}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.waktu_kunjungan ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.waktu_kunjungan && (
                <p className="mt-1 text-sm text-red-600">{errors.waktu_kunjungan}</p>
              )}
            </div>
          </div>
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Masukkan alamat email"
            error={errors.email}
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keperluan
            </label>
            <textarea
              name="keperluan"
              value={formData.keperluan}
              onChange={handleChange}
              placeholder="Tuliskan keperluan kunjungan Anda"
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.keperluan ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {errors.keperluan && (
              <p className="mt-1 text-sm text-red-600">{errors.keperluan}</p>
            )}
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload File (opsional)
            </label>
            <input
              type="file"
              name="file_upload"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.file_upload && (
              <p className="mt-1 text-sm text-red-600">{errors.file_upload}</p>
            )}
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim'}
          </Button>
        </div>
      </form>
    </div>
  );
}
