'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '../styles/watch-progress.css';

interface Course {
  id: number;
  name: string;
  progress: number;
  image: string;
  category: string;
  instructor: {
    name: string;
    avatar: string;
  };
}

interface CourseGridProps {
  courses?: Course[];
  showAll?: boolean;
}

export default function CourseGrid({ 
  courses = [
    { 
      id: 1, 
      name: "أساسيات البرمجة", 
      progress: 75,
      image: "/hero-image.png",
      category: "Frontend",
      instructor: {
        name: "أحمد محمد",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 2, 
      name: "تطوير المواقع", 
      progress: 45,
      image: "/hero-image.png",
      category: "Backend",
      instructor: {
        name: "سارة أحمد",
        avatar: "/profile2.jpg"
      }
    },
    { 
      id: 3, 
      name: "قواعد البيانات", 
      progress: 90,
      image: "/hero-image.png",
      category: "Database",
      instructor: {
        name: "محمد علي",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 4, 
      name: "تصميم واجهات المستخدم", 
      progress: 60,
      image: "/hero-image.png",
      category: "UI/UX",
      instructor: {
        name: "فاطمة حسن",
        avatar: "/profile2.jpg"
      }
    },
    { 
      id: 5, 
      name: "الذكاء الاصطناعي", 
      progress: 30,
      image: "/hero-image.png",
      category: "AI",
      instructor: {
        name: "عمر خالد",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 6, 
      name: "تطوير تطبيقات الجوال", 
      progress: 85,
      image: "/hero-image.png",
      category: "Mobile",
      instructor: {
        name: "ليلى محمود",
        avatar: "/profile2.jpg"
      }
    },
    { 
      id: 7, 
      name: "الأمن السيبراني", 
      progress: 20,
      image: "/hero-image.png",
      category: "Security",
      instructor: {
        name: "يوسف أحمد",
        avatar: "/profile.jpg"
      }
    },
    { 
      id: 8, 
      name: "تحليل البيانات", 
      progress: 55,
      image: "/hero-image.png",
      category: "Data Science",
      instructor: {
        name: "نور الدين",
        avatar: "/profile2.jpg"
      }
    },
    { 
      id: 9, 
      name: "التسويق الرقمي", 
      progress: 40,
      image: "/hero-image.png",
      category: "Marketing",
      instructor: {
        name: "مريم سالم",
        avatar: "/profile.jpg"
      }
    }
  ],
  showAll = false
}: CourseGridProps) {
  const router = useRouter();

  const CourseCard = ({ course }: { course: Course }) => (
    <div
      className="course-card"
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/course-details/${course.id}`)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          router.push(`/course-details/${course.id}`);
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="course-image">
        <img src={course.image} alt={course.name} />
        <div className="course-category">
          {course.category}
        </div>
      </div>
      <div className="course-content">
        <h4 className="course-name">{course.name}</h4>
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{width: `${course.progress}%`}}
            ></div>
          </div>
          <p className="course-progress">{course.progress}% مكتمل</p>
        </div>
        <div className="instructor-info">
          <img src={course.instructor.avatar} alt={course.instructor.name} className="instructor-avatar" />
          <span className="instructor-name">{course.instructor.name}</span>
        </div>
      </div>
    </div>
  );

  if (showAll) {
    return (
      <div className="modal-courses-grid">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    );
  }

  return (
    <div className="course-carousel">
      {courses.slice(0, 3).map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export type { Course };