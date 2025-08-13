'use client';

import { useState, useEffect } from 'react';

interface SurveyQuestion {
  id: number;
  pertanyaan: string;
  tipe_pertanyaan: 'rating' | 'text';
  urutan: number;
  status: boolean;
  placeholder?: string;
}

export default function AdminSurvey() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    pertanyaan: '',
    tipe_pertanyaan: 'rating' as 'rating' | 'text',
    urutan: 0,
    status: true,
    placeholder: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch('/api/survey/questions');
      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        
        // Ensure data is an array and transform to expected format
        if (Array.isArray(data)) {
          const transformedData = data.map((q: any) => ({
            id: q.id,
            pertanyaan: q.pertanyaan,
            tipe_pertanyaan: q.tipe_jawaban || q.tipe_pertanyaan,
            urutan: q.urutan,
            status: q.is_aktif !== undefined ? q.is_aktif : q.status
          }));
          
          setQuestions(transformedData);
        } else {
          setQuestions([]);
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async () => {
    try {
      const response = await fetch('/api/survey/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion),
      });

      if (response.ok) {
        setNewQuestion({
          pertanyaan: '',
          tipe_pertanyaan: 'rating',
          urutan: 0,
          status: true,
          placeholder: ''
        });
        setShowAddQuestion(false);
        fetchQuestions(); // Refresh list
      }
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  const handleEditQuestion = async (question: SurveyQuestion) => {
    try {
      const response = await fetch(`/api/survey/questions/${question.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question),
      });

      if (response.ok) {
        setEditingQuestion(null);
        fetchQuestions(); // Refresh list
      }
    } catch (error) {
      console.error('Error updating question:', error);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      try {
        const response = await fetch(`/api/survey/questions/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchQuestions(); // Refresh list
        }
      } catch (error) {
        console.error('Error deleting question:', error);
      }
    }
  };

  const toggleQuestionStatus = async (question: SurveyQuestion) => {
    const updatedQuestion = { ...question, status: !question.status };
    handleEditQuestion(updatedQuestion);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Memuat data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Survey Management</h1>
              <p className="text-gray-600 mt-1">Kelola pertanyaan untuk survey tamu</p>
            </div>
            <button
              onClick={() => setShowAddQuestion(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Tambah Pertanyaan
            </button>
          </div>

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

          {/* Questions List */}
          <div className="space-y-3">
            {Array.isArray(questions) && questions.length > 0 ? (
              questions.map((question) => (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                {editingQuestion?.id === question.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pertanyaan
                      </label>
                      <input
                        type="text"
                        value={editingQuestion.pertanyaan}
                        onChange={(e) => setEditingQuestion({
                          ...editingQuestion,
                          pertanyaan: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipe
                        </label>
                        <select
                          value={editingQuestion.tipe_pertanyaan}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            tipe_pertanyaan: e.target.value as 'rating' | 'text'
                          })}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="rating">Rating</option>
                          <option value="text">Text</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Urutan
                        </label>
                        <input
                          type="number"
                          value={editingQuestion.urutan}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            urutan: parseInt(e.target.value)
                          })}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    {editingQuestion.tipe_pertanyaan === 'text' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder (opsional)
                        </label>
                        <textarea
                          value={editingQuestion.placeholder || ''}
                          onChange={(e) => setEditingQuestion({
                            ...editingQuestion,
                            placeholder: e.target.value
                          })}
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                          placeholder="Contoh jawaban untuk membantu user..."
                        />
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleEditQuestion(editingQuestion)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => setEditingQuestion(null)}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors text-sm"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-medium text-gray-900">
                          {question.urutan}. {question.pertanyaan}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          question.tipe_pertanyaan === 'rating' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {question.tipe_pertanyaan === 'rating' ? 'Rating' : 'Text'}
                        </span>
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
                        onClick={() => toggleQuestionStatus(question)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          question.status 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {question.status ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-3">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">Belum ada pertanyaan survey</p>
                <p className="text-sm text-gray-400 mt-1">Klik "Tambah Pertanyaan" untuk memulai</p>
              </div>
            )}
          </div>

          {/* Add Question Modal */}
          {showAddQuestion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg max-w-lg w-full mx-4 shadow-xl">
                <h2 className="text-lg font-semibold mb-4 text-gray-900">Tambah Pertanyaan Baru</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pertanyaan
                    </label>
                    <input
                      type="text"
                      value={newQuestion.pertanyaan}
                      onChange={(e) => setNewQuestion({
                        ...newQuestion,
                        pertanyaan: e.target.value
                      })}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Masukkan pertanyaan..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipe
                      </label>
                      <select
                        value={newQuestion.tipe_pertanyaan}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          tipe_pertanyaan: e.target.value as 'rating' | 'text'
                        })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="rating">Rating</option>
                        <option value="text">Text</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Urutan
                      </label>
                      <input
                        type="number"
                        value={newQuestion.urutan}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          urutan: parseInt(e.target.value) || 0
                        })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1, 2, 3..."
                      />
                    </div>
                  </div>
                  
                  {newQuestion.tipe_pertanyaan === 'text' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Placeholder (opsional)
                      </label>
                      <textarea
                        value={newQuestion.placeholder}
                        onChange={(e) => setNewQuestion({
                          ...newQuestion,
                          placeholder: e.target.value
                        })}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none"
                        placeholder="Contoh jawaban untuk membantu user..."
                      />
                    </div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setNewQuestion({
                          pertanyaan: '',
                          tipe_pertanyaan: 'rating',
                          urutan: 0,
                          status: true,
                          placeholder: ''
                        });
                        setShowAddQuestion(false);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleAddQuestion}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      Tambah Pertanyaan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
