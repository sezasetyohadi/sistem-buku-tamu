'use client';

import React, { useState } from 'react';
import PrimaryButton from '../ui/PrimaryButton';
import FormInput from '../ui/FormInput';
import FormSelect from '../ui/FormSelect';
import Card from '../ui/Card';

interface SurveyFeedbackFormProps {
  onSubmit?: (data: any) => void;
  isLoading?: boolean;
}

export default function SurveyFeedbackForm({ onSubmit, isLoading = false }: SurveyFeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    visitDate: '',
    overallRating: '',
    serviceRating: '',
    facilityRating: '',
    staffRating: '',
    improvements: '',
    recommend: '',
    feedback: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const ratingOptions = [
    { value: '', label: 'Pilih rating' },
    { value: '5', label: '5 - Sangat Baik' },
    { value: '4', label: '4 - Baik' },
    { value: '3', label: '3 - Cukup' },
    { value: '2', label: '2 - Kurang' },
    { value: '1', label: '1 - Sangat Kurang' }
  ];

  const recommendOptions = [
    { value: '', label: 'Pilih jawaban' },
    { value: 'yes', label: 'Ya, sangat merekomendasikan' },
    { value: 'maybe', label: 'Mungkin' },
    { value: 'no', label: 'Tidak merekomendasikan' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
      newErrors.name = 'Nama harus diisi';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    if (!formData.visitDate) {
      newErrors.visitDate = 'Tanggal kunjungan harus diisi';
    }
    if (!formData.overallRating) {
      newErrors.overallRating = 'Rating keseluruhan harus dipilih';
    }
    if (!formData.serviceRating) {
      newErrors.serviceRating = 'Rating pelayanan harus dipilih';
    }
    if (!formData.recommend) {
      newErrors.recommend = 'Rekomendasi harus dipilih';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black mb-2">Survey Kepuasan Masyarakat</h2>
        <p className="text-black">Bantu kami meningkatkan layanan dengan mengisi survei ini</p>
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
          />
        </div>

        <FormInput
          label="Tanggal Kunjungan"
          name="visitDate"
          type="date"
          value={formData.visitDate}
          onChange={handleInputChange}
          error={errors.visitDate}
          required
        />

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-black">Penilaian Pelayanan</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Rating Keseluruhan"
              name="overallRating"
              value={formData.overallRating}
              onChange={handleInputChange}
              error={errors.overallRating}
              options={ratingOptions}
              required
            />

            <FormSelect
              label="Rating Pelayanan Staff"
              name="serviceRating"
              value={formData.serviceRating}
              onChange={handleInputChange}
              error={errors.serviceRating}
              options={ratingOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Rating Fasilitas"
              name="facilityRating"
              value={formData.facilityRating}
              onChange={handleInputChange}
              options={ratingOptions}
            />

            <FormSelect
              label="Rating Kecepatan Layanan"
              name="staffRating"
              value={formData.staffRating}
              onChange={handleInputChange}
              options={ratingOptions}
            />
          </div>
        </div>

        <FormSelect
          label="Apakah Anda akan merekomendasikan pelayanan DISNAKERTRANS Jateng?"
          name="recommend"
          value={formData.recommend}
          onChange={handleInputChange}
          error={errors.recommend}
          options={recommendOptions}
          required
        />

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Saran Perbaikan
          </label>
          <textarea
            name="improvements"
            value={formData.improvements}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 text-black placeholder-black border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white hover:bg-gray-50 focus:bg-white"
            placeholder="Apa yang bisa kami perbaiki untuk meningkatkan pelayanan?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Feedback Tambahan
          </label>
          <textarea
            name="feedback"
            value={formData.feedback}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 text-black placeholder-black border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white hover:bg-gray-50 focus:bg-white"
            placeholder="Ceritakan pengalaman Anda atau berikan saran lainnya..."
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
            {isLoading ? 'Mengirim Survey...' : 'Kirim Survey'}
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
                visitDate: '',
                overallRating: '',
                serviceRating: '',
                facilityRating: '',
                staffRating: '',
                improvements: '',
                recommend: '',
                feedback: ''
              });
              setErrors({});
            }}
          >
            Reset
          </PrimaryButton>
        </div>
      </form>
    </Card>
  );
}
