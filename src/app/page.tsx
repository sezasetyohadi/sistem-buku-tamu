'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the guest home page
    router.replace('/guest');
  }, [router]);

  return null; // No UI needed, just redirect
}
