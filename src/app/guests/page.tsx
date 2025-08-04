"use client";

import { useState } from "react";

export default function Guests() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    jenisLayanan: "",
    prioritas: "",
    deskripsiPermohonan: "",
    filePendukung: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, filePendukung: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Service request submitted:", formData);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              <span className="mr-2">🙏</span>
              Permohonan Layanan
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📋 Formulir Permohonan Layanan
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ajukan permohonan layanan Anda dengan mudah melalui formulir digital yang tersedia
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
                        <span className="mr-2">📧</span>
                        Email
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900 placeholder-gray-400"
                      placeholder="contoh@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">🛠️</span>
                  Detail Layanan
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">🔧</span>
                        Jenis Layanan
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      name="jenisLayanan"
                      value={formData.jenisLayanan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900"
                      required
                    >
                      <option value="">Pilih Jenis Layanan</option>
                      <option value="Konsultasi">🗣️ Konsultasi</option>
                      <option value="Pengajuan Dokumen">📄 Pengajuan Dokumen</option>
                      <option value="Bantuan Teknis">🔧 Bantuan Teknis</option>
                      <option value="Informasi">ℹ️ Informasi</option>
                      <option value="Komplain">❗ Komplain</option>
                      <option value="Lainnya">📝 Lainnya</option>
                    </select>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">⚡</span>
                        Prioritas
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <select
                      name="prioritas"
                      value={formData.prioritas}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900"
                      required
                    >
                      <option value="">Pilih Prioritas</option>
                      <option value="Rendah">🟢 Rendah</option>
                      <option value="Sedang">🟡 Sedang</option>
                      <option value="Tinggi">🟠 Tinggi</option>
                      <option value="Urgent">🔴 Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">📝</span>
                  Deskripsi Permohonan
                </h3>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="mr-2">📋</span>
                      Jelaskan detail permohonan layanan Anda
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  </label>
                  <textarea
                    name="deskripsiPermohonan"
                    value={formData.deskripsiPermohonan}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 resize-none text-gray-900 placeholder-gray-400"
                    placeholder="Jelaskan detail permohonan layanan Anda..."
                    required
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="mb-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <span className="mr-3">📎</span>
                  File Pendukung
                </h3>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="mr-2">📁</span>
                      File Pendukung (Opsional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="filePendukung"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.png"
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Maksimal 5MB per file)
                  </p>
                </div>
              </div>

              {/* Information Box */}
              <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">💡</span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-semibold text-blue-800 mb-2">Informasi Penting</h4>
                    <ul className="text-blue-700 space-y-1 text-sm">
                      <li>• Permohonan akan diproses dalam 1-3 hari kerja</li>
                      <li>• Anda akan mendapat notifikasi status via email</li>
                      <li>• Untuk permohonan urgent, silakan hubungi langsung customer service</li>
                      <li>• Pastikan data yang dimasukkan sudah benar dan lengkap</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-purple-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-3">🚀</span>
                    Kirim Permohonan
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
