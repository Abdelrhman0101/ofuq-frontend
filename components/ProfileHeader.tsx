'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getCurrentUser, signout, User } from '../utils/authService';
import clsx from 'clsx';
import styles from './HomeHeader.module.css';
import '../styles/profile-header.css';

const ProfileHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Profile menu state copied from HomeHeader for consistent behavior
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Check authentication status on mount (same logic as HomeHeader)
  useEffect(() => {
    const authenticated = isAuthenticated();
    setIsLoggedIn(authenticated);
    if (authenticated) {
      setUser(getCurrentUser());
    }
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setAvatarClicked(true);
    setTimeout(() => setAvatarClicked(false), 400);
  };

  const handleLogout = async () => {
    try {
      await signout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggedIn(false);
      setUser(null);
      router.push('/auth');
    }
  };

  return (
    <>
      <header className="profile-header">
        <div className="header-container">
          {/* Logo */}
          <div className="header-logo">
            <Image 
              src="/mahad_alofk2.png" 
              alt="معهد الأفق" 
              width={120} 
              height={50}
              className="logo-image"
            />
          </div>

          {/* Desktop Navigation Links - Centered */}
          <nav className="header-nav desktop-nav">
            <Link href="/" className={`nav-link1 ${pathname === '/' ? 'active' : ''}`}>الرئيسية</Link>
            <Link href="/courses" className={`nav-link1 ${(pathname?.startsWith('/courses') || pathname?.startsWith('/course-details')) ? 'active' : ''}`}>برامجنا التدريبية</Link>
            <Link href="/user/fav" className={`nav-link1 ${pathname?.startsWith('/user/fav') ? 'active' : ''}`}>المفضلة</Link>
            <Link href="/about" className={`nav-link1 ${pathname?.startsWith('/about') ? 'active' : ''}`}>عنّا</Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button 
            className="hamburger-btn mobile-only"
            onClick={toggleSidebar}
            aria-label="فتح القائمة"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          {/* Profile Menu (reused from HomeHeader for consistency) */}
          <div className="header-profile" ref={profileMenuRef}>
            {isLoggedIn ? (
              <div className={styles['profile-menu-container']} onClick={toggleProfileMenu}>
                <div className={styles['profile-info']}>
                  <div className={clsx(styles['profile-avatar'], avatarClicked && styles['click-effect'])} ref={avatarRef}>
                    <Image src="/avatar.jpg" alt="Profile" width={36} height={36} className={styles['profile-image']} />
                  </div>
                  <div className={styles['profile-details']}>
                    <span className={styles['profile-name']}>مرحباً، {user?.name}</span>
                  </div>
                </div>

                {isProfileMenuOpen && (
                  <div className={styles['profile-dropdown']} onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={user?.role === 'admin' ? '/admin' : '/user'}
                      className={styles['dropdown-item']}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      لوحة التحكم
                    </Link>
                    <Link
                      href={user?.role === 'admin' ? '/admin/profile-management' : '/user/settings'}
                      className={styles['dropdown-item']}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      إدارة الحساب الشخصي
                    </Link>
                    <Link
                      href="/user/fav"
                      className={styles['dropdown-item']}
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      المفضلة
                    </Link>
                    <div className={styles['dropdown-separator']}></div>
                    <button className={clsx(styles['dropdown-item'], styles['logout'])} onClick={handleLogout}>
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth" className={clsx(styles['auth-btn'], styles['login-btn1'])}>تسجيل دخول</Link>
                <Link href="/auth" className={clsx(styles['auth-btn'], styles['signup-btn'])}>إنشاء حساب</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`mobile-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <button className="close-btn" onClick={closeSidebar}>
              <span>&times;</span>
            </button>
          </div>
          <nav className="sidebar-nav">
            <Link href="/" className={`sidebar-link ${pathname === '/' ? 'active' : ''}`} onClick={closeSidebar}>الرئيسية</Link>
            <Link href="/courses" className={`sidebar-link ${(pathname?.startsWith('/courses') || pathname?.startsWith('/course-details')) ? 'active' : ''}`} onClick={closeSidebar}>برامجنا التدريبية</Link>
            <Link href="/favorites" className={`sidebar-link ${pathname?.startsWith('/favorites') ? 'active' : ''}`} onClick={closeSidebar}>المفضلة</Link>
            <Link href="/about" className={`sidebar-link ${pathname?.startsWith('/about') ? 'active' : ''}`} onClick={closeSidebar}>عنّا</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;