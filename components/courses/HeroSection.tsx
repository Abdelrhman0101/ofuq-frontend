'use client';
import React from 'react';
import { Course } from '@/types/course';
import '../../styles/courses.css';

interface HeroSectionProps {
  courses: Course[];
  courseFilter: 'all' | 'published' | 'draft';
  setCourseFilter: React.Dispatch<React.SetStateAction<'all' | 'published' | 'draft'>>;
  setShowCreateCourse: React.Dispatch<React.SetStateAction<boolean>>;
  showCreateCourse: boolean;
  viewMode: 'cards' | 'list';
  setViewMode: React.Dispatch<React.SetStateAction<'cards' | 'list'>>;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  courses,
  courseFilter,
  setCourseFilter,
  setShowCreateCourse,
  showCreateCourse,
  viewMode,
  setViewMode,
}) => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-main">
          <div className="hero-text">
            <div className="hero-icon-container">
              <div className="hero-icon-bg"></div>
            </div>
            <h1 className="hero-title">
              📚 إدارة الدورات التعليمية
            </h1>
            <p className="hero-subtitle">منصة شاملة لإدارة وتنظيم دورات المنصة التعليمية بطريقة احترافية ومبتكرة - معهد أفق للتعليم عن بعد</p>
            <div className="hero-stats">
              <div 
                className={`hero-stat ${courseFilter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setCourseFilter('all');
                  setShowCreateCourse(false);
                }}
              >
                <span className="hero-stat-text">{courses.length} دورة متاحة</span>
              </div>
              <div 
                className={`hero-stat ${courseFilter === 'draft' ? 'active' : ''}`}
                onClick={() => {
                  setCourseFilter('draft');
                  setShowCreateCourse(false);
                }}
              >
                <span className="hero-stat-text">{courses.filter(c => c.status === 'draft').length} مسودة</span>
              </div>
              <div 
                className={`hero-stat ${courseFilter === 'published' ? 'active' : ''}`}
                onClick={() => {
                  setCourseFilter('published');
                  setShowCreateCourse(false);
                }}
              >
                <span className="hero-stat-text">{courses.filter(c => c.status === 'published').length} منشورة</span>
              </div>
            </div>
            
            {/* صف الأزرار - إنشاء كورس جديد وأزرار العرض */}
            <div className="hero-actions-row">
              {/* زر إنشاء كورس جديد مع زر الإغلاق */}
              <div className="hero-create-section">
                <div 
                  className="hero-create-btn"
                  onClick={() => {
                    setShowCreateCourse(true);
                    setCourseFilter('all');
                  }}
                >
                  <span className="hero-create-icon">➕</span>
                  <span className="hero-create-text">إنشاء كورس جديد</span>
                </div>
                

              </div>
              
              {/* أزرار عرض الكورسات */}
              <div className="view-mode-selector">
                <button 
                  className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="عرض البطاقات"
                >
                  <svg className="view-mode-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z"/>
                  </svg>
                  <span className="view-mode-text">عرض البطاقات</span>
                </button>
                <button 
                  className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="عرض القائمة"
                >
                  <svg className="view-mode-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>
                  </svg>
                  <span className="view-mode-text">عرض القائمة</span>
                </button>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-circle">
              <img src="/online-lesson_17905187.gif" alt="Online Learning" className="hero-gif" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;