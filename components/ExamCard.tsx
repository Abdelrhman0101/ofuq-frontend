'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/watch-progress.css';
import { getMyEnrolledCourses, getCourseProgress, Course } from '../utils/courseService';
import { getBackendAssetUrl } from '../utils/url';
import { isAuthenticated } from '../utils/authService';

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
              subject: c.category?.name || 'عام',
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

    const handleExamClick = () => {
      if (onExamSelect) {
        onExamSelect(exam.id, exam.name, exam.progress);
      } else {
        router.push(`/exam-details?courseName=${encodeURIComponent(exam.name)}&progress=${exam.progress}`);
      }
    };

    return (
      <div className="course-card">
        <div className="course-image">
          <img src={exam.image} alt={exam.name} />
        </div>
        <div className="course-content">
          <h3 className="course-title">{exam.name}</h3>
          <p className="course-subject">{exam.subject}</p>
          
          <div className="exam-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${exam.progress}%` }}
              ></div>
            </div>
            <p className="progress-text">{getProgressText(exam.progress)}</p>
          </div>
          
          <div className="course-instructor">
            <img src={exam.instructor.avatar} alt={exam.instructor.name} />
            <span>{exam.instructor.name}</span>
          </div>
          
          <button className="exam-card-btn" onClick={handleExamClick}>
            عرض الاختبارات
          </button>
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
        {items.map((exam) => (
          <SingleExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    );
  }

  return (
    <div className="courses-grid">
      {items.slice(0, 4).map((exam) => (
        <SingleExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
}

export type { Exam };