'use client';

const SIMULATION_ENABLED = false;

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import VideoSection from '../../components/VideoSection';
import CourseContent from '../../components/CourseContent';
import ScrollToTop from '../../components/ScrollToTop';
import styles from './watch.module.css'; // تأكد من أن هذا المسار صحيح
import FinalExam from '../../components/FinalExam';
import Certificate from '../../components/Certificate';
import { getUserLesson, completeLesson, getLessonNavigation, type LessonNavigation, Lesson } from '../../utils/lessonService';

import { getLessonQuiz } from '../../utils/quizService';
import { getBackendAssetUrl } from '../../utils/url';
import { isAuthenticated } from '../../utils/authService';
import { Course, getCourseDetails, getCourseProgress, getCourseProgressDetails, checkCourseAccess } from '../../utils/courseService';
import Toast from '../../components/Toast';
import '@/styles/toast.css';

// تعريف أنواع البيانات
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

// تعريف نوع البيانات للكويز
interface LessonQuiz {
  id: number;
  title: string;
  description?: string | null;
  max_attempts?: number;
  passing_score?: number;
  time_limit?: number;
  attempts_used?: number;
  attempts_remaining?: number;
  quiz?: {
    id: number;
    [key: string]: any;
  };
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    type: 'single' | 'multiple';
    correctAnswer: number | number[] | null;
    [key: string]: any;
  }>;
  [key: string]: any;
}

function WatchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // استخراج المعاملات من URL
  const lessonId = searchParams.get('lessonId') ? parseInt(searchParams.get('lessonId')!) : null;
  const chapterId = searchParams.get('chapterId') ? parseInt(searchParams.get('chapterId')!) : null;
  const courseId = searchParams.get('courseId') ? parseInt(searchParams.get('courseId')!) : null;

  // الحالات المحلية
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ألغينا نافذة الكويز بين الدروس
  const [showFinalExam, setShowFinalExam] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [simulationMode, setSimulationMode] = useState(SIMULATION_ENABLED);
  const [lessonNav, setLessonNav] = useState<LessonNavigation | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('warning');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'warning') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // حالات الكويز
  const [quizData, setQuizData] = useState<LessonQuiz | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);

  // المتغيرات المحسوبة
  const sequenceBlocked = false; // يمكن تحديد منطق منع التسلسل هنا
  const thumbnailUrl = lesson?.thumbnail ? getBackendAssetUrl(lesson.thumbnail) : '';
  const videoUrl = lesson?.video_url ? getBackendAssetUrl(lesson.video_url) : '';
  const isQuizRequired = quizData && quizData.questions && quizData.questions.length > 0;
  const isLocked = false; // يمكن تحديد منطق القفل هنا
  const lockMessage = '';

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // التحقق من وجود المعاملات المطلوبة
        if (!lessonId || !chapterId || !courseId) {
          setError('معاملات غير صحيحة في الرابط');
          return;
        }
        
        // حارس الوصول: استخدم GET /api/courses/{courseId}/progress للتحقق النهائي
        try {
          const access = await checkCourseAccess(courseId);
          if (!access.allowed) {
            showToast('غير مسموح بالدخول، يرجى الاشتراك في الدبلومة', 'warning');
            setTimeout(() => {
              router.push(`/course-details/${courseId}`);
            }, 1500);
            return;
          }
        } catch (guardErr) {
          console.warn('تعذر تنفيذ حارس الوصول للكورس:', guardErr);
          showToast('تعذر التحقق من الوصول للمحتوى', 'error');
          setTimeout(() => {
            router.push(`/course-details/${courseId}`);
          }, 1500);
          return;
        }

        // تحميل بيانات الكورس
        const courseData = await getCourseDetails(courseId);
        setCourse(courseData);

        // تحميل بيانات الدرس بعد التأكد من الوصول
        const lessonData = await getUserLesson(lessonId);
        setLesson(lessonData.lesson);

        // تحميل تقدم الكورس
        try {
          const progress = await getCourseProgress(courseId);
          setCourseProgress(progress);
        } catch (progressError) {
          console.warn('تعذر تحميل تقدم الكورس:', progressError);
        }

        // تحميل بيانات الكويز إذا كان متاحاً
        try {
          const quiz = await getLessonQuiz(lessonId);
          setQuizData(quiz);
          
          // التحقق من حالة إنجاز الكويز
          if (quiz && courseProgress) {
            const lessonProgress = courseProgress.lessons?.find((l: any) => l.lesson_id === lessonId);
            setQuizFinished(lessonProgress?.quiz_completed || false);
          }
        } catch (quizError) {
          console.log('لا يوجد كويز لهذا الدرس:', quizError);
          setQuizData(null);
        }

        // جلب بيانات تنقل الدرس (السابق/التالي وهل الحالي الأخير)
        try {
          const nav = await getLessonNavigation(lessonId);
          setLessonNav(nav);
        } catch (navError) {
          console.warn('تعذر جلب بيانات تنقل الدرس:', navError);
        }

      } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, chapterId, courseId, router]);

  // بناء تسلسل الدروس اعتمادًا على بيانات الكورس كـ fallback آمن
  const flatLessons = useMemo(() => {
    if (!course) return [] as Array<{ id: number; chapterId: number }>;
    const items: Array<{ id: number; chapterId: number }> = [];
    (course.chapters || []).forEach((ch: any) => {
      const lessons = Array.isArray(ch.lessons) ? ch.lessons : [];
      // نستخدم ترتيب الدروس كما هو مرسل من الباك إند
      lessons.forEach((ls: any) => {
        if (ls && ls.id != null) {
          items.push({ id: Number(ls.id), chapterId: Number(ch.id) });
        }
      });
    });
    return items;
  }, [course]);

  const currentIndex = useMemo(() => {
    if (!lessonId) return -1;
    return flatLessons.findIndex((l) => Number(l.id) === Number(lessonId));
  }, [flatLessons, lessonId]);

  // حساب الدروس السابقة والتالية اعتمادًا على تسلسل الكورس (بدلاً من الاعتماد فقط على واجهة التنقل)
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course || currentIndex < 0) return { prevLesson: null, nextLesson: null };
    const prev = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;
    const next = currentIndex >= 0 && currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
    return { prevLesson: prev, nextLesson: next };
  }, [course, flatLessons, currentIndex]);

  // مؤشرات الحالة اعتمادًا على تسلسل الكورس لضمان عدم اعتبار كل درس كالأخير
  const isLastLesson = useMemo(() => {
    if (currentIndex < 0) return false;
    return currentIndex === flatLessons.length - 1;
  }, [flatLessons, currentIndex]);

  const isNextLast = useMemo(() => {
    if (currentIndex < 0) return false;
    return currentIndex === flatLessons.length - 2;
  }, [flatLessons, currentIndex]);
  
  // دالة إنهاء الدبلومة
  const handleDiplomaCompletion = async () => {
    if (!course || !lesson) return;
    
    try {
      // إكمال الدرس الحالي أولاً
      await completeLesson(lesson.id);
      
      // عرض alert مبروك
      alert('🎉 مبروك! لقد أتممت المقرر بنجاح 🎉\n\nسيتم تحويلك الآن إلى صفحة تفاصيل الدبلومة');
      
      // التحويل لصفحة تفاصيل الدبلومة
      if (course.category?.name) {
        // استخدام اسم الدبلومة كـ slug (يمكن تحسينه لاحقاً)
        const diplomaSlug = course.category.name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/diplomas/${diplomaSlug}`);
      } else {
        // fallback إلى صفحة الدبلومات العامة
        router.push('/diplomas');
      }
    } catch (error) {
      console.error('خطأ في إنهاء الدبلومة:', error);
      alert('حدث خطأ أثناء إنهاء الدبلومة. يرجى المحاولة مرة أخرى.');
    }
  };

  // دوال معالجة الأحداث
  const handleCertificateClose = () => {
    setShowCertificate(false);
  };

  const handleFinalExamComplete = () => {
    setShowFinalExam(false);
    setShowCertificate(true);
  };

  const navigateToLesson = async (target: { id: number; chapterId: number } | null) => {
    console.log("--- Inside navigateToLesson ---");
    console.log("Target Lesson:", target);
    console.log("Current Lesson ID:", lessonId);
    console.log("Is Moving Forward:", target && target.id > (lessonId || 0));
    console.log("Simulation Mode:", simulationMode);
    console.log("Is Quiz Required for CURRENT lesson?", isQuizRequired);
    console.log("Is Quiz Finished for CURRENT lesson?", quizFinished);
    console.log("--- End navigateToLesson Check ---");

    if (!target || !courseId) return;

    // إذا كان الانتقال للأمام: أكمِل الدرس الحالي دائمًا ثم انتقل
    if (target.id > (lessonId || 0)) {
      if (lessonId) {
        console.log('[Watch] completing current lesson before moving forward');
        try { await completeLesson(lessonId); } catch (e) { console.warn('تعذر إكمال الدرس قبل الانتقال:', e); }
        // تحديث شريط التقدم
        try { const progress = await getCourseProgress(courseId); setCourseProgress(progress); } catch { }
      }
    }

    // التأكد من تمرير كل المعرفات اللازمة
    router.push(`/watch?lessonId=${target.id}&chapterId=${target.chapterId}&courseId=${courseId}`);
  };

  const goToMyExams = async () => {
    if (!lessonId) return;
    try {
      await completeLesson(lessonId);
    } catch (e) {
      console.warn('تعذر إكمال الدرس الأخير قبل التحويل:', e);
    }
    router.push('/user/my_exams');
  };

  // عرض الشهادة
  if (showCertificate && course) {
    return (
      <Certificate
        courseName={course.title}
        instructorName={course.instructor?.name || "المدرب"}
        studentName="الطالب"
        completionDate={new Date().toLocaleDateString('ar-EG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
        onClose={handleCertificateClose}
      />
    );
  }

  // عرض الامتحان النهائي
  if (showFinalExam && course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">الامتحان النهائي</h1>
              <p className="text-gray-600 mb-4">كورس: {course.title}</p>
            </div>
            <FinalExam onComplete={handleFinalExamComplete} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['watch-page']} style={{ width: '100%', minHeight: '100vh' }}>
      <HomeHeader />
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={2500}
      />

      <main className={styles['watch-main']} style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
        {/* Video Section */}
        <div className={styles['video-container']} style={{ width: '100%' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px' }}>
              جاري تحميل محتوى الدرس...
            </div>
          ) : error ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '280px', color: '#e74c3c' }}>
              {error}
            </div>
          ) : (
            <VideoSection
              thumbnailUrl={thumbnailUrl}
              videoUrl={videoUrl}
              alt={lesson?.title || 'Course Video'}
              isLocked={isLocked}
              lockMessage={lockMessage}
              onEnded={() => navigateToLesson(nextLesson)}
            />
          )}

          {/* Previous / Next lesson navigation */}
          <div className={styles['lesson-navigation']}>
            <button
              className={styles['lesson-nav-btn']}
              onClick={() => navigateToLesson(prevLesson)}
              disabled={!prevLesson}
            >
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>السابق</span>
            </button>

            {isLastLesson ? (
              <button
                className={styles['lesson-nav-btn']}
                onClick={goToMyExams}
              >
                <span>اختباراتي</span>
                <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            ) : (
              <button
                className={styles['lesson-nav-btn']}
                onClick={() => navigateToLesson(nextLesson)}
                disabled={!nextLesson || sequenceBlocked}
              >
                <span>التالي</span>
                <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
            {isNextLast && (
              <div style={{ marginInlineStart: '12px', color: '#7f8c8d' }}>ملاحظة: الدرس القادم هو الأخير</div>
            )}
          </div>
        </div>

        {/* Course Content Section */}
        <div className={styles['course-content-section']} style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
          {course && (
            <CourseContent
              rating={Number(course.average_rating ?? course.rating ?? 0)}
              courseTitle={course.title || 'عنوان الكورس'}
              lecturesCount={(course.chapters || []).reduce((acc, ch) => acc + ((ch.lessons || []).length), 0)}
              studentsCount={Number(course.students_count ?? 0)}
              hoursCount={Number(course.duration ?? 0)}
              courseDescription={course.description || ''}
              courseId={String(course.id)}
              isEnrolled={true}
              chapters={course.chapters || []}
              currentLessonId={lessonId}
              currentChapterId={chapterId}
              courseProgress={courseProgress}
              onLessonClick={(lsId, chId) => {
                navigateToLesson({ id: lsId, chapterId: chId });
              }}
            />
          )}
        </div>

        {/* تم إلغاء نافذة الكويز بين الدروس */}
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}

// المكون الأساسي الذي يُصدّر
export default function WatchPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>جاري التحميل...</div>}>
      <WatchPageContent />
    </Suspense>
  );
}