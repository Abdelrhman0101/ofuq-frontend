'use client';

import React, { useState, useEffect } from 'react';
import HomeHeader from '../components/HomeHeader';
import HeroSection from '../components/HeroSection';
import CourseCard from '../components/CourseCard';
import ValuesSection from '../components/ValuesSection';
import TestimonialsSlider from '../components/TestimonialsSlider';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialMediaFloat from '../components/SocialMediaFloat';
import { getFeaturedCourses, Course } from '../utils/courseService';
import { getBackendAssetUrl } from '../utils/url';
import '../styles/contact-section.css';

export default function HomePage() {
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        setLoading(true);
        const courses = await getFeaturedCourses();
        setFeaturedCourses(courses);
      } catch (err) {
        console.error('Error loading featured courses:', err);
        setError('فشل في تحميل الكورسات المميزة');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedCourses();
  }, []);

  // Transform API course data to match CourseCard props
  const transformCourseData = (course: Course) => {
    // Skip courses without valid ID
    if (!course?.id) {
      console.warn('Course without valid ID found:', course);
      return null;
    }
    
    const coverRaw = (course as any).cover_image_url || course.cover_image || '';
    const instructorRaw = (course?.instructor as any)?.image || (course?.instructor as any)?.profileImage || '';
    const image = getBackendAssetUrl(coverRaw || instructorRaw) || '/banner.jpg';
    const instructorAvatar = getBackendAssetUrl(instructorRaw) || '/profile.jpg';

    return {
      id: course.id.toString(),
      title: course.title || 'عنوان غير متوفر',
      image,
      category: course?.category?.name || 'عام',
      rating: parseFloat(String(course.rating ?? '4.5')),
      studentsCount: course.students_count || 0,
      duration: course.duration ? `${course.duration} ساعة` : '30 ساعة',
      lessonsCount: course.chapters_count || 0,
      instructorName: course?.instructor?.name || 'مدرب',
      instructorAvatar,
      price: Number(course?.price ?? '0')
    };
  };

  return (
    <div className="home-page">
      <HomeHeader />
      <HeroSection />
      
      <main>
        {/* Popular Courses Section */}
        <section className="popular-courses-section">
          <div className="popular-courses-container">
            <div className="popular-courses-header">
              <div className="popular-courses-left">
                <div className="popular-badge">برامجنا المميزة</div>
                <h2 className="popular-title">اكتشف مجموعة واسعة من الكورسات التعليمية</h2>
              </div>
              <button className="view-all-btn">
                عرض الكل
                <div className="arrow-circle">
                  <svg viewBox="0 0 24 24">
                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                  </svg>
                </div>
              </button>
            </div>
            
            <div className="courses-grid">
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  جاري تحميل الكورسات المميزة...
                </div>
              ) : error ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                  {error}
                </div>
              ) : featuredCourses.length > 0 ? (
                featuredCourses
                  .map(transformCourseData)
                  .filter(course => course !== null)
                  .map((course) => (
                    <CourseCard key={course.id} {...course} />
                  ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  لا توجد كورسات مميزة حالياً
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Values Section */}
        <ValuesSection />
        
        {/* Testimonials Section */}
        <TestimonialsSlider />
        
        {/* Contact Section */}
        <section className="contact-section" aria-labelledby="contact-heading">
          <div className="contact-container">
            <div className="contact-logo" aria-hidden="true">
              <img src="/mahad_alofk2.png" alt="منصة أفق للتعليم عن بعد" />
            </div>
            <div className="contact-content">
              <h2 id="contact-heading" className="contact-title">تواصل معنا</h2>
              <p className="contact-subtitle">نحن هنا لمساعدتك في رحلتك التعليمية</p>

              <div className="contact-info" role="list">
                <div className="contact-item" role="listitem">
                  <span className="contact-icon" aria-hidden="true">📧</span>
                  <div className="contact-texts">
                    <span className="contact-label">البريد الإلكتروني</span>
                    <a className="contact-link" href="mailto:info@ofoq.academy">info@ofoq.academy</a>
                  </div>
                </div>

                <div className="contact-item" role="listitem">
                  <span className="contact-icon" aria-hidden="true">📱</span>
                  <div className="contact-texts">
                    <span className="contact-label">الجوال</span>
                    <a className="contact-link" href="tel:+966501234567">+966 50 123 4567</a>
                  </div>
                </div>

                <div className="contact-item" role="listitem">
                  <span className="contact-icon" aria-hidden="true">💬</span>
                  <div className="contact-texts">
                    <span className="contact-label">واتساب</span>
                    <a className="contact-link" href="https://wa.me/966501234567" target="_blank" rel="noopener noreferrer">راسلنا على واتساب</a>
                  </div>
                </div>
              </div>

              <div className="contact-actions">
                <a className="contact-btn primary" href="mailto:info@ofoq.academy">إرسال بريد</a>
                <a className="contact-btn outline" href="/about">اعرف أكثر عنا</a>
              </div>

              <div className="contact-meta">
                <span>أوقات العمل: يومياً 9 ص - 6 م</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      
      {/* Floating Components */}
      <ScrollToTop />
      <SocialMediaFloat />
    </div>
  );
}