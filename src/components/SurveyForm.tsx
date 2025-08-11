"use client";

import React, { useEffect, useState } from 'react';
import Button from '@/components/ui/PrimaryButton';
import Input from '@/components/ui/FormInput';
import { isValidEmail } from '@/lib/utils';

// Types based on the DB schema
interface SurveySection {
  id: number;
  nama_section: string;
  urutan: number;
  questions: SurveyQuestion[];
}

interface SurveyQuestion {
  id: number;
  section_id: number;
  urutan: number;
  pertanyaan: string;
  tipe_jawaban: 'rating' | 'teks';
  is_aktif: boolean;
  created_at: string;
  jenis_rating_id?: number;
  ratingOptions?: RatingOption[];
}

interface RatingOption {
  id: number;
  jenis_rating_id: number;
  skala_rating: string;
  urutan_rating: number;
}

interface FormData {
  nama_lengkap: string;
  email: string;
  tanggal_kunjungan: string;
  answers: { [key: number]: number | string }; // questionId: answer (number for rating, string for text)
  saran: string;
}

export default function SurveyForm() {
  const [sections, setSections] = useState<SurveySection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Initialize form data with today's date as default
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  const [formData, setFormData] = useState<FormData>({
    nama_lengkap: '',
    email: '',
    tanggal_kunjungan: today,
    answers: {},
    saran: '',
  });
  
  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Fetch survey sections, questions and rating options
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch survey data organized by sections
        const response = await fetch('/api/survey/questions-by-section');
        if (!response.ok) {
          throw new Error('Failed to fetch survey data');
        }
        const data = await response.json();
        setSections(data.data || []);
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
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
  
  // Handle survey question answer selection for rating questions
  const handleRatingSelection = (questionId: number, ratingValue: number) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: ratingValue,
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
  
  // Handle survey question answer input for text questions
  const handleTextAnswer = (questionId: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [questionId]: value,
      },
    }));
    
    // Clear error for this question when user types an answer
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
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }
    
    if (!formData.tanggal_kunjungan) {
      newErrors.tanggal_kunjungan = 'Tanggal kunjungan harus diisi';
    }
    
    // Check if all required questions have been answered
    sections.forEach(section => {
      section.questions.forEach(question => {
        // Rating questions are mandatory
        if (question.tipe_jawaban === 'rating') {
          if (!formData.answers[question.id]) {
            newErrors[`question_${question.id}`] = 'Silakan pilih jawaban untuk pertanyaan ini';
          }
        }
      });
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form reset
  const handleReset = () => {
    setFormData({
      nama_lengkap: '',
      email: '',
      tanggal_kunjungan: today,
      answers: {},
      saran: '',
    });
    setErrors({});
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
      // Create an array for all questions in all sections
      const allQuestions: SurveyQuestion[] = [];
      sections.forEach(section => {
        if (section.questions) {
          allQuestions.push(...section.questions);
        }
      });
      
      // Prepare data for submission - create an array of all answers
      const answers = allQuestions.map(question => {
        let answer = formData.answers[question.id] || '';
        
        // For text type questions that weren't answered, use empty string
        if (question.tipe_jawaban === 'teks' && !answer) {
          answer = '';
        }
        
        return {
          pertanyaan_id: question.id,
          jawaban: answer,
          nama_lengkap: formData.nama_lengkap,
          email: formData.email,
          tanggal_kunjungan: formData.tanggal_kunjungan,
          saran: formData.saran
        };
      });
      
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
        email: '',
        tanggal_kunjungan: today,
        answers: {},
        saran: '',
      });
      
      setSubmitSuccess(true);
      window.scrollTo(0, 0); // Scroll to top to show success message
    } catch (error) {
      console.error('Error submitting survey:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to find a question's type
  const findQuestionType = (questionId: number): 'rating' | 'teks' => {
    for (const section of sections) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) {
        return question.tipe_jawaban;
      }
    }
    return 'teks'; // default
  };
  
  // Helper function to determine if a section should display questions in a grid
  const shouldDisplayGrid = (sectionId: number): boolean => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.questions) return false;
    return section.questions.length > 1;
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
  
  // Render select dropdown for rating questions
  const renderRatingSelect = (question: SurveyQuestion) => {
    return (
      <div className="w-full">
        <label htmlFor={`question_${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          {question.pertanyaan} <span className="text-red-500">*</span>
        </label>
        <select
          id={`question_${question.id}`}
          name={`question_${question.id}`}
          value={formData.answers[question.id] as string || ''}
          onChange={(e) => handleRatingSelection(question.id, parseInt(e.target.value))}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors[`question_${question.id}`] ? "border-red-500" : "border-gray-300"
          }`}
          required
        >
          <option value="">Pilih rating</option>
          {question.ratingOptions?.map((option) => (
            <option key={option.id} value={option.id}>
              {option.skala_rating}
            </option>
          ))}
        </select>
        {errors[`question_${question.id}`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]}</p>
        )}
      </div>
    );
  };
  
  // Render input or textarea for text questions with dropdown for recommendation questions
  const renderTextInput = (question: SurveyQuestion) => {
    // For questions with jenis_rating_id = 2 (Skala 3), use a special dropdown
    if (question.jenis_rating_id === 2) {
      return (
        <div className="w-full">
          <label htmlFor={`question_${question.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            {question.pertanyaan} <span className="text-red-500">*</span>
          </label>
          <select
            id={`question_${question.id}`}
            name={`question_${question.id}`}
            value={formData.answers[question.id] as string || ''}
            onChange={(e) => handleTextAnswer(question.id, e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors[`question_${question.id}`] ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Pilih jawaban</option>
            {/* Using dropdown options from ratingOptions if available */}
            {question.ratingOptions?.map((option) => (
              <option key={option.id} value={option.skala_rating}>
                {option.skala_rating}
              </option>
            ))}
            {/* Fallback options if ratingOptions is not available */}
            {(!question.ratingOptions || question.ratingOptions.length === 0) && (
              <>
                <option value="Memuaskan">Memuaskan</option>
                <option value="Cukup">Cukup</option>
                <option value="Kurang Memuaskan">Kurang Memuaskan</option>
              </>
            )}
          </select>
          {errors[`question_${question.id}`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]}</p>
          )}
        </div>
      );
    }
    
    // For text questions (jenis_rating_id = 3)
    return (
      <div className="w-full">
        <label htmlFor={`question_${question.id}_text`} className="block text-sm font-medium text-gray-700 mb-1">
          {question.pertanyaan}
        </label>
        <textarea
          id={`question_${question.id}_text`}
          name={`question_${question.id}_text`}
          value={formData.answers[question.id] as string || ''}
          onChange={(e) => handleTextAnswer(question.id, e.target.value)}
          placeholder="Masukkan jawaban Anda"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors[`question_${question.id}`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]}</p>
        )}
      </div>
    );
  };
  
  // Function to render questions by section in a grid or single column
  const renderSectionQuestions = (sectionId: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.questions) return null;
    
    const questions = section.questions.sort((a, b) => a.urutan - b.urutan);
    const useGrid = questions.length > 1;
    
    if (useGrid) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {questions.map((question) => (
            <div key={question.id}>
              {question.tipe_jawaban === 'rating'
                ? renderRatingSelect(question)
                : renderTextInput(question)
              }
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="mb-4">
          {questions.map((question) => (
            <div key={question.id}>
              {question.tipe_jawaban === 'rating'
                ? renderRatingSelect(question)
                : renderTextInput(question)
              }
            </div>
          ))}
        </div>
      );
    }
  };
  
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
          
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Masukkan alamat email"
            error={errors.email}
            required
          />
          
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kunjungan <span className="text-red-500">*</span>
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
          
          {/* Penilaian Pelayanan Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium mb-4">Penilaian Pelayanan</h3>
            
            {/* Render Section 1 */}
            {renderSectionQuestions(1)}
            
            {/* Render Section 2 */}
            {renderSectionQuestions(2)}
          </div>
          
          {/* Recommendation Question - Section 3 */}
          {sections.find(s => s.id === 3) && (
            <div className="border-t border-gray-200 pt-4">
              {renderSectionQuestions(3)}
            </div>
          )}
          
          {/* Service Speed Assessment - Section 4 */}
          {sections.find(s => s.id === 4) && (
            <div className="pt-4">
              {renderSectionQuestions(4)}
            </div>
          )}
          
          {/* Saran Perbaikan - Section 5 */}
          {sections.find(s => s.id === 5) && (
            <div className="border-t border-gray-200 pt-4">
              {renderSectionQuestions(5)}
            </div>
          )}
          
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Survey →'}
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleReset}
            >
              Reset →
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
