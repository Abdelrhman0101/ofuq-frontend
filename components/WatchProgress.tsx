'use client';

import React from 'react';
import Link from 'next/link';
import CourseGrid from './CourseGrid';
import { Course } from './CourseGrid';
import '../styles/watch-progress.css';

interface WatchProgressProps {
  courses?: Course[];
}

export default function WatchProgress({ courses }: WatchProgressProps) {
  return (
    <div className="watch-progress">
      <div className="section-header">
        <h2 className="section-title">متابعة المشاهدة</h2>
        <Link href="/user/my_courses" className="view-all-btn">
          عرض الكل
        </Link>
      </div>
      
      <div className="carousel-container">
        <div className="carousel-wrapper">
          <CourseGrid courses={courses} showAll={false} />
        </div>
      </div>
    </div>
  );
}