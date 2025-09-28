'use client';

import React from 'react';

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
  reviews
}) => {
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

  const getPercentage = (count: number) => {
    return totalReviews > 0 ? (count / totalReviews) * 100 : 0;
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

      <style jsx>{`
        .student-reviews-container {
          background-color: #019EBB3D;
          padding: 30px;
          border-radius: 12px;
          direction: rtl;
        }

        .rating-statistics {
          display: flex;
          gap: 40px;
          margin-bottom: 40px;
          align-items: flex-start;
        }

        .rating-breakdown {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .rating-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .rating-label {
          min-width: 80px;
        }

        .star-count {
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }

        .rating-bar-container {
          flex: 1;
          height: 8px;
          background-color: #e0e0e0;
          border-radius: 4px;
          overflow: hidden;
        }

        .rating-bar {
          height: 100%;
          background-color: #019EBB;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .overall-rating {
          flex: 0 0 200px;
        }

        .rating-card {
          background: white;
          padding: 25px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .rating-number {
          font-size: 28px;
          font-weight: bold;
          color: #333;
          margin-bottom: 10px;
        }

        .rating-stars {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-bottom: 10px;
        }

        .star.filled {
          fill: #ffd700;
        }

        .star.empty {
          fill: #ddd;
        }

        .rating-label {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 25px;
        }

        .review-item {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .reviewer-header {
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 15px;
        }

        .reviewer-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
        }

        .reviewer-info {
          flex: 1;
        }

        .reviewer-name {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin: 0 0 8px 0;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .review-rating {
          display: flex;
          gap: 2px;
        }

        .review-date {
          font-size: 12px;
          color: #666;
        }

        .review-message {
          font-size: 14px;
          line-height: 1.6;
          color: #555;
          margin: 0;
        }

        @media (max-width: 768px) {
          .rating-statistics {
            flex-direction: column;
            gap: 25px;
          }

          .overall-rating {
            flex: none;
          }

          .reviewer-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .review-meta {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentReviews;