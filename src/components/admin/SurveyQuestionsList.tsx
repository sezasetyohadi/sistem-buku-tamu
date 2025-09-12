'use client';

import React from 'react';
import ConfirmationModal from './ConfirmationModal';

interface SurveyQuestion {
  id?: number;
  pertanyaan: string;
  tipe_pertanyaan: 'rating' | 'text';
  status: boolean;
  jenis_rating_id?: number;
  is_required?: boolean | number; // Allow both boolean and number (1/0 from DB)
  urutan?: number;
  baris?: number;
  multiple_rating_types?: { 
    jenis_rating_id: number; 
    is_required?: boolean | number; 
    nama_rating?: string;
    urutan?: number;
  }[];
}

interface SurveyQuestionsListProps {
  questions: SurveyQuestion[];
  loading: boolean;
  deleteConfirmationOpen: boolean;
  questionToDelete: SurveyQuestion | null;
  isDeleting: boolean;
  onToggleQuestionStatus: (question: SurveyQuestion) => void;
  onEditQuestion: (question: SurveyQuestion) => void;
  onDeleteQuestion: () => void;
  onOpenDeleteConfirmation: (question: SurveyQuestion) => void;
  onCloseDeleteConfirmation: () => void;
  onOpenOrderModal: () => void;
}

export default function SurveyQuestionsList({
  questions,
  loading,
  deleteConfirmationOpen,
  questionToDelete,
  isDeleting,
  onToggleQuestionStatus,
  onEditQuestion,
  onDeleteQuestion,
  onOpenDeleteConfirmation,
  onCloseDeleteConfirmation,
  onOpenOrderModal
}: SurveyQuestionsListProps) {
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Memuat pertanyaan...</div>
      </div>
    );
  }

  return (
    <>
      {/* Information about respondent identity */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Informasi Identitas Responden
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                • Bagian <strong>Identitas Responden</strong> pada form survey diisi otomatis dari data registrasi tamu
              </p>
              <p className="mt-1">
                • Data identitas tidak dapat diedit oleh admin dan bersifat <strong>read-only</strong>
              </p>
              <p className="mt-1">
                • Hanya pertanyaan survey di bawah ini yang dapat dikelola oleh admin
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question management buttons */}
      <div className="flex justify-end mb-4">
        <button 
          onClick={onOpenOrderModal}
          className="flex items-center bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
          </svg>
          Edit Urutan
        </button>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {Array.isArray(questions) && questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-medium text-gray-900">
                      {question.pertanyaan}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      question.status ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    <span className="text-sm text-gray-600">
                      {question.status ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleQuestionStatus(question)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      question.status 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {question.status ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => onEditQuestion(question)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onOpenDeleteConfirmation(question)}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>Belum ada pertanyaan survey.</p>
            <p className="text-sm mt-1">Klik "Tambah Pertanyaan" untuk memulai.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirmationOpen}
        title="Hapus Pertanyaan"
        message={`Apakah Anda yakin ingin menghapus pertanyaan "${questionToDelete?.pertanyaan}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmButtonText="Hapus"
        cancelButtonText="Batal"
        onConfirm={onDeleteQuestion}
        onClose={onCloseDeleteConfirmation}
        isLoading={isDeleting}
      />
    </>
  );
}
