'use client';
import React, { useState } from 'react';
import '../styles/header.css';

const DropdownArrow = '/icons/dropdown-arrow.svg';
const UserProfileIcon = '/icons/user-profile.svg';
const AccountSettingsIcon = '/icons/account-settings.svg';
const LogoutIcon = '/icons/logout.svg';
const NotificationIcon = '/icons/notification.svg';
const NewBadgeIcon = '/icons/new-badge.svg';
const MessageIcon = '/icons/message.svg';
const CalendarIcon = '/icons/calendar.svg';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    // وظيفة تسجيل الخروج
    console.log('تسجيل الخروج');
    // يمكن إضافة منطق تسجيل الخروج هنا
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* جزء فارغ للتوازن */}
        <div className="header-left"></div>
        
        {/* أيقونة الإشعارات وجزء المستخدم */}
        <div className="header-right">
          <div className="user-profile" onClick={toggleDropdown}>
            <img
              src={DropdownArrow}
              alt="Dropdown Arrow"
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
              width="16"
              height="16"
            />
            <img
              src="/profile.jpg"
              alt="صورة المستخدم"
              className="user-avatar"
            />
          </div>

          {/* القائمة المنسدلة للمستخدم */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <img src={UserProfileIcon} alt="User Profile" width="16" height="16" />
                <span>الملف الشخصي</span>
              </div>

              <div className="dropdown-item">
                <img src={AccountSettingsIcon} alt="Account Settings" width="16" height="16" />
                <span>إعدادات الحساب</span>
              </div>

              <div className="dropdown-divider"></div>

              <div className="dropdown-item logout" onClick={handleLogout}>
                <img src={LogoutIcon} alt="Logout" width="16" height="16" />
                <span>تسجيل الخروج</span>
              </div>
            </div>
          )}

          <div className="notifications-icon" onClick={toggleNotifications}>
            <img src={NotificationIcon} alt="Notifications" width="24" height="24" />
            <span className="notification-badge">3</span>
          </div>

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
    </header>
  );
};

export default Header;