'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '../utils/authService';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    // Check if user is not authenticated
    if (!isAuthenticated()) {
      router.replace('/auth');
      return;
    }
  }, [router]);

  // Only render children if user is authenticated
  if (!isAuthenticated()) {
    return null; // Prevent UI from flashing before redirect
  }

  return <>{children}</>;
}