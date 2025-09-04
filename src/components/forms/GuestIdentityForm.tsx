"use client";

import { GuestIdentity, LookupData } from '@/types/survey-types';

interface GuestIdentityFormProps {
  guestIdentity: GuestIdentity;
  lookupData: LookupData;
  updateGuestIdentity: (field: keyof GuestIdentity, value: string) => void;
  focusedDropdowns: {[key: string]: boolean};
  handleDropdownMouseDown: (key: string) => void;
  handleDropdownBlur: (key: string) => void;
  handleDropdownChange: (key: string) => void;
}

export default function GuestIdentityForm({
  guestIdentity,
  lookupData,
  updateGuestIdentity,
  focusedDropdowns,
  handleDropdownMouseDown,
  handleDropdownBlur,
  handleDropdownChange
}: GuestIdentityFormProps) {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-center">IDENTITAS RESPONDEN</h3>
        <p className="text-blue-100 text-sm text-center mt-1">Silakan isi data identitas Anda</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nama Lengkap
            </label>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <input
                type="text"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                value={guestIdentity?.nama || ''}
                onChange={e => updateGuestIdentity('nama', e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
              />
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
              <input
                type="email"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                value={guestIdentity?.email || ''}
                onChange={e => updateGuestIdentity('email', e.target.value)}
                placeholder="Masukkan email"
                required
              />
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
              <input
                type="tel"
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg"
                value={guestIdentity?.nomor_telp || ''}
                onChange={e => updateGuestIdentity('nomor_telp', e.target.value)}
                placeholder="Masukkan nomor telepon"
                required
              />
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
              <div className="relative w-full">
                <select 
                  value={guestIdentity?.jenis_kelamin || ''}
                  onChange={(e) => {
                    updateGuestIdentity('jenis_kelamin', e.target.value);
                    handleDropdownChange('gender');
                  }}
                  onMouseDown={() => handleDropdownMouseDown('gender')}
                  onBlur={() => handleDropdownBlur('gender')}
                  className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                  style={{
                    backgroundColor: '#ffffff !important',
                    color: '#1f2937 !important',
                    WebkitTextFillColor: '#1f2937 !important'
                  }}
                >
                  <option value="">Pilih jenis kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
                {/* Dropdown arrow with animation */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.gender ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tanggal Lahir
            </label>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg"
                value={guestIdentity?.tanggal_lahir || ''}
                onChange={e => updateGuestIdentity('tanggal_lahir', e.target.value)}
                placeholder="Tanggal Lahir"
                required
              />
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
              <input
                type="text"
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg"
                value={guestIdentity?.alamat || ''}
                onChange={e => updateGuestIdentity('alamat', e.target.value)}
                placeholder="Masukkan alamat lengkap"
                required
              />
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
              <div className="relative w-full">
                <select 
                  value={guestIdentity?.pendidikan_terakhir || ''}
                  onChange={(e) => {
                    updateGuestIdentity('pendidikan_terakhir', e.target.value);
                    handleDropdownChange('education');
                  }}
                  onMouseDown={() => handleDropdownMouseDown('education')}
                  onBlur={() => handleDropdownBlur('education')}
                  className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                  style={{
                    backgroundColor: '#ffffff !important',
                    color: '#1f2937 !important',
                    WebkitTextFillColor: '#1f2937 !important'
                  }}
                >
                  <option value="">Pilih pendidikan terakhir</option>
                  {lookupData.educationLevels.map((education) => (
                    <option key={education.id} value={education.pendidikan_terakhir}>
                      {education.pendidikan_terakhir}
                    </option>
                  ))}
                </select>
                {/* Dropdown arrow with animation */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.education ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
              <div className="relative w-full">
                <select 
                  value={guestIdentity?.pekerjaan_utama || ''}
                  onChange={(e) => {
                    updateGuestIdentity('pekerjaan_utama', e.target.value);
                    handleDropdownChange('job');
                  }}
                  onMouseDown={() => handleDropdownMouseDown('job')}
                  onBlur={() => handleDropdownBlur('job')}
                  className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                  style={{
                    backgroundColor: '#ffffff !important',
                    color: '#1f2937 !important',
                    WebkitTextFillColor: '#1f2937 !important'
                  }}
                >
                  <option value="">Pilih pekerjaan utama</option>
                  {lookupData.professions.map((profession) => (
                    <option key={profession.id} value={profession.nama_profesi}>
                      {profession.nama_profesi}
                    </option>
                  ))}
                </select>
                {/* Dropdown arrow with animation */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.job ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
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
              <div className="relative w-full">
                <select 
                  value={guestIdentity?.jenis_layanan || ''}
                  onChange={(e) => {
                    updateGuestIdentity('jenis_layanan', e.target.value);
                    handleDropdownChange('service');
                  }}
                  onMouseDown={() => handleDropdownMouseDown('service')}
                  onBlur={() => handleDropdownBlur('service')}
                  className="w-full pl-4 pr-10 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3D5DC3] focus:ring-opacity-50 focus:border-[#3D5DC3] appearance-none hover:bg-gray-50 focus:bg-white"
                  style={{
                    backgroundColor: '#ffffff !important',
                    color: '#1f2937 !important',
                    WebkitTextFillColor: '#1f2937 !important'
                  }}
                >
                  <option value="">Pilih jenis layanan</option>
                  {lookupData.tujuanKunjungan.map((layanan) => (
                    <option key={layanan.id} value={layanan.tujuan}>
                      {layanan.tujuan}
                    </option>
                  ))}
                </select>
                {/* Dropdown arrow with animation */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className={`w-5 h-5 text-gray-400 transition-all duration-200 transform ${focusedDropdowns.service ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
