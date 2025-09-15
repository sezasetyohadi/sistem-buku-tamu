/**
 * Improved Admin Login Page with AuthContext Integration
 * Uses the new authentication context for proper state management
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import PasswordInput from '@/components/ui/PasswordInput';
import { useAuth } from '@/contexts/AuthContext';
import { authLogger } from '@/lib/logger';
import { showToast } from '@/lib/toast';

export default function ImprovedLoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);

  const { login, isAuthenticated, user, error } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      authLogger.info(`User ${user.username} already authenticated, redirecting to admin dashboard`);
      router.replace('/admin');
    }
  }, [isAuthenticated, user, router]);

  // Load saved credentials if "Remember Me" was previously checked
  useEffect(() => {
    const savedCredentials = localStorage.getItem('adminRememberedCredentials');
    if (savedCredentials) {
      try {
        const credentials = JSON.parse(savedCredentials);
        setFormData(prev => ({
          ...prev,
          username: credentials.username || '',
          rememberMe: true
        }));
      } catch (error) {
        authLogger.error('Error loading saved credentials:', error);
        localStorage.removeItem('adminRememberedCredentials');
      }
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      showToast.validation('Username dan password harus diisi');
      return;
    }

    setIsLoading(true);

    try {
      // Save credentials if remember me is checked
      if (formData.rememberMe) {
        localStorage.setItem('adminRememberedCredentials', JSON.stringify({
          username: formData.username
        }));
      } else {
        localStorage.removeItem('adminRememberedCredentials');
      }

      // Use the AuthContext login method
      await login(formData.username, formData.password);
      
      showToast.success('Login berhasil! Selamat datang kembali.');
      authLogger.info(`Admin login successful: ${formData.username}`);
      
      // Redirect to admin dashboard
      router.push('/admin');

    } catch (error: any) {
      authLogger.error('Login failed:', error);
      
      const errorMessage = error.message || 'Login gagal. Silakan coba lagi.';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      showToast.validation('Email harus diisi');
      return;
    }

    setIsForgotPasswordLoading(true);

    try {
      const response = await fetch('/api/forgot-token/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showToast.success('Email reset password telah dikirim. Silakan cek inbox Anda.');
        setShowForgotPassword(false);
        setForgotPasswordEmail('');
      } else {
        throw new Error(result.message || 'Gagal mengirim email reset password');
      }
    } catch (error: any) {
      authLogger.error('Forgot password error:', error);
      showToast.error(error.message || 'Gagal mengirim email reset password');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  // Show loading if authentication is being checked
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Mengalihkan ke dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <span className="text-white text-2xl font-bold">DA</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {showForgotPassword ? 'Reset Password' : 'Login Admin'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {showForgotPassword 
              ? 'Masukkan email Anda untuk mereset password' 
              : 'Silakan masuk ke panel administrasi'
            }
          </p>
        </div>

        {/* Login Form */}
        {!showForgotPassword ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Masukkan username"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Masukkan password"
                  disabled={isLoading}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                  Ingat saya
                </label>
              </div>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                disabled={isLoading}
              >
                Lupa password?
              </button>
            </div>

            {/* Show authentication error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </div>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Forgot Password Form */
          <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label htmlFor="forgotPasswordEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="forgotPasswordEmail"
                name="forgotPasswordEmail"
                type="email"
                required
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Masukkan email Anda"
                disabled={isForgotPasswordLoading}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={isForgotPasswordLoading}
              >
                Batal
              </button>
              
              <button
                type="submit"
                disabled={isForgotPasswordLoading}
                className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isForgotPasswordLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim...
                  </div>
                ) : (
                  'Kirim Email'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            © 2024 Sistem Buku Tamu Digital - DISNAKERTRANS Jawa Tengah
          </p>
          <Link 
            href="/guest" 
            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            Kembali ke Halaman Tamu
          </Link>
        </div>
      </div>
    </div>
  );
}
