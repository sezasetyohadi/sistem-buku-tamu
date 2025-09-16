'use client';

import { useEffect, useState } from 'react';

export default function AccessDeniedPage() {
  const [requestedUrl, setRequestedUrl] = useState('');
  const [allowedUrls, setAllowedUrls] = useState<string[]>([]);

  useEffect(() => {
    setRequestedUrl(window.location.origin);
    
    // Get allowed URLs from environment
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
    const guestUrl = process.env.NEXT_PUBLIC_GUEST_URL;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    const urls = [];
    if (adminUrl) urls.push(adminUrl);
    if (guestUrl) urls.push(guestUrl);
    if (appUrl) urls.push(appUrl);
    
    setAllowedUrls(urls);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Akses Ditolak
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Anda tidak diizinkan mengakses halaman ini dari URL saat ini
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Informasi Akses</h3>
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">URL Saat Ini:</span>
                  <p className="text-sm text-gray-900 break-all">{requestedUrl}</p>
                </div>
                
                {allowedUrls.length > 0 && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">URL yang Diizinkan:</span>
                    <ul className="mt-2 space-y-1">
                      {allowedUrls.map((url, index) => (
                        <li key={index}>
                          <a 
                            href={url}
                            className="text-sm text-blue-600 hover:text-blue-500 break-all"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Penjelasan:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Panel Admin hanya dapat diakses dari URL admin yang dikonfigurasi</li>
                <li>• Portal Tamu hanya dapat diakses dari URL tamu yang dikonfigurasi</li>
                <li>• Reset password hanya dapat diakses dari URL aplikasi yang dikonfigurasi</li>
                <li>• Ini adalah fitur keamanan untuk mencegah akses tidak sah</li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={() => window.history.back()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}