'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '../styles/watch-progress.css';

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
  onExamSelect?: (examName: string, progress: number) => void;
}

export default function ExamCard({ 
  exams = [
    { 
      id: 1, 
      name: "اختبار أساسيات البرمجة", 
      subject: "البرمجة",
      progress: 75,
      image: "/hero-image.png",
      instructor: {
        name: "أحمد محمد",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 2, 
      name: "اختبار تطوير المواقع", 
      subject: "تطوير الويب",
      progress: 100,
      image: "/hero-image.png",
      instructor: {
        name: "سارة أحمد",
        avatar: "/profile2.jpg"
      }
    },
    { 
      id: 3, 
      name: "اختبار قواعد البيانات", 
      subject: "قواعد البيانات",
      progress: 45,
      image: "/hero-image.png",
      instructor: {
        name: "محمد علي",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 4, 
      name: "اختبار تصميم واجهات المستخدم", 
      subject: "UI/UX",
      progress: 90,
      image: "/hero-image.png",
      instructor: {
        name: "فاطمة حسن",
        avatar: "/profile2.jpg"
      }
    },
    { 
      id: 5, 
      name: "اختبار الذكاء الاصطناعي", 
      subject: "الذكاء الاصطناعي",
      progress: 30,
      image: "/hero-image.png",
      instructor: {
        name: "عمر خالد",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 6, 
      name: "اختبار تطوير تطبيقات الجوال", 
      subject: "تطوير الجوال",
      progress: 85,
      image: "/hero-image.png",
      instructor: {
        name: "ليلى محمود",
        avatar: "/profile2.jpg"
      }
    }
  ],
  showAll = false,
  onExamSelect
}: ExamCardProps) {
  const router = useRouter();

  const SingleExamCard: React.FC<{ exam: Exam }> = ({ exam }) => {
  const getProgressText = (progress: number) => {
    return progress === 100 ? 'انتهى' : `مكتمل ${progress}%`;
  };

  const handleExamClick = () => {
    if (onExamSelect) {
      onExamSelect(exam.name, exam.progress);
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

  if (showAll) {
    return (
      <div className="modal-courses-grid">
        {exams.map((exam) => (
          <SingleExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    );
  }

  return (
    <div className="courses-grid">
      {exams.slice(0, 4).map((exam) => (
        <SingleExamCard key={exam.id} exam={exam} />
      ))}
    </div>
  );
}

export type { Exam };