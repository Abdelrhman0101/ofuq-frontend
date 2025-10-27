'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import LoginForm from '../../components/LoginForm';
import styles from './Auth.module.css';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') as 'login' | 'signup' | null;

  return (
    <div className={styles.authPage}>
      <LoginForm initialTab={tab} />
      <div className={styles.authFooterLinks}>
        <Link href="/privacy" className={styles.footerLink}>
          سياسة الخصوصية
        </Link>
        <span className={styles.linkSeparator}>|</span>
        <Link href="/terms" className={styles.footerLink}>
          الشروط والأحكام
        </Link>
      </div>
    </div>
  );
}