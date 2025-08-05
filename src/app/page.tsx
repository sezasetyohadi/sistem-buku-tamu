import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-blue-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #3D5DC3 0%, #2563EB 50%, #1D4ED8 100%)'}}>
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-1/4 w-32 h-32 opacity-20 rounded-full blur-2xl" style={{backgroundColor: '#F29442'}}></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-white opacity-20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Logo Section */}
            <div className="flex justify-center mb-8">
              <div className="w-24 h-28 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-2xl border border-white/30 p-3">
                <img 
                  src="/logo-jateng.svg" 
                  alt="Logo Provinsi Jawa Tengah" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            {/* Welcome badge */}
            <div className="inline-flex items-center px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
              Sistem Online • Tersedia 24/7
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Selamat Datang di
              <span className="block bg-gradient-to-r from-orange-300 via-orange-400 to-white bg-clip-text text-transparent" style={{background: 'linear-gradient(90deg, #F29442, #FB923C, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                DISNAKERTRANS
              </span>
              <span className="text-3xl md:text-4xl font-semibold block mt-4 text-blue-100">
                Jawa Tengah
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Sistem Buku Tamu Digital - Daftarkan kunjungan Anda dengan mudah, 
              akses layanan ketenagakerjaan dan transmigrasi secara digital
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-2xl transform hover:scale-105 hover:-translate-y-1"
                style={{background: 'linear-gradient(135deg, #F29442 0%, #EA580C 100%)', boxShadow: '0 25px 50px -12px rgba(242, 148, 66, 0.25)'}}
              >
                <span className="flex items-center">
                  <span className="mr-3">📝</span>
                  Daftar Sebagai Tamu
                  <span className="ml-3 transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link
                href="/guests"
                className="group bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-blue-600 font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-white/25 transform hover:scale-105"
              >
                <span className="flex items-center">
                  <span className="mr-3">🙏</span>
                  Permohonan Layanan
                  <span className="ml-3 transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" className="w-full h-auto">
            <path fill="rgba(249, 250, 251, 1)" fillOpacity="1" d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,58.7C672,64,768,96,864,96C960,96,1056,64,1152,58.7C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative">
        <div className="container mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6" style={{backgroundColor: '#FEF3E2', color: '#EA580C'}}>
              <span className="mr-2">✨</span>
              Layanan Kami
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Pelayanan DISNAKERTRANS Jateng
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah melayani masyarakat dengan sistem digital yang modern dan terintegrasi
            </p>
          </div>
          
          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* Card 1 */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16" style={{background: 'linear-gradient(135deg, rgba(61, 93, 195, 0.1), rgba(37, 99, 235, 0.1))'}}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #3D5DC3, #2563EB)'}}>
                  📝
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Registrasi Tamu</h3>
                <p className="text-gray-600 leading-relaxed">
                  Daftarkan kunjungan Anda ke DISNAKERTRANS Jateng dengan formulir digital yang mudah dan cepat
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16" style={{background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(22, 163, 74, 0.1))'}}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #22C55E, #16A34A)'}}>
                  🏢
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Layanan Ketenagakerjaan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Akses berbagai layanan ketenagakerjaan dan transmigrasi dengan sistem yang terintegrasi dan efisien
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16" style={{background: 'linear-gradient(135deg, rgba(242, 148, 66, 0.1), rgba(234, 88, 12, 0.1))'}}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                  ⭐
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Feedback & Evaluasi</h3>
                <p className="text-gray-600 leading-relaxed">
                  Berikan penilaian dan masukan untuk terus meningkatkan kualitas pelayanan DISNAKERTRANS Jateng
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl" style={{background: 'linear-gradient(135deg, #3D5DC3 0%, #2563EB 100%)'}}>
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 opacity-10 rounded-full" style={{backgroundColor: '#F29442'}}></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Mulai Sekarang!</h3>
                <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                  Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan layanan digital kami
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                    style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}
                  >
                    Daftar Sekarang
                  </Link>
                  <Link
                    href="/survey"
                    className="border-2 border-white text-white hover:bg-white hover:text-indigo-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Berikan Feedback
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}