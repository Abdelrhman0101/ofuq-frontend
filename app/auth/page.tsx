'use client';

import React from 'react';
import LoginForm from '../../components/LoginForm';
import '../../styles/auth.css';

export default function AuthPage() {
  return (
    <div className="auth-page">
      <LoginForm />
    </div>
  );
}