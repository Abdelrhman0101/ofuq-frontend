import React from 'react';

interface CourseCardProps {
  id: string;
  title: string;
  image: string;
  category: string;
  rating: number;
  studentsCount: number;
  duration: string;
  lessonsCount: number;
  instructorName: string;
  instructorAvatar: string;
  price: number;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  image,
  category,
  rating,
  studentsCount,
  duration,
  lessonsCount,
  instructorName,
  instructorAvatar,
  price
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="star" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="star" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#FFD700"/>
              <stop offset="50%" stopColor="#e0e0e0"/>
            </linearGradient>
          </defs>
          <path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="star" viewBox="0 0 24 24" fill="#e0e0e0">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      );
    }

    return stars;
  };

  return (
    <div className="course-card">
      <div className="course-image-container">
        <img src={image} alt={title} className="course-image" />
        <div className="gamification-overlay">
          <img src="/gamification-creative-collage-concept.jpg" alt="Gamification" className="gamification-bg" />
        </div>
        <div className="course-category">{category}</div>
      </div>
      
      <div className="course-content">
        <div className="course-rating">
          <span className="rating-number">({rating})</span>
          <div className="stars">
            {renderStars(rating)}
          </div>
        </div>
        
        <h3 className="course-title">{title}</h3>
        
        <div className="course-stats-line">
          <div className="stat-item">
            <svg className="stat-icon" viewBox="0 0 24 24">
              <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4v2h2l2.54-3.4L16.5 18H20z"/>
            </svg>
            <span>{studentsCount} طالب</span>
          </div>
          <div className="stat-item">
            <svg className="stat-icon" viewBox="0 0 24 24">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
            </svg>
            <span>{duration}</span>
          </div>
          <div className="stat-item">
            <svg className="stat-icon" viewBox="0 0 24 24">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span>{lessonsCount} درس</span>
          </div>
        </div>
        
        <div className="stats-separator"></div>
        
        <div className="instructor-info">
          <img src={instructorAvatar} alt={instructorName} className="instructor-avatar" />
          <span className="instructor-name">{instructorName}</span>
        </div>
        
        <div className="course-footer">
          <div className="course-price">
            <span className="currency">ج.م</span>
            {price}
          </div>
          
          <div className="enroll-section">
            <span className="enroll-text">
              سجل الآن
            </span>
            <div className="enroll-arrow">
              <svg viewBox="0 0 24 24">
                <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;