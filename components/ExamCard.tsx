'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  getMyEnrolledCourses,
  Course,
  getEnrollmentFilters,
  getCourseDetails,
  getCourseProgressDetails
} from '../utils/courseService';
import styles from './ExamCard.module.css';
import FilterBar from './FilterBar';

interface ExamCardProps {
  showAll?: boolean;
  exams?: Course[];
  onExamSelect?: (exam: Course) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ showAll = false, exams, onExamSelect }) => {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Filter State
  const [filters, setFilters] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | number>('all');

  const fetchFilters = useCallback(async () => {
    try {
      const data = await getEnrollmentFilters();
      const options = [
        { id: 'all', label: 'الكل', count: data.counts.all },
        { id: 'completed', label: 'مكتملة', count: data.counts.completed },
        { id: 'in_progress', label: 'قيد الدراسة', count: data.counts.in_progress },
        ...data.categories.map(cat => ({
          id: cat.id,
          label: cat.title || cat.name, // Use title/label if available, fallback to name
          count: undefined // We don't have per-category counts yet, can be added later
        }))
      ];
      setFilters(options);
    } catch (err) {
      console.error('Failed to fetch filters', err);
    }
  }, []);

  const fetchExams = useCallback(async (page: number) => {
    try {
      setLoading(true);

      // Prepare filter params
      const filterParams: any = {};
      if (activeFilter === 'completed') filterParams.status = 'completed';
      else if (activeFilter === 'in_progress') filterParams.status = 'in_progress';
      else if (typeof activeFilter === 'number') filterParams.category_id = activeFilter;

      const response = await getMyEnrolledCourses(page, 50, filterParams);

      if (response && response.data) {
        setEnrolledCourses(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.last_page);
        }
      } else {
        setEnrolledCourses([]);
      }
    } catch (err) {
      setError('فشل في تحميل المقررات الدراسية');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (!exams) {
      fetchFilters();
    }
  }, [exams, fetchFilters]);

  useEffect(() => {
    if (!exams) {
      fetchExams(currentPage);
    } else {
      setEnrolledCourses(exams);
      setLoading(false);
    }
  }, [exams, currentPage, activeFilter, fetchExams]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilterChange = (id: string | number) => {
    setActiveFilter(id);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handleCardClick = (courseId: number) => {
    if (onExamSelect) {
      const course = enrolledCourses.find(c => c.id === courseId);
      if (course) onExamSelect(course);
    } else {
      router.push(`/user/my_exams/${courseId}`);
    }
  };

  // متابعة الدراسة: نحدد آخر درس غير مكتمل ونذهب إليه
  const handleContinueStudyClick = async (exam: Course, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const [courseDetails, progressDetails] = await Promise.all([
        getCourseDetails(exam.id),
        getCourseProgressDetails(exam.id)
      ]);

      const chapters = (courseDetails?.chapters || []).slice().sort((a: any, b: any) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
      const flatLessons: Array<{ id: number; chapterId: number }> = [];
      chapters.forEach((ch: any) => {
        const lessons = (ch.lessons || []).slice().sort((a: any, b: any) => Number(a?.order ?? 0) - Number(b?.order ?? 0));
        lessons.forEach((ls: any) => {
          if (ls && ls.id != null) flatLessons.push({ id: Number(ls.id), chapterId: Number(ch.id) });
        });
      });

      // إذا لم نجد دروسًا، نعود لعرض التفاصيل
      if (!flatLessons.length) {
        if (onExamSelect) onExamSelect(exam); else router.push(`/user/my_exams/${exam.id}`);
        return;
      }

      const completedIds = new Set(
        (progressDetails?.lessons || [])
          .filter((l: any) => String(l.status).toLowerCase() === 'completed')
          .map((l: any) => Number(l.lesson_id))
      );

      const nextLesson = flatLessons.find((l) => !completedIds.has(l.id)) || flatLessons[0];

      router.push(`/watch?lessonId=${nextLesson.id}&chapterId=${nextLesson.chapterId}&courseId=${exam.id}`);
    } catch (err) {
      console.error('Failed to navigate to continue study:', err);
      // في حالة الفشل، نسقط لعرض تفاصيل الامتحان بدلًا من تعطيل التجربة
      if (onExamSelect) onExamSelect(exam); else router.push(`/user/my_exams/${exam.id}`);
    }
  };

  // دخول الامتحان النهائي
  const handleFinalExamClick = (exam: Course, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    router.push(`/user/final-exam/${exam.id}`);
  };

  // عرض النتيجة وطلب الشهادة (يفتح صفحة تفاصيل الاختبار)
  const handleResultAndCertificateClick = (exam: Course, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onExamSelect) {
      onExamSelect(exam);
    } else {
      router.push(`/user/my_exams/${exam.id}`);
    }
  };

  if (loading && enrolledCourses.length === 0) {
    return <div className={styles.loading}>جاري التحميل...</div>;
  }

  if (error && !exams) {
    return <div className={styles.error}>{error}</div>;
  }

  const displayCourses = showAll ? enrolledCourses : enrolledCourses.slice(0, 6);

  return (
    <div className={styles.container}>
      {!exams && (
        <FilterBar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      {displayCourses.length === 0 ? (
        <div className={styles.emptyState}>
          <p>لا توجد مقررات دراسية في هذا القسم.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {displayCourses.map((exam) => (
            <div
              key={exam.id}
              className={styles.card}
              onClick={() => handleCardClick(exam.id)}
            >
              <div className={styles.imageWrapper}>
                {exam.category && (
                  <span className={styles.diplomaBadge}>
                    {exam.category.title || exam.category.label || exam.category.name}
                  </span>
                )}
                <img
                  src={exam.cover_image || '/images/ofuq-logo.png'}
                  alt={exam.title}
                  className={styles.image}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/ofuq-logo.png';
                  }}
                />
                <div className={styles.overlay}>
                  <span className={styles.viewButton}>عرض التفاصيل</span>
                </div>
              </div>

              <div className={styles.content}>
                <h3 className={styles.title}>{exam.title}</h3>

                {/* Progress Bar */}
                <div className={styles.progressContainer}>
                  <div className={styles.progressInfo}>
                    <span className={styles.progressLabel}>نسبة الإنجاز</span>
                    <span className={styles.progressPercentage}>
                      {Math.round(Number(exam.progress_percentage || 0))}%
                    </span>
                  </div>
                  <div className={styles.progressBarBg}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${Math.round(Number(exam.progress_percentage || 0))}%` }}
                    />
                  </div>
                </div>

                <div className={styles.actionButtons}>
                  {/* استكمال الدراسة */}
                  <button
                    className={styles.actionButton}
                    onClick={(e) => handleContinueStudyClick(exam, e)}
                    disabled={Math.round(Number(exam.progress_percentage || 0)) >= 100}
                  >
                    استكمال الدراسة
                  </button>

                  {/* دخول الامتحان النهائي */}
                  <button
                    className={styles.actionButton}
                    onClick={(e) => handleFinalExamClick(exam, e)}
                    disabled={Math.round(Number(exam.progress_percentage || 0)) < 100}
                  >
                    دخول الامتحان النهائي
                  </button>

                  {/* طلب النتيجة والشهادة */}
                  <button
                    className={styles.actionButton}
                    onClick={(e) => handleResultAndCertificateClick(exam, e)}
                    disabled={Math.round(Number(exam.progress_percentage || 0)) < 100}
                  >
                    طلب النتيجة والشهادة
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!showAll && !exams && totalPages > 1 && (
        <div className={styles.paginationControls}>
          <button
            onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage - 1); }}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            السابق
          </button>

          <span className={styles.pageInfo}>
            صفحة {currentPage} من {totalPages}
          </span>

          <button
            onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage + 1); }}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            التالي
          </button>
        </div>
      )}
    </div>
  );
};

export default ExamCard;