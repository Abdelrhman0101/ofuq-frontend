"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onClose }) => {
  const pathname = usePathname();
  const [openDropdown, setOpenDropdown] = useState<{ [key: string]: boolean }>({});

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isActive = (href: string) => {
    if (!pathname) return false;

    if (href === '/admin' && pathname === '/admin') {
      return true;
    }

    if (href !== '/admin') {
      if (pathname === href) {
        return true;
      }

      if (pathname.startsWith(href + '/')) {
        if (href === '/admin/diplomas' && pathname.includes('/question-bank')) {
          return false;
        }
        return true;
      }
    }

    return false;
  };

  const handleNavigate = () => {
    onClose?.();
  };

  return (
    <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-logo']}>
          <img src="/favicon.ico" alt="منصة أفق للتعليم عن بعد" />
        </div>
        <h2 className={styles['sidebar-title']}>لوحة الإدارة</h2>
        <p className={styles['sidebar-subtitle']}>إدارة المنصة والمحتوى</p>
      </div>

      <nav className={styles['sidebar-nav']}>
        <ul>
          <li className={styles['nav-item']}>
            <Link
              href="/admin"
              className={`${styles['nav-link']} ${isActive('/admin') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>🏠</span>
              <span>لوحة التحكم</span>
            </Link>
          </li>

          <li className={styles['nav-item']}>
            <Link
              href="/admin/diplomas"
              className={`${styles['nav-link']} ${isActive('/admin/diplomas') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>🎓</span>
              <span>إدارة الدبلومات</span>
            </Link>
          </li>

          <li className={styles['nav-item']}>
            <Link
              href="/admin/diplomas/question-bank"
              className={`${styles['nav-link']} ${isActive('/admin/diplomas/question-bank') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>❓</span>
              <span>بنك الأسئلة</span>
            </Link>
          </li>

          <li className={styles['nav-item']}>
            <Link
              href="/admin/students"
              className={`${styles['nav-link']} ${isActive('/admin/students') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>👨‍🎓</span>
              <span>إدارة الطلاب</span>
            </Link>
          </li>

          <li className={styles['nav-item']}>
            <Link
              href="/admin/instructors"
              className={`${styles['nav-link']} ${isActive('/admin/instructors') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>👨‍🏫</span>
              <span>المحاضرون</span>
            </Link>
          </li>

          <li className={styles['nav-item']}>
            <Link
              href="/admin/database-backups"
              className={`${styles['nav-link']} ${isActive('/admin/database-backups') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>�</span>
              <span>النسخ الاحتياطية</span>
            </Link>
          </li>

          <li className={styles['nav-item']}>
            <Link
              href="/admin/profile-management"
              className={`${styles['nav-link']} ${isActive('/admin/profile-management') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>⚙️</span>
              <span>إدارة الملف الشخصي</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className={styles['sidebar-footer']}>
        <p className={styles['footer-text']}>© منصة أفق للتعليم عن بعد</p>
      </div>
    </aside>
  );
};

export default Sidebar;