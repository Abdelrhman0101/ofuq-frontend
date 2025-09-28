'use client';
import React, { useState } from 'react';
import { Course, Chapter, Lesson, Question } from '@/types/course';
import LessonQuestionManager from './LessonQuestionManager';
import '../../styles/courses.css';

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
            onClick={() => {
              if (currentCourse) {
                const newChapter: Chapter = {
                  id: Date.now().toString(),
                  title: '',
                  description: '',
                  lessons: [],
                  order: 1
                };
                setCourses(prevCourses => 
                  prevCourses.map(course =>
                    course.id === currentCourse.id
                      ? { 
                          ...course, 
                          chapters: [
                            newChapter, 
                            ...course.chapters.map(ch => ({ ...ch, order: ch.order + 1 }))
                          ]
                        }
                      : course
                  )
                );
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
                      const newLesson: Lesson = {
                        id: Date.now().toString(),
                        title: '',
                        description: '',
                        attachments: [],
                        order: 1,
                        questions: []
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
                                        lessons: [
                                          newLesson, 
                                          ...ch.lessons.map(l => ({ ...l, order: l.order + 1 }))
                                        ]
                                      }
                                    : ch
                                )
                              }
                            : course
                        )
                      );
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
                                                  ? { ...l, title: e.target.value }
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
                          className="lesson-title-input"
                        />
                        <textarea
                          placeholder="وصف الدرس"
                          value={lesson.description}
                          onChange={(e) => {
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
                                                  ? { ...l, description: e.target.value }
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
                          className="lesson-description-input"
                          rows={2}
                        />
                        
                        {/* Video Upload Section */}
                        <div className="lesson-video-section">
                          <label className="video-upload-label">
                            فيديو الدرس
                          </label>
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
                        </div>

                        {/* Lesson Questions Section */}
                        <LessonQuestionManager
                          lessonId={lesson.id}
                          questions={lesson.questions}
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
                                              lessons: ch.lessons.map((l, i) =>
                                                i === lessonIndex 
                                                  ? { ...l, questions: updatedQuestions }
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
    </div>
  );
};

export default ContentManagementStep;