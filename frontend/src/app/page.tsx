import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white min-h-screen flex items-center overflow-hidden">
        {/* Decorative white lines pattern */}
        <div className="absolute inset-0 opacity-10">
          {/* Flowing animated lines */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
              {/* Main flowing curves with different animation delays */}
              <path 
                d="M-100,200 Q300,100 600,200 Q900,300 1300,200"
                stroke="white" 
                strokeWidth="1" 
                fill="none" 
                className="animate-pulse opacity-60"
                style={{
                  animationDuration: '4s',
                  strokeDasharray: '5,10',
                  animationTimingFunction: 'ease-in-out'
                }}
              />
              <path 
                d="M-100,400 Q400,250 800,400 Q1000,500 1300,350"
                stroke="white" 
                strokeWidth="0.8" 
                fill="none" 
                className="animate-pulse opacity-50"
                style={{
                  animationDuration: '6s', 
                  animationDelay: '1s',
                  strokeDasharray: '3,8'
                }}
              />
              <path 
                d="M-100,600 Q200,450 500,550 Q800,650 1300,500"
                stroke="white" 
                strokeWidth="0.6" 
                fill="none" 
                className="animate-pulse opacity-70"
                style={{
                  animationDuration: '5s', 
                  animationDelay: '2s',
                  strokeDasharray: '8,5'
                }}
              />
              
              {/* Thinner flowing lines with gentler animation */}
              <path 
                d="M-50,150 Q250,80 550,150 Q850,220 1250,180"
                stroke="white" 
                strokeWidth="0.5" 
                fill="none" 
                className="animate-pulse opacity-40"
                style={{
                  animationDuration: '7s', 
                  animationDelay: '0.5s',
                  strokeDasharray: '2,15'
                }}
              />
              <path 
                d="M-50,350 Q350,200 750,350 Q950,450 1250,300"
                stroke="white" 
                strokeWidth="0.4" 
                fill="none" 
                className="animate-pulse opacity-45"
                style={{
                  animationDuration: '8s', 
                  animationDelay: '1.5s',
                  strokeDasharray: '1,12'
                }}
              />
              <path 
                d="M-50,500 Q150,350 450,450 Q750,550 1250,450"
                stroke="white" 
                strokeWidth="0.3" 
                fill="none" 
                className="animate-pulse opacity-35"
                style={{
                  animationDuration: '6s', 
                  animationDelay: '3s',
                  strokeDasharray: '4,20'
                }}
              />
              
              {/* Very subtle background curves */}
              <path 
                d="M0,100 Q600,50 1200,150"
                stroke="white" 
                strokeWidth="0.2" 
                fill="none" 
                className="animate-pulse opacity-25"
                style={{
                  animationDuration: '10s',
                  strokeDasharray: '1,25'
                }}
              />
              <path 
                d="M0,700 Q600,650 1200,750"
                stroke="white" 
                strokeWidth="0.2" 
                fill="none" 
                className="animate-pulse opacity-30"
                style={{
                  animationDuration: '9s',
                  animationDelay: '2.5s',
                  strokeDasharray: '2,30'
                }}
              />
            </svg>
          </div>
          
          {/* Floating particles */}
          <div className="absolute inset-0">
            <div 
              className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-bounce opacity-40"
              style={{animationDuration: '3s', animationDelay: '1s'}}
            ></div>
            <div 
              className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-white rounded-full animate-ping opacity-30"
              style={{animationDuration: '4s', animationDelay: '2s'}}
            ></div>
            <div 
              className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-white rounded-full animate-pulse opacity-50"
              style={{animationDuration: '5s', animationDelay: '0.5s'}}
            ></div>
            <div 
              className="absolute top-2/3 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-bounce opacity-35"
              style={{animationDuration: '6s', animationDelay: '3s'}}
            ></div>
          </div>
        </div>
        {/* Animated background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Moving gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-30 rounded-full blur-2xl animate-bounce" style={{animationDuration: '3s'}}></div>
          <div className="absolute bottom-32 right-1/3 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-400 opacity-25 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-1/4 left-1/2 w-8 h-8 bg-white/10 rounded-lg rotate-45 animate-spin" style={{animationDuration: '8s'}}></div>
          <div className="absolute bottom-1/4 left-1/4 w-6 h-6 bg-orange-400/20 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}></div>
          <div className="absolute top-1/3 right-1/4 w-10 h-10 border-2 border-white/20 rounded-full animate-pulse"></div>
        </div>
        
        <div className="container mx-auto px-6 py-20 relative z-10 max-w-7xl">
          <div className="text-center">
            {/* Logo Section with enhanced styling */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                <div className="relative w-28 h-32 bg-white/15 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/30 p-4 hover:scale-105 transition-transform duration-500">
                  <img 
                    src="/logo-jateng.svg" 
                    alt="Logo Provinsi Jawa Tengah" 
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
            
            {/* Enhanced welcome badge */}
            <div className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-lg rounded-full text-sm font-bold mb-8 border border-green-400/30 hover:scale-105 transition-transform duration-300">
              <span className="relative">
                <span className="w-3 h-3 bg-green-400 rounded-full mr-4 inline-block animate-ping absolute"></span>
                <span className="w-3 h-3 bg-green-400 rounded-full mr-4 inline-block"></span>
              </span>
              <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Sistem Online • Tersedia 24/7
              </span>
            </div>
            
            {/* Enhanced typography with animations */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight tracking-tight">
                <span className="inline-block hover:scale-110 transition-transform duration-500">
                  Selamat Datang di
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-orange-300 via-orange-400 to-yellow-300 bg-clip-text text-transparent hover:from-yellow-300 hover:to-orange-400 transition-all duration-700 hover:scale-105 transform">
                  DISNAKERTRANS
                </span>
              </h1>
              <div className="relative">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-blue-50 tracking-wide">
                  Jawa Tengah
                </h2>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full"></div>
              </div>
            </div>
            
            <p className="text-lg md:text-xl lg:text-2xl mb-12 text-blue-50 max-w-4xl mx-auto leading-relaxed font-light">
              Sistem Buku Tamu Digital - Daftarkan kunjungan Anda dengan mudah, 
              akses layanan ketenagakerjaan dan transmigrasi secara digital
            </p>
            
            {/* Enhanced CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group relative text-white font-bold py-6 px-12 rounded-2xl text-lg transition-all duration-500 shadow-2xl transform hover:scale-110 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-100 group-hover:opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 animate-pulse bg-white/10"></div>
                <span className="relative flex items-center z-10">
                  <span className="mr-3 text-2xl">📝</span>
                  <span>Daftar Sebagai Tamu</span>
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </Link>
              
              <Link
                href="/guests"
                className="group relative bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white hover:text-purple-700 font-bold py-6 px-12 rounded-2xl text-lg transition-all duration-500 shadow-xl hover:shadow-white/25 transform hover:scale-110 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center z-10">
                  <span className="mr-3 text-2xl">🙏</span>
                  <span>Permohonan Layanan</span>
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Organic wave shape at bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-32" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z" 
                  className="fill-gray-50"></path>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          {/* Animated flowing lines */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1200 800">
            <path 
              d="M0,200 Q300,100 600,200 Q900,300 1200,200" 
              stroke="url(#gradient1)" 
              strokeWidth="1.5" 
              fill="none"
              className="animate-pulse"
              style={{
                animationDuration: '8s',
                strokeDasharray: '10,5'
              }}
            />
            <path 
              d="M0,400 Q400,250 800,400 Q1000,500 1200,350" 
              stroke="url(#gradient2)" 
              strokeWidth="1" 
              fill="none"
              className="animate-pulse"
              style={{
                animationDuration: '6s',
                animationDelay: '2s',
                strokeDasharray: '5,10'
              }}
            />
            <path 
              d="M0,600 Q300,450 600,550 Q900,650 1200,500" 
              stroke="url(#gradient3)" 
              strokeWidth="0.8" 
              fill="none"
              className="animate-pulse"
              style={{
                animationDuration: '7s',
                animationDelay: '1s',
                strokeDasharray: '8,8'
              }}
            />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4"/>
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.6"/>
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3"/>
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.5"/>
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
          </svg>
          
          {/* Floating geometric shapes */}
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full border border-blue-200 animate-spin" style={{animationDuration: '20s'}}></div>
          <div className="absolute bottom-32 left-16 w-32 h-32 rounded-full bg-purple-100 animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-lg transform rotate-45 bg-orange-100 animate-bounce" style={{animationDuration: '3s'}}></div>
          
          {/* Subtle particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-40" style={{animationDuration: '3s'}}></div>
          <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-bounce opacity-50" style={{animationDuration: '2s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-orange-300 rounded-full animate-pulse opacity-60" style={{animationDuration: '4s', animationDelay: '0.5s'}}></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6" style={{backgroundColor: '#FEF3E2', color: '#EA580C'}}>
              <span className="mr-2">✨</span>
              Layanan Kami
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">
              Pelayanan DISNAKERTRANS Jateng
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
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
                <p className="text-gray-800 leading-relaxed">
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
                <p className="text-gray-800 leading-relaxed">
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
                <p className="text-gray-800 leading-relaxed">
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
                <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
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
        
        {/* Bottom organic shape */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <svg className="relative block w-full h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C200,80 400,40 600,60 C800,80 1000,20 1200,40 L1200,120 L0,120 Z" 
                  className="fill-white"></path>
          </svg>
        </div>
      </div>
    </div>
  );
}