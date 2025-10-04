'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/profile-header.css';

const ProfileHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const closeProfileDropdown = () => {
    setIsProfileDropdownOpen(false);
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
            <Link href="/" className="nav-link1 active">الرئيسية</Link>
            <Link href="/courses" className="nav-link1">برامجنا التدريبية</Link>
            <Link href="/favorites" className="nav-link1">المفضلة</Link>
            <Link href="/about" className="nav-link1">عنّا</Link>
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

          {/* Profile Image */}
          <div className="header-profile">
            <button 
              className="profile-button"
              onClick={toggleProfileDropdown}
              aria-label="فتح قائمة الملف الشخصي"
            >
              <Image 
                src="/profile.jpg" 
                alt="الملف الشخصي" 
                width={40} 
                height={40}
                className="profile-image1"
              />
            </button>
            
            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-overlay" onClick={closeProfileDropdown}></div>
                <div className="dropdown-content">
                  <Link 
                    href="/user/settings" 
                    className="dropdown-item"
                    onClick={closeProfileDropdown}
                  >
                    إدارة الحساب الشخصي
                  </Link>
                  <Link 
                    href="/user" 
                    className="dropdown-item"
                    onClick={closeProfileDropdown}
                  >
                    إدارة الكورسات
                  </Link>
                  <Link 
                    href="/auth" 
                    className="dropdown-item logout"
                    onClick={closeProfileDropdown}
                  >
                    تسجيل الخروج
                  </Link>
                </div>
              </div>
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
            <Link href="/" className="sidebar-link active" onClick={closeSidebar}>الرئيسية</Link>
            <Link href="/courses" className="sidebar-link" onClick={closeSidebar}>برامجنا التدريبية</Link>
            <Link href="/favorites" className="sidebar-link" onClick={closeSidebar}>المفضلة</Link>
            <Link href="/about" className="sidebar-link" onClick={closeSidebar}>عنّا</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;