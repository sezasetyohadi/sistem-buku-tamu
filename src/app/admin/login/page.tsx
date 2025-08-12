"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDummyLogin = () => {
    // Set dummy session for testing
    const dummyAdminData = {
      id: 1,
      username: 'dummy123',
      nama_lengkap: 'Admin Demo',
      email: 'admin@demo.com',
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('admin_session', JSON.stringify(dummyAdminData));
    document.cookie = `admin_auth=true; path=/; max-age=86400`; // 24 hours
    
    // Redirect to admin dashboard
    router.push('/admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // Store admin session/token in localStorage
        localStorage.setItem('admin_session', JSON.stringify({
          id: result.admin.id,
          username: result.admin.username,
          nama_lengkap: result.admin.nama_lengkap,
          email: result.admin.email,
          loginTime: new Date().toISOString()
        }));
        
        // Also set a simple auth cookie for middleware
        document.cookie = `admin_auth=true; path=/; max-age=86400`; // 24 hours
        
        // Redirect to admin dashboard
        router.push('/admin');
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold mb-6 bg-white/10 text-white backdrop-blur-sm">
            <span className="mr-2">🔐</span>
            Admin Login
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Sistem Buku Tamu
          </h1>
          <p className="text-blue-100">
            Masuk ke panel administrasi
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan username"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Masukkan password"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Memproses...
                </div>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Kembali ke{' '}
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">
                Beranda
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo Login:</strong><br />
              Username: dummy123 | Password: dummy123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
