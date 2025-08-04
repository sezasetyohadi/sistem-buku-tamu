"use client";

import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    namaLengkap: "",
    email: "",
    alamatLengkap: "",
    jenisKelamin: "",
    pendidikanTerakhir: "",
    profesiInstansi: "",
    alamatInstansi: "",
    keperluan: "",
    tujuanPertemuan: "",
    tanggalKunjungan: "",
    jamKunjungan: "",
    fileBerkas: null as File | null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, fileBerkas: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add form submission logic here
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="py-12">{" "}
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <span className="mr-2">👤</span>
              Formulir Pendaftaran
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              📝 Formulir Pendaftaran Tamu
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Lengkapi formulir di bawah ini untuk mendaftarkan kunjungan Anda
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-gray-100">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Nama Lengkap */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">👤</span>
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
                      placeholder="Masukkan nama lengkap Anda"
                      required
                    />
                  </div>
                  
                  {/* Email */}
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
                  
                  {/* Alamat Lengkap */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">🏠</span>
                        Alamat Lengkap
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <textarea
                      name="alamatLengkap"
                      value={formData.alamatLengkap}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 resize-none text-gray-900 placeholder-gray-400"
                      placeholder="Masukkan alamat lengkap Anda"
                      required
                    />
                  </div>
                  
                  {/* Jenis Kelamin */}
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

                  {/* Pendidikan Terakhir */}
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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Profesi/Instansi */}
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
                      placeholder="Masukkan profesi atau instansi"
                      required
                    />
                  </div>

                  {/* Alamat Instansi */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">🏢</span>
                        Alamat Instansi
                      </span>
                    </label>
                    <textarea
                      name="alamatInstansi"
                      value={formData.alamatInstansi}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 resize-none text-gray-900 placeholder-gray-400"
                      placeholder="Masukkan alamat instansi"
                    />
                  </div>

                  {/* Keperluan */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">📋</span>
                        Keperluan
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <textarea
                      name="keperluan"
                      value={formData.keperluan}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 resize-none text-gray-900 placeholder-gray-400"
                      placeholder="Jelaskan keperluan kunjungan Anda"
                      required
                    />
                  </div>

                  {/* Tujuan Pertemuan */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <span className="flex items-center">
                        <span className="mr-2">🎯</span>
                        Tujuan Pertemuan
                        <span className="text-red-500 ml-1">*</span>
                      </span>
                    </label>
                    <textarea
                      name="tujuanPertemuan"
                      value={formData.tujuanPertemuan}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 resize-none text-gray-900 placeholder-gray-400"
                      placeholder="Jelaskan tujuan pertemuan"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time Section */}
              <div className="grid md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-gray-200">
                {/* Tanggal Kunjungan */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="mr-2">📅</span>
                      Tanggal Kunjungan
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    name="tanggalKunjungan"
                    value={formData.tanggalKunjungan}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900"
                    required
                  />
                </div>

                {/* Jam Kunjungan */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="mr-2">🕐</span>
                      Jam Kunjungan
                      <span className="text-red-500 ml-1">*</span>
                    </span>
                  </label>
                  <input
                    type="time"
                    name="jamKunjungan"
                    value={formData.jamKunjungan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition-all duration-300 group-hover:border-gray-300 text-gray-900"
                    required
                  />
                </div>
              </div>

              {/* File Upload */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <span className="flex items-center">
                      <span className="mr-2">📎</span>
                      File Berkas (Opsional)
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      name="fileBerkas"
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

              {/* Submit Button */}
              <div className="mt-12 text-center">
                <button
                  type="submit"
                  className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-green-500/25 transform hover:scale-105 hover:-translate-y-1"
                >
                  <span className="flex items-center justify-center">
                    <span className="mr-3">✅</span>
                    Daftar Sebagai Tamu
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
