'use client';

import React, { useState, useEffect } from 'react';
import '../../styles/globals.css';
import '../../styles/courses.css';
import '../../styles/modern-course-details.css';
import './courses.css';
import { Course, CourseCreationStep } from '../../types/course';
import HeroSection from '../../components/courses/HeroSection';
import CourseCreationNav from '../../components/courses/CourseCreationNav';
import BasicInfoStep from '../../components/courses/BasicInfoStep';
import ContentManagementStep from '../../components/courses/ContentManagementStep';
import CoursesList from '../../components/courses/CoursesList';
import CourseDetails from '../../components/courses/CourseDetails';
import ReviewStep from '../../components/courses/ReviewStep';

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
    categoryId: '',
    price: 0,
    isFree: true,
    coverImage: null as File | null,
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
      categoryId: courseBasicInfo.categoryId, // This can be empty string
      price: courseBasicInfo.isFree ? 0 : courseBasicInfo.price,
      isFree: courseBasicInfo.isFree,
      chapters: [],
      createdAt: new Date(),
      status: 'draft',
      ...(courseBasicInfo.coverImage && { coverImage: courseBasicInfo.coverImage })
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
      categoryId: '',
      price: 0,
      isFree: true,
      coverImage: null,
    });
  };

  const handleReviewPrev = () => {
    setCurrentStep('content-management');
  };

  const handleSaveDraft = () => {
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
  };

  const handlePublish = () => {
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
  };
  
  const handleContentStepNext = () => {
    setCurrentStep('review');
  }

  const handleContentStepPrev = () => {
    setCurrentStep('basic-info');
  }

  // Get current course being edited
  const currentCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;

  // Filter courses based on selected filter
  const filteredCourses = courses.filter((course) => {
    if (courseFilter === 'all') return true;
    return course.status === courseFilter;
  });

  const selectedCourse = courses.find(course => course.id === selectedCourseForView);

  const creationSteps = [
    { id: 'basic-info', title: 'المعلومات الأساسية', description: 'أدخل تفاصيل الكورس الأساسية.' },
    { id: 'content-management', title: 'إدارة المحتوى', description: 'أضف فصول ودروس الكورس.' },
    { id: 'review', title: 'مراجعة ونشر', description: 'راجع الكورس وقم بنشره.' },
  ];

  return (
    <div className="courses-container">
      <div className="courses-content">
        <HeroSection
          courseFilter={courseFilter}
          setCourseFilter={setCourseFilter}
          setShowCreateCourse={setShowCreateCourse}
          showCreateCourse={showCreateCourse}
          courses={courses}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {showCreateCourse ? (
          <div className="course-creation-container">
            <button onClick={resetCourseCreation} className="close-creation-btn" title="إغلاق">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <CourseCreationNav
              currentStep={currentStep}
              currentCourse={currentCourse || null}
              resetCourseCreation={resetCourseCreation}
              steps={creationSteps}
              setCurrentStep={setCurrentStep}
            />
            <div className="course-creation-content">
              {currentStep === 'basic-info' && (
                <BasicInfoStep
                  courseBasicInfo={courseBasicInfo}
                  setCourseBasicInfo={setCourseBasicInfo}
                  handleCreateBasicCourse={handleCreateBasicCourse}
                />
              )}
              {currentStep === 'content-management' && currentCourse && (
                <ContentManagementStep course={currentCourse} setCourses={setCourses} onNext={handleContentStepNext} onPrev={handleContentStepPrev} />
              )}
              {currentStep === 'review' && currentCourse && (
                <ReviewStep
                  currentCourse={currentCourse}
                  onPrev={handleReviewPrev}
                  onSaveDraft={handleSaveDraft}
                  onPublish={handlePublish}
                />
              )}
            </div>
          </div>
        ) : (
          <CoursesList
            courses={filteredCourses}
            viewMode={viewMode}
            setSelectedCourseForView={setSelectedCourseForView}
            setShowCourseDetails={setShowCourseDetails}
            courseFilter={courseFilter}
            setCourses={setCourses}
            setSelectedCourseId={setSelectedCourseId}
            setCurrentStep={(step: string) => setCurrentStep(step as CourseCreationStep)}
            setShowCreateCourse={setShowCreateCourse}
          />
        )}

        {showCourseDetails && selectedCourse && (
          <CourseDetails course={selectedCourse} onClose={closeCourseDetails} isClient={isClient} />
        )}
      </div>
    </div>
  );
}