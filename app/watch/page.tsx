'use client';

const SIMULATION_ENABLED = true;

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
// تم حذف getChapterQuiz، لكننا ما زلنا بحاجة إلى submitQuizAnswers
import { submitQuizAnswers } from '../../utils/quizService';
import { getBackendAssetUrl } from '../../utils/url';
import { isAuthenticated } from '../../utils/authService';
import { Course, getCourseDetails, getCourseProgress } from '../../utils/courseService';

// الواجهة الخاصة بالسؤال كما هي معرفة في صفحة المشاهدة
// يمكنك استيرادها إذا كانت مشتركة
interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

// الواجهة الخاصة ببيانات الكويز القادمة من الدرس (افتراضية بناءً على تحليلك)
interface LessonQuiz {
  id: number;
  title: string;
  questions: Array<{
    id: number;
    question: string;
    options: string[];
    correct_answer: number | number[] | string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

function WatchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonIdParam = searchParams.get('lessonId');
  const chapterIdParam = searchParams.get('chapterId'); // ما زلنا بحاجة له لعرض القائمة الجانبية
  const courseIdParam = searchParams.get('courseId');   // وما زلنا بحاجة له للتنقل

  const lessonId = useMemo(() => (lessonIdParam ? Number(lessonIdParam) : null), [lessonIdParam]);
  const chapterId = useMemo(() => (chapterIdParam ? Number(chapterIdParam) : null), [chapterIdParam]);
  const courseId = useMemo(() => (courseIdParam ? Number(courseIdParam) : null), [courseIdParam]);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [quizKey, setQuizKey] = useState<number>(0); // لإعادة تحميل الكويز عند الفشل
  
  // حالات المحاكاة
  const [showFinalExam, setShowFinalExam] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [showQuizPopup, setShowQuizPopup] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<boolean>(SIMULATION_ENABLED);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuestions([]); // أعد تعيين الأسئلة عند تحميل درس جديد

        if (!isAuthenticated()) {
          setError('يرجى تسجيل الدخول للوصول إلى محتوى الدرس');
          return;
        }
        if (!lessonId) {
          setError('معرّف الدرس غير موجود في الرابط');
          return;
        }

        // 1. جلب بيانات الدرس (التي تحتوي الآن على الكويز)
        // نحتاج إلى تعريف (lessonData as any) مؤقتًا لأن واجهة 'Lesson' لم يتم تحديثها
        const { lesson: lessonData } = await getUserLesson(lessonId);
        setLesson(lessonData);

        // 2. [المنطق الجديد] استخراج الكويز من الدرس
        const lessonQuiz = (lessonData as any).quiz as LessonQuiz | null;

        if (lessonQuiz && lessonQuiz.questions && lessonQuiz.questions.length > 0) {
          setQuizId(Number(lessonQuiz.id));
          const mapped = lessonQuiz.questions.map((q, idx) => ({
            id: Number(q.id ?? idx + 1),
            question: q.question,
            options: q.options || [],
            // تحويل آمن للإجابة الصحيحة - تصحيح المنطق
            correctAnswer: typeof q.correct_answer === 'number' 
              ? q.correct_answer 
              : parseInt(String(q.correct_answer), 10) || 0
          }));
          setQuestions(mapped);
          setQuizFinished(false); // يجب إعادة تعيين حالة النجاح مع كل درس جديد
          setQuizKey(prev => prev + 1); // عرض كويز جديد
        } else {
          // لا يوجد كويز لهذا الدرس - في المحاكاة نعرض أسئلة وهمية
          if (simulationMode) {
            setQuestions([]);
            setQuizId(null);
            setQuizFinished(false); // في المحاكاة نعرض أسئلة وهمية
          } else {
            setQuestions([]);
            setQuizId(null);
            setQuizFinished(true); // نعتبره "منتهي" لأنه لا يوجد ما يجب إكماله
          }
        }

        // 3. جلب بيانات الكورس (لأجل العرض الجانبي والتنقل)
        if (courseId != null) {
          try {
            const courseData = await getCourseDetails(courseId);
            setCourse(courseData);
          } catch (e) {
            console.warn('تعذر جلب تفاصيل الكورس:', e);
          }
          try {
            const progress = await getCourseProgress(courseId);
            setCourseProgress(progress);
          } catch (e) {
            console.warn('تعذر جلب تقدم الكورس:', e);
          }
        }
        
        // 4. [المنطق القديم - تم حذفه]
        // (تم حذف استدعاء getChapterQuiz(chapterId) بالكامل)

      } catch (err: any) {
        console.error('فشل تحميل بيانات المشاهدة', err);
        setError(err?.message || 'حدث خطأ أثناء تحميل الدرس');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [lessonId, courseId]); // chapterId ليس ضرورياً هنا بعد الآن لجلب البيانات، لكنه مهم للتنقل

  const videoUrl = lesson?.video_url ? getBackendAssetUrl(lesson.video_url) : '/sample-video.mp4';
  const thumbnailUrl = '/banner.jpg'; // يمكنك تغييره ليأخذ صورة الكورس
  const isQuizRequired = questions.length > 0 || simulationMode; // في المحاكاة نعرض دائماً أسئلة
  
  // التحقق من كون هذا الدرس الأول في الكورس
  const isFirstLesson = useMemo(() => {
    if (!course || !lesson || !course.chapters) return false;
    const allLessons = course.chapters.flatMap(chapter => chapter.lessons);
    return allLessons.length > 0 && allLessons[0]?.id === lesson.id;
  }, [course, lesson]);
  
  // الدرس محجوب إذا كان الاختبار مطلوباً ولم يتم إنهاؤه، باستثناء الدرس الأول
  // في وضع المحاكاة، لا نحجب أي درس بعد إنهاء الأسئلة
  const isLocked = !simulationMode && isQuizRequired && !quizFinished && !isFirstLesson;

  // دوال المحاكاة
  const handleSimulationQuizEnd = () => {
    if (!course || !lesson || !course.chapters) return;
    
    // إغلاق popup الأسئلة
    setShowQuizPopup(false);
    
    // البحث عن الدرس التالي
    const allLessons = course.chapters.flatMap(chapter => chapter.lessons);
    const currentLessonIndex = allLessons.findIndex(l => l.id === lesson.id);
    const nextLesson = allLessons[currentLessonIndex + 1];
    
    if (nextLesson) {
      // الانتقال للدرس التالي
      router.push(`/watch?courseId=${courseId}&chapterId=${nextLesson.chapter_id}&lessonId=${nextLesson.id}`);
    } else {
      // هذا آخر درس - عرض الامتحان النهائي
      setShowFinalExam(true);
    }
  };

  const handleFinalExamComplete = () => {
    setShowFinalExam(false);
    setShowCertificate(true);
  };

  const handleCertificateClose = () => {
    setShowCertificate(false);
    // يمكن إضافة منطق إضافي هنا مثل العودة لصفحة الكورس
  };

  const handleQuizComplete = async (selectedAnswers: { [key: number]: number }) => {
    try {
      if (!quizId) {
        alert('لم يتم تحديد اختبار لهذا الدرس');
        return;
      }
      const answersPayload = questions.map((q, idx) => ({
        question_id: q.id,
        // تأكد من أن الباك إند يتوقع مصفوفة
        selected_indices: [selectedAnswers[idx]] 
      }));

      const res = await submitQuizAnswers(quizId, answersPayload);
      const passed = Boolean(res?.attempt?.passed);

      if (passed) {
        setQuizFinished(true); // فتح قفل الفيديو والتنقل
        if (lessonId) {
          try { await completeLesson(lessonId); } catch (err) { console.warn('تعذر إكمال الدرس:', err); }
        }
        if (courseId != null) {
          // تحديث شريط التقدم
          try { const progress = await getCourseProgress(courseId); setCourseProgress(progress); } catch (err) {}
        }
        alert('أحسنت! نجحت في اختبار الدرس. تم فتح الدرس والتنقل.');
      } else {
        alert('للأسف لم تجتز الاختبار. سيتم إعادة تحميل أسئلة جديدة للمحاولة مرة أخرى.');
        
        // [المنطق الجديد] إعادة تحميل الدرس لجلب أسئلة جديدة (إذا كان الباك إند يغيرها)
        if (lessonId) { 
          try {
            const { lesson: newLessonData } = await getUserLesson(lessonId);
            const lessonQuiz = (newLessonData as any).quiz as LessonQuiz | null;

            if (lessonQuiz && lessonQuiz.questions && lessonQuiz.questions.length > 0) {
              setQuizId(Number(lessonQuiz.id));
              const remapped = lessonQuiz.questions.map((q: any, idx: number) => ({
                id: Number(q.id ?? idx + 1),
                question: q.question,
                options: q.options || [],
                correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer : -1
              }));
              setQuestions(remapped);
            }
            setQuizFinished(false);
            setQuizKey(prev => prev + 1); // إعادة تعيين مكون الكويز
          } catch (e) {
            console.warn('تعذر إعادة تحميل أسئلة الكويز:', e);
          }
        }
      }
    } catch (err: any) {
      console.error('فشل إرسال إجابات الكويز:', err);
      alert(err?.response?.data?.message || 'حدث خطأ أثناء إرسال الإجابات. حاول مجدداً.');
    }
  };

  // منطق الدرس التالي/السابق (يبقى كما هو)
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course || !course.chapters || !chapterId || !lessonId) return { prevLesson: null, nextLesson: null };
    
    const chapters = course.chapters
      .filter(ch => Array.isArray(ch.lessons) && ch.lessons.length > 0)
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      }));
      
    const chIndex = chapters.findIndex(ch => ch.id === chapterId);
    if (chIndex < 0) return { prevLesson: null, nextLesson: null };
    
    const currentChapter = chapters[chIndex];
    const lIndex = (currentChapter.lessons || []).findIndex(l => l.id === lessonId);
    if (lIndex < 0) return { prevLesson: null, nextLesson: null };

    // Previous
    let prev: null | { id: number; chapterId: number } = null;
    if (lIndex > 0) {
      const l = currentChapter.lessons![lIndex - 1];
      prev = { id: l.id, chapterId: currentChapter.id };
    } else if (chIndex > 0) {
      const prevChapter = chapters[chIndex - 1];
      const last = (prevChapter.lessons || [])[prevChapter.lessons!.length - 1];
      if (last) prev = { id: last.id, chapterId: prevChapter.id };
    }

    // Next
    let next: null | { id: number; chapterId: number } = null;
    if (lIndex < (currentChapter.lessons!.length - 1)) {
      const l = currentChapter.lessons![lIndex + 1];
      next = { id: l.id, chapterId: currentChapter.id };
    } else if (chIndex < (chapters.length - 1)) {
      const nextChapter = chapters[chIndex + 1];
      const first = (nextChapter.lessons || [])[0];
      if (first) next = { id: first.id, chapterId: nextChapter.id };
    }

    return { prevLesson: prev, nextLesson: next };
  }, [course, chapterId, lessonId]);

  const navigateToLesson = (target: { id: number; chapterId: number } | null) => {
    if (!target || !courseId) return;
    
    // في وضع المحاكاة، إذا كان هذا زر "التالي" وهناك أسئلة، اعرض popup الأسئلة
    if (simulationMode && target.id > (lessonId || 0) && isQuizRequired) {
      setShowQuizPopup(true);
      return;
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
        studentName="الطالب" // يمكن الحصول عليه من بيانات المستخدم
        completionDate={new Date()}
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
              isLocked={isLocked} // تمرير حالة القفل
              lockMessage={'محجوب حتى إكمال أسئلة الدرس'}
            />
          )}
          
          {/* Previous / Next lesson navigation */}
          <div className={styles['lesson-navigation']}>
            <button
              className={styles['lesson-nav-btn']}
              onClick={() => navigateToLesson(prevLesson)}
              disabled={!prevLesson || isLocked} // تعطيل الزر إذا كان الدرس مقفلاً
            >
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>السابق</span>
            </button>

            <button
              className={styles['lesson-nav-btn']}
              onClick={() => navigateToLesson(nextLesson)}
              disabled={!nextLesson || isLocked} // تعطيل الزر إذا كان الدرس مقفلاً
            >
              <span>التالي</span>
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Course Content Section */}
        <div className={styles['course-content-section']} style={{ width: '100%', maxWidth: '100%', margin: 0 }}>
          {/* عرض المنهج الجانبي */}
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
              chapters={(course.chapters || []).map(ch => ({
                id: ch.id,
                title: ch.title,
                lessons: (ch.lessons || []).map(l => ({ id: l.id, title: l.title, video_url: l.video_url ?? null }))
              }))}
              defaultExpandedChapterId={chapterId ?? undefined} // فتح الفصل الحالي
              activeLessonId={lessonId ?? undefined} // تعليم الدرس الحالي
            />
          )}

          {/* وصف الدرس */}
          {lesson && (
            <div style={{ marginTop: '24px', padding: '0 16px' }}>
              <h2>وصف الدرس :</h2>
              {lesson.description && (
                <p className={styles['course-overview']}>{lesson.description}</p>
              )}
              {lesson.content && (
                <div className={styles['course-overview']}>{lesson.content}</div>
              )}
            </div>
          )}

          {/* عرض الكويز */}
          {simulationMode && !loading && (
            <div style={{ marginTop: '24px' }}>
              <SimulationQuiz 
                onEnd={handleSimulationQuizEnd}
                isLastLesson={(() => {
                  if (!course || !lesson) return false;
                  const allLessons = course.chapters.flatMap(chapter => chapter.lessons);
                  const currentLessonIndex = allLessons.findIndex(l => l.id === lesson.id);
                  return currentLessonIndex === allLessons.length - 1;
                })()}
              />
            </div>
          )}
          
          {/* الكويز الأصلي - يظهر فقط عندما تكون المحاكاة معطلة */}
          {!simulationMode && questions.length > 0 && !loading && (
            <div style={{ marginTop: '24px' }}>
              <Quiz 
                key={quizKey} // استخدام المفتاح لإعادة التحميل
                questions={questions}
                requireAllAnswered={true}
                onComplete={handleQuizComplete}
              />
            </div>
          )}

          {/* شريط التقدم والاختبار النهائي */}
          {courseId && (
            <div style={{
              marginTop: '32px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              padding: '16px'
            }}>
              <h3 style={{ margin: 0, marginBottom: 12, color: '#2c3e50' }}>الاختبار النهائي</h3>
              <div style={{ width: '100%', height: 8, background: '#e0e0e0', borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)', width: `${Math.min(100, Math.max(0, courseProgress))}%`, transition: 'width 0.3s ease' }}></div>
              </div>
              <p style={{ fontSize: 12, color: '#666', margin: 0, fontWeight: 500, textAlign: 'center' }}>
                مكتمل بنسبة {Math.round(courseProgress)}%
              </p>
              <button 
                onClick={() => router.push('/user/my_exams')} // افترض أن هذا هو الرابط الصحيح
                disabled={courseProgress < 100}
                style={{
                  width: '100%',
                  background: courseProgress >= 100 ? '#019EBB' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: courseProgress >= 100 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  marginTop: 15
                }}
              >
                {courseProgress >= 100 ? 'ابدأ الاختبار النهائي' : 'أكمل جميع الدروس لبدء الاختبار النهائي'}
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Quiz Popup */}
      {showQuizPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '800px',
            width: '95%',
            maxHeight: '85vh',
            overflowY: 'auto',
            position: 'relative',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
          }}>
            <button
              onClick={() => setShowQuizPopup(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
            <SimulationQuiz 
              onFinish={handleSimulationQuizEnd}
              isLastLesson={(() => {
                if (!course || !lesson) return false;
                const allLessons = course.chapters.flatMap(chapter => chapter.lessons);
                const currentLessonIndex = allLessons.findIndex(l => l.id === lesson.id);
                return currentLessonIndex === allLessons.length - 1;
              })()}
            />
          </div>
        </div>
      )}
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}

// المكون الأساسي الذي يُصدّر
export default function WatchPage() {
  return (
    // استخدام Suspense ضروري لأن الصفحة تستخدم useSearchParams
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>جاري التحميل...</div>}>
      <WatchPageContent />
    </Suspense>
  );
}