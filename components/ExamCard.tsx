'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/watch-progress.css';
import { getMyEnrolledCourses, getCourseProgress, Course, getCourseProgressDetails, getCourseDetails } from '../utils/courseService';
import { getBackendAssetUrl } from '../utils/url';
import { isAuthenticated } from '../utils/authService';
import { getCourseFinalExamMeta, CourseFinalExamMetaData } from '../utils/quizService';
import Toast from './Toast';

interface Exam {
  id: number;
  name: string;
  subject: string;
  progress: number; // completion percentage
  image: string;
  instructor: {
    name: string;
    avatar: string;
  };
}

interface ExamCardProps {
  exams?: Exam[];
  showAll?: boolean;
  onExamSelect?: (examId: number, examName: string, progress: number) => void;
}

export default function ExamCard({ 
  exams,
  showAll = false,
  onExamSelect
}: ExamCardProps) {
  const router = useRouter();
  const [items, setItems] = useState<Exam[]>(exams ?? []);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!exams && isAuthenticated()) {
          const courses: Course[] = await getMyEnrolledCourses();
          const results: Exam[] = [];
          for (const c of courses) {
            const progress = await getCourseProgress(c.id);
            results.push({
              id: Number(c.id),
              name: c.title,
              // اجعل موضوع الاختبار (الدبلومة) نصًا دائمًا لتجنب [object Object]
              subject: (() => {
                const cat = (c as any).category;
                if (typeof cat === 'string') return String(cat);
                const name = cat?.name;
                if (typeof name === 'string') return name;
                // Fallbacks if API returns localized or nested name objects
                const localized = (name && (name.ar || name.en)) || cat?.title || cat?.label;
                return String(localized ?? 'عام');
              })(),
              progress: Math.round(Number(progress ?? 0)),
              image: getBackendAssetUrl((c as any).cover_image_url ?? c.cover_image ?? ''),
              instructor: {
                name: c.instructor?.name || 'المدرب',
                avatar: getBackendAssetUrl((c.instructor as any)?.image ?? '/profile.jpg'),
              },
            });
          }
          if (!cancelled) setItems(results);
        } else if (exams) {
          setItems(exams);
        } else {
          setItems([]);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'تعذر تحميل الاختبارات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [exams]);

  const SingleExamCard: React.FC<{ exam: Exam }> = ({ exam }) => {
    const getProgressText = (progress: number) => {
      return progress === 100 ? 'انتهى' : `مكتمل ${progress}%`;
    };

    // ميتاداتا الامتحان النهائي لهذا الكورس
    const [meta, setMeta] = useState<CourseFinalExamMetaData | null>(null);
    const [remainingSec, setRemainingSec] = useState<number>(0);

    // تنسيق الوقت المتبقي كـ أيام/ساعات/دقائق
    const formatRemainingLabel = (sec: number): string => {
      const s = Math.max(0, sec);
      if (s === 0) return 'بدء الاختبار';
      const days = Math.floor(s / 86400);
      const hours = Math.floor((s % 86400) / 3600);
      const minutes = Math.floor((s % 3600) / 60);
      const parts: string[] = [];
      if (days > 0) parts.push(`${days} ${days === 1 ? 'يوم' : 'أيام'}`);
      if (hours > 0) parts.push(`${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`);
      if (minutes > 0) {
        parts.push(`${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`);
      } else if (parts.length === 0) {
        parts.push('أقل من دقيقة');
      }
      return `إعادة المحاولة بعد ${parts.join(' ')}`;
    };

    // جلب الميتاداتا عند كون التقدم 100%
    useEffect(() => {
      let cancelled = false;
      let timer: any = null;
      async function loadMeta() {
        if (exam.progress !== 100) return;
        try {
          const m = await getCourseFinalExamMeta(exam.id);
          if (cancelled) return;
          setMeta(m);
          const computeRemaining = () => {
            // استخدم remaining_cooldown_seconds إن وجد، وإلا احسب من next_allowed_at
            const explicit = Number(m?.remaining_cooldown_seconds ?? 0);
            if (explicit && explicit > 0) {
              setRemainingSec(Math.max(0, Math.round(explicit)));
              return;
            }
            const nextAllowedTs = Date.parse(m?.next_allowed_at || '');
            const nowTs = Date.now();
            const rem = Math.max(0, Math.round((nextAllowedTs - nowTs) / 1000));
            setRemainingSec(rem);
          };
          computeRemaining();
          timer = setInterval(computeRemaining, 1000);
        } catch (e: any) {
          // صامت: لا تمنع الزر، سيتم التعامل في صفحة الامتحان
          console.warn('تعذر جلب ميتاداتا الامتحان:', e?.message || e);
        }
      }
      loadMeta();
      return () => {
        cancelled = true;
        if (timer) clearInterval(timer);
      };
    }, [exam.id, exam.progress]);

    const handleExamClick = () => {
      if (onExamSelect) {
        onExamSelect(exam.id, exam.name, exam.progress);
      } else {
        router.push(`/exam-details?courseName=${encodeURIComponent(exam.name)}&progress=${exam.progress}`);
      }
    };

    const handlePrimaryAction = async () => {
      // إذا كان التقدم 100% → اذهب لامتحان الكورس النهائي
      if (exam.progress === 100) {
        // إن كانت هناك تهدئة نشطة أو غير مسموح الآن
        const blockedByCooldown = meta && (remainingSec > 0);
        const notAllowed = meta && meta.is_allowed_now === false;
        if (blockedByCooldown || notAllowed) {
          const labelMsg = blockedByCooldown
            ? formatRemainingLabel(remainingSec)
            : 'محاولة جديدة غير متاحة الآن';
          try {
            // خزّن رسالة لمنع الضياع إن تغيرت الصفحة
            sessionStorage.setItem('exam-block-message', labelMsg);
            sessionStorage.setItem(
              'flash-toast',
              JSON.stringify({ message: labelMsg, type: 'warning' })
            );
          } catch {}
          showToast(labelMsg, 'warning');
          return;
        }

        // لا نقوم بالبدء من البطاقة؛ نوجّه لصفحة الامتحان لتتولى attempt/active ثم start
        router.push(`/user/final-exam/${exam.id}`);
        return;
      }

      // خلاف ذلك → استكمال الدراسة: حدد آخر نقطة توقف
      try {
        const [details, course] = await Promise.all([
          getCourseProgressDetails(exam.id),
          getCourseDetails(exam.id)
        ]);

        // حماية من البيانات الناقصة
        if (!course || !course.chapters || course.chapters.length === 0) {
          //fallback: اذهب لصفحة تفاصيل الكورس
          router.push(`/course-details/${exam.id}`);
          return;
        }

        const lessonsProgress = (details?.lessons ?? []).map(l => ({
          id: Number(l.lesson_id),
          status: String(l.status || 'not_started'),
          started_at: l.started_at ? new Date(l.started_at).getTime() : 0,
          completed_at: l.completed_at ? new Date(l.completed_at).getTime() : 0,
        }));

        const inProgress = lessonsProgress.filter(l => l.status === 'in_progress');
        const completedIds = new Set(lessonsProgress.filter(l => l.status === 'completed').map(l => l.id));

        // 1) إن وجد درس قيد التقدم، اختر أحدثه
        let targetLessonId: number | null = null;
        if (inProgress.length > 0) {
          inProgress.sort((a, b) => (b.started_at || 0) - (a.started_at || 0));
          targetLessonId = inProgress[0].id;
        }

        // 2) وإلا اختر أول درس غير مكتمل بحسب ترتيب المحتوى
        if (!targetLessonId) {
          outer: for (const ch of course.chapters || []) {
            for (const ls of (ch.lessons || [])) {
              const lid = Number(ls.id);
              if (!completedIds.has(lid)) {
                targetLessonId = lid;
                break outer;
              }
            }
          }
        }

        // 3) وإن لم يوجد (كلها مكتملة)، فاختر أول درس كاحتياط
        if (!targetLessonId) {
          const firstChapter = course.chapters[0];
          const firstLesson = (firstChapter.lessons || [])[0];
          if (!firstLesson) {
            router.push(`/course-details/${exam.id}`);
            return;
          }
          targetLessonId = Number(firstLesson.id);
        }

        // إيجاد chapterId لهذا الدرس
        let targetChapterId: number | null = null;
        for (const ch of course.chapters || []) {
          if ((ch.lessons || []).some((ls: any) => Number(ls.id) === Number(targetLessonId))) {
            targetChapterId = Number(ch.id);
            break;
          }
        }

        if (!targetChapterId) {
          // إذا لم نستطع إيجاد الفصل بشكل موثوق، ارجع لتفاصيل الكورس
          router.push(`/course-details/${exam.id}`);
          return;
        }

        router.push(`/watch?lessonId=${targetLessonId}&chapterId=${targetChapterId}&courseId=${exam.id}`);
      } catch (err) {
        console.warn('تعذر تحديد نقطة الاستكمال:', err);
        router.push(`/course-details/${exam.id}`);
      }
    };

    return (
      <div className="course-card">
        <div className="course-image">
          <img src={exam.image} alt={exam.name} />
        </div>
        <div className="course-content">
          <h3 className="course-title">{exam.name}</h3>
          {/* <p className="course-subject">{exam.subject}</p> */}
          
          <div className="exam-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${exam.progress}%` }}
              ></div>
            </div>
            <p className="progress-text">{getProgressText(exam.progress)}</p>
          </div>
          
          {/* <div className="course-instructor">
            <img src={exam.instructor.avatar} alt={exam.instructor.name} />
            <span>{exam.instructor.name}</span>
          </div> */}
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="exam-card-btn" onClick={handleExamClick}>
              عرض الاختبارات
            </button>
            <button
              className="exam-card-btn"
              onClick={handlePrimaryAction}
              disabled={exam.progress === 100 && ((meta?.is_allowed_now === false) || remainingSec > 0)}
            >
              {exam.progress === 100
                ? (() => {
                    if (remainingSec > 0) {
                      return formatRemainingLabel(remainingSec);
                    }
                    if (meta?.is_allowed_now === false) {
                      return 'غير متاح الآن';
                    }
                    return 'بدء الاختبار';
                  })()
                : 'استكمال الدراسة'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="courses-grid"><p>جاري تحميل اختباراتك...</p></div>;
  }
  if (error) {
    return <div className="courses-grid"><p>حدث خطأ: {error}</p></div>;
  }

  if (showAll) {
    return (
      <div className="modal-courses-grid">
        <Toast
          message={toastMessage}
          type={toastType}
          isVisible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
        {items.map((exam) => (
          <SingleExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    );
  }

  return (
    <div className="courses-grid">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      {items.map((exam) => (
        <SingleExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
}

export type { Exam };