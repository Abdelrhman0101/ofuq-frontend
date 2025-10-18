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

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  const handleNavigate = () => {
    // Close sidebar on navigation in mobile view
    onClose?.();
  };

  return (
    <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
      <div className={styles['sidebar-header']}>
        <div className={styles['sidebar-logo']}>
          <img src="/mahad_alofk2.png" alt="معهد الأفق للتعليم عن بعد" />
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
              href="/admin/courses"
              className={`${styles['nav-link']} ${isActive('/admin/courses') ? styles.active : ''}`}
              onClick={handleNavigate}
            >
              <span className={styles['nav-icon']}>📚</span>
              <span>إدارة الكورسات</span>
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

          {/* Reports Dropdown */}
          {/* <li className={`${styles['nav-item']} ${styles['nav-dropdown']}`}>
            <button
              type="button"
              className={`${styles['nav-link']} ${styles['dropdown-toggle']}`}
              onClick={() => toggleDropdown('reports')}
            >
              <span>
                <span className={styles['nav-icon']}>📊</span>
                التقارير
              </span>
              <span className={`${styles['dropdown-arrow']} ${openDropdown['reports'] ? styles.open : ''}`}>▾</span>
            </button>
            <div className={`${styles['dropdown-menu']} ${openDropdown['reports'] ? styles.open : ''}`}>
              <Link
                href="/admin/reports/financial"
                className={`${styles['dropdown-link']} ${isActive('/admin/reports/financial') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                التقارير المالية
              </Link>
              <Link
                href="/admin/reports/visits"
                className={`${styles['dropdown-link']} ${isActive('/admin/reports/visits') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                تقارير الزيارات
              </Link>
            </div>
          </li> */}

          {/* Policies Dropdown */}
          {/* <li className={`${styles['nav-item']} ${styles['nav-dropdown']}`}>
            <button
              type="button"
              className={`${styles['nav-link']} ${styles['dropdown-toggle']}`}
              onClick={() => toggleDropdown('policies')}
            >
              <span>
                <span className={styles['nav-icon']}>📜</span>
                السياسات
              </span>
              <span className={`${styles['dropdown-arrow']} ${openDropdown['policies'] ? styles.open : ''}`}>▾</span>
            </button>
            <div className={`${styles['dropdown-menu']} ${openDropdown['policies'] ? styles.open : ''}`}>
              <Link
                href="/admin/policies/terms"
                className={`${styles['dropdown-link']} ${isActive('/admin/policies/terms') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                الشروط والأحكام
              </Link>
              <Link
                href="/admin/policies/privacy"
                className={`${styles['dropdown-link']} ${isActive('/admin/policies/privacy') ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                سياسة الخصوصية
              </Link>
            </div>
          </li> */}

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
        <p className={styles['footer-text']}>© معهد الأفق للتعليم عن بعد</p>
      </div>
    </aside>
  );
};

export default Sidebar;