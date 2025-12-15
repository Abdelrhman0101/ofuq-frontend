'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated, getCurrentUser, signout, User } from '../utils/authService';
import { getBackendAssetUrl } from '../utils/url';
import styles from './HomeHeader.module.css';
import clsx from 'clsx';
import MegaMenu from './MegaMenu';
import { PiCertificate, PiCaretDown, PiCaretLeft } from 'react-icons/pi';

// Mobile Sidebar Menu Data
const mobileMenuData = [
  {
    label: 'الرئيسية',
    href: '/',
    children: [
      { label: 'من نحن', href: '/about' },
      { label: 'رواد المنصة حول العالم', href: '#', comingSoon: true },
      { label: 'الإحصائيات', href: '#', comingSoon: true },
      { label: 'بيانات التواصل', href: '#', comingSoon: true },
      { label: 'عداد المسجلين', href: '#', comingSoon: true },
      { label: 'شؤون الطلاب', href: '#', comingSoon: true },
      { label: 'الدعم الفني', href: '#', comingSoon: true },
      { label: 'الصفحات في الوسائط', href: '#', comingSoon: true },
    ]
  },
  {
    label: 'الدبلومات',
    href: '/diploms',
    children: [
      { label: 'التربوية', href: '/diploms?category=educational' },
      { label: 'الدعوية', href: '/diploms?category=dawah' },
      { label: 'الإعلامية', href: '/diploms?category=media' },
      { label: 'الإدارية', href: '/diploms?category=management' },
      { label: 'الشرعية', href: '/diploms?category=sharia' },
      { label: 'تطوير الذات', href: '/diploms?category=self-development' },
      { label: 'التقنية', href: '/diploms?category=tech' },
      { label: 'السلوكية', href: '/diploms?category=behavioral' },
      { label: 'المهنية', href: '/diploms?category=professional' },
      { label: 'خدمة المجتمع', href: '/diploms?category=community-service' },
    ]
  },
  {
    label: 'مجتمع أفق',
    href: '/community',
    children: [
      { label: 'اللقاءات الإثرائية', href: '#', comingSoon: true },
      { label: 'المنتدى التفاعلي', href: '#', comingSoon: true },
      { label: 'الإعلانات', href: '#', comingSoon: true },
      { label: 'أخبار المنصة', href: '#', comingSoon: true },
      { label: 'صفحة الخبراء', href: '#', comingSoon: true },
      { label: 'شات الحوار بين الرواد', href: '#', comingSoon: true },
      { label: 'الاستشارات', href: '#', comingSoon: true },
    ]
  },
  {
    label: 'نادي الابتكار',
    href: '#',
    comingSoon: true,
    children: [
      { label: 'كورسات الابتكار', href: '#', comingSoon: true },
      { label: 'ابتكارات الرواد', href: '#', comingSoon: true },
      { label: 'براءات الاختراع', href: '#', comingSoon: true },
      { label: 'ورش عمل صناعة الأفكار', href: '#', comingSoon: true },
      { label: 'الذكاء الاصطناعي', href: '#', comingSoon: true },
      {
        label: 'كتابي',
        href: '#',
        comingSoon: true,
        children: [
          { label: 'تلخيص', href: '#', comingSoon: true },
          { label: 'صوتي', href: '#', comingSoon: true },
          { label: 'بودكاست', href: '#', comingSoon: true },
          { label: 'تشجير', href: '#', comingSoon: true },
          { label: 'رسم بياني', href: '#', comingSoon: true },
          { label: 'أصل الكتاب', href: '#', comingSoon: true },
          { label: 'اختبار وشهادة', href: '#', comingSoon: true },
        ]
      },
    ]
  },
  {
    label: 'المعرض',
    href: '#',
    comingSoon: true,
    children: [
      { label: 'الكتب والمقررات', href: '#', comingSoon: true },
      { label: 'الأدلة والوثائق', href: '#', comingSoon: true },
      { label: 'الملخصات', href: '#', comingSoon: true },
      { label: 'الكورسات', href: '#', comingSoon: true },
      { label: 'الفيديوهات', href: '#', comingSoon: true },
      { label: 'الملفات الصوتية', href: '#', comingSoon: true },
      { label: 'البحوث والدراسات', href: '#', comingSoon: true },
      { label: 'اكسب معنا', href: '#', comingSoon: true },
    ]
  },
  {
    label: 'زاد المحاضر والخطيب',
    href: '#',
    comingSoon: true,
    children: []
  },
  {
    label: 'فضاء أفق',
    href: '#',
    comingSoon: true,
    children: [
      { label: 'التطبيقات', href: '#', comingSoon: true },
      { label: 'الأكاديميات', href: '#', comingSoon: true },
      { label: 'المتجر', href: '#', comingSoon: true },
      { label: 'الخدمات الرقمية', href: '#', comingSoon: true },
      { label: 'الخدمات البحثية', href: '#', comingSoon: true },
      { label: 'التوكيلات', href: '#', comingSoon: true },
    ]
  },
];

const HomeHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [avatarClicked, setAvatarClicked] = useState(false);
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [expandedSubmenus, setExpandedSubmenus] = useState<string[]>([]);
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
    setExpandedMenus([]);
    setExpandedSubmenus([]);
  };

  const toggleMobileMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const toggleMobileSubmenu = (label: string) => {
    setExpandedSubmenus(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
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

            {/* Desktop Navigation - MegaMenu */}
            <div className={styles['desktop-nav']}>
              <MegaMenu />
            </div>

            {/* Certificate Verification Button - Icon Only with Tooltip */}
            <Link
              href="/verify-certificate"
              prefetch={false}
              className={clsx(styles['verify-btn-icon'], styles['desktop-only'])}
              title="تحقق من شهادتك"
            >
              <PiCertificate className={styles['verify-icon']} />
              <span className={styles['verify-tooltip']}>تحقق من شهادتك</span>
            </Link>
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

          {/* Certificate Verification Button in Sidebar */}
          <Link
            href="/verify-certificate"
            prefetch={false}
            className={styles['sidebar-verify-btn']}
            onClick={closeSidebar}
          >
            <PiCertificate className={styles['sidebar-verify-icon']} />
            <span>التحقق من الشهادة</span>
          </Link>

          {/* Accordion Navigation */}
          <nav className={styles['sidebar-nav']}>
            {mobileMenuData.map((item) => (
              <div key={item.label} className={styles['accordion-item']}>
                <div
                  className={styles['accordion-header']}
                  onClick={() => item.children.length > 0 && toggleMobileMenu(item.label)}
                >
                  {item.children.length > 0 ? (
                    <>
                      <span className={styles['accordion-label']}>{item.label}</span>
                      <PiCaretDown className={clsx(
                        styles['accordion-arrow'],
                        expandedMenus.includes(item.label) && styles['rotated']
                      )} />
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={styles['accordion-link']}
                      onClick={closeSidebar}
                    >
                      {item.label}
                    </Link>
                  )}
                </div>

                {/* Accordion Content */}
                {item.children.length > 0 && expandedMenus.includes(item.label) && (
                  <div className={styles['accordion-content']}>
                    {item.children.map((child: any) => (
                      <div key={child.label}>
                        {child.children ? (
                          // Nested submenu (كتابي)
                          <div className={styles['nested-accordion']}>
                            <div
                              className={styles['nested-header']}
                              onClick={() => toggleMobileSubmenu(child.label)}
                            >
                              <span>{child.label}</span>
                              <PiCaretLeft className={clsx(
                                styles['nested-arrow'],
                                expandedSubmenus.includes(child.label) && styles['rotated']
                              )} />
                            </div>
                            {expandedSubmenus.includes(child.label) && (
                              <div className={styles['nested-content']}>
                                {child.children.map((subChild: any) => (
                                  <Link
                                    key={subChild.label}
                                    href={subChild.href}
                                    className={styles['nested-link']}
                                    onClick={closeSidebar}
                                  >
                                    {subChild.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={child.href}
                            className={styles['accordion-sublink']}
                            onClick={closeSidebar}
                          >
                            {child.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
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