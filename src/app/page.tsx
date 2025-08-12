'use client';

import Link from "next/link";
import ScrollWave from "@/components/ScrollWave";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target as HTMLElement;
          target.style.opacity = '1';
          target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '-50px'
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
  }, []);

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white min-h-screen flex items-center overflow-hidden">
        {/* Enhanced Abstract Wavy Lines with multiple layers - positioned much further from buttons */}
        <div className="absolute bottom-96 left-0 w-full h-96 opacity-50">
          {/* Multiple animated wavy lines for richer effect - pure white to match bottom waves */}
          <svg className="absolute inset-0 w-full h-full animate-float-wave" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,200 Q480,150 960,220 Q1440,280 1920,200" 
                  stroke="#ffffff" strokeWidth="2.5" fill="none" opacity="1" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave-2" viewBox="0 0 1920 400" preserveAspectRatio="none">
            <path d="M0,280 Q640,230 1280,300 Q1600,350 1920,280" 
                  stroke="#ffffff" strokeWidth="2" fill="none" opacity="0.8" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave" viewBox="0 0 1920 400" preserveAspectRatio="none" style={{animationDelay: '2s', animationDuration: '10s'}}>
            <path d="M0,160 Q320,120 640,180 Q1280,240 1920,160" 
                  stroke="#ffffff" strokeWidth="1.5" fill="none" opacity="0.7" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave-2" viewBox="0 0 1920 400" preserveAspectRatio="none" style={{animationDelay: '4s', animationDuration: '12s'}}>
            <path d="M0,320 Q480,270 960,340 Q1440,390 1920,320" 
                  stroke="#ffffff" strokeWidth="1.8" fill="none" opacity="0.6" />
          </svg>
          <svg className="absolute inset-0 w-full h-full animate-float-wave" viewBox="0 0 1920 400" preserveAspectRatio="none" style={{animationDelay: '1s', animationDuration: '7s'}}>
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
        
        <div className="container mx-auto px-6 py-20 relative z-10 max-w-7xl">
          <div className="text-center">
            {/* Logo Section with simple styling */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="relative w-28 h-32 bg-white/15 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl border border-white/30 p-4 hover:scale-105 transition-transform duration-500">
                  <img 
                    src="/logo-jateng.svg" 
                    alt="Logo Provinsi Jawa Tengah" 
                    className="w-full h-full object-contain filter drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
            
            {/* Simple welcome badge */}
            <div className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-green-400/20 to-emerald-400/20 backdrop-blur-lg rounded-full text-sm font-bold mb-8 border border-green-400/30">
              <span className="w-3 h-3 bg-green-400 rounded-full mr-4 inline-block"></span>
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
                href="/guests/register"
                href="/guest/register"
                className="group relative text-white font-bold py-6 px-12 rounded-2xl text-lg transition-all duration-500 shadow-2xl transform hover:scale-110 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-100 group-hover:opacity-90"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute inset-0 animate-pulse bg-white/10"></div>
                <span className="relative flex items-center z-10">
                  <span className="mr-3 text-2xl">📝</span>
                  <span>Pendaftaran Tamu</span>
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
              </Link>
              
              <Link
                href="/guest/survey"
                className="group relative bg-white/10 backdrop-blur-xl border-2 border-white/30 text-white hover:bg-white hover:text-purple-700 font-bold py-6 px-12 rounded-2xl text-lg transition-all duration-500 shadow-xl hover:shadow-white/25 transform hover:scale-110 hover:-translate-y-1 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <span className="relative flex items-center z-10">
                  <span className="mr-3 text-2xl">⭐</span>
                  <span>Survey Kepuasan</span>
                  <span className="ml-3 transform group-hover:translate-x-2 transition-transform duration-300">→</span>
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
      <div className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden opacity-0 translate-y-8 transition-all duration-1000 ease-out" data-fade="up">
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
          {/* Section header */}
          <div className="text-center mb-20 opacity-0 translate-y-8 transition-all duration-1000 ease-out" data-fade="up" style={{transitionDelay: '100ms'}}>
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
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-100 relative overflow-hidden opacity-0 translate-y-8 ease-out" data-fade="up" style={{transition: 'all 1000ms ease-out', transitionDelay: '200ms'}}>
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
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-100 relative overflow-hidden opacity-0 translate-y-8 ease-out" data-fade="up" style={{transition: 'all 1000ms ease-out', transitionDelay: '300ms'}}>
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
            <div className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl border border-gray-100 relative overflow-hidden opacity-0 translate-y-8 ease-out" data-fade="up" style={{transition: 'all 1000ms ease-out', transitionDelay: '400ms'}}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16" style={{background: 'linear-gradient(135deg, rgba(242, 148, 66, 0.1), rgba(234, 88, 12, 0.1))'}}></div>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 transform group-hover:scale-110 transition-transform" style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}>
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Feedback & Evaluasi</h3>
                <p className="text-gray-800 leading-relaxed">
                  Berikan penilaian dan masukan untuk terus meningkatkan kualitas pelayanan DISNAKERTRANS Jateng
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center opacity-0 translate-y-8 transition-all duration-1000 ease-out" data-fade="up" style={{transitionDelay: '500ms'}}>
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
                    href="/guests/register"
                    href="/guest/register"
                    className="text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
                    style={{background: 'linear-gradient(135deg, #F29442, #EA580C)'}}
                  >
                    Daftar Sekarang
                  </Link>
                  <Link
                    href="/guests/survey"
                    href="/guest/survey"
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
        
        {/* Admin Access - for testing */}
        <div className="absolute bottom-4 right-4 z-10">
          <Link 
            href="/admin/login" 
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
