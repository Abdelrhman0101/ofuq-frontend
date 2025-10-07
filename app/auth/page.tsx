'use client';

import React from 'react';
import Link from 'next/link';
import LoginForm from '../../components/LoginForm';
import '../../styles/auth.css';

export default function AuthPage() {
  return (
    <div className="auth-page">
      <LoginForm />
      <div className="auth-footer-links">
        <Link href="/privacy" className="footer-link">
          سياسة الخصوصية
        </Link>
        <span className="link-separator">|</span>
        <Link href="/terms" className="footer-link">
          الشروط والأحكام
        </Link>
      </div>
    </div>
  );
}