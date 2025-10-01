'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import TurnstileCaptcha from '@/components/ui/TurnstileCaptcha';
import { useTurnstileCaptcha } from '@/hooks/useTurnstileCaptcha';

import PasswordInput from '../../../components/ui/PasswordInput';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const router = useRouter();

  // CAPTCHA hook for main login
  const {
    captchaToken,
    isCaptchaVerified,
    captchaError,
    handleCaptchaVerify,
    handleCaptchaError,
    handleCaptchaExpire,
    resetCaptcha,
    getCaptchaValidationError
  } = useTurnstileCaptcha({
    required: true,
    onVerificationChange: (isVerified) => {
      console.log('Login CAPTCHA verification status changed:', isVerified);
    }
  });

  // CAPTCHA hook for forgot password
  const {
    captchaToken: forgotCaptchaToken,
    isCaptchaVerified: isForgotCaptchaVerified,
    captchaError: forgotCaptchaError,
    handleCaptchaVerify: handleForgotCaptchaVerify,
    handleCaptchaError: handleForgotCaptchaError,
    handleCaptchaExpire: handleForgotCaptchaExpire,
    resetCaptcha: resetForgotCaptcha,
    getCaptchaValidationError: getForgotCaptchaValidationError
  } = useTurnstileCaptcha({
    required: true,
    onVerificationChange: (isVerified) => {
      console.log('Forgot password CAPTCHA verification status changed:', isVerified);
    }
  });

  // Check if already authenticated - redirect to admin dashboard
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        // Check if user is already authenticated by calling /api/admin/me
        const response = await fetch('/api/admin/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            console.log('User already authenticated, redirecting to admin dashboard');
            router.replace('/admin');
          }
        }
      } catch (error) {
        console.error('Auth check error on login page:', error);
        // If there's an error, just stay on login page
      }
    };

    checkAuthAndRedirect();
  }, [router]);

  // Load saved credentials if "Remember Me" was previously checked
  useEffect(() => {
    const loadSavedCredentials = () => {
      try {
        const savedCredentials = localStorage.getItem('admin_remembered_credentials');
        if (savedCredentials) {
          const credentials = JSON.parse(savedCredentials);
          setFormData(prev => ({
            ...prev,
            username: credentials.username || '',
            password: credentials.password || '',
            rememberMe: true
          }));
        }
      } catch (error) {
        console.error('Error loading saved credentials:', error);
        localStorage.removeItem('admin_remembered_credentials');
      }
    };

    loadSavedCredentials();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // If unchecking Remember Me, clear saved credentials
    if (name === 'rememberMe' && type === 'checkbox' && !checked) {
      localStorage.removeItem('admin_remembered_credentials');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username dan password harus diisi');
      setIsLoading(false);
      return;
    }

    // Validate CAPTCHA
    const captchaValidationError = getCaptchaValidationError();
    if (captchaValidationError) {
      setError('Silakan selesaikan verifikasi CAPTCHA');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for JWT
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          rememberMe: formData.rememberMe,
          captchaToken: captchaToken // Add CAPTCHA token
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Save credentials if Remember Me is checked
        if (formData.rememberMe) {
          localStorage.setItem('admin_remembered_credentials', JSON.stringify({
            username: formData.username,
            password: formData.password
          }));
        } else {
          // Remove saved credentials if Remember Me is unchecked
          localStorage.removeItem('admin_remembered_credentials');
        }
        
        console.log(`Login successful${formData.rememberMe ? ' (Remember Me enabled for 7 days)' : ' (24 hour session)'}, redirecting to admin dashboard`);
        
        // Trigger a profile refresh in the layout after login
        window.dispatchEvent(new CustomEvent('adminProfileUpdated', { 
          detail: { forceRefresh: true } 
        }));
        
        // Increased delay to ensure JWT cookies are properly set before redirect
        setTimeout(() => {
          router.replace('/admin');
        }, 300);
      } else {
        setError(result.message || 'Login gagal');
        resetCaptcha(); // Reset CAPTCHA on login failure
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
      resetCaptcha(); // Reset CAPTCHA on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordMessage('');

    // Validasi email
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Email harus diisi');
      setIsForgotPasswordLoading(false);
      return;
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(forgotPasswordEmail)) {
      setForgotPasswordError('Format email tidak valid');
      setIsForgotPasswordLoading(false);
      return;
    }

    // Validate CAPTCHA
    const forgotCaptchaValidationError = getForgotCaptchaValidationError();
    if (forgotCaptchaValidationError) {
      setForgotPasswordError('Silakan selesaikan verifikasi CAPTCHA');
      setIsForgotPasswordLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: forgotPasswordEmail,
          captchaToken: forgotCaptchaToken // Add CAPTCHA token
        }),
      });

      const result = await response.json();

      if (result.success) {
        setForgotPasswordMessage(result.message);
        setForgotPasswordEmail('');
        // Sembunyikan form forgot password setelah berhasil
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordMessage('');
        }, 5000);
      } else {
        setForgotPasswordError(result.message || 'Gagal mengirim email reset password');
        resetForgotCaptcha(); // Reset CAPTCHA on error
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setForgotPasswordError('Terjadi kesalahan saat mengirim email. Silakan coba lagi.');
      resetForgotCaptcha(); // Reset CAPTCHA on error
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-40 h-40 bg-white/35 rounded-full flex items-center justify-center backdrop-blur-sm mb-6 mx-auto">
                <img 
                  src="/logo-dalista.svg" 
                  alt="Logo Dalista" 
                  className="w-33 h-32 select-none pointer-events-none"
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
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Dalista - Admin
              </h1>
              <div className="w-24 h-1 bg-white/50 mx-auto mb-6"></div>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-md mx-auto text-center">
                Dashboard admin Dalista Dinas Tenaga Kerja dan Transmigrasi Provinsi Jawa Tengah
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <svg className="w-8 h-8 text-blue-100 mb-2 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-100">Manajemen Tamu</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <svg className="w-8 h-8 text-blue-100 mb-2 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <div className="text-sm text-blue-100">Laporan Detail</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <svg className="w-8 h-8 text-blue-100 mb-2 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a3.5 3.5 0 000 1.798V18a1 1 0 11-2 0V6.899a3.5 3.5 0 000-1.798V3a1 1 0 011-1zm0 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
                  <path fillRule="evenodd" d="M7 2a1 1 0 011-1h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V2zm2 2h6v2H9V4zm0 4h6v1H9V8zm0 3h6v1H9v-1zm0 3h4v1H9v-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-100">Manajemen Kuesioner</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-12 bg-gray-50">
        <div className="max-w-md w-full mx-auto relative">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Sistem Buku Tamu</h2>
            <p className="text-gray-600">Panel Administrator</p>
          </div>

          {/* Login Header */}
          <div className="text-center lg:text-left mb-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h3>
            <p className="text-gray-600">Silakan masuk ke Dalista - Admin</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form space-y-6">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Masukkan username"
                  disabled={isLoading}
                  style={{
                    backgroundColor: '#ffffff !important',
                    color: '#1f2937 !important',
                    WebkitTextFillColor: '#1f2937 !important',
                    WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                    boxShadow: '0 0 0 1000px #ffffff inset !important',
                    caretColor: '#1f2937 !important'
                  }}
                />
              </div>
            </div>

            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              label="Password"
              placeholder="Masukkan password"
              required={true}
              disabled={isLoading}
              autoComplete="current-password"
              showLeftIcon={true}
              focusColor="blue"
            />

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700 cursor-pointer hover:text-gray-900 transition-colors duration-200">
                Ingat saya selama 7 hari
              </label>
            </div>

            {/* CAPTCHA Section */}
            <div className="w-full">
              <div className="flex justify-center">
                <TurnstileCaptcha
                  onVerify={handleCaptchaVerify}
                  onError={handleCaptchaError}
                  onExpire={handleCaptchaExpire}
                  theme="light"
                  size="normal"
                  className="mx-auto"
                  disabled={isLoading}
                />
              </div>
              {captchaError && (
                <p className="text-red-500 text-sm mt-2 text-center">{captchaError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isCaptchaVerified}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Masuk
                </div>
              )}
            </button>

            {/* Forgot Password Link */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline transition-colors duration-200"
                disabled={isLoading}
              >
                Lupa Password?
              </button>
            </div>
          </form>

          {/* Forgot Password Overlay */}
          {showForgotPassword && (
            <div className="absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex flex-col justify-center z-20">
              <div className="max-w-md w-full mx-auto px-8">
                {/* Close Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail('');
                      setForgotPasswordError('');
                      setForgotPasswordMessage('');
                      resetForgotCaptcha(); // Reset forgot password CAPTCHA
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                    disabled={isForgotPasswordLoading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Reset Password Header */}
                <div className="text-center lg:text-left mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h3>
                  <p className="text-gray-600">Masukkan alamat email yang terdaftar. Kami akan mengirimkan link reset password ke email Anda.</p>
                </div>

                {/* Messages */}
                {forgotPasswordMessage && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md mb-6">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-green-700 text-sm">{forgotPasswordMessage}</p>
                    </div>
                  </div>
                )}

                {forgotPasswordError && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md mb-6">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm">{forgotPasswordError}</p>
                    </div>
                  </div>
                )}

                {/* Reset Password Form */}
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="forgotEmail"
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                        placeholder="contoh@email.com"
                        disabled={isForgotPasswordLoading}
                        style={{
                          backgroundColor: '#ffffff !important',
                          color: '#1f2937 !important',
                          WebkitTextFillColor: '#1f2937 !important',
                          WebkitBoxShadow: '0 0 0 1000px #ffffff inset !important',
                          boxShadow: '0 0 0 1000px #ffffff inset !important',
                          caretColor: '#1f2937 !important'
                        }}
                      />
                    </div>
                  </div>

                  {/* CAPTCHA Section for Forgot Password */}
                  <div className="w-full">
                    <div className="flex justify-center">
                      <TurnstileCaptcha
                        onVerify={handleForgotCaptchaVerify}
                        onError={handleForgotCaptchaError}
                        onExpire={handleForgotCaptchaExpire}
                        theme="light"
                        size="normal"
                        className="mx-auto"
                        disabled={isForgotPasswordLoading}
                      />
                    </div>
                    {forgotCaptchaError && (
                      <p className="text-red-500 text-sm mt-2 text-center">{forgotCaptchaError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isForgotPasswordLoading || !isForgotCaptchaVerified}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isForgotPasswordLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Mengirim Reset Link...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Kirim Reset Link
                      </div>
                    )}
                  </button>

                  {/* Back to Login Link */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setForgotPasswordEmail('');
                        setForgotPasswordError('');
                        setForgotPasswordMessage('');
                        resetForgotCaptcha(); // Reset forgot password CAPTCHA
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium underline transition-colors duration-200"
                      disabled={isForgotPasswordLoading}
                    >
                      Kembali ke Login
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
