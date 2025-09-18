'use client';

import { lazy, Suspense } from 'react';

import Card from '@/components/ui/Card';
import TurnstileCaptcha from '@/components/ui/TurnstileCaptcha';
import { useSurveyData, useDropdownState } from '@/hooks/useSurveyForm';
import { useTurnstileCaptcha } from '@/hooks/useTurnstileCaptcha';
import { submitSurvey } from '@/lib/survey-api';
import { showToast } from '@/lib/toast';
import { SurveySubmission } from '@/types/survey-types';

import LoadingState from '../guest/LoadingState';


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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validate identity data
      if (!isFormValid()) {
        showToast.validation('Mohon lengkapi semua data identitas responden');
        setSubmitting(false);
        return;
      }

      // Validate CAPTCHA
      const captchaValidationError = getCaptchaValidationError();
      if (captchaValidationError) {
        showToast.validation(captchaValidationError);
        setSubmitting(false);
        return;
      }

      // Convert responses to the format expected by the API
      const answers = responses
        .filter(response => response.jawaban !== undefined) // Filter out undefined answers
        .map(response => ({
          pertanyaan_id: response.pertanyaan_id,
          jawaban: response.jawaban as string | number // Type assertion since we filtered out undefined
        }));

      const submission: SurveySubmission = {
        identity: {
          ...(guestIdentity.tamu_id ? { tamu_id: guestIdentity.tamu_id } : {}), // Only include tamu_id if it exists
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
        feedback: feedback.trim(),
        captchaToken: captchaToken || undefined // Add CAPTCHA token to submission
      };

      const result = await submitSurvey(submission);

      if (result.success) {
        setSubmitted(true);
        resetCaptcha(); // Reset CAPTCHA on successful submission
      } else {
        showToast.error('Gagal mengirim survey: ' + (result.message || 'Unknown error'));
        resetCaptcha(); // Reset CAPTCHA on error to allow retry
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      showToast.error('Terjadi kesalahan saat mengirim survey');
      resetCaptcha(); // Reset CAPTCHA on error to allow retry
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survei Kepuasan Layanan</h2>
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

          {/* CAPTCHA Section */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Verifikasi Keamanan
            </label>
            <div className="flex justify-center">
              <TurnstileCaptcha
                onVerify={handleCaptchaVerify}
                onError={handleCaptchaError}
                onExpire={handleCaptchaExpire}
                theme="light"
                size="normal"
                className="mx-auto"
                disabled={submitting}
              />
            </div>
            {captchaError && (
              <p className="text-red-600 text-sm mt-2 text-center">{captchaError}</p>
            )}
            {isCaptchaVerified && (
              <p className="text-green-600 text-sm mt-2 text-center flex items-center justify-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verifikasi berhasil
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !isFormValid() || !isCaptchaVerified}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                submitting || !isFormValid() || !isCaptchaVerified
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

          {(!isFormValid() || !isCaptchaVerified) && questions.length > 0 && (
            <p className="text-sm text-gray-500 text-center mt-4">
              {!isFormValid() && 'Silakan lengkapi data identitas dan berikan penilaian terhadap pelayanan kami ^^'}
              {isFormValid() && !isCaptchaVerified && 'Silakan selesaikan verifikasi keamanan untuk melanjutkan'}
            </p>
          )}
        </form>
      </Card>
    </>
  );
}
