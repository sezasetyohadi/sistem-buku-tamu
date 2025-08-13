"use client";

import { useState, useEffect } from 'react';
import Card from './ui/Card';

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

interface GuestIdentity {
  id: number;
  nama: string;
  email: string;
  nomor_telp: string;
  umur?: number;
  jenis_kelamin: string;
  alamat: string;
  kecamatan?: string;
  kab_kota?: string;
  provinsi?: string;
  pendidikan_terakhir?: string;
  pekerjaan_utama?: string;
  jenis_layanan?: string;
}

export default function SurveyForm() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [ratingOptions, setRatingOptions] = useState<RatingOption[]>([]);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guestIdentity, setGuestIdentity] = useState<GuestIdentity | null>(null);
  const [surveyDate, setSurveyDate] = useState('');

  useEffect(() => {
    fetchSurveyData();
    // Set current date for survey
    const currentDate = new Date();
    setSurveyDate(currentDate.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }));
    
    // Mock guest identity - in real app, this would come from session or API
    // For now, using sample data with empty dropdowns for user selection
    setGuestIdentity({
      id: 1,
      nama: 'John Doe',
      email: 'john.doe@example.com',
      nomor_telp: '081234567890',
      umur: 30,
      jenis_kelamin: '', // Let user select
      alamat: 'Jl. Contoh No. 123',
      kecamatan: 'Semarang Tengah',
      kab_kota: 'Semarang',
      provinsi: 'Jawa Tengah',
      pendidikan_terakhir: '', // Let user select
      pekerjaan_utama: '', // Let user select
      jenis_layanan: '' // Let user select
    });
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
    <>
      <Card variant="elevated" padding="lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Survey Kepuasan Layanan</h2>
          <p className="text-gray-800">Berikan penilaian Anda terhadap layanan DISNAKERTRANS Provinsi Jawa Tengah</p>
        </div>

        {/* IDENTITAS RESPONDEN Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-center">IDENTITAS RESPONDEN</h3>
            <p className="text-blue-100 text-sm text-center mt-1">Data diambil otomatis dari registrasi tamu</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tanggal Survey
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                    {surveyDate}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nama Lengkap
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <div className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                    {guestIdentity?.nama || '-'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                    {guestIdentity?.email || '-'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nomor Telepon
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                    {guestIdentity?.nomor_telp || '-'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Kelamin
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <select 
                    value={guestIdentity?.jenis_kelamin || ''}
                    onChange={(e) => setGuestIdentity(prev => prev ? {...prev, jenis_kelamin: e.target.value} : null)}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      backgroundColor: '#ffffff !important',
                      color: '#1f2937 !important',
                      WebkitTextFillColor: '#1f2937 !important'
                    }}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">1. Laki-laki</option>
                    <option value="Perempuan">2. Perempuan</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat
                </label>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-gray-400 mr-3 mt-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg">
                    {guestIdentity?.alamat || '-'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pendidikan Terakhir
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  <select 
                    value={guestIdentity?.pendidikan_terakhir || ''}
                    onChange={(e) => setGuestIdentity(prev => prev ? {...prev, pendidikan_terakhir: e.target.value} : null)}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      backgroundColor: '#ffffff !important',
                      color: '#1f2937 !important',
                      WebkitTextFillColor: '#1f2937 !important'
                    }}
                  >
                    <option value="">Pilih Pendidikan Terakhir</option>
                    <option value="SD/Sederajat">1. SD/Sederajat</option>
                    <option value="SLTP">2. SLTP</option>
                    <option value="SLTA">3. SLTA</option>
                    <option value="Diploma (D-1, D-2, D-3)">4. Diploma (D-1, D-2, D-3)</option>
                    <option value="Sarjana (S-1)">5. Sarjana (S-1)</option>
                    <option value="Pasca Sarjana (S-2, S-3)">6. Pasca Sarjana (S-2, S-3)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pekerjaan Utama
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                  </svg>
                  <select 
                    value={guestIdentity?.pekerjaan_utama || ''}
                    onChange={(e) => setGuestIdentity(prev => prev ? {...prev, pekerjaan_utama: e.target.value} : null)}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      backgroundColor: '#ffffff !important',
                      color: '#1f2937 !important',
                      WebkitTextFillColor: '#1f2937 !important'
                    }}
                  >
                    <option value="">Pilih Pekerjaan Utama</option>
                    <option value="PNS / TNI / Polri">1. PNS / TNI / Polri</option>
                    <option value="Pensiunan">2. Pensiunan</option>
                    <option value="Pegawai Swasta">3. Pegawai Swasta</option>
                    <option value="Wiraswasta">4. Wiraswasta</option>
                    <option value="Buruh Tani/Bangunan">5. Buruh Tani/Bangunan</option>
                    <option value="Pelajar/Mahasiswa">6. Pelajar/Mahasiswa</option>
                    <option value="Tidak Bekerja">7. Tidak Bekerja</option>
                    <option value="Lainnya, Sebutkan :">8. Lainnya, Sebutkan :</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Jenis Layanan
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <select 
                    value={guestIdentity?.jenis_layanan || ''}
                    onChange={(e) => setGuestIdentity(prev => prev ? {...prev, jenis_layanan: e.target.value} : null)}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    style={{
                      backgroundColor: '#ffffff !important',
                      color: '#1f2937 !important',
                      WebkitTextFillColor: '#1f2937 !important'
                    }}
                  >
                    <option value="">Pilih Jenis Layanan</option>
                    <option value="Akreditasi LPKS">1. Akreditasi LPKS</option>
                    <option value="Uji Kompetensi">2. Uji Kompetensi</option>
                    <option value="Pendaftaran Magang Jepang">3. Pendaftaran Magang Jepang</option>
                    <option value="Rekomendasi LPKS yang akan Akreditasi">4. Rekomendasi LPKS yang akan Akreditasi</option>
                    <option value="Layanan Informasi Program Magang Dalam dan Luar Negeri">5. Layanan Informasi Program Magang Dalam dan Luar Negeri</option>
                    <option value="Konsultasi Perizinan P3MI">6. Konsultasi Perizinan P3MI</option>
                    <option value="Konsultasi Perizinan TKA">7. Konsultasi Perizinan TKA</option>
                    <option value="Konsultasi Perizinan LPTKS">8. Konsultasi Perizinan LPTKS</option>
                    <option value="Informasi Pasar Kerja dan Bursa Kerja">9. Informasi Pasar Kerja dan Bursa Kerja</option>
                    <option value="Pengesahan Peraturan Perusahaan">10. Pengesahan Peraturan Perusahaan</option>
                    <option value="Pendaftaran Perjanjian Kerja Bersama">11. Pendaftaran Perjanjian Kerja Bersama</option>
                    <option value="Konsultasi dan Rekomendasi Izin Perusahaan Penyedia Jasa Pekerja">12. Konsultasi dan Rekomendasi Izin Perusahaan Penyedia Jasa Pekerja</option>
                    <option value="Mediasi Hubungan Industrial">13. Mediasi Hubungan Industrial</option>
                    <option value="Konsultasi Hubungan Industrial">14. Konsultasi Hubungan Industrial</option>
                    <option value="Wajib Lapor Ketenagakerjaan">15. Wajib Lapor Ketenagakerjaan</option>
                    <option value="Pengesahan/Konsultasi Kebijakan Keselamatan Kerja & Perhitungan Klaim Jaminan Kecelakaan Kerja & LAHK (K3)">16. Pengesahan/Konsultasi Kebijakan Keselamatan Kerja & Perhitungan Klaim Jaminan Kecelakaan Kerja & LAHK (K3)</option>
                    <option value="Penelitian Produk Layanan K3">17. Penelitian Produk Layanan K3</option>
                    <option value="Penanganan Kasus Ketenagakerjaan">18. Penanganan Kasus Ketenagakerjaan</option>
                    <option value="Penyidikan Tindak Pidana">19. Penyidikan Tindak Pidana</option>
                    <option value="Pengesahan Permasalahan Tenaga Kerja">20. Pengesahan Permasalahan Tenaga Kerja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Umur
                </label>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="flex items-center space-x-2">
                    <div className="px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg w-20 text-center">
                      {guestIdentity?.umur || '-'}
                    </div>
                    <span className="text-sm text-gray-600">Tahun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none bg-white text-gray-900"
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
      </Card>
    </>
  );
}
