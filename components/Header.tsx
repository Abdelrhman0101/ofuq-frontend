'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
  };

  const handleLogout = () => {
    // يمكن إضافة منطق تسجيل الخروج هنا
    router.push('/auth');
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
          {/* قائمة البروفايل */}
          <div className="profile-menu-container" onClick={toggleProfileMenu} ref={profileMenuRef}>
            <div className="profile-info">
              <div className="profile-avatar">
                <img src="/profile.jpg" alt="Profile" className="profile-image" />
              </div>
              <div className="profile-details">
                <span className="profile-name">أحمد محمد</span>
                
              </div>
            </div>

            {/* قائمة البروفايل المنسدلة */}
            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <div className="profile-dropdown-header">
                  <div className="profile-dropdown-avatar">
                    <img src="/profile.jpg" alt="Profile" className="dropdown-profile-image" />
                  </div>
                  <div className="profile-dropdown-info">
                    <h4>أحمد محمد</h4>
                    <p>ahmed@example.com</p>
                  </div>
                </div>
                
                <div className="profile-dropdown-items">
                  <div className="profile-dropdown-item" onClick={handleProfileManagement}>
                    <img src={UserProfileIcon} alt="Profile Management" width="16" height="16" />
                    <span>إدارة الملف الشخصي</span>
                  </div>
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
        </div>
      </div>
    </header>
  );
};

export default Header;