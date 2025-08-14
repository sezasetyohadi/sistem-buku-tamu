'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GuestPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to register page immediately
    router.push('/guest/register');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Mengarahkan ke halaman pendaftaran...</p>
      </div>
    </div>
  );
}
