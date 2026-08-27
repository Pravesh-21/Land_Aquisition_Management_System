'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, role, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (isAuthenticated && role) {
      router.replace(`/dashboard/${role.toLowerCase()}`);
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, role, isLoaded, router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-[var(--color-gov-navy)] border-t-transparent animate-spin rounded-full mx-auto"></div>
        <div className="text-xs font-bold text-[var(--color-gov-navy)] uppercase tracking-wider">
          Redirecting to BHU-DRISHTI Parichay Identity Portal...
        </div>
      </div>
    </div>
  );
}
