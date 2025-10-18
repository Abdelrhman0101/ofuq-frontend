'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import VideoSection from '../../components/VideoSection';
import CourseContent from '../../components/CourseContent';
import ScrollToTop from '../../components/ScrollToTop';
import styles from './watch.module.css';
import Quiz from '../../components/Quiz';
import { getUserLesson, completeLesson, Lesson } from '../../utils/lessonService';
import { getChapterQuiz, submitQuizAnswers, QuizQuestion as ChapterQuizQuestion } from '../../utils/quizService';
import { getBackendAssetUrl } from '../../utils/url';
import { isAuthenticated } from '../../utils/authService';
import { Course, getCourseDetails, getCourseProgress } from '../../utils/courseService';

function WatchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lessonIdParam = searchParams.get('lessonId');
  const chapterIdParam = searchParams.get('chapterId');
  const courseIdParam = searchParams.get('courseId');
  const lessonId = useMemo(() => lessonIdParam ? Number(lessonIdParam) : null, [lessonIdParam]);
  const chapterId = useMemo(() => chapterIdParam ? Number(chapterIdParam) : null, [chapterIdParam]);
  const courseId = useMemo(() => courseIdParam ? Number(courseIdParam) : null, [courseIdParam]);

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<{ id: number; question: string; options: string[]; correctAnswer: number }[]>([]);
  const [course, setCourse] = useState<Course | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [quizKey, setQuizKey] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        if (!isAuthenticated()) {
          setError('يرجى تسجيل الدخول للوصول إلى محتوى الدرس');
          return;
        }
        if (!lessonId) {
          setError('معرّف الدرس غير موجود في الرابط');
          return;
        }

        const { lesson: lessonData } = await getUserLesson(lessonId);
        setLesson(lessonData);

        // Load course details for content/navigate if courseId is provided
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

        // Fetch quiz questions if chapterId is available
        if (chapterId) {
          try {
            const quiz = await getChapterQuiz(chapterId);
            setQuizId(Number(quiz?.quiz?.id ?? null));
            const mapped = (quiz.questions || []).map((q: ChapterQuizQuestion, idx: number) => ({
              id: Number((q as any).id ?? idx + 1),
              question: q.question,
              options: q.options || [],
              correctAnswer: typeof (q as any).correct_answer === 'number' ? (q as any).correct_answer : -1
            }));
            setQuestions(mapped);
          } catch (e) {
            console.warn('تعذر جلب أسئلة الكويز:', e);
          }
        }
      } catch (err: any) {
        console.error('فشل تحميل بيانات المشاهدة', err);
        setError(err?.message || 'حدث خطأ أثناء تحميل الدرس');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [lessonId, chapterId, courseId]);

  const videoUrl = lesson?.video_url ? getBackendAssetUrl(lesson.video_url) : '/sample-video.mp4';
  const thumbnailUrl = '/banner.jpg';
  const isQuizRequired = questions.length > 0;
  const isLocked = isQuizRequired && !quizFinished;

  const handleQuizComplete = async (selectedAnswers: { [key: number]: number }) => {
    try {
      if (!quizId) {
        alert('لم يتم تحديد اختبار لهذا الفصل');
        return;
      }
      const answersPayload = questions.map((q, idx) => ({
        question_id: q.id,
        selected_indices: [selectedAnswers[idx]]
      }));

      const res = await submitQuizAnswers(quizId, answersPayload);
      const passed = Boolean(res?.attempt?.passed);

      if (passed) {
        setQuizFinished(true);
        if (lessonId) {
          try { await completeLesson(lessonId); } catch (err) { console.warn('تعذر إكمال الدرس:', err); }
        }
        if (courseId != null) {
          try { const progress = await getCourseProgress(courseId); setCourseProgress(progress); } catch (err) {}
        }
        alert('أحسنت! نجحت في اختبار الدرس. تم فتح الدرس والتنقل.');
      } else {
        alert('للأسف لم تجتز الاختبار. سيتم إعادة تحميل أسئلة جديدة للمحاولة مرة أخرى.');
        if (chapterId) {
          try {
            const quiz = await getChapterQuiz(chapterId);
            setQuizId(Number(quiz?.quiz?.id ?? null));
            const remapped = (quiz.questions || []).map((q: ChapterQuizQuestion, idx: number) => ({
              id: Number((q as any).id ?? idx + 1),
              question: q.question,
              options: q.options || [],
              correctAnswer: typeof (q as any).correct_answer === 'number' ? (q as any).correct_answer : -1
            }));
            setQuestions(remapped);
            setQuizFinished(false);
            setQuizKey(prev => prev + 1);
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

  // Compute previous/next lessons based on course data
  const { prevLesson, nextLesson } = useMemo(() => {
    if (!course || !course.chapters || !chapterId || !lessonId) return { prevLesson: null as null | { id: number; chapterId: number }, nextLesson: null as null | { id: number; chapterId: number } };
    // احرص على ترتيب الفصول والدروس حسب 'order' إن وجد لضمان تنقل منطقي
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
    router.push(`/watch?lessonId=${target.id}&chapterId=${target.chapterId}&courseId=${courseId}`);
  };

  return (
    <div className={styles['watch-page']} style={{ width: '100%', minHeight: '100vh' }}>
      <HomeHeader />
      
      <main className={styles['watch-main']} style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0 }}>
        {/* Video Section */}
        <div className={styles['video-container']} style={{ width: '100%' }}>
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '280px'
            }}>
              جاري تحميل محتوى الدرس...
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '280px',
              color: '#e74c3c'
            }}>
              {error}
            </div>
          ) : (
            <VideoSection 
              thumbnailUrl={thumbnailUrl}
              videoUrl={videoUrl}
              alt={lesson?.title || 'Course Video'}
              isLocked={isLocked}
              lockMessage={'محجوب حتى إكمال أسئلة الدرس'}
            />
          )}
          
          {/* Video Controls Bar - removed to avoid duplicate controls */}

          {/* Previous / Next lesson navigation */}
          <div className={styles['lesson-navigation']}>
            <button
              className={styles['lesson-nav-btn']}
              onClick={() => navigateToLesson(prevLesson)}
              disabled={!prevLesson || isLocked}
            >
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span>السابق</span>
            </button>

            <button
              className={styles['lesson-nav-btn']}
              onClick={() => navigateToLesson(nextLesson)}
              disabled={!nextLesson || isLocked}
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
              defaultExpandedChapterId={chapterId ?? undefined}
              activeLessonId={lessonId ?? undefined}
            />
          )}

          {/* Lesson details (real description/content) */}
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

          {questions.length > 0 && (
            <div style={{ marginTop: '24px' }}>
              <Quiz 
                key={quizKey}
                questions={questions}
                requireAllAnswered={true}
                onComplete={handleQuizComplete}
              />
            </div>
          )}
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
                onClick={() => router.push('/user/my_exams')}
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
      
      <Footer />
      <ScrollToTop />
    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div>جاري التحميل...</div>}>
      <WatchPageContent />
    </Suspense>
  );
}