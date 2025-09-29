'use client';

import React from 'react';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import VideoSection from '../../components/VideoSection';
import CourseContentCopy from '../../components/CourseContentCopy';
import ScrollToTop from '../../components/ScrollToTop';
import '../../styles/course-details.css';
import '../../styles/floating-components.css';

export default function WatchPage() {

  return (
    <div className="watch-page" style={{ width: '100%', minHeight: '100vh' }}>
      <HomeHeader />
      
      <main className="watch-main" style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
        {/* Video Section */}
        <div className="video-container" style={{ width: '100%' }}>
          <VideoSection 
            thumbnailUrl="/gamification-creative-collage-concept.jpg"
            videoUrl="/sample-video.mp4"
            alt="Course Video"
          />
          
          {/* Video Controls Bar */}
          <div className="video-controls-bar">
            <div className="controls-left">
              <button className="control-btn">
                <svg className="control-icon" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
              <button className="control-btn">
                <svg className="control-icon" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
              </button>
              <span className="time-display">00:00 / 45:30</span>
            </div>
            
            <div className="progress-container">
              <input 
                type="range" 
                className="progress-bar" 
                min="0" 
                max="100" 
                defaultValue="0"
              />
            </div>
            
            <div className="controls-right">
              <button className="control-btn">
                <svg className="control-icon" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
              <button className="control-btn">
                <svg className="control-icon" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Course Content Section */}
        <div className="course-content-section" style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
          <CourseContentCopy 
            rating={4.5}
            courseTitle="دورة تعلم التصميم الجرافيكي"
            lecturesCount={25}
            studentsCount={1500}
            hoursCount={15}
          />
        </div>
      </main>
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}