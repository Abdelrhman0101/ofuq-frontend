'use client';
import React, { useMemo, useState } from 'react';
import { Course } from '@/types/course';
import { createCourse } from '@/utils/courseService';
import { getCurrentUser, getAuthToken, isAuthenticated } from '../../utils/authService';

interface ReviewStepProps {
  currentCourse: Course | null;
  courseBasicInfo: any;
  onPrev: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  currentCourse,
  courseBasicInfo,
  onPrev,
  onSaveDraft,
  onPublish,
}) => {
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);

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

  // توليد امتحان الكورس: سؤال عشوائي من كل درس
  const [examQuestions, setExamQuestions] = useState(() => {
    const questions: any[] = [];
    currentCourse.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        const qCount = lesson.questions?.length || 0;
        if (qCount > 0) {
          const idx = Math.floor(Math.random() * qCount);
          questions.push({ ...lesson.questions[idx], lessonTitle: lesson.title });
        }
      });
    });
    return questions;
  });

  const regenerateExam = () => {
    const questions: any[] = [];
    currentCourse.chapters.forEach((chapter) => {
      chapter.lessons.forEach((lesson) => {
        const qCount = lesson.questions?.length || 0;
        if (qCount > 0) {
          const idx = Math.floor(Math.random() * qCount);
          questions.push({ ...lesson.questions[idx], lessonTitle: lesson.title });
        }
      });
    });
    setExamQuestions(questions);
  };

  const handleSaveDraft = async () => {
    setIsCreatingCourse(true);
    try {
      if (currentCourse) {
        // ✅ ADD THIS MERGE LOGIC
        const finalPayload = {
          ...currentCourse,
          ...courseBasicInfo, // Merges title, description, instructor, category etc.
          instructor_id: courseBasicInfo.instructor?.id, // Explicitly add the IDs
          category_id: courseBasicInfo.category?.id,
          status: 'draft', // Set status for draft
          // Remove the full objects to avoid conflicts
          instructor: undefined,
          category: undefined,
          is_published: undefined, // Remove is_published field to avoid conflicts with status
          chaptersData: currentCourse.chapters?.map(chapter => ({
            title: chapter.title,
            description: chapter.description || '',
            order: chapter.order,
            lessons: chapter.lessons?.map(lesson => ({
              title: lesson.title,
              description: lesson.description || '',
              order: lesson.order,
              video_url: lesson.videoUrl || '',
              is_visible: lesson.isVideoPublic || false,
              resources: lesson.resources || [],
              questions: lesson.questions || []
            })) || []
          })) || []
        };

        // Now, send the complete payload to the service
        await createCourse(finalPayload);
        onSaveDraft();
      }
    } catch (error: any) {
      console.error('Error saving draft:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handlePublish = async () => {
    console.log('[ReviewStep] handlePublish called');
    console.log('[ReviewStep] currentCourse:', currentCourse);
    console.log('[ReviewStep] courseBasicInfo:', courseBasicInfo);
    
    // Check authentication status
    const isAuth = isAuthenticated();
    const currentUser = getCurrentUser();
    const authToken = getAuthToken();
    
    console.log('[ReviewStep] Authentication status:', {
      isAuthenticated: isAuth,
      currentUser: currentUser,
      hasToken: !!authToken,
      tokenLength: authToken?.length || 0
    });
    setIsCreatingCourse(true);
    try {
      if (currentCourse) {
        // ✅ ADD THIS MERGE LOGIC
        const finalPayload = {
          ...currentCourse,
          ...courseBasicInfo, // Merges title, description, instructor, category etc.
          instructor_id: courseBasicInfo.instructor?.id, // Explicitly add the IDs
          category_id: courseBasicInfo.category?.id,
          is_published: true, // Set is_published to true for published courses
          // Remove the full objects to avoid conflicts
          instructor: undefined,
          category: undefined,
          status: undefined, // Remove status field to avoid conflicts with is_published
          chaptersData: currentCourse.chapters?.map(chapter => ({
            title: chapter.title,
            description: chapter.description || '',
            order: chapter.order,
            lessons: chapter.lessons?.map(lesson => ({
              title: lesson.title,
              description: lesson.description || '',
              order: lesson.order,
              video_url: lesson.videoUrl || '',
              is_visible: lesson.isVideoPublic || false,
              resources: lesson.resources || [],
              questions: lesson.questions || []
            })) || []
          })) || []
        };

        console.log("🔍 Instructor ID:", finalPayload.instructor_id);
        console.log("🔍 Category ID:", finalPayload.category_id);
        console.log("🔍 courseBasicInfo.instructor:", courseBasicInfo.instructor);
        console.log("🔍 courseBasicInfo.category:", courseBasicInfo.category);

        console.log("🔍 Final payload to send:", finalPayload);

        // Now, send the complete payload to the service
        console.log("🔍 About to call createCourse...");
        const result = await createCourse(finalPayload);
        console.log("🔍 createCourse result:", result);
        
        console.log("🔍 About to call onPublish...");
        onPublish();
        console.log("🔍 onPublish called successfully");
      } else {
        console.log("❌ currentCourse is null or undefined");
      }
    } catch (error: any) {
      console.error('❌ Error publishing course:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsCreatingCourse(false);
    }
  };

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

        {/* Course Exam Preview */}
        {/* <div className="review-section">
          <div className="review-section-header">
            <h3 className="review-section-title">امتحان الكورس (سؤال واحد من كل درس)</h3>
            <button className="step-save-btn" onClick={regenerateExam}>إعادة توليد الامتحان</button>
          </div>
          {examQuestions.length === 0 ? (
            <p style={{ color: '#666' }}>لا توجد أسئلة في الدروس لتوليد الامتحان.</p>
          ) : (
            <div className="review-content-summary">
              {examQuestions.map((q: any, index: number) => (
                <div key={q.id || index} className="review-chapter-item">
                  <div className="review-chapter-title">
                    {`سؤال ${index + 1} - من الدرس: ${q.lessonTitle || ''}`}
                  </div>
                  <div className="review-chapter-lessons">
                    <div className="review-lesson-item">
                      {q.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div> */}

        {/* Action Buttons */}
        <div className="step-actions review-actions">
          <button onClick={onPrev} className="step-prev-btn" disabled={isCreatingCourse}>
            <span className="btn-icon">⬅️</span>
            العودة للتعديل
          </button>
          <button onClick={handleSaveDraft} className="step-save-btn" disabled={isCreatingCourse}>
            {isCreatingCourse ? 'جاري الحفظ...' : 'حفظ كمسودة'}
          </button>
          <button onClick={handlePublish} className="step-publish-btn" disabled={isCreatingCourse}>
            {isCreatingCourse ? 'جاري النشر...' : 'نشر الكورس'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;