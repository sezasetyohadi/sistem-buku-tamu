'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Immediate redirect to guest landing page
    router.replace('/guest/landing');
  }, [router]);

  return null; // No UI needed, just redirect
}
