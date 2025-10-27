'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from './LoginForm';

const AuthPageContent: React.FC = () => {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') as 'login' | 'signup' | null;

  return <LoginForm initialTab={tab} />;
};

export default AuthPageContent;