'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StudentReviews from './StudentReviews';
import InstructorProfile from './InstructorProfile';
import '../styles/student-reviews.css';

interface CourseContentProps {
  rating: number;
  courseTitle: string;
  lecturesCount: number;
  studentsCount: number;
  hoursCount: number;
  courseDescription?: string;
  courseId?: string;
  isEnrolled?: boolean;
  defaultExpandedChapterId?: number;
  activeLessonId?: number;
  chapters?: Array<{
    id: number;
    title: string;
    lessons?: Array<{
      id: number;
      title: string;
      video_url?: string | null;
    }>;
  }>;
  instructorName?: string;
  instructorImage?: string;
  instructorRating?: number;
  instructorCoursesCount?: number;
  instructorStudentsCount?: number;
  instructorTitle?: string;
  instructorBio?: string;
}

const CourseContent: React.FC<CourseContentProps> = ({
  rating,
  courseTitle,
  lecturesCount,
  studentsCount,
  hoursCount,
  courseDescription = '',
  courseId,
  isEnrolled = false,
  defaultExpandedChapterId,
  activeLessonId,
  chapters = [],
  instructorName = "",
  instructorImage = "/profile.jpg",
  instructorRating = 0,
  instructorCoursesCount = 0,
  instructorStudentsCount = 0,
  instructorTitle = "",
  instructorBio = ""
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});

  // Detect if we have real backend content (with numeric lesson IDs)
  const hasRealContent = Array.isArray(chapters) && chapters.length > 0 && chapters.some(ch => Array.isArray(ch.lessons) && ch.lessons.some(l => typeof l.id === 'number' && l.id > 0));

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <svg key={i} className="star" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <svg key={i} className="star" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#ddd" />
              </linearGradient>
            </defs>
            <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      } else {
        stars.push(
          <svg key={i} className="star empty" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      }
    }
    return stars;
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Expand default chapter if provided
  React.useEffect(() => {
    if (typeof defaultExpandedChapterId === 'number') {
      setExpandedSections(prev => ({
        ...prev,
        [`chapter-${defaultExpandedChapterId}`]: true
      }));
    }
  }, [defaultExpandedChapterId]);

  // إذا وصلت فصول من الـ API نستخدمها، وإلا fallback لبيانات توضيحية
  const contentSections =
    chapters && chapters.length > 0
      ? chapters.map((ch) => ({
          id: `chapter-${ch.id}`,
          title: ch.title,
          lessons: (ch.lessons || []).map((l) => ({
            id: l.id,
            title: l.title,
            video_url: l.video_url ?? null,
          })),
        }))
      : [
          {
            id: 'sample-1',
            title: 'محتوى تجريبي',
            lessons: ['درس تمهيدي', 'مقدمة عامة', 'التعرف على المحتوى'].map((t, i) => ({
              id: i + 1,
              title: t,
              video_url: null,
            })),
          },
        ];

  const handleLessonNavigate = (lessonId: number, chapterId?: number, canWatch?: boolean, isPreview?: boolean) => {
    // Prevent navigating for sample/fallback content
    if (!hasRealContent) {
      // محتوى تجريبي فقط، لا توجد دروس حقيقية للتشغيل
      return;
    }
    // لو المستخدم غير مشترك لكن فيه فيديو معاينة، نعرض المعاينة بدلاً من صفحة المشاهدة المحمية
    if (isPreview && !canWatch) {
      try {
        // تمرير المستخدم إلى أعلى الصفحة حيث قسم الفيديو (VideoSection)
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (e) {
        // في حال عدم توفر window لأي سبب
      }
      return;
    }
    if (!canWatch && courseId) {
      // إن لم يكن الطالب مشتركاً ولا توجد معاينة، نحوله للدفع
      router.push(`/checkout/${courseId}`);
      return;
    }
    const query = `lessonId=${lessonId}` + (chapterId ? `&chapterId=${chapterId}` : '') + (courseId ? `&courseId=${courseId}` : '');
    router.push(`/watch?${query}`);
  };



  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="tab-content">
            <h2>وصف الكورس :</h2>
            <p className="course-overview">{courseDescription || 'وصف الكورس غير متوفر حالياً.'}</p>
            {/* إزالة النص التجريبي واستبداله بالوصف الحقيقي فقط */}
            
            <h2>محتوى الكورس :</h2>
            <p className="course-content-subtitle">نحن هنا لمساعدتك والإجابة على أسئلتك</p>
            
            <div className="course-content-dropdowns">
              {contentSections.map((section, index) => (
                <div key={section.id} className="dropdown-section">
                  <button 
                    className={`dropdown-header ${expandedSections[section.id] ? 'expanded' : ''}`}
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="dropdown-title-container">
                      <span className="dropdown-number">0{index + 1}:34</span>
                      <span className="dropdown-title">{section.title}</span>
                    </div>
                    <svg 
                      className={`dropdown-arrow ${expandedSections[section.id] ? 'rotated' : ''}`} 
                      viewBox="0 0 24 24"
                    >
                      <path d="M7 10l5 5 5-5z"/>
                    </svg>
                  </button>
                  
                  {expandedSections[section.id] && (
                    <div className="dropdown-content">
                      {section.lessons.map((lesson, lessonIndex) => (
                        <div key={`lesson-${lesson.id}-${lessonIndex}`} className={`lesson-item ${activeLessonId === lesson.id ? 'active' : ''}`}>
                          <div className="lesson-info">
                            <span className="lesson-time">0{lessonIndex + 1}:34</span>
                            <span className="lesson-title">{lesson.title}</span>
                          </div>
                          <button
                            className="play-lesson-btn"
                            disabled={!hasRealContent}
                            onClick={() =>
                              handleLessonNavigate(
                                lesson.id,
                                Number(section.id.replace('chapter-', '')),
                                isEnrolled,
                                !isEnrolled && !!lesson.video_url
                              )
                            }
                          >
                            <svg viewBox="0 0 24 24" className="play-icon-small">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                            <span>{
                              hasRealContent
                                ? (isEnrolled
                                    ? 'مشاهدة'
                                    : (lesson.video_url ? 'معاينة' : 'اشترِ الآن'))
                                : 'قريباً'
                            }</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
          </div>
        );
      case 'reviews':
        return (
          <StudentReviews 
            courseId={courseId || ''}
          />
        );
      case 'instructor':
        return (
          <InstructorProfile 
            instructorName={instructorName}
            instructorImage={instructorImage}
            rating={instructorRating}
            coursesCount={instructorCoursesCount}
            studentsCount={instructorStudentsCount}
            title={instructorTitle}
            bio={instructorBio}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="left-content">
      {/* Rating Section */}
      <div className="rating-section">
        <span className="rating-number">({rating})</span>
        <div className="stars">
          {renderStars(rating)}
        </div>
      </div>

      {/* Course Title */}
      <h1 className="course-title">{courseTitle}</h1>

      {/* Course Stats */}
      <div className="course-stats">
        <div className="stat-item">
          <svg className="stat-icon" viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
          </svg>
          <span>{lecturesCount} محاضرة</span>
        </div>
        <div className="stat-item">
          <svg className="stat-icon" viewBox="0 0 24 24">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.5 7.5h-5A1.5 1.5 0 0 0 12.04 8.37L9.5 16H12v6h8zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-6H10l-2.54-7.63A1.5 1.5 0 0 0 6 7.5H1A1.5 1.5 0 0 0 -.46 8.37L-3 16h2.5v6h8z"/>
          </svg>
          <span>{studentsCount} طالب</span>
        </div>
        <div className="stat-item">
          <svg className="stat-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <span>{hoursCount} ساعة</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <div className="tabs-nav">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            نظرة عامة
          </button>
          <button 
            className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            آراء الطلاب
          </button>
          <button 
            className={`tab-button ${activeTab === 'instructor' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructor')}
          >
            المحاضر
          </button>
        </div>
        {getTabContent()}
      </div>

      <style jsx>{`
        .left-content {
          width: 100%;
          padding: 0 16px;
        }

        .rating-section {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 8px 0 12px;
        }

        .rating-number {
          color: #4142D0;
          font-weight: 600;
        }

        .stars .star {
          width: 18px;
          height: 18px;
        }
        .stars .star.empty {
          fill: #ddd;
        }

        .course-title {
          font-size: 24px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 8px 0 16px;
          text-align: right;
        }

        .course-stats {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
        }

        .stat-icon {
          width: 20px;
          height: 20px;
          fill: #4142D0;
        }

        .tabs-container {
          margin-top: 16px;
        }

        .tabs-nav {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
        }

        .tab-button {
          padding: 8px 12px;
          border: none;
          background: #f5f5f5;
          color: #333;
          border-radius: 6px;
          cursor: pointer;
        }

        .tab-button.active {
          background: #4142D0;
          color: #fff;
        }

        .tab-content {
          margin-top: 16px;
        }

        .course-overview {
          line-height: 1.8;
          color: #333;
          margin: 8px 0 16px;
          text-align: right;
          direction: rtl;
        }

        .course-content-subtitle {
          color: #666;
          margin-bottom: 12px;
        }

        .course-content-dropdowns {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dropdown-section {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: #fff;
        }

        .dropdown-header {
          background-color: #f8f9fa;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .dropdown-title-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .dropdown-number {
          background-color: #eef1ff;
          color: #4142D0;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          min-width: 48px;
          text-align: center;
        }

        .dropdown-title {
          color: #333;
          font-weight: 600;
        }

        .dropdown-arrow.rotated {
          transform: rotate(180deg);
        }

        .dropdown-content {
          position: static;
          padding: 8px 0;
        }

        .review-item {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .reviewer-info {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
        }
        
        .review-rating {
          display: flex;
          gap: 2px;
        }
        
        .review-rating .star {
          width: 16px;
          height: 16px;
        }
        
        .instructor-details h4 {
          color: #4142D0;
          margin: 20px 0 10px 0;
        }
        
        .instructor-details ul {
          padding-right: 20px;
          margin-bottom: 15px;
        }
        
        .instructor-details li {
          margin-bottom: 5px;
          color: #666;
        }

        .course-content-sections {
          margin-top: 20px;
        }

        .content-section {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          margin-bottom: 10px;
          overflow: hidden;
        }

        .section-header {
          background-color: #f8f9fa;
          padding: 15px 20px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background-color 0.2s;
        }

        .section-header:hover {
          background-color: #e9ecef;
        }

        .section-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .dropdown-arrow {
          width: 20px;
          height: 20px;
          fill: #666;
          transition: transform 0.2s;
        }

        .dropdown-arrow.expanded {
          transform: rotate(180deg);
        }

        .section-content {
          padding: 0;
        }

        .lesson-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-bottom: 1px solid #f0f0f0;
          background-color: white;
        }

        .lesson-item.active {
          background-color: #f0f7ff;
          border-right: 3px solid #4142D0;
        }

        .lesson-item:last-child {
          border-bottom: none;
        }

        .lesson-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .lesson-time {
          background-color: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
          min-width: 40px;
          text-align: center;
        }

        .lesson-duration {
          background-color: #f8f9fa;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #666;
          min-width: 40px;
          text-align: center;
        }

        .lesson-type {
          color: #4142D0;
          font-size: 14px;
          text-decoration: underline;
        }

        .play-icon {
          width: 16px;
          height: 16px;
          fill: #4142D0;
        }

        .play-lesson-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #eef1ff;
          color: #4142D0;
          border: none;
          border-radius: 6px;
          padding: 6px 10px;
          cursor: pointer;
        }

        .play-lesson-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .play-icon-small {
          width: 16px;
          height: 16px;
          fill: #4142D0;
        }

        .lesson-title {
          color: #333;
          font-size: 14px;
          text-align: right;
          flex: 1;
        }

        .lesson-item.active .lesson-title {
          color: #1a237e;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default CourseContent;