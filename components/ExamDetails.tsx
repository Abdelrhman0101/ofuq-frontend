'use client';

import React, { useEffect, useState } from 'react';
import '../styles/exam-details.css';
import { FinalExamMetaData, getCourseFinalExamMeta, getQuizAttempts, QuizAttempt } from '../utils/quizService';

interface ExamDetailsProps {
  courseId: number;
  courseName: string;
  completionPercentage: number;
  onBack: () => void;
}

const ExamDetails: React.FC<ExamDetailsProps> = ({ courseId, courseName, completionPercentage, onBack }) => {
  const [meta, setMeta] = useState<FinalExamMetaData | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const m = await getCourseFinalExamMeta(courseId);
        if (!cancelled) setMeta(m);
        if (m?.quiz_id) {
          const a = await getQuizAttempts(m.quiz_id);
          if (!cancelled) setAttempts(a);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'تعذر تحميل بيانات الاختبار النهائي');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [courseId]);

  return (
    <div className="exam-details-container">
      <button className="back-button" onClick={onBack}>
        ← العودة إلى الاختبارات
      </button>
      
      <div className="course-header">
        <h1 className="course-name">{courseName}</h1>
        <div className="completion-section">
          <div className="completion-bar">
            <div 
              className="completion-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="completion-text">نسبة الإنجاز: {completionPercentage}%</span>
        </div>
      </div>

      {loading ? (
        <div className="table-wrapper"><p>جاري تحميل بيانات الاختبار النهائي...</p></div>
      ) : error ? (
        <div className="table-wrapper"><p>حدث خطأ: {error}</p></div>
      ) : (
        <>
          <div className="lessons-table-container">
            <h2 className="table-title">معلومات الاختبار النهائي</h2>
            <div className="table-wrapper">
              <table className="lessons-table">
                <tbody>
                  <tr>
                    <td>عدد الأسئلة المتاحة</td>
                    <td>{meta?.questions_pool_count ?? 0}</td>
                  </tr>
                  <tr>
                    <td>جاهزية بنك الأسئلة</td>
                    <td>
                      <span className={`status-badge ${meta?.has_sufficient_question_bank ? 'status-completed' : 'status-incomplete'}`}>
                        {meta?.has_sufficient_question_bank ? 'جاهز' : 'غير كافٍ'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td>عدد المحاولات السابقة</td>
                    <td>{meta?.attempts_count ?? attempts.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="lessons-table-container">
            <h2 className="table-title">محاولاتك</h2>
            <div className="table-wrapper">
              <table className="lessons-table">
                <thead>
                  <tr>
                    <th>التاريخ</th>
                    <th>الدرجة</th>
                    <th>عدد الأسئلة</th>
                    <th>عدد الصحيحة</th>
                    <th>الحالة</th>
                    <th>المدة</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center' }}>لا توجد محاولات حتى الآن</td>
                    </tr>
                  ) : attempts.map((a) => (
                    <tr key={a.id}>
                      <td>{a.created_at ? new Date(a.created_at).toLocaleString('ar-EG') : '-'}</td>
                      <td>{Math.round(a.score)}%</td>
                      <td>{a.total_questions ?? '-'}</td>
                      <td>{a.correct_answers ?? '-'}</td>
                      <td>
                        <span className={`status-badge ${a.passed ? 'status-completed' : 'status-incomplete'}`}>
                          {a.passed ? 'ناجح' : 'راسب'}
                        </span>
                      </td>
                      <td>{a.time_taken ? `${a.time_taken} ث` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExamDetails;