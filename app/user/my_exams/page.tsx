'use client';

import { useEffect, useState } from 'react';
import ExamCard from '../../../components/ExamCard';
import ExamDetails from '../../../components/ExamDetails';
import styles from '../my_courses/MyCourses.module.css';
import Toast from '../../../components/Toast';

interface SelectedExam {
  id: number;
  name: string;
  progress: number;
}

export default function MyExams() {
  const [selectedExam, setSelectedExam] = useState<SelectedExam | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('flash-toast');
      if (raw) {
        const data = JSON.parse(raw);
        if (data && data.message) {
          setToastMessage(String(data.message));
          setToastType((data.type as any) || 'info');
          setToastVisible(true);
        }
        sessionStorage.removeItem('flash-toast');
      }
      // دعم المفتاح البديل exam-block-message حسب توصية الباك إند
      const blockMsg = sessionStorage.getItem('exam-block-message');
      if (blockMsg) {
        setToastMessage(String(blockMsg));
        setToastType('warning');
        setToastVisible(true);
        sessionStorage.removeItem('exam-block-message');
      }
    } catch {}
  }, []);

  const handleExamSelect = (examId: number, examName: string, progress: number) => {
    setSelectedExam({ id: examId, name: examName, progress });
  };

  const handleBackToExams = () => {
    setSelectedExam(null);
  };

  return (
    <div className={`my-courses-page ${styles.myCoursesPage}`}>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
      {!selectedExam ? (
        <>
          <div className="page-header">
            <h1>اختباراتي</h1>
            <p>جميع الاختبارات المتاحة لك</p>
          </div>
          
          <div className="courses-container">
            <ExamCard showAll={false} onExamSelect={handleExamSelect} />
          </div>
        </>
      ) : (
        <ExamDetails 
          courseId={selectedExam.id}
          courseName={selectedExam.name} 
          completionPercentage={selectedExam.progress}
          onBack={handleBackToExams}
        />
      )}
    </div>
  );
}