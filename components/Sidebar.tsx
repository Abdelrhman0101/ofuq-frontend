"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { getCurrentUser } from '../utils/authService';
import apiClient from '../utils/apiClient';

interface SidebarProps {
  isMobileOpen?: boolean;
  onClose?: () => void;
}

interface MenuItem {
  href: string;
  label: string;
  icon: string;
  permission?: string; // Required permission to view this item
  adminOnly?: boolean; // Only visible to admin
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen = false, onClose }) => {
  const pathname = usePathname();
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Menu items with their required permissions
  const menuItems: MenuItem[] = [
    { href: '/admin', label: 'لوحة التحكم', icon: '🏠' },
    { href: '/admin/diplomas', label: 'إدارة الدبلومات', icon: '🎓', permission: 'diplomas.view' },
    { href: '/admin/diplomas/question-bank', label: 'بنك الأسئلة', icon: '❓', permission: 'questions.view' },
    { href: '/admin/students', label: 'إدارة الطلاب', icon: '👨‍🎓', permission: 'students.view' },
    { href: '/admin/instructors', label: 'المحاضرون', icon: '👨‍🏫', permission: 'instructors.view' },
    { href: '/admin/supervisors', label: 'إدارة المشرفين', icon: '👥', adminOnly: true },
    { href: '/admin/database-backups', label: 'النسخ الاحتياطية', icon: '💾', permission: 'backups.view' },
    { href: '/admin/profile-management', label: 'إدارة الملف الشخصي', icon: '⚙️' },
  ];

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const user = getCurrentUser();
        if (user) {
          setUserRole(user.role);

          // Admin has all permissions
          if (user.role === 'admin') {
            setUserPermissions(['*']);
          } else {
            // Fetch permissions from API
            const response = await apiClient.get('/user/permissions');
            if (response.data.permissions) {
              setUserPermissions(response.data.permissions);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch permissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const hasPermission = (permission?: string): boolean => {
    if (!permission) return true; // No permission required
    if (userPermissions.includes('*')) return true; // Admin has all
    return userPermissions.includes(permission);
  };

  const canViewItem = (item: MenuItem): boolean => {
    if (item.adminOnly && userRole !== 'admin') return false;
    return hasPermission(item.permission);
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

  // Filter menu items based on permissions
  const visibleItems = menuItems.filter(canViewItem);

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
          {visibleItems.map((item) => (
            <li key={item.href} className={styles['nav-item']}>
              <Link
                href={item.href}
                prefetch={false}
                className={`${styles['nav-link']} ${isActive(item.href) ? styles.active : ''}`}
                onClick={handleNavigate}
              >
                <span className={styles['nav-icon']}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles['sidebar-footer']}>
        <p className={styles['footer-text']}>© منصة أفق للتعليم عن بعد</p>
      </div>
    </aside>
  );
};

export default Sidebar;
