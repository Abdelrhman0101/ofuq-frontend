'use client';

import React, { useState } from 'react';
import '../styles/student-reviews.css';

interface ReviewData {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  message: string;
}

interface StudentReviewsProps {
  overallRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  reviews: ReviewData[];
}

const StudentReviews: React.FC<StudentReviewsProps> = ({
  overallRating,
  totalReviews,
  ratingDistribution,
  reviews: initialReviews
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    message: '',
    name: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  const renderStars = (rating: number, size: 'small' | 'large' = 'small') => {
    const stars = [];
    const starSize = size === 'large' ? '24px' : '16px';
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`star ${i < rating ? 'filled' : 'empty'}`} 
          viewBox="0 0 24 24"
          style={{ width: starSize, height: starSize }}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return stars;
  };

  const renderInteractiveStars = (currentRating: number, onStarClick: (rating: number) => void, onStarHover: (rating: number) => void, onStarLeave: () => void) => {
    const stars = [];
    const displayRating = hoveredRating || currentRating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg 
          key={i} 
          className={`star interactive ${i <= displayRating ? 'filled' : 'empty'}`} 
          viewBox="0 0 24 24"
          style={{ width: '24px', height: '24px', cursor: 'pointer' }}
          onClick={() => onStarClick(i)}
          onMouseEnter={() => onStarHover(i)}
          onMouseLeave={onStarLeave}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return stars;
  };

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.name.trim() || !newReview.message.trim() || newReview.rating === 0) {
      alert('يرجى ملء جميع الحقول واختيار التقييم');
      return;
    }

    const review: ReviewData = {
      id: Date.now().toString(),
      name: newReview.name,
      avatar: '/profile.jpg', // Default avatar
      rating: newReview.rating,
      date: 'الآن',
      message: newReview.message
    };

    setReviews([review, ...reviews]);
    setNewReview({ rating: 0, message: '', name: '' });
    setShowReviewForm(false);
    setHoveredRating(0);
  };

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  return (
    <div className="student-reviews-container">
      {/* Rating Statistics Section */}
      <div className="rating-statistics">
        {/* Left Column - Rating Breakdown */}
        <div className="rating-breakdown">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="rating-row">
              <div className="rating-label">
                <span className="star-count">{stars} نجوم</span>
              </div>
              <div className="rating-bar-container">
                <div 
                  className="rating-bar"
                  style={{ 
                    width: `${getPercentage(ratingDistribution[stars as keyof typeof ratingDistribution])}%` 
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Overall Rating */}
        <div className="overall-rating">
          <div className="rating-card">
            <div className="rating-number">{overallRating} من 5</div>
            <div className="rating-stars">
              {renderStars(Math.floor(overallRating), 'large')}
            </div>
            <div className="rating-label">الأعلى تقييماً</div>
          </div>
        </div>
      </div>

      {/* Add Review Button */}
      <div className="add-review-section">
        {!showReviewForm ? (
          <button 
            className="add-review-btn"
            onClick={() => setShowReviewForm(true)}
          >
            <svg className="add-icon" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            اكتب رأيك
          </button>
        ) : (
          <div className="review-form">
            <h3>اكتب رأيك في الكورس</h3>
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>الاسم:</label>
                <input
                  type="text"
                  value={newReview.name}
                  onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="اكتب اسمك"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>التقييم:</label>
                <div className="rating-input">
                  {renderInteractiveStars(newReview.rating, handleStarClick, handleStarHover, handleStarLeave)}
                  <span className="rating-text">
                    {newReview.rating > 0 ? `${newReview.rating} من 5` : 'اختر التقييم'}
                  </span>
                </div>
              </div>
              
              <div className="form-group">
                <label>رأيك:</label>
                <textarea
                  value={newReview.message}
                  onChange={(e) => setNewReview(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="اكتب رأيك في الكورس..."
                  rows={4}
                  required
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-btn">
                  نشر الرأي
                </button>
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowReviewForm(false);
                    setNewReview({ rating: 0, message: '', name: '' });
                    setHoveredRating(0);
                  }}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Reviews List Section */}
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            <div className="reviewer-header">
              <img 
                src={review.avatar} 
                alt={review.name}
                className="reviewer-avatar"
              />
              <div className="reviewer-info">
                <h4 className="reviewer-name">{review.name}</h4>
                <div className="review-meta">
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                  <span className="review-date">{review.date}</span>
                </div>
              </div>
            </div>
            <p className="review-message">{review.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentReviews;