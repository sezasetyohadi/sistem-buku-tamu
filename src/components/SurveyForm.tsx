"use client";

import { useState, useEffect } from 'react';

interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  section_id: number;
  section_nama?: string;
  ratingOptions?: RatingOption[];
}

interface RatingOption {
  id: number;
  nilai?: number;
  label?: string;
  deskripsi?: string;
  skala_rating?: string;
  urutan_rating?: number;
}

interface SurveyResponse {
  pertanyaan_id: number;
  rating: number;
}

export default function SurveyForm() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [ratingOptions, setRatingOptions] = useState<RatingOption[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchSurveyData();
  }, []);

  const fetchSurveyData = async () => {
    try {
      // Fetch questions
      const questionsResponse = await fetch('/api/survey/questions');
      const questionsData = await questionsResponse.json();

      // Fetch rating options
      const ratingsResponse = await fetch('/api/survey/rating-options');
      const ratingsData = await ratingsResponse.json();

      if (questionsData.success) {
        setQuestions(questionsData.data || []);
      }

      if (ratingsData.success) {
        setRatingOptions(ratingsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching survey data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingChange = (questionId: number, rating: number) => {
    if (isNaN(rating)) return; // Ignore invalid ratings
    
    setResponses(prev => {
      const existing = prev.find(r => r.pertanyaan_id === questionId);
      if (existing) {
        return prev.map(r => 
          r.pertanyaan_id === questionId 
            ? { ...r, rating } 
            : r
        );
      } else {
        return [...prev, { pertanyaan_id: questionId, rating }];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert responses to the format expected by the API
      const answers = responses.map(response => ({
        pertanyaan_id: response.pertanyaan_id,
        rating_id: response.rating, // API expects rating_id
        rating: response.rating
      }));

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          feedback: feedback.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        setResponses([]);
        setFeedback('');
      } else {
        alert('Gagal mengirim survey: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('Terjadi kesalahan saat mengirim survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat survey...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Terima Kasih!
        </h2>
        <p className="text-gray-600 mb-6">
          Survey Anda telah berhasil dikirim. Masukan Anda sangat berharga untuk meningkatkan kualitas pelayanan kami.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setResponses([]);
            setFeedback('');
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Isi Survey Lagi
        </button>
      </div>
    );
  }

  // Group questions by section
  const questionsBySection = questions.reduce((acc, question) => {
    const sectionName = question.section_nama || 'Umum';
    if (!acc[sectionName]) {
      acc[sectionName] = [];
    }
    acc[sectionName].push(question);
    return acc;
  }, {} as Record<string, SurveyQuestion[]>);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Survey Kepuasan Layanan
        </h2>
        <p className="text-green-100">
          Mohon berikan penilaian Anda terhadap layanan DISNAKERTRANS Jawa Tengah
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        {Object.keys(questionsBySection).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada pertanyaan survey yang tersedia.</p>
          </div>
        ) : (
          Object.entries(questionsBySection).map(([sectionName, sectionQuestions]) => (
            <div key={sectionName} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                {sectionName}
              </h3>
              <div className="space-y-6">
                {sectionQuestions.map((question) => {
                  const currentResponse = responses.find(r => r.pertanyaan_id === question.id);
                  return (
                    <div key={question.id} className="bg-gray-50 rounded-lg p-6">
                      <p className="text-gray-900 font-medium mb-4">
                        {question.pertanyaan}
                      </p>
                      <select
                        name={`question-${question.id}`}
                        value={currentResponse?.rating || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            handleRatingChange(question.id, parseInt(value));
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 dark:bg-white dark:text-gray-900"
                        required
                      >
                        <option value="">Pilih rating...</option>
                        {question.ratingOptions?.map((option) => {
                          const ratingValue = option.nilai || option.urutan_rating || 1;
                          const ratingLabel = option.label || option.skala_rating || `Rating ${ratingValue}`;
                          
                          return (
                            <option key={option.id} value={ratingValue}>
                              {ratingLabel}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Feedback Section */}
        <div className="mb-8">
          <label className="block text-lg font-semibold text-gray-900 mb-4">
            Saran dan Masukan (Opsional)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-white text-gray-900 dark:bg-white dark:text-gray-900"
            placeholder="Berikan saran atau masukan untuk meningkatkan kualitas pelayanan kami..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || responses.length === 0}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              submitting || responses.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            {submitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mengirim...
              </span>
            ) : (
              'Kirim Survey'
            )}
          </button>
        </div>

        {responses.length === 0 && questions.length > 0 && (
          <p className="text-sm text-gray-500 text-center mt-4">
            Silakan berikan penilaian pada setidaknya satu pertanyaan untuk dapat mengirim survey
          </p>
        )}
      </form>
    </div>
  );
}
