'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser, signout, User } from '../utils/authService';
import { getBackendAssetUrl } from '../utils/url';
import '../styles/header.css';

const NotificationIcon = '/icons/notification.svg';
const NewBadgeIcon = '/icons/new-badge.svg';
const MessageIcon = '/icons/message.svg';
const CalendarIcon = '/icons/calendar.svg';
const LogoutIcon = '/icons/logout.svg';
const UserProfileIcon = '/icons/user-profile.svg';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('/avatar.jpg');
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      
      if (authenticated) {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        
        // Update profile image URL from user data
        if (currentUser?.profile_picture) {
          setProfileImageUrl(getBackendAssetUrl(currentUser.profile_picture));
        } else {
          setProfileImageUrl('/avatar.jpg');
        }
      }
    };

    checkAuthStatus();
    
    // Listen for storage changes to update profile image when changed in settings
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_data') {
        checkAuthStatus();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleUserDataUpdate = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataUpdated', handleUserDataUpdate);
    };
  }, []);

  // إضافة event listener للنقر خارج قائمة الإشعارات وقائمة البروفايل
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsProfileMenuOpen(false); // إغلاق قائمة البروفايل عند فتح الإشعارات
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsNotificationsOpen(false); // إغلاق قائمة الإشعارات عند فتح البروفايل
    if (avatarRef.current) {
      avatarRef.current.classList.add('click-effect');
      setTimeout(() => {
        avatarRef.current && avatarRef.current.classList.remove('click-effect');
      }, 400);
    }
  };

  const handleLogout = async () => {
    try {
      await signout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always redirect and update state, even if API call fails
      setIsLoggedIn(false);
      setUser(null);
      router.push('/');
    }
  };

  const handleProfileManagement = () => {
    router.push('/admin/profile-management');
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* زر القائمة للموبايل */}
        <div className="header-left">
          <button 
            className="mobile-menu-toggle"
            onClick={onToggleSidebar}
            aria-label="فتح/إغلاق القائمة"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
            </svg>
          </button>
        </div>
        
        {/* أيقونة الإشعارات وقائمة البروفايل */}
        <div className="header-right">
          {isLoggedIn ? (
            <>
              {/* قائمة البروفايل */}
              <div className="profile-menu-container" onClick={toggleProfileMenu} ref={profileMenuRef}>
                <div className="profile-info">
                  <div className="profile-avatar" ref={avatarRef}>
                    <img src={profileImageUrl} alt="Profile" className="profile-image" />
                  </div>
                  <div className="profile-details">
                    <span className="profile-name">مرحباً، {user?.name}</span>
                  </div>
                </div>

                {/* قائمة البروفايل المنسدلة */}
                {isProfileMenuOpen && (
                  <div className="profile-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">
                        <img src={profileImageUrl} alt="Profile" className="dropdown-profile-image" />
                      </div>
                      <div className="profile-dropdown-info">
                        <h4>{user?.name}</h4>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="profile-dropdown-items">
                      <div 
                        className="profile-dropdown-item" 
                        onClick={() => router.push(user?.role === 'admin' ? '/admin' : '/user')}
                      >
                        <img src={UserProfileIcon} alt="Dashboard" width="16" height="16" />
                        <span>لوحة التحكم</span>
                      </div>
                      <div 
                        className="profile-dropdown-item" 
                        onClick={() => router.push(user?.role === 'admin' ? '/admin/profile-management' : '/user/settings')}
                      >
                        <img src={UserProfileIcon} alt="Manage Profile" width="16" height="16" />
                        <span>إدارة الحساب الشخصي</span>
                      </div>
                      <div 
                        className="profile-dropdown-item" 
                        onClick={() => router.push('/user/fav')}
                      >
                        <img src={UserProfileIcon} alt="Favorites" width="16" height="16" />
                        <span>المفضلة</span>
                      </div>
                      <div className="dropdown-separator"></div>
                      <div className="profile-dropdown-item logout" onClick={handleLogout}>
                        <img src={LogoutIcon} alt="Logout" width="16" height="16" />
                        <span>تسجيل الخروج</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* أيقونة الإشعارات */}
              <div className="notifications-icon" onClick={toggleNotifications} ref={notificationsRef}>
                <img src={NotificationIcon} alt="Notifications" width="24" height="24" />
                <span className="notification-badge">3</span>

                {/* قائمة الإشعارات */}
                {isNotificationsOpen && (
                  <div className="notifications-menu">
                    <div className="notifications-header">
                      <h3>الإشعارات</h3>
                      <span className="notifications-count">3 جديد</span>
                    </div>
                    
                    <div className="notification-item unread">
                      <div className="notification-icon">
                        <img src={NewBadgeIcon} alt="New Badge" width="16" height="16" />
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">تم رفع درجاتك الجديدة</p>
                        <p className="notification-time">منذ 5 دقائق</p>
                      </div>
                    </div>

                    <div className="notification-item unread">
                      <div className="notification-icon">
                        <img src={MessageIcon} alt="Message" width="16" height="16" />
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">رسالة جديدة من ولي الأمر</p>
                        <p className="notification-time">منذ 20 دقيقة</p>
                      </div>
                    </div>

                    <div className="notification-item">
                      <div className="notification-icon">
                        <img src={CalendarIcon} alt="Calendar" width="16" height="16" />
                      </div>
                      <div className="notification-content">
                        <p className="notification-title">تذكير بالواجب المنزلي</p>
                        <p className="notification-time">منذ ساعة</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* عرض أزرار تسجيل الدخول وإنشاء الحساب للمستخدمين غير المسجلين */
            <div className="auth-buttons">
              <button 
                className="login-btn"
                onClick={() => router.push('/auth')}
              >
                تسجيل الدخول
              </button>
              <button 
                className="signup-btn"
                onClick={() => router.push('/auth')}
              >
                إنشاء حساب
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;