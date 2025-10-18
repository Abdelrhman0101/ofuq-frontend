'use client';

import React, { useState, useEffect } from 'react';
import '../../../styles/globals.css';
import '../../../styles/courses.css';
import '../../../styles/modern-course-details.css';
import '../../../styles/toast.css';
import './courses.css';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import { Course, CourseCreationStep, Instructor } from '@/types/course';
import { getCourses, getAdminCourse } from '@/utils/courseService';
import { Category } from '@/utils/categoryService';

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    coverImage: null as File | null,
    duration: 0,
    instructor: undefined as Instructor | undefined,
    category: undefined as Category | undefined
  });

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    
    // Auto-hide success toasts after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        setToastVisible(false);
      }, 3000);
    }
  };

  const closeToast = () => {
    setToastVisible(false);
  };

  // Initialize with courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const fetchedCourses = await getCourses();
        
        // Transform API courses to match our Course interface
        const transformedCourses: Course[] = fetchedCourses.map(course => ({
          id: course.id.toString(),
          title: course.title,
          description: course.description,
          categoryId: course.category_id?.toString() || '',
          price: course.price,
          isFree: course.is_free,
          coverImage: course.cover_image,
          status: course.status,
          createdAt: new Date(course.created_at || Date.now()),
          chapters: [], // Will be populated when needed
          instructor: course.instructor ? {
            id: course.instructor.id,
            name: course.instructor.name,
            profileImage: course.instructor.image,
            bio: course.instructor.bio,
            specialization: course.instructor.title
          } : undefined,
          category: course.category
        }));
        
        setCourses(transformedCourses);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('فشل في تحميل الكورسات. الرجاء المحاولة مرة أخرى.');
        showToast('فشل في تحميل الكورسات', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Load full admin course details when selecting for edit
  useEffect(() => {
    const loadAdminCourse = async () => {
      if (!selectedCourseId) return;
      try {
        const adminCourse = await getAdminCourse(selectedCourseId);
        if (!adminCourse) return;
        const chapters = (adminCourse.chapters || []).map((ch: any) => ({
          id: String(ch.id),
          title: String(ch.title ?? ''),
          description: String(ch.description ?? ''),
          order: Number(ch.order ?? 1),
          lessons: (ch.lessons || []).map((l: any) => ({
            id: String(l.id),
            title: String(l.title ?? ''),
            description: String(l.content ?? ''),
            videoUrl: l.video_url ?? undefined,
            isVideoPublic: Boolean(l.is_visible ?? false),
            attachments: [],
            duration: undefined,
            order: Number(l.order ?? 1),
            questions: [],
            resources: [],
            quiz: undefined,
          })),
        }));

        setCourses(prev => prev.map(c => (
          c.id === selectedCourseId
            ? { ...c, chapters, chapters_count: chapters.length }
            : c
        )));
      } catch (err) {
        console.error('Error loading admin course details:', err);
        showToast('فشل في تحميل تفاصيل الكورس', 'error');
      }
    };
    loadAdminCourse();
  }, [selectedCourseId]);

  // useEffect to handle navigation after selectedCourseId updates
  useEffect(() => {
    // This effect runs whenever selectedCourseId changes.
    // If we have a new course ID and we are still on the first step,
    // it means we are ready to move to the next step.
    if (selectedCourseId && currentStep === 'basic-info') {
      setCurrentStep('content-management');
    }
  }, [selectedCourseId, currentStep]); // Dependency array

  // Function to close course details
  const closeCourseDetails = () => {
    setShowCourseDetails(false);
    setSelectedCourseForView(null);
    setExpandedChapters(new Set());
  };

  // Handle Basic Course Creation - Updated to receive course data from API
  const handleCreateBasicCourse = (courseData: any) => {
    // The courseData now comes from the API response with the actual course ID
    const newCourse: Course = {
      id: courseData.id.toString(),
      title: courseData.title,
      description: courseData.description,
      categoryId: courseData.category_id?.toString() || '',
      price: courseData.price,
      isFree: courseData.is_free,
      coverImage: courseData.cover_image,
      status: courseData.status || 'draft',
      createdAt: new Date(courseData.created_at || Date.now()),
      chapters: [],
      instructor: courseData.instructor
    };

    setCourses(prev => [...prev, newCourse]);
    setSelectedCourseId(newCourse.id);
    showToast('تم إنشاء الكورس بنجاح!', 'success');
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
    const courseToSave = currentCourse || workingCourse;
    if (courseToSave) {
      if (currentCourse) {
        // Editing existing course
        const updatedCourses = courses.map(course =>
          course.id === currentCourse.id
            ? { ...course, status: 'draft' as const }
            : course
        );
        setCourses(updatedCourses);
      } else if (workingCourse) {
        // Saving new course as draft - add to courses list
        const draftCourse = { ...workingCourse, status: 'draft' as const };
        setCourses(prevCourses => [...prevCourses, draftCourse]);
      }
      resetCourseCreation();
      showToast('تم حفظ الكورس كمسودة!', 'success');
    }
  };

  const handlePublish = () => {
    const courseToPublish = currentCourse || workingCourse;
    if (courseToPublish) {
      if (currentCourse) {
        // Editing existing course
        const updatedCourses = courses.map(course =>
          course.id === currentCourse.id
            ? { ...course, status: 'published' as const }
            : course
        );
        setCourses(updatedCourses);
      } else if (workingCourse) {
        // Publishing new course - add to courses list
        const publishedCourse = { ...workingCourse, status: 'published' as const };
        setCourses(prevCourses => [...prevCourses, publishedCourse]);
      }
      resetCourseCreation();
      showToast('تم نشر الكورس بنجاح!', 'success');
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
      coverImage: null,
      duration: 0,
      instructor: undefined,
      category: undefined
    });
  };

  // State for working course during creation
  const [workingCourse, setWorkingCourse] = useState<Course | null>(null);

  // Get current course being edited
  const currentCourse = selectedCourseId ? courses.find((c) => c.id === selectedCourseId) : null;

  // Update working course when basic info changes or when switching to content management
  useEffect(() => {
    if (showCreateCourse && currentStep !== 'basic-info' && !currentCourse) {
      if (!workingCourse) {
        // Create initial working course from basic info
        setWorkingCourse({
          id: 'temp-' + Date.now(),
          title: courseBasicInfo.title,
          description: courseBasicInfo.description,
          categoryId: courseBasicInfo.category?.id.toString() || '',
          price: courseBasicInfo.price,
          isFree: courseBasicInfo.isFree,
          coverImage: courseBasicInfo.coverImage || undefined,
          status: 'draft' as const,
          createdAt: new Date(),
          chapters: [],
          instructor: courseBasicInfo.instructor
        });
      }
    } else if (currentCourse) {
      // Use the real course if editing
      setWorkingCourse(currentCourse);
    } else if (!showCreateCourse) {
      // Clear working course when not in creation mode
      setWorkingCourse(null);
    }
  }, [showCreateCourse, currentStep, currentCourse, courseBasicInfo]);

  // Get the course to display (either real course or working course)
  const displayCourse = currentCourse || workingCourse;

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
              currentCourse={displayCourse} 
              resetCourseCreation={resetCourseCreation}
              steps={[
                { id: 'basic-info', title: 'المعلومات الأساسية', description: 'عنوان الكورس والوصف' },
                { id: 'content-management', title: 'إدارة المحتوى', description: 'الفصول والدروس' },
                { id: 'review', title: 'المراجعة والنشر', description: 'مراجعة نهائية ونشر الكورس' }
              ]}
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
                  onNext={() => setCurrentStep('content-management')}
                />
              )}
              {currentStep === 'content-management' && displayCourse && (
                <ContentManagementStep 
                  course={displayCourse} 
                  setCourses={(updateFn) => {
                    // Update working course directly for temporary course
                    if (displayCourse.id.startsWith('temp-')) {
                      if (typeof updateFn === 'function') {
                        const updatedCourses = updateFn([displayCourse]);
                        setWorkingCourse(updatedCourses[0]);
                      } else {
                        // updateFn is Course[] array
                        setWorkingCourse(updateFn[0]);
                      }
                    } else {
                      // Update courses state for real courses
                      setCourses(updateFn);
                    }
                  }}
                  onNext={handleContentStepNext} 
                  onPrev={handleContentStepPrev} 
                />
              )}
              {currentStep === 'review' && displayCourse && (
                <ReviewStep
                  currentCourse={displayCourse}
                  courseBasicInfo={courseBasicInfo}
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
      
      {/* Toast Component */}
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={closeToast}
      />
    </div>
  );
}