"use client";

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { isValidEmail } from '@/lib/utils';

// Types based on the DB schema
interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  is_aktif: boolean;
  options: SurveyOption[];
}

interface SurveyOption {
  id: number;
  pertanyaan_id: number;
  isi_opsi: string;
  urutan: number;
}

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
  nama_lengkap: string;
  jenis_kelamin: Gender;
  pendidikan_terakhir: string;
  profesi: string;
  instansi: string;
  answers: { [key: number]: number }; // questionId: optionId
  saran: string;
}

export default function SurveyForm() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [educationOptions, setEducationOptions] = useState<EducationOption[]>([]);
  const [professionOptions, setProfessionOptions] = useState<ProfessionOption[]>([]);
  const [isCustomEducation, setIsCustomEducation] = useState(false);
  const [isCustomProfession, setIsCustomProfession] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Initialize form data
  const [formData, setFormData] = useState<FormData>({
    nama_lengkap: '',
    jenis_kelamin: Gender.MALE,
    pendidikan_terakhir: '',
    profesi: '',
    instansi: '',
    answers: {},
    saran: '',
  });
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Fetch survey questions and options
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch survey questions
        const questionsResponse = await fetch('/api/survey/questions');
        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch survey questions');
        }
        const questionsData = await questionsResponse.json();
        setQuestions(questionsData.data || []);
        
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
        console.error('Error fetching data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle special cases for "Lainnya" options
    if (name === 'pendidikan_terakhir') {
      if (value === 'Lainnya') {
        setIsCustomEducation(true);
        return;
      } else {
        setIsCustomEducation(false);
      }
    } 
    
    if (name === 'profesi') {
      if (value === 'Lainnya') {
        setIsCustomProfession(true);
        return;
      } else {
        setIsCustomProfession(false);
      }
    }
    
    // Handle custom inputs
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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Handle survey question answer selection
  const handleAnswerSelection = (questionId: number, optionId: number) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: optionId,
      },
    }));
    
    // Clear error for this question when user selects an answer
    if (errors[`question_${questionId}`]) {
      setErrors((prev) => ({
        ...prev,
        [`question_${questionId}`]: '',
      }));
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.nama_lengkap.trim()) {
      newErrors.nama_lengkap = 'Nama lengkap harus diisi';
    }
    
    if (!formData.jenis_kelamin) {
      newErrors.jenis_kelamin = 'Jenis kelamin harus dipilih';
    }
    
    if (!formData.pendidikan_terakhir) {
      newErrors.pendidikan_terakhir = 'Pendidikan terakhir harus dipilih';
    }
    
    if (!formData.profesi) {
      newErrors.profesi = 'Profesi harus dipilih';
    }
    
    // Check if all questions have been answered
    questions.forEach((question) => {
      if (!formData.answers[question.id]) {
        newErrors[`question_${question.id}`] = 'Silakan pilih jawaban untuk pertanyaan ini';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
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
      // Prepare data for submission
      const answers = Object.entries(formData.answers).map(([questionId, optionId]) => ({
        pertanyaan_id: parseInt(questionId),
        jawaban: optionId,
        nama_lengkap: formData.nama_lengkap,
        jenis_kelamin: formData.jenis_kelamin,
        pendidikan_terakhir: formData.pendidikan_terakhir,
        profesi: formData.profesi,
        instansi: formData.instansi,
        saran: formData.saran
      }));
      
      // Send the request
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answers }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit survey');
      }
      
      // Clear form on success
      setFormData({
        nama_lengkap: '',
        jenis_kelamin: Gender.MALE,
        pendidikan_terakhir: '',
        profesi: '',
        instansi: '',
        answers: {},
        saran: '',
      });
      
      // Reset custom input states
      setIsCustomEducation(false);
      setIsCustomProfession(false);
      
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error submitting survey:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return <div className="flex justify-center my-8">Loading survey...</div>;
  }
  
  if (error) {
    return (
      <div className="my-8 p-4 bg-red-100 text-red-700 rounded-md">
        <p className="font-bold">Error:</p>
        <p>{error}</p>
        <Button 
          variant="secondary" 
          onClick={() => window.location.reload()}
          className="mt-2"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2 text-center">Survei Kepuasan Masyarakat</h2>
      <p className="text-center text-gray-600 mb-6">
        Bantu kami meningkatkan layanan dengan mengisi survei ini
      </p>
      
      {submitSuccess && (
        <div className="mb-6 p-3 bg-green-100 text-green-700 rounded">
          Terima kasih! Survei Anda telah berhasil disimpan.
        </div>
      )}
      
      {submitError && (
        <div className="mb-6 p-3 bg-red-100 text-red-700 rounded">
          {submitError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Nama Lengkap"
            name="nama_lengkap"
            value={formData.nama_lengkap}
            onChange={handleChange}
            placeholder="Masukkan nama lengkap"
            error={errors.nama_lengkap}
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
              Pendidikan Terakhir
            </label>
            <select
              name="pendidikan_terakhir"
              value={isCustomEducation ? 'Lainnya' : formData.pendidikan_terakhir}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.pendidikan_terakhir ? "border-red-500" : "border-gray-300"
              }`}
              required
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
            {errors.pendidikan_terakhir && (
              <p className="mt-1 text-sm text-red-600">{errors.pendidikan_terakhir}</p>
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.profesi ? "border-red-500" : "border-gray-300"
              }`}
              required
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
            {errors.profesi && (
              <p className="mt-1 text-sm text-red-600">{errors.profesi}</p>
            )}
          </div>
          
          <Input
            label="Instansi/Lembaga"
            name="instansi"
            value={formData.instansi}
            onChange={handleChange}
            placeholder="Masukkan asal instansi/lembaga"
          />
          
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Penilaian Layanan</h3>
            
            {questions.length === 0 && (
              <p className="text-gray-500 italic">Tidak ada pertanyaan survei yang tersedia.</p>
            )}
            
            {questions.map((question) => (
              <div key={question.id} className="mb-6">
                <p className="font-medium mb-2">{question.pertanyaan}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {question.options.map((option) => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`question_${question.id}_option_${option.id}`}
                        name={`question_${question.id}`}
                        value={option.id}
                        checked={formData.answers[question.id] === option.id}
                        onChange={() => handleAnswerSelection(question.id, option.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`question_${question.id}_option_${option.id}`} className="text-sm">
                        {option.isi_opsi}
                      </label>
                    </div>
                  ))}
                </div>
                {errors[`question_${question.id}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]}</p>
                )}
              </div>
            ))}
          </div>
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saran dan Masukan
            </label>
            <textarea
              name="saran"
              value={formData.saran}
              onChange={handleChange}
              placeholder="Tuliskan saran dan masukan Anda untuk peningkatan layanan kami"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Survei'}
          </Button>
        </div>
      </form>
    </div>
  );
}
