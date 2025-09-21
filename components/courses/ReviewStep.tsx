import React from 'react';
import { Course } from '@/types/course';

interface ReviewStepProps {
  currentCourse: Course | null;
  onPrev: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  currentCourse,
  onPrev,
  onSaveDraft,
  onPublish,
}) => {
  if (!currentCourse) {
    return <div>لا يوجد كورس للمراجعة</div>;
  }

  const totalLessons = currentCourse.chapters?.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0) || 0;
  const totalAttachments = currentCourse.chapters?.reduce((total, chapter) =>
    total + (chapter.lessons?.reduce((lessonTotal, lesson) =>
      lessonTotal + (lesson.attachments?.length || 0), 0) || 0), 0) || 0;
  const totalVideos = currentCourse.chapters?.reduce((total, chapter) =>
    total + (chapter.lessons?.filter(lesson => lesson.videoFile).length || 0), 0) || 0;
  const totalQuestions = currentCourse.chapters?.reduce((total, chapter) =>
    total + (chapter.lessons?.reduce((lessonTotal, lesson) =>
      lessonTotal + (lesson.questions?.length || 0), 0) || 0), 0) || 0;

  return (
    <div className="course-creation-step review-step">
      <div className="review-container">
        <div className="review-header">
          <h2 className="review-title">مراجعة ونشر الكورس</h2>
          <p className="review-subtitle">
            تأكد من أن كل شيء يبدو جيدًا قبل نشر الكورس الخاص بك.
          </p>
        </div>

        {/* Course Info */}
        <div className="review-section">
          <div className="review-section-header">
            <h3 className="review-section-title">معلومات الكورس</h3>
          </div>
          <div className="review-info-grid">
            <div className="review-info-item">
              <span className="review-info-label">عنوان الكورس</span>
              <span className="review-info-value">{currentCourse.title}</span>
            </div>
            <div className="review-info-item">
              <span className="review-info-label">وصف الكورس</span>
              <span className="review-info-value">{currentCourse.description}</span>
            </div>
            <div className="review-info-item">
              <span className="review-info-label">السعر</span>
              <span className="review-info-value">
                {currentCourse.isFree ? 'مجاني' : `${currentCourse.price} جنية`}
              </span>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="review-section">
          <div className="review-section-header">
            <h3 className="review-section-title">محتوى الكورس</h3>
          </div>
          <div className="review-content-summary">
            {currentCourse.chapters.map((chapter, index) => (
              <div key={index} className="review-chapter-item">
                <div className="review-chapter-title">
                  {chapter.title}
                </div>
                <div className="review-chapter-lessons">
                  {chapter.lessons.map((lesson, lessonIndex) => (
                    <div key={lessonIndex} className="review-lesson-item">
                      {lesson.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Statistics */}
        <div className="review-section">
          <div className="review-section-header">
            <h3 className="review-section-title">إحصائيات الكورس</h3>
          </div>
          <div className="review-stats">
            <div className="review-stat-card">
              <div className="review-stat-number">{currentCourse.chapters?.length || 0}</div>
              <div className="review-stat-label">فصل</div>
            </div>
            <div className="review-stat-card">
              <div className="review-stat-number">{totalLessons}</div>
              <div className="review-stat-label">درس</div>
            </div>
            <div className="review-stat-card">
              <div className="review-stat-number">{totalVideos}</div>
              <div className="review-stat-label">فيديو</div>
            </div>
            <div className="review-stat-card">
              <div className="review-stat-number">{totalQuestions}</div>
              <div className="review-stat-label">سؤال</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="step-actions review-actions">
          <button onClick={onPrev} className="step-prev-btn">
            <span className="btn-icon">⬅️</span>
            العودة للتعديل
          </button>
          <button onClick={onSaveDraft} className="step-save-btn">
            حفظ كمسودة
          </button>
          <button onClick={onPublish} className="step-publish-btn">
            نشر الكورس
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;