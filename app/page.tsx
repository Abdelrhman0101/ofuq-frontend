'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import HomeHeader from '../components/HomeHeader';
import HeroSection from '../components/HeroSection';
import DiplomaCard from '../components/DiplomaCard';
import ValuesSection from '../components/ValuesSection';
import TestimonialsSlider from '../components/TestimonialsSlider';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import SocialMediaFloat from '../components/SocialMediaFloat';
import WorldUsersMap from '../components/WorldUsersMap';
import { getPublicDiplomas, Diploma } from '../utils/categoryService';
import { getBackendAssetUrl } from '../utils/url';
import '../styles/contact-section.css';

export default function HomePage() {
  const [featuredDiplomas, setFeaturedDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedDiplomas = async () => {
      try {
        setLoading(true);
        const diplomas = await getPublicDiplomas();
        setFeaturedDiplomas((diplomas || []).slice(0, 3)); // عرض 3 دبلومات فقط
      } catch (err) {
        console.error('Error loading featured diplomas:', err);
        setError('فشل في تحميل الدبلومات');
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedDiplomas();
  }, []);

  // تحويل بيانات الدبلومة لتتوافق مع خصائص DiplomaCard
  const transformDiplomaData = (diploma: Diploma) => {
    if (!diploma?.id) {
      console.warn('Diploma without valid ID found:', diploma);
      return null;
    }

    const coverImage = getBackendAssetUrl(diploma.cover_image_url || '') || '/banner.jpg';

    return {
      id: diploma.id.toString(),
      name: diploma.name || 'اسم غير متوفر',
      description: diploma.description || '',
      image: coverImage,
      price: Number(diploma?.price ?? 0),
      isFree: Boolean(diploma.is_free),
      slug: diploma.slug,
      coursesCount: diploma.courses_count || 0,
    };
  };

  return (
    <div className="home-page">
      <HomeHeader />
      <HeroSection />
      
      <main>
        {/* World Users Map Section */}
        <WorldUsersMap />
        {/* Popular Diplomas Section */}
        <section className="popular-courses-section">
          <div className="popular-courses-container">
            <div className="popular-courses-header">
              <div className="popular-courses-left">
                <div className="popular-badge">برامجنا المميزة</div>
                <h2 className="popular-title">اكتشف مجموعة واسعة من الدبلومات التعليمية</h2>
              </div>
              <Link href="/diploms" className="view-all-btn">
                عرض الكل
                <div className="arrow-circle">
                  <svg viewBox="0 0 24 24">
                    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                  </svg>
                </div>
              </Link>
            </div>
            
            <div className="courses-grid">
              {loading ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  جاري تحميل الدبلومات...
                </div>
              ) : error ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#e74c3c' }}>
                  {error}
                </div>
              ) : featuredDiplomas.length > 0 ? (
                featuredDiplomas
                  .map(transformDiplomaData)
                  .filter((diploma) => diploma !== null)
                  .map((diploma: any) => (
                    <DiplomaCard key={diploma.id} {...diploma} />
                  ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                  لا توجد دبلومات مميزة حالياً
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