'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../utils/authService';

interface AdminAuthGuardProps {
  children: React.ReactNode;
}

export default function AdminAuthGuard({ children }: AdminAuthGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const user = getCurrentUser();
    
    // Check if user is not authenticated OR if user role is not admin
    if (!user || user.role !== 'admin') {
      router.replace('/auth');
      return;
    }
  }, [router]);

  // Get current user for conditional rendering
  const user = getCurrentUser();
  
  // Only render children if user is authenticated and is an admin
  if (!user || user.role !== 'admin') {
    return null; // Prevent admin UI from flashing before redirect
  }

  return <>{children}</>;
}