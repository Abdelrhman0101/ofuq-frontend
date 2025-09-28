'use client';

import React, { useState, useEffect } from 'react';
import '../../../styles/globals.css';
import '../../../styles/courses.css';
import '../../../styles/modern-course-details.css';
import './courses.css';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Course, CourseCreationStep } from '@/types/course';

import HeroSection from '@/components/courses/HeroSection';
import CourseCreationNav from '@/components/courses/CourseCreationNav';
import BasicInfoStep from '@/components/courses/BasicInfoStep';
import ContentManagementStep from '@/components/courses/ContentManagementStep';
import CoursesList from '@/components/courses/CoursesList';
import CourseDetails from '@/components/courses/CourseDetails';
import ReviewStep from '@/components/courses/ReviewStep';

export default function Courses() {
  // State for course management
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  
  // State for course creation
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [currentStep, setCurrentStep] = useState<CourseCreationStep>('basic-info');
  
  // State for course details view
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourseForView, setSelectedCourseForView] = useState<string | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  
  // State for filtering
  const [courseFilter, setCourseFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  
  // State for basic course info
  const [courseBasicInfo, setCourseBasicInfo] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: true,
    coverImage: null as File | null
  });

  // Initialize with empty courses array
  useEffect(() => {
    // Here you can add API call to fetch real courses data
    // For now, starting with empty array
    setCourses([]);
  }, []);

  // Function to close course details
  const closeCourseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourseForView(null);
    setExpandedChapters(new Set());
  };

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
      categoryId: '',
      price: courseBasicInfo.price,
      isFree: courseBasicInfo.isFree,
      coverImage: courseBasicInfo.coverImage as File | undefined,
      status: 'draft',
      createdAt: new Date(),
      chapters: []
    };

    setCourses(prev => [...prev, newCourse]);
    setSelectedCourseId(newCourse.id);
    setCurrentStep('content-management');
  };

  // Navigation Steps
  const steps = [
    { id: 'basic-info', title: '1- معلومات الكورس', description: 'العنوان والوصف والسعر' },
    { id: 'content-management', title: '2- إدارة المحتوى', description: 'الفصول والدروس' },
    { id: 'review', title: '3- المراجعة النهائية', description: 'مراجعة ونشر الكورس' }
  ];

  // Handle content step navigation
  const handleContentStepNext = () => {
    setCurrentStep('review');
  };

  const handleContentStepPrev = () => {
    setCurrentStep('basic-info');
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

  // Reset course creation
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
  const currentCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;

  // Filter courses based on selected filter
  const filteredCourses = courses.filter((course) => {
    if (courseFilter === 'all') return true;
    return course.status === courseFilter;
  });

  const selectedCourse = courses.find(course => course.id === selectedCourseForView);

  return (
    <div className="courses-page">
      <Header />
      <div className="courses-content">
        <Sidebar />
        <main className="courses-main">
          {/* Hero Section */}
          <HeroSection
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
            setShowCreateCourse={setShowCreateCourse}
            showCreateCourse={showCreateCourse}
            courses={courses}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* Course Creation Navigation */}
          {showCreateCourse && (
            <CourseCreationNav
              currentStep={currentStep}
              currentCourse={currentCourse || null}
              resetCourseCreation={resetCourseCreation}
              steps={steps}
              setCurrentStep={setCurrentStep}
            />
          )}

          {/* Course Creation Steps Content */}
          {showCreateCourse && (
            <div className="course-creation-content">
              {currentStep === 'basic-info' && (
                <BasicInfoStep
                  courseBasicInfo={courseBasicInfo}
                  setCourseBasicInfo={setCourseBasicInfo}
                  handleCreateBasicCourse={handleCreateBasicCourse}
                />
              )}
              {currentStep === 'content-management' && currentCourse && (
                <ContentManagementStep 
                  course={currentCourse} 
                  setCourses={setCourses} 
                  onNext={handleContentStepNext} 
                  onPrev={handleContentStepPrev} 
                />
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
          )}

          {/* Courses List */}
          {!showCreateCourse && (
            <CoursesList
              courses={filteredCourses}
              courseFilter={courseFilter}
              viewMode={viewMode}
              setCourses={setCourses}
              setSelectedCourseId={setSelectedCourseId}
              setCurrentStep={(step: string) => setCurrentStep(step as CourseCreationStep)}
              setShowCreateCourse={setShowCreateCourse}
              setSelectedCourseForView={setSelectedCourseForView}
              setShowCourseDetails={setShowCourseDetails}
            />
          )}

          {/* Course Details Modal */}
          {showCourseDetails && selectedCourse && (
            <CourseDetails
              course={selectedCourse}
              onClose={closeCourseDetails}
              isClient={true}
            />
          )}
        </main>
      </div>
    </div>
  );
}