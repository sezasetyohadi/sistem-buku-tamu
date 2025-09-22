'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import ScrollWave from '@/components/ScrollWave';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the page has already been loaded before (for better UX)
    const hasVisitedBefore = sessionStorage.getItem('hasVisitedLanding');
    
    if (hasVisitedBefore) {
      // If returning, load faster
      setIsLoading(false);
      return;
    }
    
    // For first visit, show loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Mark that we've visited
      sessionStorage.setItem('hasVisitedLanding', 'true');
    }, 1000); // Reduced from 1500ms to 1000ms
    
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (isLoading) {return;}

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px'
    });
    
    // Observe all elements with fade-up class
    const elementsToObserve = document.querySelectorAll('[data-fade="up"]');
    elementsToObserve.forEach(element => {
      observer.observe(element);
    });

    // Add hover effects to cards
    const cards = document.querySelectorAll('.group');
    cards.forEach(card => {
      const cardElement = card as HTMLElement;
      cardElement.addEventListener('mouseenter', () => {
        cardElement.style.transform = 'translateY(-8px)';
        cardElement.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
      });
      
      cardElement.addEventListener('mouseleave', () => {
        cardElement.style.transform = 'translateY(0)';
        cardElement.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
      });
    });

    return () => {
      elementsToObserve.forEach(element => {
        observer.unobserve(element);
      });
    };
  }, [isLoading]);

  // Loading screen component
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-lg">Memuat halaman...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white min-h-screen flex items-center overflow-hidden">
        {/* Enhanced Abstract Wavy Lines with multiple layers - positioned much further from buttons */}
        <div className="absolute bottom-80 left-0 w-full h-96 opacity-50">
          {/* Multiple animated wavy lines for richer effect - pure white to match bottom waves */}
          <svg className="absolute inset-0 w-full h-full animate-float-wave" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,200 Q480,150 960,220 Q1440,280 1920,200" 
                  stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="1" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave-2" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,280 Q640,230 1280,300 Q1600,350 1920,280" 
                  stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave anim-delay-2 duration-1000" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,160 Q320,120 640,180 Q1280,240 1920,160" 
                  stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.7" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave-2 anim-delay-4 duration-1200" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,320 Q480,270 960,340 Q1440,390 1920,320" 
                  stroke="#ffffff" strokeWidth="1.8" fill="none" opacity="0.6" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave anim-delay-1 duration-700" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,240 Q960,180 1920,240" 
                  stroke="#ffffff" strokeWidth="1.2" fill="none" opacity="0.9" />
          </svg>
        </div>
        {/* Simple background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Static gradient orbs */}
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-20 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-1/4 w-40 h-40 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-30 rounded-full blur-2xl"></div>
          <div className="absolute bottom-32 right-1/3 w-32 h-32 bg-gradient-to-r from-pink-400 to-red-400 opacity-25 rounded-full blur-2xl"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 py-20 pb-32 relative z-10 max-w-7xl">
          <div className="text-center">
            {/* Logo Section with smaller spacing */}
            <div className="flex justify-center mb-6">
              <div className="flex justify-center items-center bg-white/32 backdrop-blur-lg rounded-3xl p-3 border border-white/50 drop-shadow-2xl w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52">
                <img 
                  src="/logo-dalista.svg" 
                  alt="Logo Dalista" 
                  className="w-24 h-28 sm:w-32 sm:h-36 md:w-44 md:h-48 object-contain select-none pointer-events-none"
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                  } as React.CSSProperties}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                  loading="lazy"
                />
              </div>
            </div>
            
            {/* Status badge with smaller spacing */}
            <div className="inline-flex items-center px-4 py-2 sm:px-6 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-lg rounded-full text-sm font-bold mb-6 border border-green-400/30">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-3 inline-block"></span>
              <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">
                Sistem Online 24/7
              </span>
            </div>
            
            {/* Typography with compact spacing */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 leading-tight tracking-tight px-2">
                <span className="inline-block">
                  Selamat Datang di
                </span>
                <br />
                <span className="inline-block">
                  <img 
                    src="/logo-dalista-text.svg" 
                    alt="DALISTA" 
                    className="h-12 sm:h-16 md:h-12 lg:h-16 xl:h-20 w-auto inline-block filter drop-shadow-lg select-none pointer-events-none"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3)) drop-shadow(0 0 20px rgba(255,165,0,0.4))',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      WebkitTouchCallout: 'none'
                    } as React.CSSProperties}
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    draggable={false}
                  />
                </span>
              </h1>
              <div className="relative">
                <h5 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-50 tracking-wide">
                  Digitalisasi Layanan Registrasi Tamu
                </h5>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full"></div>
              </div>
            </div>

            <p className="text-sm sm:text-base md:text-base lg:text-lg mb-4 text-blue-50 max-w-3xl mx-auto leading-relaxed font-medium px-4">
              Daftarkan kunjungan dan akses layanan Dinas Tenaga Kerja dan Transmigrasi<br />Provinsi Jawa Tengah lebih mudah.
            </p>     
            
            {/* CTA buttons - Smaller, more proportional sizing */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link
                href="/guest/register"
                className="group relative text-white font-bold py-4 px-8 rounded-xl text-base md:text-lg transition-all duration-500 shadow-xl transform hover:scale-105 hover:-translate-y-1 overflow-hidden w-full sm:w-auto sm:min-w-[200px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-100 group-hover:opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 animate-pulse bg-white/10"></div>
                <span className="relative flex items-center justify-center z-10">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Pendaftaran Tamu</span>
                </span>
              </Link>
              
              <Link
                href="/guest/survey"
                className="group relative bg-white/15 backdrop-blur-xl border-2 border-white/40 text-white hover:bg-white hover:text-purple-700 font-bold py-4 px-8 rounded-xl text-base md:text-lg transition-all duration-500 shadow-lg hover:shadow-white/25 transform hover:scale-105 hover:-translate-y-1 overflow-hidden min-w-[200px]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center justify-center z-10">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>Survey Kepuasan</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated wave shape at bottom like image 2 */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <ScrollWave />
          {/* Multiple wave layers for dynamic effect */}
          <svg className="wave-element relative block w-full h-32 animate-wave-scroll" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,60 C150,80 350,40 600,50 C850,60 1050,80 1200,60 L1200,120 L0,120 Z" 
                  className="fill-white" opacity="1"></path>
          </svg>
          <svg className="wave-element absolute bottom-0 block w-full h-28 animate-wave-scroll-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,40 C300,70 500,30 800,45 C950,55 1100,70 1200,45 L1200,120 L0,120 Z" 
                  className="fill-emerald-100" opacity="0.8"></path>
          </svg>
          <svg className="wave-element absolute bottom-0 block w-full h-24 animate-wave-scroll-3" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,20 C400,50 600,10 900,30 C1000,40 1150,50 1200,30 L1200,120 L0,120 Z" 
                  className="fill-cyan-50" opacity="0.6"></path>
          </svg>
        </div>
      </div>

      {/* Features Section with scroll fade animation */}
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden -mt-8">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-20">
          {/* Subtle geometric patterns */}
          <div className="absolute top-20 right-20 w-48 h-48 rounded-full border-2 border-blue-200"></div>
          <div className="absolute bottom-32 left-16 w-32 h-32 rounded-full bg-purple-100"></div>
          <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-lg transform rotate-45 bg-orange-100"></div>
          
          {/* Flowing lines */}
          <svg className="absolute top-0 left-0 w-full h-full opacity-30" viewBox="0 0 1200 800">
            <path d="M0,400 Q300,200 600,400 Q900,600 1200,400" 
                  stroke="url(#gradient1)" strokeWidth="2" fill="none" />
            <path d="M0,300 Q400,100 800,300 Q1000,450 1200,300" 
                  stroke="url(#gradient2)" strokeWidth="1.5" fill="none" />
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.5"/>
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3"/>
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.2"/>
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section header - More moderate sizing for better balance */}
          <div className="text-center mb-20 opacity-0 translate-y-4 transition-all duration-500 ease-out delay-50" data-fade="up">
            {/* Logo Disnakertrans yang dapat diklik */}
            <div className="flex justify-center mb-8">
              <a 
                href="https://disnakertrans.jatengprov.go.id/" 
                target="_blank" 
                rel="noopener noreferrer"
                title="Kunjungi Website Resmi Disnakertrans Jateng"
              >
                <img 
                  src="/logo-disnakertrans.svg" 
                  alt="Logo Dinas Tenaga Kerja dan Transmigrasi Jawa Tengah" 
                  className="w-20 h-20 sm:w-32 sm:h-32 object-contain filter drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none',
                    WebkitTouchCallout: 'none'
                  } as React.CSSProperties}
                  onContextMenu={(e) => e.preventDefault()}
                  onDragStart={(e) => e.preventDefault()}
                  draggable={false}
                />
              </a>
            </div>
            
            <div className="inline-flex items-center px-6 py-3 rounded-full text-base font-bold mb-6 bg-badge-orange">
              <span className="mr-2">✨</span>
              Layanan Kami
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6">
              Pelayanan DISNAKERTRANS Jateng
            </h2>
            <p className="text-lg md:text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah melayani masyarakat dengan sistem digital yang modern dan terintegrasi
            </p>
          </div>
          
          {/* Feature cards - Enhanced with larger spacing and text */}
          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto mb-24">
            {/* Card 1 */}
            <div className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl border border-gray-100 relative overflow-hidden opacity-0 translate-y-4 ease-out transition-all duration-500 delay-100 hover:scale-105 hover:-translate-y-2" data-fade="up">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 bg-gradient-blue-light group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl mb-8 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 bg-gradient-blue">
                  <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6 group-hover:text-blue-600 transition-colors duration-500">Registrasi Tamu</h3>
                <p className="text-xl text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-500">
                  Daftarkan kunjungan Anda ke DISNAKERTRANS Jateng dengan formulir digital yang mudah dan cepat
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl border border-gray-100 relative overflow-hidden opacity-0 translate-y-4 ease-out transition-all duration-500 delay-150 hover:scale-105 hover:-translate-y-2" data-fade="up">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 bg-gradient-green-light group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl mb-8 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 bg-gradient-green">
                  <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6 group-hover:text-green-600 transition-colors duration-500">Layanan Ketenagakerjaan</h3>
                <p className="text-xl text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-500">
                  Akses berbagai layanan ketenagakerjaan dan transmigrasi dengan sistem yang terintegrasi dan efisien
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl border border-gray-100 relative overflow-hidden opacity-0 translate-y-4 ease-out transition-all duration-500 delay-200 hover:scale-105 hover:-translate-y-2" data-fade="up">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 bg-gradient-orange-light group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl mb-8 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 bg-gradient-orange">
                  <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-6 group-hover:text-orange-600 transition-colors duration-500">Feedback & Evaluasi</h3>
                <p className="text-xl text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-500">
                  Berikan penilaian dan masukan untuk terus meningkatkan kualitas pelayanan DISNAKERTRANS Jateng
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section - More balanced sizing */}
          <div className="text-center opacity-0 translate-y-4 transition-all duration-500 ease-out delay-250" data-fade="up">
            <div className="rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl bg-cta-gradient">
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 opacity-10 rounded-full bg-decoration-orange"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-bold mb-6">Mulai Sekarang!</h3>
                <p className="text-lg md:text-xl text-blue-50 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Silakan pilih layanan berikut untuk melanjutkan
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/guest/register"
                    className="bg-white text-blue-600 font-bold py-4 px-10 rounded-2xl text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl min-w-[200px]"
                  >
                    Daftar Tamu
                  </Link>
                  <Link
                    href="/guest/survey"
                    className="border-3 border-white text-white font-bold py-4 px-10 rounded-2xl text-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 min-w-[200px]"
                  >
                    Isi Survei
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
