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
  const [activeTab, setActiveTab] = useState<'questions' | 'responses'>('questions');
  const [newQuestion, setNewQuestion] = useState({
    pertanyaan: '',
    tipe_pertanyaan: 'rating' as 'rating' | 'text',
    urutan: 0,
    status: true,
    placeholder: ''
  });

  // Dummy survey responses
  const dummyResponses = [
    {
      id: 1,
      nama: "Budi Santoso",
      email: "budi.santoso@email.com",
      tanggal: "2025-08-13",
      waktu: "14:30",
      responses: {
        "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?": 5,
        "Bagaimana penilaian Anda terhadap kecepatan pelayanan?": 4,
        "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?": 5,
        "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?": 4,
        "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?": 5,
        "Apakah ada saran atau kritik untuk perbaikan layanan kami?": "Pelayanan sudah sangat baik, hanya perlu penambahan kursi di ruang tunggu.",
        "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?": 5
      }
    },
    {
      id: 2,
      nama: "Siti Nurhaliza",
      email: "siti.nurhaliza@email.com",
      tanggal: "2025-08-13",
      waktu: "10:15",
      responses: {
        "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?": 4,
        "Bagaimana penilaian Anda terhadap kecepatan pelayanan?": 3,
        "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?": 4,
        "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?": 4,
        "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?": 4,
        "Apakah ada saran atau kritik untuk perbaikan layanan kami?": "Proses pelayanan bisa dipercepat lagi.",
        "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?": 4
      }
    },
    {
      id: 3,
      nama: "Ahmad Wijaya",
      email: "ahmad.wijaya@email.com",
      tanggal: "2025-08-12",
      waktu: "16:45",
      responses: {
        "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?": 5,
        "Bagaimana penilaian Anda terhadap kecepatan pelayanan?": 5,
        "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?": 5,
        "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?": 5,
        "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?": 5,
        "Apakah ada saran atau kritik untuk perbaikan layanan kami?": "Pelayanan sangat memuaskan, pertahankan kualitas ini!",
        "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?": 5
      }
    }
  ];

  useEffect(() => {
    // Langsung set dummy data tanpa mengecek API untuk demo
    const dummyQuestions: SurveyQuestion[] = [
      {
        id: 1,
        pertanyaan: "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?",
        tipe_pertanyaan: 'rating',
        urutan: 1,
        status: true
      },
      {
        id: 2,
        pertanyaan: "Bagaimana penilaian Anda terhadap kecepatan pelayanan?",
        tipe_pertanyaan: 'rating',
        urutan: 2,
        status: true
      },
      {
        id: 3,
        pertanyaan: "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?",
        tipe_pertanyaan: 'rating',
        urutan: 3,
        status: true
      },
      {
        id: 4,
        pertanyaan: "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?",
        tipe_pertanyaan: 'rating',
        urutan: 4,
        status: true
      },
      {
        id: 5,
        pertanyaan: "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?",
        tipe_pertanyaan: 'rating',
        urutan: 5,
        status: true
      },
      {
        id: 6,
        pertanyaan: "Apakah ada saran atau kritik untuk perbaikan layanan kami?",
        tipe_pertanyaan: 'text',
        urutan: 6,
        status: true,
        placeholder: "Tuliskan saran atau kritik Anda untuk membantu kami memberikan pelayanan yang lebih baik..."
      },
      {
        id: 7,
        pertanyaan: "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?",
        tipe_pertanyaan: 'rating',
        urutan: 7,
        status: true
      },
      {
        id: 8,
        pertanyaan: "Bagaimana Anda mengetahui tentang layanan kami?",
        tipe_pertanyaan: 'text',
        urutan: 8,
        status: false,
        placeholder: "Contoh: media sosial, website, teman, dll..."
      }
    ];
    
    setQuestions(dummyQuestions);
    setLoading(false);
  }, []);

  // Fungsi untuk demo - langsung return dummy data
  const fetchQuestions = async () => {
    // Simulasi loading
    setLoading(true);
    
    // Set dummy data untuk demo
    const dummyQuestions: SurveyQuestion[] = [
      {
        id: 1,
        pertanyaan: "Bagaimana penilaian Anda terhadap pelayanan yang diberikan oleh petugas?",
        tipe_pertanyaan: 'rating',
        urutan: 1,
        status: true
      },
      {
        id: 2,
        pertanyaan: "Bagaimana penilaian Anda terhadap kecepatan pelayanan?",
        tipe_pertanyaan: 'rating',
        urutan: 2,
        status: true
      },
      {
        id: 3,
        pertanyaan: "Bagaimana penilaian Anda terhadap kejelasan informasi yang diberikan?",
        tipe_pertanyaan: 'rating',
        urutan: 3,
        status: true
      },
      {
        id: 4,
        pertanyaan: "Bagaimana penilaian Anda terhadap fasilitas yang tersedia?",
        tipe_pertanyaan: 'rating',
        urutan: 4,
        status: true
      },
      {
        id: 5,
        pertanyaan: "Bagaimana penilaian Anda secara keseluruhan terhadap layanan kami?",
        tipe_pertanyaan: 'rating',
        urutan: 5,
        status: true
      },
      {
        id: 6,
        pertanyaan: "Apakah ada saran atau kritik untuk perbaikan layanan kami?",
        tipe_pertanyaan: 'text',
        urutan: 6,
        status: true,
        placeholder: "Tuliskan saran atau kritik Anda untuk membantu kami memberikan pelayanan yang lebih baik..."
      },
      {
        id: 7,
        pertanyaan: "Apakah Anda akan merekomendasikan layanan kami kepada orang lain?",
        tipe_pertanyaan: 'rating',
        urutan: 7,
        status: true
      },
      {
        id: 8,
        pertanyaan: "Bagaimana Anda mengetahui tentang layanan kami?",
        tipe_pertanyaan: 'text',
        urutan: 8,
        status: false,
        placeholder: "Contoh: media sosial, website, teman, dll..."
      }
    ];
    
    setQuestions(dummyQuestions);
    setLoading(false);
  };

  const handleAddQuestion = async () => {
    // Simulasi penambahan pertanyaan untuk demo
    const newId = Math.max(...questions.map(q => q.id)) + 1;
    const newQuestionWithId = {
      ...newQuestion,
      id: newId,
      urutan: newQuestion.urutan || questions.length + 1
    };
    
    setQuestions([...questions, newQuestionWithId]);
    setNewQuestion({
      pertanyaan: '',
      tipe_pertanyaan: 'rating',
      urutan: 0,
      status: true,
      placeholder: ''
    });
    setShowAddQuestion(false);
  };

  const handleEditQuestion = async (question: SurveyQuestion) => {
    // Simulasi edit untuk demo
    setQuestions(questions.map(q => q.id === question.id ? question : q));
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus pertanyaan ini?')) {
      // Simulasi hapus untuk demo
      setQuestions(questions.filter(q => q.id !== id));
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
    <div className="min-h-screen bg-gray-50 p-4 admin-survey">
      <div className="max-w-6xl mx-auto">
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

          {/* Survey Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Pertanyaan</p>
                  <p className="text-2xl font-bold">{questions.length}</p>
                </div>
                <div className="bg-blue-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Pertanyaan Aktif</p>
                  <p className="text-2xl font-bold">{questions.filter(q => q.status).length}</p>
                </div>
                <div className="bg-green-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Rating Questions</p>
                  <p className="text-2xl font-bold">{questions.filter(q => q.tipe_pertanyaan === 'rating').length}</p>
                </div>
                <div className="bg-purple-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Text Questions</p>
                  <p className="text-2xl font-bold">{questions.filter(q => q.tipe_pertanyaan === 'text').length}</p>
                </div>
                <div className="bg-orange-400 rounded-full p-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 2v8h8V6H6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'questions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Kelola Pertanyaan
              </button>
              <button
                onClick={() => setActiveTab('responses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'responses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Lihat Respon Survey ({dummyResponses.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'questions' ? (
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
                          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                          style={{
                            backgroundColor: '#ffffff !important',
                            color: '#1f2937 !important',
                            WebkitTextFillColor: '#1f2937 !important',
                            WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                            boxShadow: '0 0 0 1000px #ffffff inset !important'
                          }}
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
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            style={{
                              backgroundColor: '#ffffff !important',
                              color: '#1f2937 !important',
                              WebkitTextFillColor: '#1f2937 !important',
                              WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                              boxShadow: '0 0 0 1000px #ffffff inset !important'
                            }}
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
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            style={{
                              backgroundColor: '#ffffff !important',
                              color: '#1f2937 !important',
                              WebkitTextFillColor: '#1f2937 !important',
                              WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                              boxShadow: '0 0 0 1000px #ffffff inset !important'
                            }}
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
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none bg-white text-gray-900"
                            style={{
                              backgroundColor: '#ffffff !important',
                              color: '#1f2937 !important',
                              WebkitTextFillColor: '#1f2937 !important',
                              WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                              boxShadow: '0 0 0 1000px #ffffff inset !important'
                            }}
                            placeholder="Contoh jawaban untuk membantu user..."
                          />
                        </div>
                      )}                    <div className="flex gap-2 pt-2">
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
            </>
          ) : (
            /* Survey Responses Tab */
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-800 mb-2">Statistik Respon</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{dummyResponses.length}</p>
                    <p className="text-sm text-gray-600">Total Respon</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">4.5</p>
                    <p className="text-sm text-gray-600">Rata-rata Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">100%</p>
                    <p className="text-sm text-gray-600">Tingkat Respon</p>
                  </div>
                </div>
              </div>

              {/* Response List */}
              {dummyResponses.map((response, index) => (
                <div key={response.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{response.nama}</h3>
                      <p className="text-sm text-gray-600">{response.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{response.tanggal}</p>
                      <p className="text-sm text-gray-500">{response.waktu}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {Object.entries(response.responses).map(([question, answer]) => (
                      <div key={question} className="border-l-2 border-gray-200 pl-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">{question}</p>
                        {typeof answer === 'number' ? (
                          <div className="flex items-center space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-5 h-5 ${
                                  star <= answer ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="ml-2 text-sm font-medium text-gray-600">({answer}/5)</span>
                          </div>
                        ) : (
                          <p className="text-gray-600 bg-gray-50 rounded-md p-3">{answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

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
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                      style={{
                        backgroundColor: '#ffffff !important',
                        color: '#1f2937 !important',
                        WebkitTextFillColor: '#1f2937 !important',
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                        boxShadow: '0 0 0 1000px #ffffff inset !important'
                      }}
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        style={{
                          backgroundColor: '#ffffff !important',
                          color: '#1f2937 !important',
                          WebkitTextFillColor: '#1f2937 !important',
                          WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                          boxShadow: '0 0 0 1000px #ffffff inset !important'
                        }}
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                        style={{
                          backgroundColor: '#ffffff !important',
                          color: '#1f2937 !important',
                          WebkitTextFillColor: '#1f2937 !important',
                          WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                          boxShadow: '0 0 0 1000px #ffffff inset !important'
                        }}
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
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-20 resize-none bg-white text-gray-900"
                        style={{
                          backgroundColor: '#ffffff !important',
                          color: '#1f2937 !important',
                          WebkitTextFillColor: '#1f2937 !important',
                          WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                          boxShadow: '0 0 0 1000px #ffffff inset !important'
                        }}
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
