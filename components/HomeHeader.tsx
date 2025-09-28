'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '../styles/home-header.css';

const HomeHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="home-header">
        <div className="header-container">
          {/* Logo and Navigation Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
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

            {/* Desktop Navigation Links */}
            <nav className="header-nav desktop-nav">
              <Link href="/about" className="nav-link">عنّا</Link>
              <Link href="/courses" className="nav-link">برامجنا التدريبية</Link>
              <Link href="/" className="nav-link active">الرئيسية</Link>
            </nav>
          </div>

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

          {/* Auth Buttons */}
          <div className="header-auth">
            <button className="auth-btn login-btn">تسجيل دخول</button>
            <button className="auth-btn signup-btn">إنشاء حساب</button>
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
            <Link href="/about" className="sidebar-link" onClick={closeSidebar}>عنّا</Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default HomeHeader;