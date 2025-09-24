import React from 'react';
import HomeHeader from '../../components/HomeHeader';
import HeroSection from '../../components/HeroSection';
import CourseCard from '../../components/CourseCard';
import ValuesSection from '../../components/ValuesSection';
import TestimonialsSlider from '../../components/TestimonialsSlider';
import Footer from '../../components/Footer';
import './home-header.css';
import '../../styles/course-cards.css';
import '../../styles/contact-section.css';

export default function HomePage() {
  // بيانات وهمية للكورسات
  const dummyCourses = [
    {
      id: '1',
      title: 'بيانات الإحصاء وتحليل الأعمال وعلوم البيانات',
      image: '/assets/gamification-creative-collage-concept.jpg',
      category: 'Development',
      rating: 4.7,
      studentsCount: 330,
      duration: '30 ساعة',
      lessonsCount: 20,
      instructorName: 'سارة محمد',
      instructorAvatar: '/profile.jpg',
      price: 1300
    },
    {
      id: '2',
      title: 'بيانات الإحصاء وتحليل الأعمال وعلوم البيانات',
      image: '/assets/gamification-creative-collage-concept.jpg',
      category: 'Development',
      rating: 4.7,
      studentsCount: 330,
      duration: '30 ساعة',
      lessonsCount: 20,
      instructorName: 'سارة محمد',
      instructorAvatar: '/profile.jpg',
      price: 1300
    },
    {
      id: '3',
      title: 'بيانات الإحصاء وتحليل الأعمال وعلوم البيانات',
      image: '/assets/gamification-creative-collage-concept.jpg',
      category: 'Development',
      rating: 4.7,
      studentsCount: 330,
      duration: '30 ساعة',
      lessonsCount: 20,
      instructorName: 'سارة محمد',
      instructorAvatar: '/profile.jpg',
      price: 1300
    }
  ];

  return (
    <div className="home-page">
      <HomeHeader />
      <HeroSection />
      
      {/* Popular Courses Section */}
      <section className="popular-courses-section">
        <div className="popular-courses-container">
          <div className="popular-courses-header">
            <div className="popular-courses-left">
              <div className="popular-badge">الأكثر شعبية</div>
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
          <h2 className="popular-title">برامجنا المميزة</h2>
          
          <div className="courses-grid">
            {dummyCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Values Section */}
      <ValuesSection />
      
      {/* Testimonials Section */}
      <TestimonialsSlider />
      
      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <div className="contact-logo">
            <img src="/mahad_alofk2.png" alt="معهد الأفق للتعليم عن بعد" />
          </div>
          <div className="contact-content">
            <h3 className="contact-title">تواصل معنا</h3>
            <div className="contact-form">
              <input 
                type="email" 
                placeholder="اكتب إيميلك هنا"
                className="contact-input"
              />
              <button className="contact-submit-btn">
                إرسال
              </button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Main Content */}
      <main className="main-content">
        
      </main>
      
      <Footer />
    </div>
  );
}