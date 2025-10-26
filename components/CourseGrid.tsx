'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import '../styles/watch-progress.css';

interface Course {
  id: number;
  name: string;
  progress: number;
  image: string;
  category: string | { id: number; name: string; created_at?: string; updated_at?: string };
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
  courses = [],
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
        {/* <div className="course-category">
          {typeof course.category === 'string' ? course.category : course.category?.name || 'عام'}
        </div> */}
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