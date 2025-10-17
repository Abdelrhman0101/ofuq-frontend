'use client';

import { useState } from 'react';
import ExamCard from '../../../components/ExamCard';
import ExamDetails from '../../../components/ExamDetails';
import '../../../styles/my-courses.css';

interface SelectedExam {
  name: string;
  progress: number;
}

export default function MyExams() {
  const [selectedExam, setSelectedExam] = useState<SelectedExam | null>(null);

  const handleExamSelect = (examName: string, progress: number) => {
    setSelectedExam({ name: examName, progress });
  };

  const handleBackToExams = () => {
    setSelectedExam(null);
  };

  return (
    <div className="my-courses-page">
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
          courseName={selectedExam.name} 
          completionPercentage={selectedExam.progress}
          onBack={handleBackToExams}
        />
      )}
    </div>
  );
}