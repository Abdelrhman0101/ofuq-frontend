'use client';

import React from 'react';
import Link from 'next/link';
import LoginForm from '../../components/LoginForm';
import styles from './Auth.module.css';

export default function AuthPage() {
  return (
    <div className={styles.authPage}>
      <LoginForm />
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