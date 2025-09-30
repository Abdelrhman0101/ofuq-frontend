'use client';

import React from 'react';
import '../styles/exam-details.css';

interface ExamDetailsProps {
  courseName: string;
  completionPercentage: number;
  onBack: () => void;
}

const ExamDetails: React.FC<ExamDetailsProps> = ({ courseName, completionPercentage, onBack }) => {
  const lessons = [
    {
      id: 1,
      name: 'الدرس الأول: مقدمة في الموضوع',
      examDate: '2024-01-15',
      result: '85%',
      status: 'completed' as const,
      action: 'view'
    },
    {
      id: 2,
      name: 'الدرس الثاني: المفاهيم الأساسية',
      examDate: '2024-01-20',
      result: '92%',
      status: 'completed' as const,
      action: 'view'
    },
    {
      id: 3,
      name: 'الدرس الثالث: التطبيق العملي',
      examDate: '2024-01-25',
      result: '-',
      status: 'incomplete' as const,
      action: 'continue'
    },
    {
      id: 4,
      name: 'الدرس الرابع: المراجعة النهائية',
      examDate: '2024-01-30',
      result: '-',
      status: 'incomplete' as const,
      action: 'continue'
    }
  ];

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

      <div className="lessons-table-container">
        <h2 className="table-title">تفاصيل الدروس والاختبارات</h2>
        <div className="table-wrapper">
          <table className="lessons-table">
            <thead>
              <tr>
                <th>اسم الدرس</th>
                <th>تاريخ الاختبار</th>
                <th>النتيجة</th>
                <th>حالة الاختبار</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((lesson) => (
                <tr key={lesson.id}>
                  <td>{lesson.name}</td>
                  <td>{lesson.examDate}</td>
                  <td>{lesson.result}</td>
                  <td>
                    <span className={`status-badge status-${lesson.status}`}>
                      {lesson.status === 'completed' ? 'مكتمل' : 'غير مكتمل'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={`action-button ${lesson.action === 'continue' ? 'continue' : ''}`}
                    >
                      {lesson.action === 'view' ? 'عرض النتيجة' : 'متابعة الاختبار'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExamDetails;