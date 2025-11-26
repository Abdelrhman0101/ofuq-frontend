'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ExamCard.module.css';
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

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

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
          // Fetch with pagination (9 items per page)
          const response = await getMyEnrolledCourses(currentPage, 9);

          if (response.data) {
            console.log('ExamCard response:', response);
            const courses: Course[] = response.data;
            const results: Exam[] = [];
            for (const c of courses) {
              const progress = await getCourseProgress(c.id);
              results.push({
                id: Number(c.id),
                name: c.title,
                subject: (() => {
                  const cat = (c as any).category;
                  if (typeof cat === 'string') return String(cat);
                  const name = cat?.name;
                  if (typeof name === 'string') return name;
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
            if (!cancelled) {
              setItems(results);
              if (response.pagination) {
                console.log('Setting totalPages to:', response.pagination.last_page);
                setTotalPages(response.pagination.last_page);
              } else {
                console.warn('No pagination data in response');
              }
            }
          }
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
  }, [exams, currentPage]); // Re-run when currentPage changes

  const SingleExamCard: React.FC<{ exam: Exam }> = ({ exam }) => {
    const getProgressText = (progress: number) => {
      return progress === 100 ? 'انتهى' : `مكتمل ${progress}%`;
    };

    const [meta, setMeta] = useState<CourseFinalExamMetaData | null>(null);
    const [remainingSec, setRemainingSec] = useState<number>(0);

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
      if (exam.progress === 100) {
        const blockedByCooldown = meta && (remainingSec > 0);
        const notAllowed = meta && meta.is_allowed_now === false;
        if (blockedByCooldown || notAllowed) {
          const labelMsg = blockedByCooldown
            ? formatRemainingLabel(remainingSec)
            : 'محاولة جديدة غير متاحة الآن';
          try {
            sessionStorage.setItem('exam-block-message', labelMsg);
            sessionStorage.setItem(
              'flash-toast',
              JSON.stringify({ message: labelMsg, type: 'warning' })
            );
          } catch { }
          showToast(labelMsg, 'warning');
          return;
        }
        router.push(`/user/final-exam/${exam.id}`);
        return;
      }

      try {
        const [details, course] = await Promise.all([
          getCourseProgressDetails(exam.id),
          getCourseDetails(exam.id)
        ]);

        if (!course || !course.chapters || course.chapters.length === 0) {
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

        let targetLessonId: number | null = null;
        if (inProgress.length > 0) {
          inProgress.sort((a, b) => (b.started_at || 0) - (a.started_at || 0));
          targetLessonId = inProgress[0].id;
        }

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

        if (!targetLessonId) {
          const firstChapter = course.chapters[0];
          const firstLesson = (firstChapter.lessons || [])[0];
          if (!firstLesson) {
            router.push(`/course-details/${exam.id}`);
            return;
          }
          targetLessonId = Number(firstLesson.id);
        }

        let targetChapterId: number | null = null;
        for (const ch of course.chapters || []) {
          if ((ch.lessons || []).some((ls: any) => Number(ls.id) === Number(targetLessonId))) {
            targetChapterId = Number(ch.id);
            break;
          }
        }

        if (!targetChapterId) {
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
      <div className={styles.courseCard}>
        <div className={styles.courseImage}>
          <img src={exam.image} alt={exam.name} />
        </div>
        <div className={styles.courseContent}>
          <h3 className={styles.courseTitle}>{exam.name}</h3>

          <div className={styles.examProgress}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${exam.progress}%` }}
              ></div>
            </div>
            <p className={styles.progressText}>{getProgressText(exam.progress)}</p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
            {exam.progress === 100 && (
              <button className={`${styles.examCardBtn} ${styles.secondary}`} onClick={handleExamClick}>
                الحصول علي شهادة المقرر
              </button>
            )}
            <button
              className={`${styles.examCardBtn} ${exam.progress === 100 ? styles.primary : ''}`}
              onClick={handlePrimaryAction}
              disabled={exam.progress === 100 && ((meta?.is_allowed_now === false) || remainingSec > 0)}
              style={{ flex: 1 }}
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
    return <div className={styles.coursesGrid}><p>جاري تحميل اختباراتك...</p></div>;
  }
  if (error) {
    return <div className={styles.coursesGrid}><p>حدث خطأ: {error}</p></div>;
  }

  return (
    <div className={styles.coursesContainer}>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      <div className={showAll ? styles.modalCoursesGrid : styles.coursesGrid}>
        {items.map((exam) => (
          <SingleExamCard key={exam.id} exam={exam} />
        ))}
      </div>

      {!showAll && !exams && totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            className={styles.paginationBtn}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            السابق
          </button>
          <span className={styles.paginationInfo}>صفحة {currentPage} من {totalPages}</span>
          <button
            className={styles.paginationBtn}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            التالي
          </button>
        </div>
      )}
      {/* Debug Info - Remove after fixing */}
      <div style={{ padding: '10px', background: '#eee', marginTop: '20px', fontSize: '12px' }}>
        Debug: Pages: {totalPages}, Current: {currentPage}, Items: {items.length}
      </div>
    </div>
  );
}

export type { Exam };