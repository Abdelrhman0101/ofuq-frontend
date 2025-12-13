'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getCurrentUser, signout, User } from '../utils/authService';
import { getBackendAssetUrl } from '../utils/url';
import styles from './HomeHeader.module.css';
import clsx from 'clsx';
// Removed help button and VideoPopup integration

const HomeHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Video popup removed per request

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Check authentication status on mount and listen for updates
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        setUser(getCurrentUser());
      }
    };

    checkAuth();

    // Listen for profile updates
    const handleUserDataUpdate = () => {
      checkAuth();
      setImageTimestamp(Date.now());
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate);

    return () => {
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
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
      <header className={styles['home-header']} dir="rtl">
        <div className={styles['header-container']}>
          {/* Logo and Navigation Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* Logo */}
            <div className={styles['header-logo']}>
              <Link href="/" prefetch={false}>
                <Image
                  src="/mahad_alofk2.png"
                  alt="منصة أفق"
                  width={120}
                  height={50}
                  className={styles['logo-image']}
                />
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className={clsx(styles['header-nav'], styles['desktop-nav'])}>
              <Link href="/" prefetch={false} className={clsx(styles['nav-link'], pathname === '/' && styles['active'])}>الرئيسية</Link>
              <Link href="/diploms" prefetch={false} className={clsx(styles['nav-link'], (pathname?.startsWith('/diploms') || pathname?.startsWith('/course-details')) && styles['active'])}>دبلومات منصة أفق</Link>
              <Link href="/community" prefetch={false} className={clsx(styles['nav-link'], pathname?.startsWith('/community') && styles['active'])}>مجتمع أفق</Link>
              <Link href="/verify-certificate" prefetch={false} className={clsx(styles['nav-link'], pathname?.startsWith('/verify-certificate') && styles['active'])}>التحقق من الشهادة</Link>
              <Link href="/about" prefetch={false} className={clsx(styles['nav-link'], pathname?.startsWith('/about') && styles['active'])}>من نحن</Link>
            </nav>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className={clsx(styles['hamburger-btn'], styles['mobile-only'])}
            onClick={toggleSidebar}
            aria-label="فتح القائمة"
          >
            <span className={styles['hamburger-line']}></span>
            <span className={styles['hamburger-line']}></span>
            <span className={styles['hamburger-line']}></span>
          </button>

          {/* Auth / Profile */}
          <div className={clsx(styles['header-auth'], !isLoggedIn && styles['mobile-hide'])} ref={profileMenuRef}>
            {isLoggedIn ? (
              <div className={styles['profile-menu-container']} onClick={toggleProfileMenu}>
                <div className={styles['profile-info']}>
                  <div className={clsx(styles['profile-avatar'], avatarClicked && styles['click-effect'])} ref={avatarRef}>
                    <img
                      src={user?.profile_picture ? `${getBackendAssetUrl(user.profile_picture)}${getBackendAssetUrl(user.profile_picture).includes('?') ? '&' : '?'}t=${imageTimestamp}` : '/avatar.jpg'}
                      alt="Profile"
                      width={36}
                      height={36}
                      className={styles['profile-image']}
                    />
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
                <Link href="/auth?tab=login" prefetch={false} className={clsx(styles['auth-btn'], styles['login-btn1'])}>تسجيل دخول</Link>
                <Link href="/auth?tab=signup" prefetch={false} className={clsx(styles['auth-btn'], styles['signup-btn'])}>إنشاء حساب</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={clsx(styles['mobile-sidebar'], isSidebarOpen && styles['open'])}>
        <div className={styles['sidebar-overlay']} onClick={closeSidebar}></div>
        <div className={styles['sidebar-content']}>
          <div className={styles['sidebar-header']}>
            <button className={styles['close-btn']} onClick={closeSidebar}>
              <span>&times;</span>
            </button>
          </div>
          <nav className={styles['sidebar-nav']}>
            <Link href="/" prefetch={false} className={clsx(styles['sidebar-link'], pathname === '/' && styles['active'])} onClick={closeSidebar}>الرئيسية</Link>
            <Link href="/diploms" prefetch={false} className={clsx(styles['sidebar-link'], (pathname?.startsWith('/diploms') || pathname?.startsWith('/course-details')) && styles['active'])} onClick={closeSidebar}>دبلومات منصة أفق</Link>
            <Link href="/community" prefetch={false} className={clsx(styles['sidebar-link'], pathname?.startsWith('/community') && styles['active'])} onClick={closeSidebar}>مجتمع أفق</Link>
            <Link href="/verify-certificate" prefetch={false} className={clsx(styles['sidebar-link'], pathname?.startsWith('/verify-certificate') && styles['active'])} onClick={closeSidebar}>التحقق من الشهادة</Link>
            <Link href="/about" prefetch={false} className={clsx(styles['sidebar-link'], pathname?.startsWith('/about') && styles['active'])} onClick={closeSidebar}>عنّا</Link>
          </nav>

          {!isLoggedIn && (
            <div className={styles['sidebar-auth']}>
              <Link href="/auth?tab=login" prefetch={false} className={clsx(styles['auth-btn'], styles['login-btn1'])} onClick={closeSidebar}>تسجيل دخول</Link>
              <Link href="/auth?tab=signup" prefetch={false} className={clsx(styles['auth-btn'], styles['signup-btn'])} onClick={closeSidebar}>إنشاء حساب</Link>
            </div>
          )}

        </div>
      </div>

      {/* Help video popup removed */}
    </>
  );
};

export default HomeHeader;