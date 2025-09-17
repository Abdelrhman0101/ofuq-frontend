'use client';

import React, { useState, useEffect } from 'react';
import '../../styles/globals.css';
import '../../styles/courses.css';
import './courses.css';

// MCQ Question Bank Interfaces
interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
}

interface MCQBank {
  id: string;
  questions: MCQQuestion[];
  totalQuestions: number;
  passingScore: number; // النسبة المئوية للنجاح
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoFile?: File;
  attachments: File[];
  duration?: number;
  order: number;
  mcqBank?: MCQBank;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  coverImage?: File;
  price: number;
  isFree: boolean;
  chapters: Chapter[];
  mcqBank?: MCQBank;
  createdAt: Date;
  status: 'draft' | 'published';
}

type CourseCreationStep = 'basic-info' | 'content-management' | 'review';

export default function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isClient, setIsClient] = useState(false);
  
  // Course Creation States
  const [currentStep, setCurrentStep] = useState<CourseCreationStep>('basic-info');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // Course Details View States
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourseForView, setSelectedCourseForView] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // Course Filter States
  const [courseFilter, setCourseFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  // View Mode State
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // Basic Course Info
  const [courseBasicInfo, setCourseBasicInfo] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: true,
    coverImage: null as File | null
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle Escape key press to close course details
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showCourseDetails) {
        setShowCourseDetails(false);
        setSelectedCourseForView(null);
        setExpandedChapters(new Set());
      }
    };

    if (showCourseDetails) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showCourseDetails]);

  // Function to close course details
  const closeCourseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourseForView(null);
    setExpandedChapters(new Set());
  };

  // Navigation Steps
  const steps = [
    { id: 'basic-info', title: '1- معلومات الكورس', description: 'العنوان والوصف والسعر' },
    { id: 'content-management', title: '2- إدارة المحتوى', description: 'الفصول والدروس' },
    { id: 'review', title: '3- المراجعة النهائية', description: 'مراجعة ونشر الكورس' }
  ];

  // Handle Basic Course Creation
  const handleCreateBasicCourse = () => {
    if (!courseBasicInfo.title || !courseBasicInfo.description) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      title: courseBasicInfo.title,
      description: courseBasicInfo.description,
      coverImage: courseBasicInfo.coverImage as File,
      price: courseBasicInfo.price,
      isFree: courseBasicInfo.isFree,
      chapters: [],
      createdAt: new Date(),
      status: 'draft'
    };

    setCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
    setCurrentStep('content-management');
  };

  // Reset Course Creation
  const resetCourseCreation = () => {
    setShowCreateCourse(false);
    setCurrentStep('basic-info');
    setSelectedCourseId(null);
    setCourseBasicInfo({
      title: '',
      description: '',
      price: 0,
      isFree: true,
      coverImage: null
    });
  };

  // Get current course being edited
  const currentCourse = selectedCourseId ? courses.find(c => c.id === selectedCourseId) : null;
  
  // Filter courses based on selected filter
  const filteredCourses = courses.filter(course => {
    if (courseFilter === 'all') return true;
    return course.status === courseFilter;
  });

  return (
    <div className="courses-container">
      <div className="courses-content">
        {/* العنوان الرئيسي */}
        <div className="hero-section">
          
          <div className="hero-content">
            <div className="hero-main">
              <div className="hero-text">
                <div className="hero-icon-container">
                  <div className="hero-icon-bg"></div>
                  
                </div>
                <h1 className="hero-title">
                  📚 إدارة الدورات التعليمية
                </h1>
                <p className="hero-subtitle">منصة شاملة لإدارة وتنظيم دورات المنصة التعليمية بطريقة احترافية ومبتكرة - معهد أفق للتعليم عن بعد</p>
                <div className="hero-stats">
                  <div 
                    className={`hero-stat ${courseFilter === 'all' ? 'active' : ''}`}
                    onClick={() => {
                      setCourseFilter('all');
                      setShowCreateCourse(false);
                    }}
                  >
                    
                    <span className="hero-stat-text">{courses.length} دورة متاحة</span>
                  </div>
                  <div 
                    className={`hero-stat ${courseFilter === 'draft' ? 'active' : ''}`}
                    onClick={() => {
                      setCourseFilter('draft');
                      setShowCreateCourse(false);
                    }}
                  >
                    
                    <span className="hero-stat-text">{courses.filter(c => c.status === 'draft').length} مسودة</span>
                  </div>
                  <div 
                    className={`hero-stat ${courseFilter === 'published' ? 'active' : ''}`}
                    onClick={() => {
                      setCourseFilter('published');
                      setShowCreateCourse(false);
                    }}
                  >
                    
                    <span className="hero-stat-text">{courses.filter(c => c.status === 'published').length} منشورة</span>
                  </div>
                  
                  {/* زر إنشاء كورس جديد */}
                  <div 
                    className="hero-create-btn"
                    onClick={() => {
                      setShowCreateCourse(true);
                      setCourseFilter('all');
                    }}
                  >
                    <span className="hero-create-icon">➕</span>
                    <span className="hero-create-text">إنشاء كورس جديد</span>
                  </div>
                </div>
              </div>
              <div className="hero-visual">
                <div className="hero-circle">
                  <span>🎓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Course Creation Navigation */}
        {showCreateCourse && (
          <div className="course-creation-nav">
            <div className="nav-header">
              <h2 className="nav-title">
                {currentCourse ? `تحرير: ${currentCourse.title}` : 'إنشاء كورس جديد'}
              </h2>
              <button onClick={resetCourseCreation} className="nav-close-btn">
                ✕
              </button>
            </div>
            <div className="nav-steps">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
                return (
                  <div key={step.id} className={`nav-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="step-indicator">
                      {/* <span className="step-icon">{step.icon}</span> */}
                      <span className="step-number">{index + 1}</span>
                    </div>
                    <div className="step-content">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Course Creation Steps Content */}
        {showCreateCourse && (
          <div className="course-creation-content">
            {/* Step 1: Basic Course Info */}
            {currentStep === 'basic-info' && (
              <div className="step-content-container">
                <div className="step-header">
                  <h2 className="step-main-title">
                    معلومات الكورس الأساسية
                  </h2>
                  <p className="step-main-description">أدخل المعلومات الأساسية للكورس الجديد</p>
                </div>
                
                <div className="basic-info-form">
                  <div className="form-grid">
                    <div className="form-field">
                     
                      <div className="cover-upload-container">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setCourseBasicInfo({...courseBasicInfo, coverImage: e.target.files?.[0] || null})}
                          className="cover-upload-input"
                          id="cover-upload"
                        />
                        <label htmlFor="cover-upload" className="cover-upload-label">
                          {courseBasicInfo.coverImage ? (
                            <div className="cover-preview">
                              <img src={URL.createObjectURL(courseBasicInfo.coverImage)} alt="Cover" className="cover-image" />
                              <div className="cover-overlay">
                                <span>تغيير الصورة</span>
                              </div>
                            </div>
                          ) : (
                            <div className="cover-placeholder">
                              <span className="cover-placeholder-text">اختر صورة الغلاف</span>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="form-grid">
                    <div className="form-field">
                      <label className="form-label">
                        
                        عنوان الكورس *
                      </label>
                      <input
                        type="text"
                        value={courseBasicInfo.title}
                        onChange={(e) => setCourseBasicInfo({...courseBasicInfo, title: e.target.value})}
                        className="form-input"
                        placeholder="أدخل عنوان الكورس"
                      />
                    </div>
                  </div>
                  
                  <div className="form-field">
                    <label className="form-label">
                      وصف الكورس *
                    </label>
                    <textarea
                      value={courseBasicInfo.description}
                      onChange={(e) => setCourseBasicInfo({...courseBasicInfo, description: e.target.value})}
                      rows={4}
                      className="form-textarea"
                      placeholder="أدخل وصف مفصل للكورس"
                    />
                  </div>
                  
                  <div className="pricing-section">
                    <div className="pricing-toggle">
                      <label className="toggle-container">
                        <input
                          type="checkbox"
                          checked={courseBasicInfo.isFree}
                          onChange={(e) => setCourseBasicInfo({...courseBasicInfo, isFree: e.target.checked, price: e.target.checked ? 0 : courseBasicInfo.price})}
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">
                          {courseBasicInfo.isFree ? 'كورس مجاني' : 'كورس مدفوع'}
                        </span>
                      </label>
                    </div>
                    
                    {!courseBasicInfo.isFree && (
                      <div className="price-input-container">
                        <label className="form-label">
                          سعر الكورس (ريال سعودي)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={courseBasicInfo.price}
                          onChange={(e) => setCourseBasicInfo({...courseBasicInfo, price: parseFloat(e.target.value) || 0})}
                          className="form-input price-input"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="step-actions">
                    <button onClick={handleCreateBasicCourse} className="step-next-btn">
                      <span className="btn-icon">➡️</span>
                      التالي: إدارة المحتوى
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Content Management */}
            {currentStep === 'content-management' && (
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
                            order: currentCourse.chapters.length + 1
                          };
                          const updatedCourses = courses.map(course => 
                            course.id === currentCourse.id 
                              ? { ...course, chapters: [...course.chapters, newChapter] }
                              : course
                          );
                          setCourses(updatedCourses);
                        }
                      }}
                      className="add-chapter-btn"
                    >
                      <span className="btn-icon">➕</span>
                      إضافة فصل جديد
                    </button>
                  </div>

                  {/* Chapters List */}
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
                                  const updatedCourses = courses.map(course => {
                                    if (course.id === currentCourse?.id) {
                                      const updatedChapters = [...course.chapters];
                                      updatedChapters[chapterIndex] = { ...chapter, title: e.target.value };
                                      return { ...course, chapters: updatedChapters };
                                    }
                                    return course;
                                  });
                                  setCourses(updatedCourses);
                                }}
                                className="chapter-title-input"
                              />
                              <textarea
                                placeholder="وصف الفصل"
                                value={chapter.description}
                                onChange={(e) => {
                                  const updatedCourses = courses.map(course => {
                                    if (course.id === currentCourse?.id) {
                                      const updatedChapters = [...course.chapters];
                                      updatedChapters[chapterIndex] = { ...chapter, description: e.target.value };
                                      return { ...course, chapters: updatedChapters };
                                    }
                                    return course;
                                  });
                                  setCourses(updatedCourses);
                                }}
                                className="chapter-description-input"
                                rows={2}
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const updatedCourses = courses.map(course => {
                                if (course.id === currentCourse?.id) {
                                  const updatedChapters = course.chapters.filter((_, i) => i !== chapterIndex);
                                  return { ...course, chapters: updatedChapters };
                                }
                                return course;
                              });
                              setCourses(updatedCourses);
                            }}
                            className="delete-chapter-btn"
                          >
                            <span className="btn-icon">حذف</span>
                          </button>
                        </div>

                        {/* Lessons Section */}
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
                                  order: chapter.lessons.length + 1
                                };
                                const updatedCourses = courses.map(course => {
                                  if (course.id === currentCourse?.id) {
                                    const updatedChapters = [...course.chapters];
                                    updatedChapters[chapterIndex] = {
                                      ...chapter,
                                      lessons: [...chapter.lessons, newLesson]
                                    };
                                    return { ...course, chapters: updatedChapters };
                                  }
                                  return course;
                                });
                                setCourses(updatedCourses);
                              }}
                              className="add-lesson-btn"
                            >
                              <span className="btn-icon">➕</span>
                              إضافة درس
                            </button>
                          </div>

                          {/* Lessons List */}
                          <div className="lessons-list">
                            {chapter.lessons?.map((lesson, lessonIndex) => (
                              <div key={lesson.id} className="lesson-card">
                                <div className="lesson-header">
                                  <div className="lesson-number">
                                    <span className="lesson-number-text">الدرس {lessonIndex + 1}</span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const updatedCourses = courses.map(course => {
                                        if (course.id === currentCourse?.id) {
                                          const updatedChapters = [...course.chapters];
                                          const updatedLessons = chapter.lessons.filter((_, i) => i !== lessonIndex);
                                          updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                          return { ...course, chapters: updatedChapters };
                                        }
                                        return course;
                                      });
                                      setCourses(updatedCourses);
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
                                      const updatedCourses = courses.map(course => {
                                        if (course.id === currentCourse?.id) {
                                          const updatedChapters = [...course.chapters];
                                          const updatedLessons = [...chapter.lessons];
                                          updatedLessons[lessonIndex] = { ...lesson, title: e.target.value };
                                          updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                          return { ...course, chapters: updatedChapters };
                                        }
                                        return course;
                                      });
                                      setCourses(updatedCourses);
                                    }}
                                    className="lesson-title-input"
                                  />
                                  <textarea
                                    placeholder="وصف الدرس"
                                    value={lesson.description}
                                    onChange={(e) => {
                                      const updatedCourses = courses.map(course => {
                                        if (course.id === currentCourse?.id) {
                                          const updatedChapters = [...course.chapters];
                                          const updatedLessons = [...chapter.lessons];
                                          updatedLessons[lessonIndex] = { ...lesson, description: e.target.value };
                                          updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                          return { ...course, chapters: updatedChapters };
                                        }
                                        return course;
                                      });
                                      setCourses(updatedCourses);
                                    }}
                                    className="lesson-description-input"
                                    rows={2}
                                  />

                                  <div className="lesson-video-section">
                                    <label className="video-upload-label">
                                      فيديو الدرس
                                    </label>
                                    <input
                                      type="file"
                                      accept="video/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const updatedCourses = courses.map(course => {
                                            if (course.id === currentCourse?.id) {
                                              const updatedChapters = [...course.chapters];
                                              const updatedLessons = [...chapter.lessons];
                                              updatedLessons[lessonIndex] = { ...lesson, videoFile: file };
                                              updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                              return { ...course, chapters: updatedChapters };
                                            }
                                            return course;
                                          });
                                          setCourses(updatedCourses);
                                        }
                                      }}
                                      className="video-upload-input"
                                    />
                                    {lesson.videoFile && (
                                      <div className="video-file-info">
                                        <span className="video-file-name">{lesson.videoFile.name}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="lesson-attachments-section">
                                    <label className="attachments-upload-label">
                                      المرفقات
                                    </label>
                                    <input
                                      type="file"
                                      multiple
                                      accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar"
                                      onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        if (files.length > 0) {
                                          const updatedCourses = courses.map(course => {
                                            if (course.id === currentCourse?.id) {
                                              const updatedChapters = [...course.chapters];
                                              const updatedLessons = [...chapter.lessons];
                                              updatedLessons[lessonIndex] = {
                                                ...lesson,
                                                attachments: [...lesson.attachments, ...files]
                                              };
                                              updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                              return { ...course, chapters: updatedChapters };
                                            }
                                            return course;
                                          });
                                          setCourses(updatedCourses);
                                        }
                                      }}
                                      className="attachments-upload-input"
                                    />
                                    {lesson.attachments.length > 0 && (
                                      <div className="attachments-list">
                                        {lesson.attachments.map((file, fileIndex) => (
                                          <div key={fileIndex} className="attachment-item">
                                            <span className="attachment-icon">📄</span>
                                            <span className="attachment-name">{file.name}</span>
                                            <button
                                              onClick={() => {
                                                const updatedCourses = courses.map(course => {
                                                  if (course.id === currentCourse?.id) {
                                                    const updatedChapters = [...course.chapters];
                                                    const updatedLessons = [...chapter.lessons];
                                                    const updatedAttachments = lesson.attachments.filter((_, i) => i !== fileIndex);
                                                    updatedLessons[lessonIndex] = { ...lesson, attachments: updatedAttachments };
                                                    updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                    return { ...course, chapters: updatedChapters };
                                                  }
                                                  return course;
                                                });
                                                setCourses(updatedCourses);
                                              }}
                                              className="remove-attachment-btn"
                                            >
                                              ✕
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* MCQ Bank Section for Lesson */}
                                  <div className="lesson-mcq-section">
                                    <div className="lesson-mcq-header">
                                      <label className="lesson-mcq-label">
                                        بنك الأسئلة للدرس ({lesson.mcqBank?.questions?.length || 0} أسئلة)
                                      </label>
                                      <button
                                        onClick={() => {
                                          const newQuestion: MCQQuestion = {
                                            id: Date.now().toString(),
                                            question: '',
                                            options: [
                                              { id: '1', text: '', isCorrect: false },
                                              { id: '2', text: '', isCorrect: false },
                                              { id: '3', text: '', isCorrect: false },
                                              { id: '4', text: '', isCorrect: false }
                                            ],
                                            difficulty: 'medium',
                                            order: (lesson.mcqBank?.questions?.length || 0) + 1
                                          };
                                          const updatedCourses = courses.map(course => {
                                            if (course.id === currentCourse?.id) {
                                              const updatedChapters = [...course.chapters];
                                              const updatedLessons = [...chapter.lessons];
                                              const existingBank = lesson.mcqBank || {
                                                id: Date.now().toString(),
                                                questions: [],
                                                totalQuestions: 0,
                                                passingScore: 70
                                              };
                                              updatedLessons[lessonIndex] = {
                                                ...lesson,
                                                mcqBank: {
                                                  ...existingBank,
                                                  questions: [...existingBank.questions, newQuestion],
                                                  totalQuestions: existingBank.questions.length + 1
                                                }
                                              };
                                              updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                              return { ...course, chapters: updatedChapters };
                                            }
                                            return course;
                                          });
                                          setCourses(updatedCourses);
                                        }}
                                        className="add-lesson-question-btn"
                                      >
                                        <span className="btn-icon">➕</span>
                                        إضافة سؤال
                                      </button>
                                    </div>

                                    {/* Questions List for Lesson */}
                                    {lesson.mcqBank?.questions && lesson.mcqBank.questions.length > 0 && (
                                      <div className="lesson-mcq-questions-list">
                                        {lesson.mcqBank.questions.map((question, questionIndex) => (
                                          <div key={question.id} className="mcq-question-card">
                                            <div className="mcq-question-header">
                                              <div className="mcq-question-number">
                                                <span className="mcq-question-number-text">السؤال {questionIndex + 1}</span>
                                              </div>
                                              <div className="mcq-question-actions">
                                                <button
                                                  onClick={() => {
                                                    const updatedCourses = courses.map(course => {
                                                      if (course.id === currentCourse?.id) {
                                                        const updatedChapters = [...course.chapters];
                                                        const updatedLessons = [...chapter.lessons];
                                                        const updatedQuestions = lesson.mcqBank!.questions.filter((_, i) => i !== questionIndex);
                                                        updatedLessons[lessonIndex] = {
                                                          ...lesson,
                                                          mcqBank: {
                                                            ...lesson.mcqBank!,
                                                            questions: updatedQuestions,
                                                            totalQuestions: updatedQuestions.length
                                                          }
                                                        };
                                                        updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                        return { ...course, chapters: updatedChapters };
                                                      }
                                                      return course;
                                                    });
                                                    setCourses(updatedCourses);
                                                  }}
                                                  className="delete-question-btn"
                                                >
                                                  <span className="btn-icon">حذف</span>
                                                </button>
                                              </div>
                                            </div>
                                            <div className="mcq-question-content">
                                              <textarea
                                                placeholder="اكتب السؤال هنا..."
                                                value={question.question}
                                                onChange={(e) => {
                                                  const updatedCourses = courses.map(course => {
                                                    if (course.id === currentCourse?.id) {
                                                      const updatedChapters = [...course.chapters];
                                                      const updatedLessons = [...chapter.lessons];
                                                      const updatedQuestions = [...lesson.mcqBank!.questions];
                                                      updatedQuestions[questionIndex] = {
                                                        ...question,
                                                        question: e.target.value
                                                      };
                                                      updatedLessons[lessonIndex] = {
                                                        ...lesson,
                                                        mcqBank: {
                                                          ...lesson.mcqBank!,
                                                          questions: updatedQuestions
                                                        }
                                                      };
                                                      updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                      return { ...course, chapters: updatedChapters };
                                                    }
                                                    return course;
                                                  });
                                                  setCourses(updatedCourses);
                                                }}
                                                className="mcq-question-input"
                                                rows={3}
                                              />
                                              <div className="mcq-options-list">
                                                {question.options.map((option, optionIndex) => (
                                                  <div key={option.id} className="mcq-option-item">
                                                    <div className="mcq-option-header">
                                                      <span className="mcq-option-label">الخيار {optionIndex + 1}</span>
                                                      <label className="mcq-correct-checkbox">
                                                        <input
                                                          type="checkbox"
                                                          checked={option.isCorrect}
                                                          onChange={(e) => {
                                                            const updatedCourses = courses.map(course => {
                                                              if (course.id === currentCourse?.id) {
                                                                const updatedChapters = [...course.chapters];
                                                                const updatedLessons = [...chapter.lessons];
                                                                const updatedQuestions = [...lesson.mcqBank!.questions];
                                                                const updatedOptions = [...question.options];
                                                                updatedOptions[optionIndex] = {
                                                                  ...option,
                                                                  isCorrect: e.target.checked
                                                                };
                                                                updatedQuestions[questionIndex] = {
                                                                  ...question,
                                                                  options: updatedOptions
                                                                };
                                                                updatedLessons[lessonIndex] = {
                                                                  ...lesson,
                                                                  mcqBank: {
                                                                    ...lesson.mcqBank!,
                                                                    questions: updatedQuestions
                                                                  }
                                                                };
                                                                updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                                return { ...course, chapters: updatedChapters };
                                                              }
                                                              return course;
                                                            });
                                                            setCourses(updatedCourses);
                                                          }}
                                                        />
                                                        <span className="checkbox-label">إجابة صحيحة</span>
                                                      </label>
                                                    </div>
                                                    <input
                                                      type="text"
                                                      placeholder={`الخيار ${optionIndex + 1}`}
                                                      value={option.text}
                                                      onChange={(e) => {
                                                        const updatedCourses = courses.map(course => {
                                                          if (course.id === currentCourse?.id) {
                                                            const updatedChapters = [...course.chapters];
                                                            const updatedLessons = [...chapter.lessons];
                                                            const updatedQuestions = [...lesson.mcqBank!.questions];
                                                            const updatedOptions = [...question.options];
                                                            updatedOptions[optionIndex] = {
                                                              ...option,
                                                              text: e.target.value
                                                            };
                                                            updatedQuestions[questionIndex] = {
                                                              ...question,
                                                              options: updatedOptions
                                                            };
                                                            updatedLessons[lessonIndex] = {
                                                              ...lesson,
                                                              mcqBank: {
                                                                ...lesson.mcqBank!,
                                                                questions: updatedQuestions
                                                              }
                                                            };
                                                            updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                            return { ...course, chapters: updatedChapters };
                                                          }
                                                          return course;
                                                        });
                                                        setCourses(updatedCourses);
                                                      }}
                                                      className="mcq-option-input"
                                                    />
                                                  </div>
                                                ))}
                                              </div>
                                              <div className="mcq-question-explanation">
                                                <label className="mcq-explanation-label">شرح الإجابة (اختياري)</label>
                                                <textarea
                                                  placeholder="اكتب شرحاً للإجابة الصحيحة..."
                                                  value={question.explanation || ''}
                                                  onChange={(e) => {
                                                    const updatedCourses = courses.map(course => {
                                                      if (course.id === currentCourse?.id) {
                                                        const updatedChapters = [...course.chapters];
                                                        const updatedLessons = [...chapter.lessons];
                                                        const updatedQuestions = [...lesson.mcqBank!.questions];
                                                        updatedQuestions[questionIndex] = {
                                                          ...question,
                                                          explanation: e.target.value
                                                        };
                                                        updatedLessons[lessonIndex] = {
                                                          ...lesson,
                                                          mcqBank: {
                                                            ...lesson.mcqBank!,
                                                            questions: updatedQuestions
                                                          }
                                                        };
                                                        updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                        return { ...course, chapters: updatedChapters };
                                                      }
                                                      return course;
                                                    });
                                                    setCourses(updatedCourses);
                                                  }}
                                                  className="mcq-explanation-input"
                                                  rows={2}
                                                />
                                              </div>
                                            </div>
                                            
                                            {/* زر إضافة سؤال جديد أسفل كل سؤال */}
                                            <div className="add-question-after-container">
                                              <button
                                                onClick={() => {
                                                  const newQuestion: MCQQuestion = {
                                                    id: Date.now().toString(),
                                                    question: '',
                                                    options: [
                                                      { id: Date.now().toString() + '1', text: '', isCorrect: false },
                                                      { id: Date.now().toString() + '2', text: '', isCorrect: false },
                                                      { id: Date.now().toString() + '3', text: '', isCorrect: false },
                                                      { id: Date.now().toString() + '4', text: '', isCorrect: false }
                                                    ],
                                                    difficulty: 'medium',
                                                    order: questionIndex + 2
                                                  };
                                                  
                                                  const updatedCourses = courses.map(course => {
                                                    if (course.id === currentCourse?.id) {
                                                      const updatedChapters = [...course.chapters];
                                                      const updatedLessons = [...chapter.lessons];
                                                      const currentQuestions = lesson.mcqBank?.questions || [];
                                                      
                                                      // إدراج السؤال الجديد بعد السؤال الحالي
                                                      const updatedQuestions = [
                                                        ...currentQuestions.slice(0, questionIndex + 1),
                                                        newQuestion,
                                                        ...currentQuestions.slice(questionIndex + 1).map(q => ({
                                                          ...q,
                                                          order: q.order + 1
                                                        }))
                                                      ];
                                                      
                                                      updatedLessons[lessonIndex] = {
                                                        ...lesson,
                                                        mcqBank: {
                                                          ...lesson.mcqBank!,
                                                          questions: updatedQuestions,
                                                          totalQuestions: updatedQuestions.length
                                                        }
                                                      };
                                                      updatedChapters[chapterIndex] = { ...chapter, lessons: updatedLessons };
                                                      return { ...course, chapters: updatedChapters };
                                                    }
                                                    return course;
                                                  });
                                                  setCourses(updatedCourses);
                                                }}
                                                className="add-question-after-btn"
                                              >
                                                <span className="add-question-icon">➕</span>
                                                <span className="add-question-text">إضافة سؤال جديد</span>
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {(!chapter.lessons || chapter.lessons.length === 0) && (
                              <div className="empty-lessons">
                                <div className="empty-lessons-icon">📝</div>
                                <p className="empty-lessons-text">لا توجد دروس في هذا الفصل بعد</p>
                                <p className="empty-lessons-subtext">ابدأ بإضافة درس جديد</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!currentCourse?.chapters || currentCourse.chapters.length === 0) && (
                      <div className="empty-chapters">
                        <div className="empty-chapters-icon">📚</div>
                        <h3 className="empty-chapters-title">لا توجد فصول بعد</h3>
                        <p className="empty-chapters-text">ابدأ بإضافة فصل جديد لتنظيم محتوى الكورس</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="step-actions">
                    <button onClick={() => setCurrentStep('basic-info')} className="step-prev-btn">
                      <span className="btn-icon">⬅️</span>
                      السابق: معلومات الكورس
                    </button>
                    <button onClick={() => setCurrentStep('review')} className="step-next-btn">
                      <span className="btn-icon">➡️</span>
                      التالي: المراجعة النهائية
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Review */}
            {currentStep === 'review' && (
              <div className="step-content-container">
                <div className="step-header">
                  <h2 className="step-main-title">
                    
                    المراجعة النهائية
                  </h2>
                  <p className="step-main-description">راجع جميع معلومات الكورس قبل النشر أو الحفظ</p>
                </div>
                
                <div className="review-content">
                  {/* Course Basic Info Review */}
                  <div className="review-section">
                    <div className="review-section-header">
                      <h3 className="review-section-title">
                        معلومات الكورس الأساسية
                      </h3>
                    </div>
                    <div className="review-info-grid">
                      <div className="review-info-item">
                        <label className="review-label">عنوان الكورس</label>
                        <p className="review-value">{courseBasicInfo?.title || 'غير محدد'}</p>
                      </div>
                      <div className="review-info-item">
                        <label className="review-label">السعر</label>
                        <p className="review-value">
                          {courseBasicInfo?.isFree ? 'مجاني' : `${courseBasicInfo?.price || 0} ريال سعودي`}
                        </p>
                      </div>
                      <div className="review-info-item full-width">
                        <label className="review-label">وصف الكورس</label>
                        <p className="review-value description">{courseBasicInfo?.description || 'غير محدد'}</p>
                      </div>
                      <div className="review-info-item">
                        <label className="review-label">صورة الغلاف</label>
                        {courseBasicInfo?.coverImage ? (
                          <div className="review-cover-preview">
                            <img 
                              src={URL.createObjectURL(courseBasicInfo.coverImage)} 
                              alt="غلاف الكورس" 
                              className="review-cover-image"
                            />
                          </div>
                        ) : (
                          <p className="review-value no-image">لم يتم رفع صورة</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Chapters and Lessons Review */}
                  <div className="review-section">
                    <div className="review-section-header">
                      <h3 className="review-section-title">
                        محتوى الكورس ({currentCourse?.chapters?.length || 0} فصل)
                      </h3>
                    </div>
                    
                    {currentCourse?.chapters && currentCourse.chapters.length > 0 ? (
                      <div className="review-chapters-list">
                        {currentCourse.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="review-chapter-card">
                            <div className="review-chapter-header">
                              <div className="review-chapter-info">
                                <h4 className="review-chapter-title">
                                  الفصل {chapterIndex + 1}: {chapter.title || 'بدون عنوان'}
                                </h4>
                                {chapter.description && (
                                  <p className="review-chapter-description">{chapter.description}</p>
                                )}
                              </div>
                              <span className="review-lessons-count">
                                {chapter.lessons?.length || 0} درس
                              </span>
                            </div>
                            
                            {chapter.lessons && chapter.lessons.length > 0 && (
                              <div className="review-lessons-list">
                                {chapter.lessons.map((lesson, lessonIndex) => (
                                  <div key={lesson.id} className="review-lesson-item">
                                    <div className="review-lesson-header">
                                      <span className="review-lesson-title">
                                        الدرس {lessonIndex + 1}: {lesson.title || 'بدون عنوان'}
                                      </span>
                                      <div className="review-lesson-badges">
                                        {lesson.videoFile && (
                                          <span className="review-badge video"> فيديو</span>
                                        )}
                                        {lesson.attachments && lesson.attachments.length > 0 && (
                                          <span className="review-badge attachments">
                                             {lesson.attachments.length} مرفق
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    {lesson.description && (
                                      <p className="review-lesson-description">{lesson.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="review-empty-content">
                        <div className="review-empty-icon">📖</div>
                        <p className="review-empty-text">لم يتم إضافة أي محتوى للكورس بعد</p>
                        <p className="review-empty-subtext">يمكنك العودة لإضافة الفصول والدروس</p>
                      </div>
                    )}
                  </div>

                  {/* MCQ Bank Review */}
                  {currentCourse?.mcqBank && currentCourse.mcqBank.questions.length > 0 && (
                    <div className="review-section">
                      <div className="review-section-header">
                        <h3 className="review-section-title">
                          بنك الأسئلة ({currentCourse.mcqBank.questions.length} سؤال)
                        </h3>
                      </div>
                      <div className="review-mcq-info">
                        <div className="review-mcq-stats">
                          <div className="review-mcq-stat">
                            <span className="review-mcq-stat-label">نسبة النجاح:</span>
                            <span className="review-mcq-stat-value">{currentCourse.mcqBank.passingScore}%</span>
                          </div>
                          <div className="review-mcq-stat">
                            <span className="review-mcq-stat-label">الأسئلة السهلة:</span>
                            <span className="review-mcq-stat-value">
                              {currentCourse.mcqBank.questions.filter(q => q.difficulty === 'easy').length}
                            </span>
                          </div>
                          <div className="review-mcq-stat">
                            <span className="review-mcq-stat-label">الأسئلة المتوسطة:</span>
                            <span className="review-mcq-stat-value">
                              {currentCourse.mcqBank.questions.filter(q => q.difficulty === 'medium').length}
                            </span>
                          </div>
                          <div className="review-mcq-stat">
                            <span className="review-mcq-stat-label">الأسئلة الصعبة:</span>
                            <span className="review-mcq-stat-value">
                              {currentCourse.mcqBank.questions.filter(q => q.difficulty === 'hard').length}
                            </span>
                          </div>
                        </div>
                        <div className="review-mcq-questions-preview">
                          <h4 className="review-mcq-preview-title">معاينة الأسئلة:</h4>
                          <div className="review-mcq-questions-list">
                            {currentCourse.mcqBank.questions.slice(0, 3).map((question, index) => (
                              <div key={question.id} className="review-mcq-question-item">
                                <div className="review-mcq-question-header">
                                  <span className="review-mcq-question-number">السؤال {index + 1}</span>
                                </div>
                                <p className="review-mcq-question-text">
                                  {question.question || 'سؤال بدون نص'}
                                </p>
                                <div className="review-mcq-options">
                                  {question.options.map((option, optionIndex) => (
                                    <div key={option.id} className={`review-mcq-option ${option.isCorrect ? 'correct' : ''}`}>
                                      <span className="review-mcq-option-letter">
                                        {String.fromCharCode(65 + optionIndex)}
                                      </span>
                                      <span className="review-mcq-option-text">
                                        {option.text || 'اختيار فارغ'}
                                      </span>
                                      {option.isCorrect && (
                                        <span className="review-mcq-correct-indicator">✓</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {currentCourse.mcqBank.questions.length > 3 && (
                              <div className="review-mcq-more-questions">
                                <span className="review-mcq-more-text">
                                  و {currentCourse.mcqBank.questions.length - 3} أسئلة أخرى...
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Course Statistics */}
                  <div className="review-section">
                    <div className="review-section-header">
                      <h3 className="review-section-title">
                        إحصائيات الكورس
                      </h3>
                    </div>
                    <div className="review-stats-grid">
                      <div className="review-stat-card">
                        <div className="review-stat-number">{currentCourse?.chapters?.length || 0}</div>
                        <div className="review-stat-label">فصل</div>
                      </div>
                      <div className="review-stat-card">
                        <div className="review-stat-number">
                          {currentCourse?.chapters?.reduce((total, chapter) => total + (chapter.lessons?.length || 0), 0) || 0}
                        </div>
                        <div className="review-stat-label">درس</div>
                      </div>
                      <div className="review-stat-card">
                        <div className="review-stat-number">
                          {currentCourse?.chapters?.reduce((total, chapter) => 
                            total + (chapter.lessons?.reduce((lessonTotal, lesson) => 
                              lessonTotal + (lesson.attachments?.length || 0), 0) || 0), 0) || 0}
                        </div>
                        <div className="review-stat-label">مرفق</div>
                      </div>
                      <div className="review-stat-card">
                        <div className="review-stat-number">
                          {currentCourse?.chapters?.reduce((total, chapter) => 
                            total + (chapter.lessons?.filter(lesson => lesson.videoFile).length || 0), 0) || 0}
                        </div>
                        <div className="review-stat-label">فيديو</div>
                      </div>
                      <div className="review-stat-card">
                        <div className="review-stat-number">{currentCourse?.mcqBank?.questions?.length || 0}</div>
                        <div className="review-stat-label">سؤال اختبار</div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="step-actions review-actions">
                    <button onClick={() => setCurrentStep('content-management')} className="step-prev-btn">
                      <span className="btn-icon">⬅️</span>
                      العودة للتعديل
                    </button>
                    <button
                      onClick={() => {
                        if (currentCourse) {
                          const updatedCourses = courses.map(course => 
                            course.id === currentCourse.id 
                              ? { ...course, status: 'draft' as const }
                              : course
                          );
                          setCourses(updatedCourses);
                          resetCourseCreation();
                          alert('تم حفظ الكورس كمسودة بنجاح!');
                        }
                      }}
                      className="step-save-btn"
                    >
                      حفظ كمسودة
                    </button>
                    <button
                      onClick={() => {
                        if (currentCourse) {
                          const updatedCourses = courses.map(course => 
                            course.id === currentCourse.id 
                              ? { ...course, status: 'published' as const }
                              : course
                          );
                          setCourses(updatedCourses);
                          resetCourseCreation();
                          alert('تم نشر الكورس بنجاح!');
                        }
                      }}
                      className="step-publish-btn"
                    >
                      نشر الكورس
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* عرض الكورسات المُنشأة */}
        {!showCreateCourse && (
          <div className="courses-section">
            {filteredCourses.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-content">
                  <div className="empty-state-icon-container">
                    <div className="empty-state-icon-bg"></div>
                    <div className="empty-state-icon">📚</div>
                  </div>
                  <h3 className="empty-state-title">
                    لا توجد كورسات متاحة
                  </h3>
                  <p className="empty-state-description">
                    ابدأ رحلتك التعليمية بإنشاء أول كورس
                  </p>
                </div>
              </div>
            ) : (
              <div className="courses-list">
                <div className="courses-header">
                  <h2 className="courses-list-title">
                    
                    {courseFilter === 'all' ? `الكورسات المُنشأة (${filteredCourses.length})` :
                     courseFilter === 'published' ? `الكورسات المنشورة (${filteredCourses.length})` :
                     `الكورسات المسودة (${filteredCourses.length})`}
                  </h2>
                  
                  {/* أزرار تغيير طريقة العرض */}
                  <div className="view-mode-controls">
                    <button
                      onClick={() => setViewMode('cards')}
                      className={`view-mode-btn ${viewMode === 'cards' ? 'active' : ''}`}
                      title="عرض البطاقات"
                    >
                      <span className="view-mode-icon">⊞</span>
                      <span className="view-mode-text">بطاقات</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                      title="عرض القائمة"
                    >
                      <span className="view-mode-icon">☰</span>
                      <span className="view-mode-text">قائمة</span>
                    </button>
                  </div>
                </div>
                
                {/* عرض الكورسات حسب طريقة العرض المختارة */}
                {viewMode === 'cards' ? (
                  <div className="courses-grid">
                    {filteredCourses.map((course) => (
                      <div key={course.id} className="course-card-wrapper">
                        <div className="course-card-background"></div>
                        
                        <div className="course-card">
                          <div className="course-card-content">
                            <div className="course-image">
                              {course.coverImage ? (
                                <img src={URL.createObjectURL(course.coverImage)} alt={course.title} style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--border-radius-md)'}} />
                              ) : (
                                <span>📚</span>
                              )}
                            </div>
                            
                            <div className="course-body">
                              <div className="course-header">
                                <h3 className="course-title">{course.title}</h3>
                                <div className="course-status-badge">
                                  <span className="status-text">
                                    {course.status === 'draft' ? 'مسودة' : 'منشور'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="course-content">
                                <p className="course-description">{course.description}</p>
                                
                                <div className="course-meta">
                                  <div className="course-price">
                                    <span className="price-text">
                                      {course.isFree ? 'مجاني' : `${course.price} ريال`}
                                    </span>
                                  </div>
                                  <div className="course-chapters">
                                    <span className="chapters-text">{course.chapters.length} فصل</span>
                                  </div>
                                </div>
                                
                                <div className="course-date">
                                  <span className="date-text">
                                    {isClient ? course.createdAt.toLocaleDateString('ar-SA') : course.createdAt.toISOString().split('T')[0]}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="course-actions">
                                <button 
                                  onClick={() => {
                                    setSelectedCourseId(course.id);
                                    setCurrentStep('content-management');
                                    setShowCreateCourse(true);
                                  }}
                                  className="course-edit-button"
                                >
                                  تحرير المحتوى
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedCourseForView(course.id);
                                    setShowCourseDetails(true);
                                  }}
                                  className="course-content-button"
                                >
                                  عرض
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="courses-list-view">
                    {filteredCourses.map((course, index) => (
                      <div key={course.id} className="course-list-item">
                        <div className="course-list-number">
                          <span className="list-number">{index + 1}</span>
                        </div>
                        
                        <div className="course-list-image">
                          {course.coverImage ? (
                            <img src={URL.createObjectURL(course.coverImage)} alt={course.title} className="list-course-image" />
                          ) : (
                            <div className="list-course-placeholder">📚</div>
                          )}
                        </div>
                        
                        <div className="course-list-content">
                          <div className="course-list-header">
                            <h3 className="course-list-title">{course.title}</h3>
                            <div className="course-list-status">
                              <span className={`status-badge ${course.status}`}>
                                {course.status === 'draft' ? 'مسودة' : 'منشور'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="course-list-description">{course.description}</p>
                          
                          <div className="course-list-meta">
                            <div className="meta-item">
                              <span className="meta-label">السعر:</span>
                              <span className="meta-value">
                                {course.isFree ? 'مجاني' : `${course.price} ريال`}
                              </span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">الفصول:</span>
                              <span className="meta-value">{course.chapters.length} فصل</span>
                            </div>
                            <div className="meta-item">
                              <span className="meta-label">تاريخ الإنشاء:</span>
                              <span className="meta-value">
                                {isClient ? course.createdAt.toLocaleDateString('ar-SA') : course.createdAt.toISOString().split('T')[0]}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="course-list-actions">
                          <button 
                            onClick={() => {
                              setSelectedCourseId(course.id);
                              setCurrentStep('content-management');
                              setShowCreateCourse(true);
                            }}
                            className="list-edit-btn"
                          >
                            
                            تحرير
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCourseForView(course.id);
                              setShowCourseDetails(true);
                            }}
                            className="list-view-btn"
                          >
                            
                            عرض
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Course Details View */}
        {showCourseDetails && selectedCourseForView && (() => {
          const courseToView = courses.find(c => c.id === selectedCourseForView);
          if (!courseToView) return null;
          
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
              className="course-details-overlay"
              onClick={(e) => {
                // Close if clicking on the overlay background (not the container)
                if (e.target === e.currentTarget) {
                  closeCourseDetails();
                }
              }}
            >
              <div className="course-details-container">
                <div className="course-details-header">
                  <div className="course-details-title-section">
                    <div className="course-header-top">
                      <div className="course-category-badge">
                        <span className="category-text">كورس تعليمي</span>
                      </div>
                      <div className="course-status-badge">
                        <span className={`status-indicator ${courseToView.status === 'published' ? 'published' : 'draft'}`}></span>
                        <span className="status-text">{courseToView.status === 'published' ? 'منشور' : 'مسودة'}</span>
                      </div>
                    </div>
                    <h2 className="course-details-title">
                      
                      {courseToView.title}
                    </h2>
                    <p className="course-details-description">{courseToView.description}</p>
                    <div className="course-meta-info">
                      <div className="meta-item">
                        
                        <span className="meta-label">تاريخ الإنشاء:</span>
                        <span className="meta-value">
                          {isClient ? courseToView.createdAt.toLocaleDateString('ar-SA') : courseToView.createdAt.toISOString().split('T')[0]}
                        </span>
                      </div>
                      
                      <div className="meta-item">
                        
                        <span className="meta-label">السعر:</span>
                        <span className="meta-value price-highlight">
                          {courseToView.isFree ? 'مجاني' : `${courseToView.price} ريال سعودي`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={closeCourseDetails}
                    className="course-details-close-btn"
                    title="إغلاق (Esc)"
                  >
                    <span className="close-icon">✕</span>
                  </button>
                </div>
                
                <div className="course-details-content">
                  <div className="course-details-info">
                    <div className="course-info-stats">
                      <div className="course-stat chapters-stat">
                        
                        <div className="stat-content">
                          <span className="stat-number">{courseToView.chapters.length}</span>
                          <span className="stat-label">فصل</span>
                        </div>
                      </div>
                      <div className="course-stat lessons-stat">
                       
                        <div className="stat-content">
                          <span className="stat-number">
                            {courseToView.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)}
                          </span>
                          <span className="stat-label">درس</span>
                        </div>
                      </div>
                      
                      
                    </div>
                    
                   
                  </div>
                  
                  <div className="chapters-details-list">
                    <div className="chapters-header">
                      <h3 className="chapters-details-title">
                        <span className="chapters-icon">📚</span>
                        فصول الكورس
                      </h3>
                      <div className="chapters-progress">
                        <span className="progress-text">
                          {courseToView.chapters.reduce((total, chapter) => total + chapter.lessons.length, 0)} درس إجمالي
                        </span>
                      </div>
                    </div>
                    
                    {courseToView.chapters.length === 0 ? (
                      <div className="no-chapters-message">
                        <div className="no-chapters-icon">📖</div>
                        <p className="no-chapters-text">لا توجد فصول في هذا الكورس بعد</p>
                      </div>
                    ) : (
                      <div className="chapters-accordion">
                        {courseToView.chapters.map((chapter, chapterIndex) => (
                          <div key={chapter.id} className="chapter-accordion-item">
                            <div 
                              className={`chapter-accordion-header ${expandedChapters.has(chapter.id) ? 'expanded' : ''}`}
                              onClick={() => toggleChapter(chapter.id)}
                            >
                              <div className="chapter-accordion-title">
                                <div className="chapter-info">
                                  <span className="chapter-number">الفصل {chapterIndex + 1}</span>
                                  <h4 className="chapter-title">{chapter.title || 'فصل بدون عنوان'}</h4>
                                </div>
                                <div className="chapter-meta">
                                  <span className="chapter-lessons-count">
                                    <span className="lessons-icon">📝</span>
                                    {chapter.lessons.length} درس
                                  </span>
                                  <span className="chapter-duration">
                                    <span className="duration-icon">⏱️</span>
                                    {chapter.lessons.length * 15} دقيقة
                                  </span>
                                </div>
                              </div>
                              <div className="chapter-accordion-controls">
                                <span className={`accordion-arrow ${expandedChapters.has(chapter.id) ? 'expanded' : ''}`}>
                                  ▼
                                </span>
                              </div>
                            </div>
                            
                            {expandedChapters.has(chapter.id) && (
                              <div className="chapter-accordion-content">
                                {chapter.description && (
                                  <p className="chapter-description">{chapter.description}</p>
                                )}
                                
                                {chapter.lessons.length === 0 ? (
                                  <div className="no-lessons-message">
                                    <span className="no-lessons-icon">📝</span>
                                    <span className="no-lessons-text">لا توجد دروس في هذا الفصل</span>
                                  </div>
                                ) : (
                                  <div className="lessons-details-list">
                                    {chapter.lessons.map((lesson, lessonIndex) => (
                                      <div key={lesson.id} className="lesson-details-item">
                                        <div className="lesson-number">
                                          <span className="lesson-index">{lessonIndex + 1}</span>
                                        </div>
                                        <div className="lesson-content">
                                          <div className="lesson-details-header">
                                            <div className="lesson-details-info">
                                              <div className="lesson-number-title">
                                                <h5 className="lesson-title">{lesson.title || 'درس بدون عنوان'}</h5>
                                              </div>
                                              <div className="lesson-meta">
                                                <span className="lesson-duration">
                                                  <span className="duration-icon">⏰</span>
                                                  15 دقيقة
                                                </span>
                                                <span className="lesson-type">
                                                  <span className="type-icon">🎥</span>
                                                  فيديو
                                                </span>
                                                <div className="lesson-status">
                                                  <span className="status-icon">✅</span>
                                                  <span className="status-text">متاح</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="lesson-details-badges">
                                              {lesson.videoFile && (
                                                <span className="lesson-badge video">
                                                  <span className="badge-icon">🎥</span>
                                                  فيديو
                                                </span>
                                              )}
                                              {lesson.attachments.length > 0 && (
                                                <span className="lesson-badge attachments">
                                                  <span className="badge-icon">📎</span>
                                                  {lesson.attachments.length} مرفق
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                        <div className="lesson-actions">
                                          <button className="lesson-play-btn">
                                            <span className="play-icon">▶️</span>
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}