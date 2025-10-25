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
// تم حذف getChapterQuiz، لكننا ما زلنا بحاجة إلى submitQuizAnswers
import { submitQuizAnswers, getLessonQuiz } from '../../utils/quizService';
import { getBackendAssetUrl } from '../../utils/url';
import { isAuthenticated } from '../../utils/authService';
import { Course, getCourseDetails, getCourseProgress, getCourseProgressDetails } from '../../utils/courseService';

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
  quiz?: {
    id: number;
    [key: string]: any;
  };
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
  const [isQuizRequired, setIsQuizRequired] = useState(false);
  const [courseProgress, setCourseProgress] = useState<number>(0);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [quizKey, setQuizKey] = useState<number>(0); // لإعادة تحميل الكويز عند الفشل
  const [savedAnswers, setSavedAnswers] = useState<{ [key: number]: number }>({});
  const [canGoNextLocal, setCanGoNextLocal] = useState<boolean>(false);
  const quizStorageKey = useMemo(() => (courseId && lessonId ? `quizState:${courseId}:${lessonId}` : null), [courseId, lessonId]);

  // حالات المحاكاة
  const [showFinalExam, setShowFinalExam] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [showQuizPopup, setShowQuizPopup] = useState<boolean>(false);
  const [simulationMode, setSimulationMode] = useState<boolean>(SIMULATION_ENABLED);
  const [sequenceBlocked, setSequenceBlocked] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setQuestions([]); // أعد تعيين الأسئلة عند تحميل درس جديد
        setQuizFinished(false); // إعادة تعيين حالة اجتياز الاختبار عند تحميل درس جديد

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

        // 2. [المنطق الجديد] جلب كويز الدرس من الباك إند
        const lessonQuiz = await getLessonQuiz(lessonId);
        console.log('[Watch] getLessonQuiz:', { lessonId, lessonQuiz });
        // تأكيد وجود quiz داخل كائن الدرس حتقطع isQuizRequired عليه
        try {
          if (lessonData) {
            setLesson({ ...(lessonData as any), quiz: lessonQuiz } as any);
          }
        } catch { }

        // Adjust quiz handling to align with utils/quizService LessonQuiz shape
        // The returned LessonQuiz has top-level `id` and `questions`, not nested `quiz`.
        if (lessonQuiz && lessonQuiz.id && Array.isArray(lessonQuiz.questions) && lessonQuiz.questions.length > 0) {
          setQuizId(Number(lessonQuiz.id));
          const mapped = lessonQuiz.questions.map((q: any, idx: number) => {
            let parsedOptions: string[] = [];
            try {
              if (Array.isArray(q.options)) {
                parsedOptions = q.options.filter((opt: any) => typeof opt === 'string');
              } else if (typeof q.options === 'string') {
                const raw = String(q.options).trim();
                parsedOptions = JSON.parse(raw || '[]');
                if (!Array.isArray(parsedOptions)) {
                  parsedOptions = [];
                } else {
                  parsedOptions = parsedOptions.map((opt: any) => String(opt));
                }
              } else if (Array.isArray(q.answers)) {
                parsedOptions = q.answers.map((opt: any) => opt?.text ?? String(opt));
              } else {
                parsedOptions = [];
              }
            } catch {
              parsedOptions = [];
            }
            return {
              id: Number(q.id ?? idx + 1),
              question: q.question ?? q.title ?? '',
              options: parsedOptions,
              correctAnswer: 0,
            };
          });
          setQuestions(mapped);
          setQuizFinished(false);
          setQuizKey(prev => prev + 1);
          // تحميل الحالة المخزنة محلياً (إجابات/نجاح) لمرونة ما بعد الريفريش
          if (quizStorageKey) {
            try {
              const raw = localStorage.getItem(quizStorageKey);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && typeof parsed === 'object') {
                  if (parsed.answers) setSavedAnswers(parsed.answers);
                  if (parsed.passed) {
                    setCanGoNextLocal(true);
                    // لا نعيّن quizFinished هنا، سيتم تعيينها بناءً على بيانات التقدم من الخادم
                  }
                }
              }
            } catch { }
          }
        } else {
          // لا يوجد اختبار صالح أو لا توجد أسئلة
          console.log('[Watch] no quiz found or no questions for lesson:', lessonId);
          if (simulationMode) {
            setQuestions([]);
            setQuizId(null);
            setQuizFinished(false);
          } else {
            setQuestions([]);
            setQuizId(null);
            // لا نقوم بتعيين quizFinished هنا، سيتم تعيينها بناءً على بيانات التقدم
            // يمكن الاعتماد على isQuizRequired ليبقى false إذا لم يتم تحميل اختبار
          }
        }

        // 3. جلب بيانات الكورس (لأجل العرض الجانبي والتنقل)
        if (courseId != null) {
          try {
            const courseData = await getCourseDetails(courseId);
            setCourse(courseData);

            // جلب تفاصيل التقدم والتحقق من حجب التسلسل
            try {
              const progressDetails = await getCourseProgressDetails(courseId);
              if (courseData && lessonId && progressDetails && Array.isArray(progressDetails.lessons)) {
                const chapters = (courseData.chapters || [])
                  .filter(ch => Array.isArray(ch.lessons) && ch.lessons.length > 0)
                  .slice()
                  .sort((a: any, b: any) => ((a?.order ?? 0) - (b?.order ?? 0)))
                  .map(ch => ({
                    ...ch,
                    lessons: (ch.lessons || []).slice().sort((a: any, b: any) => ((a?.order ?? 0) - (b?.order ?? 0)))
                  }));
                const chIndex = chapters.findIndex(ch => ch.id === (chapterId ?? ch.id));
                let prevCandidate: { id: number; chapterId: number } | null = null;
                if (chIndex >= 0) {
                  const currentChapter = chapters[chIndex];
                  const lIndex = (currentChapter.lessons || []).findIndex((l: any) => l.id === lessonId);
                  if (lIndex > 0) {
                    const l = currentChapter.lessons![lIndex - 1];
                    prevCandidate = { id: l.id, chapterId: currentChapter.id };
                  } else if (chIndex > 0) {
                    const prevChapter = chapters[chIndex - 1];
                    const last = (prevChapter.lessons || [])[prevChapter.lessons!.length - 1];
                    if (last) prevCandidate = { id: last.id, chapterId: prevChapter.id };
                  }
                }
                if (prevCandidate) {
                  const prevProgress = progressDetails.lessons.find(l => Number(l.lesson_id) === Number(prevCandidate!.id));
                  // تحديد إن كان الدرس السابق هو الدرس الأول
                  const overallFirstLessonId = (() => {
                    const firstChapter = chapters[0];
                    if (!firstChapter || !firstChapter.lessons || firstChapter.lessons.length === 0) return null;
                    return firstChapter.lessons[0].id;
                  })();
                  const isPrevFirstLesson = overallFirstLessonId != null && Number(prevCandidate.id) === Number(overallFirstLessonId);

                  // هل لدى الدرس السابق كويز مطلوب فعلاً؟
                  let prevHasQuiz = false;
                  try {
                    const prevLessonQuiz = await getLessonQuiz(prevCandidate.id);
                    prevHasQuiz = !!(prevLessonQuiz && Array.isArray(prevLessonQuiz.questions) && prevLessonQuiz.questions.length > 0);
                  } catch (e) {
                    prevHasQuiz = false;
                  }

                  // تفعيل الحجب فقط إذا لم يكن السابق هو الأول وكان لديه كويز غير مجتاز
                  const blocked = !isPrevFirstLesson && prevHasQuiz && (!prevProgress || prevProgress.quiz_passed === false);
                  setSequenceBlocked(blocked);

                  // تحديث حالة اجتياز كويز الدرس الحالي بناءً على تفاصيل التقدم
                  const currentProgress = progressDetails.lessons.find(l => Number(l.lesson_id) === Number(lessonId));
                  if (currentProgress && typeof currentProgress.quiz_passed !== 'undefined') {
                    setQuizFinished(Boolean(currentProgress.quiz_passed));
                  } else {
                    // إذا لم توجد بيانات تقدم للدرس الحالي، فالاختبار لم يُجتز بعد
                    setQuizFinished(false);
                  }
                } else {
                  setSequenceBlocked(false);
                }
              }
            } catch (e) {
              console.warn('تعذر جلب تفاصيل التقدم:', e);
              setSequenceBlocked(false);
            }
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

  useEffect(() => {
    // The original logic was `(quizId !== null && questions.length > 0) || simulationMode`
    // The new logic from the instruction is to make it dependent on quizFinished as well.
    // This changes the meaning of `isQuizRequired` to be "a quiz is currently required to proceed".
    const required = (quizId !== null && questions.length > 0) || simulationMode;
    setIsQuizRequired(required);
  }, [quizId, questions, simulationMode]);

  // القفل بسبب الاختبار فقط
  const isQuizGateLocked = isQuizRequired && !quizFinished;

  // الدرس محجوب إذا كان الاختبار مطلوباً ولم يتم إنهاؤه، بالإضافة إلى حجب التسلسل
  const isLocked = (isQuizGateLocked || sequenceBlocked);
  const lockMessage = sequenceBlocked ? 'محجوب حتى إكمال الدرس السابق والاختبار المرتبط به' : 'محجوب حتى إكمال أسئلة الدرس';

  // تحديد هل الدرس الحالي هو الأول في المنهج
  const isFirstLesson = useMemo(() => {
    if (!course || !course.chapters || !lessonId) return false;
    const firstChapter = course.chapters[0];
    if (!firstChapter || !firstChapter.lessons || firstChapter.lessons.length === 0) return false;
    const firstLessonId = firstChapter.lessons[0]?.id;
    return Number(firstLessonId) === Number(lessonId);
  }, [course, lessonId]);
  useEffect(() => {
    console.log('[Watch] state snapshot', {
      isLocked,
      isQuizRequired,
      quizFinished,
      sequenceBlocked,
    });
  }, [isLocked, isQuizRequired, quizFinished, sequenceBlocked]);

  // فتح الكويز تلقائياً عند تحميل الدرس إذا كان مطلوباً، وأضف تأثيراً لإرجاع المستخدم للدرس السابق إذا كان الدرس الحالي محجوباً بالتسلسل. عدّل منطق handleQuizComplete ليغلق المودال ويتنقل تلقائياً للدرس التالي بعد اجتياز الكويز. فعّل زر السابق دائماً بعدم ربطه بالحجب
  useEffect(() => {
    if (!loading && isQuizGateLocked && !showQuizPopup && questions.length > 0) {
      setShowQuizPopup(true);
    }
  }, [loading, isQuizGateLocked, showQuizPopup, questions.length]);

  // في حال محاولة فتح درس محجوب بالتسلسل، ارجع للدرس السابق وافتح الكويز
  useEffect(() => {
    if (!loading && sequenceBlocked && prevLesson) {
      navigateToLesson(prevLesson);
    }
  }, [loading, sequenceBlocked]);

  useEffect(() => {
    console.log('[Watch] showQuizPopup changed:', showQuizPopup);
  }, [showQuizPopup]);

  // دوال المحاكاة
  const handleSimulationQuizEnd = () => {
    if (!course || !lesson || !course.chapters) return;

    // إغلاق popup الأسئلة
    setShowQuizPopup(false);

    // استخدام منطق الدرس التالي الموجود
    if (nextLesson) {
      // الانتقال للدرس التالي
      router.push(`/watch?courseId=${courseId}&chapterId=${nextLesson.chapterId}&lessonId=${nextLesson.id}`);
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
      // حفظ الإجابات محلياً لأي إعادة فتح أو ريفريش
      setSavedAnswers(selectedAnswers);
      if (quizStorageKey) {
        try { localStorage.setItem(quizStorageKey, JSON.stringify({ answers: selectedAnswers, passed: false })); } catch { }
      }
      const answersPayload = questions.map((q, idx) => ({
        question_id: q.id,
        selected_indices: [selectedAnswers[idx]]
      }));

      const res = await submitQuizAnswers(quizId, answersPayload);
      const passed = Boolean(res?.passed);

      if (passed) {
        setQuizFinished(true); // فتح قفل الفيديو والتنقل
        setCanGoNextLocal(true); // إظهار زر الانتقال داخل المودال
        if (quizStorageKey) {
          try { localStorage.setItem(quizStorageKey, JSON.stringify({ answers: selectedAnswers, passed: true })); } catch { }
        }
        if (lessonId) {
          try { await completeLesson(lessonId); } catch (err) { console.warn('تعذر إكمال الدرس:', err); }
        }
        if (courseId != null) {
          // تحديث شريط التقدم
          try { const progress = await getCourseProgress(courseId); setCourseProgress(progress); } catch (err) { }
        }

        // لا نغلق المودال تلقائياً؛ نظهر زر "الدرس التالي" ليكون الانتقال صريحاً
      } else {
        alert('للأسف لم تجتز الاختبار. سيتم إعادة تحميل أسئلة جديدة للمحاولة مرة أخرى.');
        setCanGoNextLocal(false);

        // [المنطق الجديم] إعادة تحميل الدرس لجلب أسئلة جديدة (إذا كان الباك إند يغيرها)
        if (lessonId) {
          try {
            const { lesson: newLessonData } = await getUserLesson(lessonId);
            const lessonQuiz = (newLessonData as any).quiz as LessonQuiz | null;

            if (lessonQuiz && lessonQuiz.questions && lessonQuiz.questions.length > 0) {
              setQuizId(Number(lessonQuiz.id));
              const remapped = lessonQuiz.questions.map((q: any, idx: number) => {
                let parsedOptions: string[] = [];
                try {
                  if (Array.isArray(q.options)) {
                    parsedOptions = q.options.filter((opt: any) => typeof opt === 'string');
                  } else if (typeof q.options === 'string') {
                    const raw = String(q.options).trim();
                    parsedOptions = JSON.parse(raw || '[]');
                    if (!Array.isArray(parsedOptions)) {
                      parsedOptions = [];
                    } else {
                      parsedOptions = parsedOptions.map((opt: any) => String(opt));
                    }
                  } else {
                    parsedOptions = [];
                  }
                } catch (e) {
                  console.error('Failed to parse options for question (retry):', q.id, q.options, e);
                  parsedOptions = [];
                }
                return {
                  id: Number(q.id ?? idx + 1),
                  question: q.question,
                  options: parsedOptions,
                  correctAnswer: typeof q.correct_answer === 'number' ? q.correct_answer : -1
                };
              });
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
      .sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0))
      .map(ch => ({
        ...ch,
        lessons: (ch.lessons || []).slice().sort((a, b) => ((a as any).order ?? 0) - ((b as any).order ?? 0))
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

  const navigateToLesson = async (target: { id: number; chapterId: number } | null) => {
    console.log("--- Inside navigateToLesson ---");
    console.log("Target Lesson:", target); // الدرس الهدف
    console.log("Current Lesson ID:", lessonId); // الدرس الحالي
    console.log("Is Moving Forward:", target && target.id > (lessonId || 0)); // هل الانتقال للأمام؟
    console.log("Simulation Mode:", simulationMode); // هل وضع المحاكاة فعال؟
    console.log("Is Quiz Required for CURRENT lesson?", isQuizRequired); // هل الدرس الحالي يتطلب اختبارًا؟
    console.log("Is Quiz Finished for CURRENT lesson?", quizFinished); // هل تم اجتياز اختبار الدرس الحالي؟
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
        studentName="الطالب" // يمكن الحصول عليه من بيانات المستخدم
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
              disabled={!prevLesson} // السماح بالرجوع دائماً حتى لو الدرس الحالي مقفول
            >
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
              <span>السابق</span>
            </button>

            <button
              className={styles['lesson-nav-btn']}
              onClick={() => navigateToLesson(nextLesson)}
              disabled={!nextLesson || sequenceBlocked} // السماح بالضغط لفتح مودال الكويز حتى لو الدرس مقفول بسبب الاختبار
            >
              <span>التالي</span>
              <svg className={styles['lesson-nav-icon']} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
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
                lessons: (ch.lessons || []).map(l => ({ id: l.id, title: l.title, video_url: (l as any).video_url ?? null }))
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
                onFinish={handleSimulationQuizEnd}
                isLastLesson={(() => {
                  if (!course || !lesson || !course.chapters) return false;
                  const allLessons = course.chapters.flatMap(chapter => chapter.lessons);
                  const currentLessonIndex = allLessons.findIndex(l => l?.id === lesson.id);
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
            {questions.length > 0 ? (
              <Quiz
                key={quizKey}
                questions={questions}
                requireAllAnswered={true}
                onComplete={handleQuizComplete}
                initialAnswers={savedAnswers}
                canGoNext={quizFinished || canGoNextLocal}
                onGoNext={() => navigateToLesson(nextLesson)}
              />
            ) : (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                جاري تحميل أسئلة الكويز...
              </div>
            )}
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