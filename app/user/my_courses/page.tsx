"use client";

import React, { useEffect, useState } from 'react';
import CourseGrid from '../../../components/CourseGrid';
import type { Course as GridCourse } from '../../../components/CourseGrid';
import { getMyEnrolledCourses, getCourseProgress } from '../../../utils/courseService';
import { getBackendAssetUrl } from '../../../utils/url';
import { isAuthenticated } from '../../../utils/authService';
import '../../../styles/my-courses.css';

export default function MyCourses() {
  const [courses, setCourses] = useState<GridCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure user is authenticated for protected endpoints
        if (!isAuthenticated()) {
          setError('الرجاء تسجيل الدخول لعرض كورساتك');
          setLoading(false);
          return;
        }

        const enrolled = await getMyEnrolledCourses();
        // Fetch progress for each course in parallel
        const withProgress: GridCourse[] = await Promise.all(
          enrolled.map(async (c) => {
            const progressValue = await getCourseProgress(c.id);
            const progress = Math.max(0, Math.min(100, Math.round(Number(progressValue ?? 0))));
            return {
              id: Number(c.id),
              name: String(c.title ?? ''),
              progress,
              image: getBackendAssetUrl((c as any).cover_image_url ?? c.cover_image ?? ''),
              category: c.category?.name ?? 'عام',
              instructor: {
                name: c.instructor?.name ?? '—',
                avatar: getBackendAssetUrl(c.instructor?.image ?? ''),
              },
            } as GridCourse;
          })
        );

        setCourses(withProgress);
      } catch (err: any) {
        setError(err?.message ?? 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="my-courses-page">
      <div className="page-header">
        <h1>برامجي</h1>
        <p>جميع الكورسات التي تتابعها</p>
      </div>
      
      <div className="courses-container">
        {loading && (
          <div className="loading-state">جاري التحميل...</div>
        )}
        {error && !loading && (
          <div className="error-state">{error}</div>
        )}
        {!loading && !error && (
          <CourseGrid showAll={true} courses={courses} />
        )}
      </div>
    </div>
  );
}