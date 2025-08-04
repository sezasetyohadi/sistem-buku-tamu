"use client";

import { useState } from "react";

export default function Survey() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    jenisKelamin: "",
    pendidikanTerakhir: "",
    profesiInstansi: "",
    umur: "",
    kemudahanAkses: "",
    kecepatanPelayanan: "",
    kemampuanPetugas: "",
    kualitasHasil: "",
    fasilitasTersedia: "",
    saranMasukan: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Survey submitted:", formData);
    // Add form submission logic here
  };

  const renderRatingQuestion = (
    name: string, 
    question: string, 
    value: string,
    emoji: string
  ) => (
    <div className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors duration-300">
      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-3 text-2xl">{emoji}</span>
        {question}
        <span className="text-red-500 ml-1">*</span>
      </h4>
      <div className="space-y-3">
        {[
          { value: "Memuaskan", label: "😊 Memuaskan", color: "text-green-600" },
          { value: "Cukup", label: "😐 Cukup", color: "text-yellow-600" },
          { value: "Kurang", label: "😞 Kurang", color: "text-red-600" }
        ].map((option) => (
          <label key={option.value} className="flex items-center cursor-pointer group">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={handleInputChange}
              className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 focus:ring-indigo-500 focus:ring-2"
              required
            />
            <span className={`ml-3 font-medium ${option.color} group-hover:scale-105 transition-transform`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold mb-6">
              <span className="mr-2">⭐</span>
              Survei Kepuasan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              ⭐ Survei Kepuasan Layanan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Berikan penilaian Anda terhadap layanan yang telah diberikan untuk membantu kami meningkatkan kualitas pelayanan
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              {/* Personal Information */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">👤</span>
                  Informasi Personal
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">✍️</span>
                        Nama Lengkap
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="namaLengkap"
                      value={formData.namaLengkap}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900 placeholder-gray-400"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">👫</span>
                        Jenis Kelamin
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      name="jenisKelamin"
                      value={formData.jenisKelamin}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900"
                      required
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">🎓</span>
                        Pendidikan Terakhir
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      name="pendidikanTerakhir"
                      value={formData.pendidikanTerakhir}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900"
                      required
                    >
                      <option value="">Pilih Pendidikan</option>
                      <option value="SD">SD</option>
                      <option value="SMP">SMP</option>
                      <option value="SMA/SMK">SMA/SMK</option>
                      <option value="D3">D3</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">💼</span>
                        Profesi/Instansi
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      name="profesiInstansi"
                      value={formData.profesiInstansi}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900 placeholder-gray-400"
                      placeholder="Masukkan profesi/instansi"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">🎂</span>
                        Umur
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="number"
                      name="umur"
                      value={formData.umur}
                      onChange={handleInputChange}
                      min="1"
                      max="100"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900 placeholder-gray-400"
                      placeholder="Masukkan umur"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Satisfaction Questions */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
                  <span className="mr-3">📊</span>
                  Penilaian Kepuasan Layanan
                </h3>
                
                <div className="space-y-6">
                  {renderRatingQuestion(
                    "kemudahanAkses",
                    "1. Bagaimana penilaian Anda terhadap kemudahan akses layanan?",
                    formData.kemudahanAkses,
                    "🚪"
                  )}

                  {renderRatingQuestion(
                    "kecepatanPelayanan",
                    "2. Bagaimana penilaian Anda terhadap kecepatan pelayanan?",
                    formData.kecepatanPelayanan,
                    "⚡"
                  )}

                  {renderRatingQuestion(
                    "kemampuanPetugas",
                    "3. Bagaimana penilaian Anda terhadap kemampuan petugas?",
                    formData.kemampuanPetugas,
                    "👨‍💼"
                  )}

                  {renderRatingQuestion(
                    "kualitasHasil",
                    "4. Bagaimana penilaian Anda terhadap kualitas hasil layanan?",
                    formData.kualitasHasil,
                    "🏆"
                  )}

                  {renderRatingQuestion(
                    "fasilitasTersedia",
                    "5. Bagaimana penilaian Anda terhadap fasilitas yang tersedia?",
                    formData.fasilitasTersedia,
                    "🏢"
                  )}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">💭</span>
                  Saran dan Masukan
                </h3>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="mr-2">📝</span>
                      Berikan saran dan masukan untuk perbaikan layanan
                    </span>
                  </label>
                  <textarea
                    name="saranMasukan"
                    value={formData.saranMasukan}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Berikan saran dan masukan untuk perbaikan layanan kami..."
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-yellow-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-3">📤</span>
                    Kirim Survei
                    <span className="ml-3 transform group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
