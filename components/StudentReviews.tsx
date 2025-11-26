'use client';

import React, { useState, useEffect } from 'react';
import { getCourseReviews, submitCourseReview, getMyEnrollments, Review } from '../utils/courseService';
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
  courseId?: number | string;
  reviews?: ReviewData[];
  overallRating?: number;
  totalReviews?: number;
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const StudentReviews: React.FC<StudentReviewsProps> = ({
  courseId,
  reviews: providedReviews,
  overallRating = 0,
  totalReviews = 0,
  ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
}) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    message: '',
    name: ''
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [actualRatingDistribution, setActualRatingDistribution] = useState(ratingDistribution);
  const [actualOverallRating, setActualOverallRating] = useState(overallRating);
  const [actualTotalReviews, setActualTotalReviews] = useState(totalReviews);

  // Load reviews and check enrollment status
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        let formattedReviews: ReviewData[] = [];

        if (providedReviews && providedReviews.length > 0) {
          formattedReviews = providedReviews;
        } else if (courseId !== undefined && courseId !== null) {
          const apiReviews = await getCourseReviews(courseId);

          const mapped: ReviewData[] = apiReviews.map((review: Review) => ({
            id: review.id.toString(),
            name: review.user.name,
            avatar: '/profile.jpg',
            rating: review.rating,
            date: new Date(review.created_at).toLocaleDateString('ar-EG'),
            message: review.comment
          }));

          formattedReviews = mapped;
        }

        setReviews(formattedReviews);

        const totalCount = formattedReviews.length;
        const avgRating = totalCount > 0
          ? formattedReviews.reduce((sum, review) => sum + review.rating, 0) / totalCount
          : 0;

        const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        formattedReviews.forEach(review => {
          distribution[review.rating as keyof typeof distribution]++;
        });

        setActualTotalReviews(totalCount);
        setActualOverallRating(Math.round(avgRating * 10) / 10);
        setActualRatingDistribution(distribution);

        if (courseId !== undefined && courseId !== null) {
          const enrollmentsResponse = await getMyEnrollments();
          const enrollments = enrollmentsResponse.data;
          setIsEnrolled(enrollments.some(course => course.id === Number(courseId)));
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error('Error loading reviews data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, providedReviews]);

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
    return actualTotalReviews > 0 ? (count / actualTotalReviews) * 100 : 0;
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newReview.message.trim() || newReview.rating === 0) {
      alert('يرجى ملء جميع الحقول واختيار التقييم');
      return;
    }

    if (!isEnrolled) {
      alert('يجب أن تكون مشتركاً في الكورس لكتابة تقييم');
      return;
    }

    // Ensure courseId is present before submitting
    if (courseId === undefined || courseId === null) {
      alert('لا يمكن إرسال التقييم بدون معرف الكورس');
      return;
    }

    try {
      setSubmitting(true);

      const reviewData = {
        rating: newReview.rating,
        comment: newReview.message
      };

      const submittedReview = await submitCourseReview(courseId, reviewData);

      if (submittedReview) {
        // Add the new review to the list
        const newReviewData: ReviewData = {
          id: submittedReview.id.toString(),
          name: submittedReview.user.name,
          avatar: '/profile.jpg',
          rating: submittedReview.rating,
          date: new Date(submittedReview.created_at).toLocaleDateString('ar-EG'),
          message: submittedReview.comment
        };

        const updatedReviews = [newReviewData, ...reviews];
        setReviews(updatedReviews);

        // Update statistics
        const newTotalReviews = updatedReviews.length;
        const newAvgRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0) / newTotalReviews;

        const newDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        updatedReviews.forEach(review => {
          newDistribution[review.rating as keyof typeof newDistribution]++;
        });

        setActualTotalReviews(newTotalReviews);
        setActualOverallRating(Math.round(newAvgRating * 10) / 10);
        setActualRatingDistribution(newDistribution);

        // Reset form
        setNewReview({ rating: 0, message: '', name: '' });
        setShowReviewForm(false);
        setHoveredRating(0);

        alert('تم إرسال التقييم بنجاح!');
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      alert(error.message || 'حدث خطأ أثناء إرسال التقييم');
    } finally {
      setSubmitting(false);
    }
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
      {loading ? (
        <div className="loading-message">جاري تحميل التقييمات...</div>
      ) : (
        <>
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
                        width: `${getPercentage(actualRatingDistribution[stars as keyof typeof actualRatingDistribution])}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column - Overall Rating */}
            <div className="overall-rating">
              <div className="rating-card">
                <div className="rating-number">{actualOverallRating} من 5</div>
                <div className="rating-stars">
                  {renderStars(Math.floor(actualOverallRating), 'large')}
                </div>
                <div className="rating-label">
                  {actualTotalReviews > 0 ? `${actualTotalReviews} تقييم` : 'لا يوجد تقييمات'}
                </div>
              </div>
            </div>
          </div>

          {/* Add Review Section - Only show if enrolled */}
          {isEnrolled && (
            <div className="add-review-section">
              {!showReviewForm ? (
                <button
                  className="add-review-btn"
                  onClick={() => setShowReviewForm(true)}
                >
                  <svg className="add-icon" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  اكتب رأيك
                </button>
              ) : (
                <div className="review-form">
                  <h3>اكتب رأيك في الكورس</h3>
                  <form onSubmit={handleSubmitReview}>
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
                      <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? 'جاري الإرسال...' : 'نشر الرأي'}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => {
                          setShowReviewForm(false);
                          setNewReview({ rating: 0, message: '', name: '' });
                          setHoveredRating(0);
                        }}
                        disabled={submitting}
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* Reviews List Section */}
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="no-reviews-message">
                <p>لا يوجد آراء حتى الآن</p>
                {isEnrolled && <p>كن أول من يكتب رأيه في هذا الكورس!</p>}
              </div>
            ) : (
              reviews.map((review) => (
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
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentReviews;