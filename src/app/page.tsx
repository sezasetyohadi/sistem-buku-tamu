import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-1/4 w-32 h-32 bg-yellow-300 opacity-20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-pink-300 opacity-20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            {/* Welcome badge */}
            <div className="inline-flex items-center px-6 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-8 border border-white/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
              Sistem Online • Tersedia 24/7
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              Selamat Datang di
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-white bg-clip-text text-transparent">
                Sistem Layanan Tamu
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Daftarkan kunjungan Anda dengan mudah, ajukan permohonan layanan secara digital, 
              atau berikan feedback melalui survei kepuasan pelanggan kami
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 hover:-translate-y-1"
              >
                <span className="flex items-center">
                  <span className="mr-3">📝</span>
                  Daftar Sebagai Tamu
                  <span className="ml-3 transform group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link
                href="/guests"
                className="group bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white hover:bg-white hover:text-purple-600 font-bold py-5 px-10 rounded-2xl text-lg transition-all duration-300 shadow-xl hover:shadow-white/25 transform hover:scale-105"
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
            <div className="inline-flex items-center px-6 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold mb-6">
              <span className="mr-2">✨</span>
              Fitur Utama
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Layanan Digital Terpadu
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sistem manajemen tamu modern dengan teknologi terdepan untuk kemudahan dan efisiensi
            </p>
          </div>
          
          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* Card 1 */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform">
                  📝
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Pendaftaran Mudah</h3>
                <p className="text-gray-600 leading-relaxed">
                  Daftarkan diri sebagai tamu dengan formulir digital yang sederhana dan user-friendly
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform">
                  🙏
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Permohonan Layanan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Ajukan permohonan layanan dengan sistem tracking yang transparan dan real-time
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform">
                  ⭐
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Survei Kepuasan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Berikan feedback dan penilaian untuk membantu kami meningkatkan kualitas layanan
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Mulai Sekarang!</h3>
                <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                  Bergabunglah dengan ribuan pengguna yang telah merasakan kemudahan layanan digital kami
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/register"
                    className="bg-white text-indigo-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
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