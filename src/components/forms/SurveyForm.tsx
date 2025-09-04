"use client";

import { useState, lazy, Suspense } from 'react';
import Card from '@/components/ui/Card';
import { useSurveyData, useDropdownState } from '@/hooks/useSurveyForm';
import { submitSurvey } from '@/lib/survey-api';
import LoadingState from '../guest/LoadingState';
import { SurveySubmission } from '@/types/survey-types';

// Lazy loaded components
const GuestIdentityForm = lazy(() => import('./GuestIdentityForm'));
const QuestionCard = lazy(() => import('../guest/QuestionCard'));
const SubmissionSuccess = lazy(() => import('../guest/SubmissionSuccess'));

export default function SurveyForm() {
  // Use the custom hooks for state management
  const {
    questions,
    feedback,
    loading,
    submitting,
    submitted,
    guestIdentity,
    lookupData,
    responses,
    questionsBySection,
    setFeedback,
    setSubmitting,
    setSubmitted,
    handleRatingChange,
    handleTextChange,
    updateGuestIdentity,
    resetFormData,
    isFormValid
  } = useSurveyData();

  const {
    focusedDropdowns,
    handleDropdownMouseDown,
    handleDropdownBlur,
    handleDropdownChange
  } = useDropdownState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate identity data
      if (!isFormValid()) {
        alert('Mohon lengkapi semua data identitas responden');
        setSubmitting(false);
        return;
      }

      // Convert responses to the format expected by the API
      const answers = responses.map(response => ({
        pertanyaan_id: response.pertanyaan_id,
        jawaban: response.jawaban
      }));

      const submission: SurveySubmission = {
        identity: {
          nama_lengkap: guestIdentity.nama,
          jenis_kelamin: guestIdentity.jenis_kelamin,
          tanggal_lahir: guestIdentity.tanggal_lahir || '',
          alamat: guestIdentity.alamat,
          email: guestIdentity.email,
          nomor_telp: guestIdentity.nomor_telp,
          pendidikan_terakhir: guestIdentity.pendidikan_terakhir || '',
          pekerjaan_utama: guestIdentity.pekerjaan_utama || '',
          jenis_layanan: guestIdentity.jenis_layanan || ''
        },
        answers,
        feedback: feedback.trim()
      };

      const result = await submitSurvey(submission);

      if (result.success) {
        setSubmitted(true);
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
    return <LoadingState />;
  }

  if (submitted) {
    return (
      <Suspense fallback={<LoadingState />}>
        <SubmissionSuccess resetForm={resetFormData} />
      </Suspense>
    );
  }

  return (
    <>
      <Card variant="elevated" padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Kepuasan Layanan</h2>
          <p className="text-gray-800">Berikan penilaian Anda terhadap layanan DISNAKERTRANS Provinsi Jawa Tengah</p>
        </div>

        {/* IDENTITAS RESPONDEN Section */}
        <Suspense fallback={<div className="animate-pulse p-4 bg-gray-100 rounded-lg">
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>}>
          <GuestIdentityForm 
            guestIdentity={guestIdentity}
            lookupData={lookupData}
            updateGuestIdentity={updateGuestIdentity}
            focusedDropdowns={focusedDropdowns}
            handleDropdownMouseDown={handleDropdownMouseDown}
            handleDropdownBlur={handleDropdownBlur}
            handleDropdownChange={handleDropdownChange}
          />
        </Suspense>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Survey Questions */}
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
                  {sectionQuestions.map((question) => (
                    <Suspense key={question.id} fallback={
                      <div className="animate-pulse p-4 bg-gray-100 rounded-lg">
                        <div className="h-5 bg-gray-300 rounded w-3/4 mb-3"></div>
                        <div className="flex space-x-2 justify-center">
                          {[1,2,3,4,5].map(n => (
                            <div key={n} className="h-8 w-8 bg-gray-300 rounded-full"></div>
                          ))}
                        </div>
                      </div>
                    }>
                      <QuestionCard 
                        question={question}
                        onRatingChange={handleRatingChange}
                        onTextChange={handleTextChange}
                        focusedDropdowns={focusedDropdowns}
                        handleDropdownMouseDown={handleDropdownMouseDown}
                        handleDropdownBlur={handleDropdownBlur}
                        handleDropdownChange={handleDropdownChange}
                      />
                    </Suspense>
                  ))}
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
              className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] bg-white hover:bg-gray-50 focus:bg-white resize-none"
              placeholder="Berikan saran atau masukan untuk meningkatkan kualitas pelayanan kami..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !isFormValid()}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                submitting || !isFormValid()
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

          {!isFormValid() && questions.length > 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Silakan lengkapi data identitas dan berikan penilaian pada setidaknya satu pertanyaan untuk dapat mengirim survey
            </p>
          )}
        </form>
      </Card>
    </>
  );
}
