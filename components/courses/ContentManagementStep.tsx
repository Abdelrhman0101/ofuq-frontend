'use client';
import React, { useState } from 'react';
import { Course, Chapter, Lesson, Question } from '@/types/course';
import LessonQuestionManager from './LessonQuestionManager';
import Toast from '../Toast';
import '../../styles/courses.css';
import '../../styles/toast.css';
import { createChapter, updateChapter, deleteChapter } from '@/utils/chapterService';
import { createLesson, updateLessonAdmin, deleteLessonAdmin } from '@/utils/lessonService';

interface ContentManagementStepProps {
  course: Course;
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  onNext: () => void;
  onPrev: () => void;
}

const ContentManagementStep: React.FC<ContentManagementStepProps> = ({
  course: currentCourse,
  setCourses,
  onNext,
  onPrev,
}) => {
  type ResourceType = 'website' | 'article' | 'video' | 'book' | 'tool' | 'other';
  
  // State for video upload method (file or url)
  const [videoUploadMethods, setVideoUploadMethods] = useState<{[key: string]: 'file' | 'url'}>({});

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const closeToast = () => {
    setToastVisible(false);
  };

  const toNum = (id: string | number) => (typeof id === 'number' ? id : parseInt(String(id), 10));
  const isPersistedId = (id: string | number) => Number.isFinite(toNum(id));
  const renderResourceIcon = (type: ResourceType) => {
    switch (type) {
      case 'website':
        return (
          <svg viewBox="0 0 24 24" className="resource-icon website-icon">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case 'article':
        return (
          <svg viewBox="0 0 24 24" className="resource-icon article-icon">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h8c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
        );
      case 'video':
        return (
          <svg viewBox="0 0 24 24" className="resource-icon video-icon">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        );
      case 'book':
        return (
          <svg viewBox="0 0 24 24" className="resource-icon book-icon">
            <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
          </svg>
        );
      case 'tool':
        return (
          <svg viewBox="0 0 24 24" className="resource-icon tool-icon">
            <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" className="resource-icon default-icon">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        );
    }
  };
  return (
    <div className="step-content-container">
      <div className="step-header">
        <h2 className="step-main-title">
          إدارة محتوى الكورس
        </h2>
        <p className="step-main-description">أضف الفصول والدروس للكورس</p>
      </div>
      
      <div className="content-management-section">
        <div className="chapters-header">
          <h3 className="chapters-title">
            الفصول ({currentCourse?.chapters?.length || 0})
          </h3>
          <button
            onClick={async () => {
              if (currentCourse) {
                const newOrder = currentCourse.chapters.length + 1;
                const courseIdNum = toNum(currentCourse.id);
                if (Number.isFinite(courseIdNum)) {
                  try {
                    const created = await createChapter(courseIdNum, { title: 'فصل جديد', description: '', order: newOrder });
                    setCourses(prevCourses => 
                      prevCourses.map(course =>
                        course.id === currentCourse.id
                          ? { 
                              ...course, 
                              chapters: [
                                {
                                  id: String(created.id),
                                  title: created.title || 'فصل جديد',
                                  description: created.description || '',
                                  lessons: [],
                                  order: created.order ?? newOrder
                                },
                                ...course.chapters.map(ch => ({ ...ch, order: ch.order + 1 }))
                              ]
                            }
                          : course
                      )
                    );
                    showToast('تم إضافة الفصل!', 'success');
                  } catch (error: any) {
                    showToast(error.message || 'فشل في إضافة الفصل', 'error');
                  }
                } else {
                  const tempId = `temp-chapter-${Date.now()}`;
                  setCourses(prevCourses => 
                    prevCourses.map(course =>
                      course.id === currentCourse.id
                        ? { 
                            ...course, 
                            chapters: [
                              {
                                id: tempId,
                                title: 'فصل جديد',
                                description: '',
                                lessons: [],
                                order: newOrder
                              },
                              ...course.chapters.map(ch => ({ ...ch, order: ch.order + 1 }))
                            ]
                          }
                        : course
                    )
                  );
  
                  showToast('تم إضافة الفصل محلياً!', 'success');
                }
              }
            }}
            className="add-chapter-btn"
          >
            <span className="btn-icon">➕</span>
            إضافة فصل جديد
          </button>
        </div>

        <div className="chapters-list">
          {currentCourse?.chapters?.map((chapter, chapterIndex) => (
            <div key={chapter.id} className="chapter-card">
              <div className="chapter-header">
                <div className="chapter-info">
                  <div className="chapter-number">
                    <span className="chapter-number-text">الفصل {chapterIndex + 1}</span>
                  </div>
                  <div className="chapter-inputs">
                    <input
                      type="text"
                      placeholder="عنوان الفصل"
                      value={chapter.title}
                      onChange={(e) => {
                        setCourses(prevCourses => 
                          prevCourses.map(course =>
                            course.id === currentCourse.id
                              ? { 
                                  ...course, 
                                  chapters: course.chapters.map((ch, idx) => 
                                    idx === chapterIndex 
                                      ? { ...ch, title: e.target.value }
                                      : ch
                                  )
                                }
                              : course
                          )
                        );
                      }}
                      onBlur={async (e) => {
                        const chIdNum = toNum(chapter.id);
                        if (Number.isFinite(chIdNum)) {
                          try {
                            await updateChapter(chIdNum, { title: e.target.value });
                            showToast('تم تحديث عنوان الفصل', 'success');
                          } catch (error: any) {
                            showToast(error.message || 'فشل تحديث عنوان الفصل', 'error');
                          }
                        }
                      }}
                      className="chapter-title-input"
                    />
                    <textarea
                      placeholder="وصف الفصل"
                      value={chapter.description}
                      onChange={(e) => {
                        setCourses(prevCourses => 
                          prevCourses.map(course =>
                            course.id === currentCourse.id
                              ? { 
                                  ...course, 
                                  chapters: course.chapters.map((ch, idx) => 
                                    idx === chapterIndex 
                                      ? { ...ch, description: e.target.value }
                                      : ch
                                  )
                                }
                              : course
                          )
                        );
                      }}
                      onBlur={async (e) => {
                        const chIdNum = toNum(chapter.id);
                        if (Number.isFinite(chIdNum)) {
                          try {
                            await updateChapter(chIdNum, { description: e.target.value });
                            showToast('تم تحديث وصف الفصل', 'success');
                          } catch (error: any) {
                            showToast(error.message || 'فشل تحديث وصف الفصل', 'error');
                          }
                        }
                      }}
                      className="chapter-description-input"
                      rows={2}
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCourses(prevCourses => 
                      prevCourses.map(course =>
                        course.id === currentCourse.id
                          ? { ...course, chapters: course.chapters.filter((_, i) => i !== chapterIndex) }
                          : course
                      )
                    );
                  }}
                  className="delete-chapter-btn"
                >
                  <span className="btn-icon">حذف</span>
                </button>
              </div>

              <div className="lessons-section">
                <div className="lessons-header">
                  <h4 className="lessons-title">
                    الدروس ({chapter.lessons?.length || 0})
                  </h4>
                  <button
                    onClick={() => {
                      // Calculate the order for the new lesson
                      const newLessonOrder = (chapter.lessons?.length || 0) + 1;
                      
                      // Generate a temporary ID for the new lesson
                      const tempId = `temp-lesson-${Date.now()}`;
                      
                      // Update the courses state with the new lesson (local state only)
                      setCourses(prevCourses => 
                        prevCourses.map(course =>
                          course.id === currentCourse.id
                            ? { 
                                ...course, 
                                chapters: course.chapters.map((ch, idx) =>
                                  idx === chapterIndex
                                    ? { 
                                        ...ch, 
                                        lessons: [
                                          {
                            id: tempId,
                            title: 'درس جديد',
                            description: '',
                            attachments: [],
                            isVideoPublic: false,
                            order: newLessonOrder,
                            questions: [], // Keep this for TS compatibility
                            resources: [],
                            quiz: undefined // Initialize quiz as undefined for new lessons
                          },
                                          ...ch.lessons
                                        ]
                                      }
                                    : ch
                                )
                              }
                            : course
                        )
                      );
                      
                      showToast('تم إضافة الدرس محلياً', 'success');
                    }}
                    className="add-lesson-btn"
                  >
                    <span className="btn-icon">➕</span>
                    إضافة درس
                  </button>
                </div>

                <div className="lessons-list">
                  {chapter.lessons?.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="lesson-card">
                      <div className="lesson-header">
                        <div className="lesson-number">
                          <span className="lesson-number-text">الدرس {lessonIndex + 1}</span>
                        </div>
                        <button
                          onClick={() => {
                            setCourses(prevCourses => 
                              prevCourses.map(course =>
                                course.id === currentCourse.id
                                  ? { 
                                      ...course, 
                                      chapters: course.chapters.map((ch, idx) =>
                                        idx === chapterIndex
                                          ? { ...ch, lessons: ch.lessons.filter((_, i) => i !== lessonIndex) }
                                          : ch
                                      )
                                    }
                                  : course
                              )
                            );
                          }}
                          className="delete-lesson-btn"
                        >
                          <span className="btn-icon">حذف</span>
                        </button>
                      </div>
                      <div className="lesson-inputs">
                        <input
                          type="text"
                          placeholder="عنوان الدرس"
                          value={lesson.title}
                          onChange={(e) => {
                            const newTitle = e.target.value;
                            setCourses(prevCourses => 
                              prevCourses.map(course =>
                                course.id === currentCourse.id
                                  ? {
                                      ...course, 
                                      chapters: course.chapters.map((ch, idx) =>
                                        idx === chapterIndex
                                          ? { 
                                              ...ch, 
                                              lessons: ch.lessons.map((l, i) =>
                                                i === lessonIndex 
                                                  ? { ...l, title: newTitle }
                                                  : l
                                              )
                                            }
                                          : ch
                                      )
                                    }
                                  : course
                              )
                            );
                          }}
                          onBlur={async (e) => {
                            const lessonIdNum = toNum(lesson.id);
                            if (Number.isFinite(lessonIdNum)) {
                              try {
                                await updateLessonAdmin(lessonIdNum, { title: e.target.value });
                                showToast('تم تحديث عنوان الدرس', 'success');
                              } catch (error: any) {
                                showToast(error.message || 'فشل تحديث عنوان الدرس', 'error');
                              }
                            }
                          }}
                          className="lesson-title-input"
                        />
                        <textarea
                          placeholder="وصف الدرس"
                          value={lesson.description}
                          onChange={(e) => {
                            const newDescription = e.target.value;
                            setCourses(prevCourses => 
                              prevCourses.map(course =>
                                course.id === currentCourse.id
                                  ? {
                                      ...course, 
                                      chapters: course.chapters.map((ch, idx) =>
                                        idx === chapterIndex
                                          ? { 
                                              ...ch, 
                                              lessons: ch.lessons.map((l, i) =>
                                                i === lessonIndex 
                                                  ? { ...l, description: newDescription }
                                                  : l
                                              )
                                            }
                                          : ch
                                      )
                                    }
                                  : course
                              )
                            );
                          }}
                          onBlur={async (e) => {
                            const lessonIdNum = toNum(lesson.id);
                            if (Number.isFinite(lessonIdNum)) {
                              try {
                                await updateLessonAdmin(lessonIdNum, { description: e.target.value, content: e.target.value });
                                showToast('تم تحديث وصف الدرس', 'success');
                              } catch (error: any) {
                                showToast(error.message || 'فشل تحديث وصف الدرس', 'error');
                              }
                            }
                          }}
                          className="lesson-description-input"
                          rows={2}
                        />
                        
                        {/* Video Upload Section */}
                        <div className="lesson-video-section">
                          <label className="video-upload-label">
                            فيديو الدرس
                          </label>
                          
                          {/* Video Upload Method Toggle */}
                          <div className="video-upload-method-toggle">
                            <button
                              type="button"
                              className={`upload-method-btn ${(videoUploadMethods[lesson.id] || 'file') === 'file' ? 'active' : ''}`}
                              onClick={() => {
                                setVideoUploadMethods(prev => ({
                                  ...prev,
                                  [lesson.id]: 'file'
                                }));
                                // Clear URL when switching to file
                                setCourses(prevCourses => 
                                  prevCourses.map(course =>
                                    course.id === currentCourse.id
                                      ? {
                                          ...course, 
                                          chapters: course.chapters.map((ch, idx) =>
                                            idx === chapterIndex
                                              ? { 
                                                  ...ch, 
                                                  lessons: ch.lessons.map((l, i) =>
                                                    i === lessonIndex 
                                                      ? { ...l, videoUrl: undefined }
                                                      : l
                                                  )
                                                }
                                              : ch
                                          )
                                        }
                                      : course
                                  )
                                );
                              }}
                            >
                              <span className="upload-method-icon">📁</span>
                              رفع ملف
                            </button>
                            <button
                              type="button"
                              className={`upload-method-btn ${videoUploadMethods[lesson.id] === 'url' ? 'active' : ''}`}
                              onClick={() => {
                                setVideoUploadMethods(prev => ({
                                  ...prev,
                                  [lesson.id]: 'url'
                                }));
                                // Clear file when switching to URL
                                setCourses(prevCourses => 
                                  prevCourses.map(course =>
                                    course.id === currentCourse.id
                                      ? {
                                          ...course, 
                                          chapters: course.chapters.map((ch, idx) =>
                                            idx === chapterIndex
                                              ? { 
                                                  ...ch, 
                                                  lessons: ch.lessons.map((l, i) =>
                                                    i === lessonIndex 
                                                      ? { ...l, videoFile: undefined }
                                                      : l
                                                  )
                                                }
                                              : ch
                                          )
                                        }
                                      : course
                                  )
                                );
                              }}
                            >
                              <span className="upload-method-icon">🔗</span>
                              رابط فيديو
                            </button>
                          </div>

                          {/* File Upload */}
                          {(videoUploadMethods[lesson.id] || 'file') === 'file' && (
                            <div className="video-upload-container">
                              <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setCourses(prevCourses => 
                                      prevCourses.map(course =>
                                        course.id === currentCourse.id
                                          ? {
                                              ...course, 
                                              chapters: course.chapters.map((ch, idx) =>
                                                idx === chapterIndex
                                                  ? { 
                                                      ...ch, 
                                                      lessons: ch.lessons.map((l, i) =>
                                                        i === lessonIndex 
                                                          ? { ...l, videoFile: file }
                                                          : l
                                                      )
                                                    }
                                                  : ch
                                              )
                                            }
                                          : course
                                      )
                                    );
                                  }
                                }}
                                className="video-upload-input"
                                id={`video-${chapter.id}-${lesson.id}`}
                                style={{ display: 'none' }}
                              />
                              <label htmlFor={`video-${chapter.id}-${lesson.id}`} className="video-upload-btn">
                                <div className="upload-area">
                                  {lesson.videoFile ? (
                                    <div className="file-selected-content">
                                      <div className="file-icon">📹</div>
                                      <div className="file-info">
                                        <div className="file-name">{lesson.videoFile.name}</div>
                                        <div className="file-size">{(lesson.videoFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                      </div>
                                      <div className="change-file-text">انقر لتغيير الفيديو</div>
                                    </div>
                                  ) : (
                                    <div className="upload-placeholder">
                                      <div className="upload-icon">📹</div>
                                      <div className="upload-text">انقر لرفع فيديو الدرس</div>
                                      <div className="upload-subtext">MP4, AVI, MOV (حد أقصى 100MB)</div>
                                    </div>
                                  )}
                                </div>
                              </label>
                            </div>
                          )}

                          {/* URL Input */}
                          {videoUploadMethods[lesson.id] === 'url' && (
                            <div className="video-url-input-container">
                              <input
                                type="url"
                                placeholder="أدخل رابط الفيديو (Google Drive, YouTube, Vimeo, إلخ)"
                                value={lesson.videoUrl || ''}
                                onChange={(e) => {
                                  const newVideoUrl = e.target.value;
                                  
                                  // Update local state only
                                  setCourses(prevCourses => 
                                    prevCourses.map(course =>
                                      course.id === currentCourse.id
                                        ? {
                                            ...course, 
                                            chapters: course.chapters.map((ch, idx) =>
                                              idx === chapterIndex
                                                ? { 
                                                    ...ch, 
                                                    lessons: ch.lessons.map((l, i) =>
                                                      i === lessonIndex 
                                                        ? { ...l, videoUrl: newVideoUrl }
                                                        : l
                                                    )
                                                  }
                                                : ch
                                            )
                                          }
                                        : course
                                    )
                                  );
                                }}
                                className="video-url-input"
                              />
                              {lesson.videoUrl && (
                                <div className="video-url-preview">
                                  <span className="video-url-preview-icon">🔗</span>
                                  <span>رابط الفيديو: {lesson.videoUrl.length > 50 ? lesson.videoUrl.substring(0, 50) + '...' : lesson.videoUrl}</span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Public/Private Switch */}
                          <div className="video-visibility-toggle">
                            <span className="toggle-label">إتاحة الفيديو للعامة</span>
                            <label className="switch">
                              <input
                                type="checkbox"
                                checked={!!lesson.isVideoPublic}
                                onChange={(e) => {
                                  const value = e.target.checked;
                                  
                                  // Update local state only
                                  setCourses(prevCourses => 
                                    prevCourses.map(course =>
                                      course.id === currentCourse.id
                                        ? {
                                            ...course,
                                            chapters: course.chapters.map((ch, idx) =>
                                              idx === chapterIndex
                                                ? {
                                                    ...ch,
                                                    lessons: ch.lessons.map((l, i) =>
                                                      i === lessonIndex
                                                        ? { ...l, isVideoPublic: value }
                                                        : l
                                                    )
                                                  }
                                                : ch
                                            )
                                          }
                                        : course
                                    )
                                  );
                                }}
                              />
                              <span className="slider round"></span>
                            </label>
                          </div>
                        </div>

                        {/* Attachments Section */}
                        <div className="lesson-attachments-section">
                          <label className="attachments-label">
                            مرفقات الدرس
                          </label>
                          <div className="attachments-container">
                            <input
                              type="file"
                              multiple
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (files.length > 0) {
                                  setCourses(prevCourses => 
                                    prevCourses.map(course =>
                                      course.id === currentCourse.id
                                        ? {
                                            ...course, 
                                            chapters: course.chapters.map((ch, idx) =>
                                              idx === chapterIndex
                                                ? { 
                                                    ...ch, 
                                                    lessons: ch.lessons.map((l, i) =>
                                                      i === lessonIndex 
                                                        ? { ...l, attachments: [...l.attachments, ...files] }
                                                        : l
                                                    )
                                                  }
                                                : ch
                                            )
                                          }
                                        : course
                                    )
                                  );
                                }
                              }}
                              className="attachments-upload-input"
                              id={`attachments-${chapter.id}-${lesson.id}`}
                              style={{ display: 'none' }}
                            />
                            <label htmlFor={`attachments-${chapter.id}-${lesson.id}`} className="attachments-upload-btn">
                              <div className="upload-area">
                                {lesson.attachments && lesson.attachments.length > 0 ? (
                                  <div className="attachments-selected-content">
                                    <div className="attachments-header">
                                      <div className="file-icon">📄</div>
                                      <div className="attachments-count">{lesson.attachments.length} مرفق(ات)</div>
                                      <div className="add-more-text">انقر لإضافة المزيد</div>
                                    </div>
                                    <div className="attachments-preview">
                                      {lesson.attachments.slice(0, 3).map((attachment, index) => (
                                        <div key={index} className="attachment-preview-item">
                                          <span className="attachment-preview-name">
                                            {attachment.name.length > 20 ? 
                                              `${attachment.name.substring(0, 20)}...` : 
                                              attachment.name
                                            }
                                          </span>
                                          <button
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              setCourses(prevCourses => 
                                                prevCourses.map(course =>
                                                  course.id === currentCourse.id
                                                    ? {
                                                        ...course, 
                                                        chapters: course.chapters.map((ch, idx) =>
                                                          idx === chapterIndex
                                                            ? { 
                                                                ...ch, 
                                                                lessons: ch.lessons.map((l, i) =>
                                                                  i === lessonIndex 
                                                                    ? { ...l, attachments: l.attachments.filter((_, ai) => ai !== index) }
                                                                    : l
                                                                )
                                                              }
                                                            : ch
                                                        )
                                                      }
                                                    : course
                                                )
                                              );
                                            }}
                                            className="remove-attachment-preview-btn"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ))}
                                      {lesson.attachments.length > 3 && (
                                        <div className="more-attachments">
                                          +{lesson.attachments.length - 3} أخرى
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="upload-placeholder">
                                    <div className="upload-icon">📄</div>
                                    <div className="upload-text">انقر لرفع مرفقات الدرس</div>
                                    <div className="upload-subtext">PDF, DOC, PPT (يمكن اختيار عدة ملفات)</div>
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                          {/* Resource Link with Icon Selector */}
                          <div className="resource-link-section">
                            <div className="resource-inputs">
                              <input
                                type="text"
                                placeholder="عنوان المصدر (اختياري)"
                                className="resource-title-input"
                                id={`res-title-${chapter.id}-${lesson.id}`}
                              />
                              <input
                                type="url"
                                placeholder="رابط المصدر (URL)"
                                className="resource-url-input"
                                id={`res-url-${chapter.id}-${lesson.id}`}
                              />
                              <input
                                type="hidden"
                                id={`res-type-${chapter.id}-${lesson.id}`}
                                value="website"
                              />
                              <div
                                className="resource-type-picker"
                                id={`res-type-picker-${chapter.id}-${lesson.id}`}
                              >
                                {(['website','article','video','book','tool','other'] as ResourceType[]).map((t) => (
                                  <button
                                    key={t}
                                    type="button"
                                    className="type-item"
                                    title={t}
                                    onClick={(e) => {
                                      const hidden = document.getElementById(`res-type-${chapter.id}-${lesson.id}`) as HTMLInputElement | null;
                                      const picker = document.getElementById(`res-type-picker-${chapter.id}-${lesson.id}`);
                                      if (hidden) hidden.value = t;
                                      if (picker) {
                                        Array.from(picker.querySelectorAll('.type-item')).forEach(el => el.classList.remove('selected'));
                                        (e.currentTarget as HTMLButtonElement).classList.add('selected');
                                      }
                                    }}
                                  >
                                    <span className="type-icon">{renderResourceIcon(t)}</span>
                                  </button>
                                ))}
                              </div>
                              <button
                                className="add-resource-btn"
                                onClick={() => {
                                  const titleEl = document.getElementById(`res-title-${chapter.id}-${lesson.id}`) as HTMLInputElement | null;
                                  const urlEl = document.getElementById(`res-url-${chapter.id}-${lesson.id}`) as HTMLInputElement | null;
                                  const typeEl = document.getElementById(`res-type-${chapter.id}-${lesson.id}`) as HTMLSelectElement | null;
                                  const title = titleEl?.value?.trim() || '';
                                  const url = urlEl?.value?.trim() || '';
                                  const type = (typeEl?.value || 'website') as 'website' | 'article' | 'video' | 'book' | 'tool' | 'other';

                                  if (!url) {
                                    showToast('يرجى إدخال رابط المصدر', 'error');
                                    return;
                                  }

                                  const domainMatch = url.match(/https?:\/\/([^/]+)/i);
                                  const domain = domainMatch ? domainMatch[1] : undefined;

                                  const newResource = {
                                    id: Date.now().toString(),
                                    title: title || url,
                                    url,
                                    type,
                                    domain,
                                  };

                                  setCourses(prevCourses => 
                                    prevCourses.map(course =>
                                      course.id === currentCourse.id
                                        ? {
                                            ...course,
                                            chapters: course.chapters.map((ch, idx) =>
                                              idx === chapterIndex
                                                ? {
                                                    ...ch,
                                                    lessons: ch.lessons.map((l, i) =>
                                                      i === lessonIndex
                                                        ? { ...l, resources: [...(l.resources || []), newResource] }
                                                        : l
                                                    )
                                                  }
                                                : ch
                                            )
                                          }
                                        : course
                                    )
                                  );

                                  if (titleEl) titleEl.value = '';
                                  if (urlEl) urlEl.value = '';
                                  if (typeEl) typeEl.value = 'website';
                                }}
                              >
                                إضافة رابط مصدر
                              </button>
                            </div>

                            {/* Added resources list */}
                            {(lesson.resources && lesson.resources.length > 0) && (
                              <div className="resource-list">
                                {lesson.resources.map((res, ri) => (
                                  <div key={res.id} className="resource-list-item">
                                    <span className={`resource-badge type-${res.type}`}>{res.type}</span>
                                    <a href={res.url} target="_blank" rel="noreferrer" className="resource-link-text">
                                      {res.title}
                                    </a>
                                    <button
                                      className="remove-resource-btn"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        setCourses(prevCourses => 
                                          prevCourses.map(course =>
                                            course.id === currentCourse.id
                                              ? {
                                                  ...course,
                                                  chapters: course.chapters.map((ch, idx) =>
                                                    idx === chapterIndex
                                                      ? {
                                                          ...ch,
                                                          lessons: ch.lessons.map((l, i) =>
                                                            i === lessonIndex
                                                              ? { 
                                                                  ...l, 
                                                                  resources: (l.resources || []).filter((_, rIndex) => rIndex !== ri) 
                                                                }
                                                              : l
                                                          )
                                                        }
                                                      : ch
                                                  )
                                                }
                                              : course
                                          )
                                        );
                                      }}
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Lesson Questions Section */}
                            <LessonQuestionManager
                              lessonId={lesson.id}
                              quizId={lesson.quiz?.id}
                              
                              // 1. القراءة من المصدر الصحيح
                              questions={lesson.quiz?.questions || []}
                              
                              // 2. الكتابة (التحديث) في المصدر الصحيح (مع الحل الوسط لـ TypeScript)
                              onQuestionsChange={(updatedQuestions) => {
                                setCourses(prevCourses => 
                                  prevCourses.map(course =>
                                    course.id === currentCourse.id
                                      ? { 
                                          ...course, 
                                          chapters: course.chapters.map((ch, idx) =>
                                            idx === chapterIndex
                                              ? { 
                                                  ...ch, 
                                                  lessons: ch.lessons.map((l, i) => {
                                                    // إذا لم يكن هذا هو الدرس المطلوب، أرجعه كما هو
                                                    if (i !== lessonIndex) return l;

                                                    // [هذا هو الإصلاح الصحيح]
                                                    // نقوم بتحديث كلا المكانين (القديم والجديد)
                                                    return {
                                                      ...l,
                                                      
                                                      // 1. إرضاء TypeScript بوضع البيانات في المكان القديم
                                                      questions: updatedQuestions, 
                                                      
                                                      // 2. وضع البيانات في المكان الصحيح (الذي نقرأ منه)
                                                      quiz: {
                                                        ...(l.quiz), // حافظ على البيانات القديمة (مثل quizId)
                                                        id: l.quiz?.id || 0, // تأكد من وجود المعرف
                                                        questions: updatedQuestions // ضع الأسئلة المحدثة هنا
                                                      }
                                                    };
                                                    // [نهاية الإصلاح الصحيح]

                                                  })
                                                }
                                              : ch
                                          )
                                        }
                                      : course
                                  )
                                );
                              }}
                            />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="step-actions">
          <button onClick={onPrev} className="step-prev-btn">
            <span className="btn-icon">⬅️</span>
            السابق: المعلومات الأساسية
          </button>
          <button onClick={onNext} className="step-next-btn">
            <span className="btn-icon">➡️</span>
            التالي: مراجعة ونشر
          </button>
        </div>
      </div>
      
      {/* Toast Component */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={closeToast}
      />
    </div>
  );
};

export default ContentManagementStep;