import { Course } from '../../types/course';
import { useState } from 'react';

interface CourseDetailsProps {
  course: Course;
  onClose: () => void;
  isClient: boolean;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course, onClose, isClient }) => {
  // State to manage which chapters are expanded
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  // Toggle chapter expansion
  const toggleChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  return (
    <div
      className="modern-course-details-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="modern-course-details-container">
        {/* Header Section */}
        <div className="modern-course-header">
          <button
            onClick={onClose}
            className="modern-close-btn"
            title="إغلاق (Esc)"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div className="modern-course-hero">
            <div className="modern-course-image-container">
              {course.coverImage ? (
                <img 
                  src={URL.createObjectURL(course.coverImage)} 
                  alt={course.title} 
                  className="modern-course-image" 
                />
              ) : (
                <div className="modern-course-placeholder">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                  </svg>
                </div>
              )}
            </div>
            
            <div className="modern-course-info">
              <div className="modern-status-badges">
                <div className={`modern-status-badge ${course.status}`}>
                  <span className="status-dot"></span>
                  {course.status === 'published' ? 'منشور' : 'مسودة'}
                </div>
                <div className="modern-category-badge">
                  كورس تعليمي
                </div>
              </div>
              
              <h1 className="modern-course-title">{course.title}</h1>
              <p className="modern-course-description">{course.description}</p>
              
              <div className="modern-course-stats">
                <div className="modern-stat-item">
                  <div className="stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">{course.chapters.length}</span>
                    <span className="stat-label">فصل</span>
                  </div>
                </div>
                
                <div className="modern-stat-item">
                  <div className="stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2"></polygon>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">
                      {course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}
                    </span>
                    <span className="stat-label">درس</span>
                  </div>
                </div>
                
                <div className="modern-stat-item">
                  <div className="stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number price-value">
                      {course.isFree ? 'مجاني' : `${course.price} ج.م`}
                    </span>
                    <span className="stat-label">السعر</span>
                  </div>
                </div>
                
                <div className="modern-stat-item">
                  <div className="stat-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-number">
                      {isClient ? course.createdAt.toLocaleDateString('ar-SA') : course.createdAt.toISOString().split('T')[0]}
                    </span>
                    <span className="stat-label">تاريخ الإنشاء</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="modern-course-content">
          <div className="modern-content-header">
            <h2>محتويات الكورس</h2>
            <div className="content-summary">
              {course.chapters.length > 0 ? (
                <span>{course.chapters.length} فصل • {course.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} درس</span>
              ) : (
                <span>لا يوجد محتوى متاح</span>
              )}
            </div>
          </div>
          
          {course.chapters.length > 0 ? (
            <div className="modern-chapters-list">
              {course.chapters.map((chapter, index) => (
                <div key={chapter.id} className="modern-chapter-card">
                  <div 
                    className="chapter-header clickable"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    <div className="chapter-number">
                      <span>{index + 1}</span>
                    </div>
                    <div className="chapter-info">
                      <h3 className="chapter-title">{chapter.title}</h3>
                      <p className="chapter-description">{chapter.description}</p>
                      <div className="chapter-meta">
                        <span className="lessons-count">{chapter.lessons.length} درس</span>
                      </div>
                    </div>
                    <div className="chapter-toggle">
                      <svg 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className={`dropdown-arrow ${expandedChapters.has(chapter.id) ? 'expanded' : ''}`}
                      >
                        <polyline points="6,9 12,15 18,9"></polyline>
                      </svg>
                    </div>
                  </div>
                  
                  {chapter.lessons.length > 0 && (
                    <div className={`modern-lessons-list ${expandedChapters.has(chapter.id) ? 'expanded' : 'collapsed'}`}>
                      {chapter.lessons.map((lesson, lessonIndex) => (
                        <div key={lesson.id} className="modern-lesson-item">
                          <div className="lesson-icon">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polygon points="5,3 19,12 5,21 5,3"></polygon>
                            </svg>
                          </div>
                          <div className="lesson-content">
                            <span className="lesson-title">الدرس {lessonIndex + 1}: {lesson.title}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="modern-empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
              <h3>لا يوجد محتوى</h3>
              <p>لم يتم إضافة أي فصول أو دروس لهذا الكورس بعد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;