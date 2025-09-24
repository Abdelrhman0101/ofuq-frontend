'use client';
import React, { useState, useEffect } from 'react';
import './HeroSection.css';

const HeroSection = () => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullText = 'مستقبلك';
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isDeleting && currentIndex < fullText.length) {
        setDisplayText(fullText.substring(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (isDeleting && currentIndex > 0) {
        setDisplayText(fullText.substring(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (!isDeleting && currentIndex === fullText.length) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && currentIndex === 0) {
        setIsDeleting(false);
      }
    }, isDeleting ? 100 : 200);

    return () => clearTimeout(timer);
  }, [currentIndex, isDeleting, fullText]);

  const studentProfiles = [
    '/profile.jpg',
    '/profile.jpg',
    '/profile.jpg',
    '/profile.jpg'
  ];

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Side Content */}
        <div className="hero-left">
          {/* Student Stats */}
          <div className="student-stats">
            <div className="stats-content">
              <span className="student-count">200+</span>
              <span className="student-label">طالب سعيد</span>
            </div>
            <div className="student-profiles">
              {studentProfiles.map((profile, index) => (
                <div key={index} className="profile-avatar" style={{zIndex: studentProfiles.length - index}}>
                  <img src={profile} alt={`Student ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Badge */}
          <div className="certificate-badge">
            تعلّم واحصل على الشهادات
          </div>

          {/* Main Title */}
          <div className="hero-title">
            <h1>
              تعلم مهارة جديدة وغيّر{' '}
              <span className="animated-text">
                {displayText}
                <span className="cursor">|</span>
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle">
            دروس مبسطة، محتوى عالي الجودة، ودعم مستمر لمساعدتك تحقق أهدافك
          </p>

          {/* Smart Search */}
          <div className="smart-search">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="ابحث عن..."
                className="search-input"
              />
              <button className="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side Content */}
        <div className="hero-right">
          <div className="hero-image-container">
            <img 
              src="/hero-image.png" 
              alt="Learning Illustration" 
              className="hero-image"
            />
            
            {/* Course Stats */}
            <div className="course-stats">
              <span className="course-count">300+</span>
              <span className="course-label">كورس ناجح</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;