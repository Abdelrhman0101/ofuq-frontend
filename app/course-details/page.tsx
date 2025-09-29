'use client';

import React from 'react';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import VideoSection from '../../components/VideoSection';
import CourseSidebar from '../../components/CourseSidebar';
import CourseContent from '../../components/CourseContent';
import CourseCard from '../../components/CourseCard';
import ScrollToTop from '../../components/ScrollToTop';
import SocialMediaFloat from '../../components/SocialMediaFloat';
import '../../styles/course-details.css';
import '../../styles/course-cards.css';
import '../../styles/floating-components.css';

const CourseDetailsPage = () => {
  // Sample data - in a real app, this would come from props or API
  const courseData = {
    videoThumbnail: "/gamification-creative-collage-concept.jpg",
    videoUrl: "/sample-video.mp4", // You would replace this with actual video URL
    courseImage: "/gamification-creative-collage-concept.jpg",
    currentPrice: 1000,
    originalPrice: 2000,
    discount: "خصم 50%",
    instructorName: "نبيل محمد",
    instructorImage: "/profile.jpg",
    rating: 4.7,
    courseTitle: "بيانات الأبحاث وتحليل الأعمال وعلوم البيانات",
    lecturesCount: 32,
    studentsCount: 20,
    hoursCount: 30
  };

  // بيانات الدورات الشعبية
  const popularCourses = [
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
    <div className="course-details-page">
      <HomeHeader />
      
      <main className="main-content">
        <div className="course-details-container">
          {/* Left Content */}
          <div className="left-section">
            <VideoSection 
              thumbnailUrl={courseData.videoThumbnail}
              videoUrl={courseData.videoUrl}
              alt="Course Preview Video"
            />
            <CourseContent 
              rating={courseData.rating}
              courseTitle={courseData.courseTitle}
              lecturesCount={courseData.lecturesCount}
              studentsCount={courseData.studentsCount}
              hoursCount={courseData.hoursCount}
            />
          </div>

          {/* Right Sidebar */}
          <CourseSidebar 
            courseImage={courseData.courseImage}
            currentPrice={courseData.currentPrice}
            originalPrice={courseData.originalPrice}
            discount={courseData.discount}
            instructorName={courseData.instructorName}
            instructorImage={courseData.instructorImage}
          />
        </div>
      </main>
      
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
            {popularCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>
      
      <Footer />
      
      {/* Floating Components */}
      <ScrollToTop />
      <SocialMediaFloat />
      
      <style jsx>{`
        .course-details-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .main-content {
          flex: 1;
          background-color: #f8f9fa;
        }
        
        .left-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
      `}</style>
    </div>
  );
};

export default CourseDetailsPage;