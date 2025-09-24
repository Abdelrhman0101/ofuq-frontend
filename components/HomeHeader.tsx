'use client';

import React from 'react';
import Image from 'next/image';
import '../app/home/home-header.css';

const HomeHeader = () => {
  return (
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

          {/* Navigation Links */}
          <nav className="header-nav">
            <a href="#" className="nav-link">عنّا</a>
            <a href="#" className="nav-link">برامجنا التدريبية</a>
            <a href="#" className="nav-link active">الرئيسية</a>
          </nav>
        </div>

        {/* Auth Buttons */}
        <div className="header-auth">
          <button className="auth-btn login-btn">تسجيل دخول</button>
          <button className="auth-btn signup-btn">إنشاء حساب</button>
          
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;