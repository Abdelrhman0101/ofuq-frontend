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
import Quiz from '../../components/Quiz';
import SimulationQuiz from '../../components/SimulationQuiz';
import FinalExam from '../../components/FinalExam';
import Certificate from '../../components/Certificate';
import { getUserLesson, completeLesson, Lesson } from '../../utils/lessonService';

import { submitQuizAnswers, getLessonQuiz } from '../../utils/quizService';
import { getBackendAssetUrl } from '../../utils/url';
import { isAuthenticated } from '../../utils/authService';
import { Course, getCourseDetails, getCourseProgress, getCourseProgressDetails } from '../../utils/courseService';

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
  const [showQuizPopup, setShowQuizPopup] = useState(false);
  const [showFinalExam, setShowFinalExam] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [courseProgress, setCourseProgress] = useState<any>(null);
  const [simulationMode, setSimulationMode] = useState(SIMULATION_ENABLED);

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

        // التحقق من تسجيل الدخول
        if (!isAuthenticated()) {
          router.push('/auth');
          return;
        }

        // التحقق من وجود المعاملات المطلوبة
        if (!lessonId || !chapterId || !courseId) {
          setError('معاملات غير صحيحة في الرابط');
          return;
        }

        // تحميل بيانات الدرس
        const lessonData = await getUserLesson(lessonId);
        setLesson(lessonData.lesson);

        // تحميل بيانات الكورس
         const courseData = await getCourseDetails(courseId);
         setCourse(courseData);

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

      } catch (err) {
        console.error('خطأ في تحميل البيانات:', err);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [lessonId, chapterId, courseId, router]);

  // حساب الدروس السابقة والتالية
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course || !chapterId || !lessonId) return { prevLesson: null, nextLesson: null };

    const chapters = course.chapters || [];
    const sortedChapters = chapters
      .filter(ch => Array.isArray(ch.lessons) && ch.lessons.length > 0)
      .slice()
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));

    let allLessons: Array<{ id: number; chapterId: number; order: number }> = [];
    
    sortedChapters.forEach(chapter => {
      const sortedLessons = (chapter.lessons || [])
        .slice()
        .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
      
      sortedLessons.forEach(lesson => {
        allLessons.push({
          id: lesson.id,
          chapterId: chapter.id,
          order: ((lesson as any).order ?? 0)
        });
      });
    });

    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const next = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    return { prevLesson: prev, nextLesson: next };
  }, [course, chapterId, lessonId]);

  // دالة للتحقق من كون الدرس الحالي هو آخر درس في الدبلومة
  const isLastLessonInDiploma = useMemo(() => {
    if (!course || !lesson || !course.chapters || !course.category_id) return false;
    
    // ترتيب الفصول حسب الترتيب
    const sortedChapters = course.chapters
      .filter(ch => Array.isArray(ch.lessons) && ch.lessons.length > 0)
      .slice()
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
    
    if (sortedChapters.length === 0) return false;
    
    // الحصول على آخر فصل
    const lastChapter = sortedChapters[sortedChapters.length - 1];
    
    // ترتيب دروس آخر فصل
    const sortedLessons = (lastChapter.lessons || [])
      .slice()
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0));
    
    if (sortedLessons.length === 0) return false;
    
    // آخر درس في آخر فصل
    const lastLesson = sortedLessons[sortedLessons.length - 1];
    
    return lesson.id === lastLesson.id;
  }, [course, lesson]);
  
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

    // إذا كان الانتقال للأمام
    if (target.id > (lessonId || 0)) {
      // وضع المحاكاة: اعرض المودال إذا كانت هناك أسئلة
      if (simulationMode && isQuizRequired) {
        console.log('[Watch] opening quiz popup (simulation)');
        setShowQuizPopup(true);
        return;
      }

      // الوضع الحقيقي
      if (!simulationMode) {
        // إذا كان هناك كويز مطلوب ولم يُنه، اعرض المودال
        if (isQuizRequired && !quizFinished) {
          console.log('[Watch] opening quiz popup (real)');
          setShowQuizPopup(true);
          return;
        }
        // إذا لم يكن هناك كويز لهذا الدرس، اعتبره مكتملاً قبل الانتقال
        if (!isQuizRequired && lessonId) {
          console.log('[Watch] auto-completing lesson (no quiz)');
          try { await completeLesson(lessonId); } catch (e) { console.warn('تعذر إكمال الدرس بدون كويز:', e); }
          // تحديث شريط التقدم
          try { const progress = await getCourseProgress(courseId); setCourseProgress(progress); } catch { }
        }
      }
    }

    // التأكد من تمرير كل المعرفات اللازمة
    router.push(`/watch?lessonId=${target.id}&chapterId=${target.chapterId}&courseId=${courseId}`);
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

            <button
              className={styles['lesson-nav-btn']}
              onClick={() => {
                if (isLastLessonInDiploma) {
                  handleDiplomaCompletion();
                } else {
                  navigateToLesson(nextLesson);
                }
              }}
              disabled={(!nextLesson && !isLastLessonInDiploma) || sequenceBlocked}
            >
              <span>{isLastLessonInDiploma ? 'إنهاء الدبلومة' : 'التالي'}</span>
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
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
              onLessonClick={(lessonId, chapterId) => {
                router.push(`/watch?lessonId=${lessonId}&chapterId=${chapterId}&courseId=${courseId}`);
              }}
            />
          )}
        </div>

        {/* Quiz Popup */}
        {showQuizPopup && quizData && (
          simulationMode ? (
            <SimulationQuiz
              questions={quizData.questions}
              onClose={() => setShowQuizPopup(false)}
              onComplete={(score) => {
                console.log('Quiz completed with score:', score);
                setShowQuizPopup(false);
                setQuizFinished(true);
              }}
            />
          ) : (
            <Quiz
              questions={quizData.questions}
              onClose={() => setShowQuizPopup(false)}
              onComplete={async (answers) => {
                try {
                  // Transform answers format from { [key: number]: number } to the expected format
                  const formattedAnswers = Object.entries(answers).map(([questionId, selectedIndex]) => ({
                    question_id: parseInt(questionId),
                    selected_indices: selectedIndex
                  }));
                  
                  const result = await submitQuizAnswers(quizData.quiz?.id || quizData.id, formattedAnswers);
                  console.log('Quiz result:', result);
                  setQuizFinished(true);
                  setShowQuizPopup(false);
                  
                  // تحديث تقدم الكورس
                  try {
                    const progress = await getCourseProgress(courseId!);
                    setCourseProgress(progress);
                  } catch (e) {
                    console.warn('تعذر تحديث تقدم الكورس:', e);
                  }
                } catch (error) {
                  console.error('خطأ في إرسال إجابات الكويز:', error);
                  alert('حدث خطأ في إرسال الإجابات. يرجى المحاولة مرة أخرى.');
                }
              }}
            />
          )
        )}
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