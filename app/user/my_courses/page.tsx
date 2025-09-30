import React from 'react';
import CourseGrid from '../../../components/CourseGrid';
import '../../../styles/my-courses.css';

export default function MyCourses() {
  return (
    <div className="my-courses-page">
      <div className="page-header">
        <h1>برامجي</h1>
        <p>جميع الكورسات التي تتابعها</p>
      </div>
      
      <div className="courses-container">
        <CourseGrid showAll={true} />
      </div>
    </div>
  );
}