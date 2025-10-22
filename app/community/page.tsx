"use client";

import { Suspense, useState, useMemo, useEffect } from 'react';
export const dynamic = 'force-dynamic';
import { useSearchParams } from 'next/navigation';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import HeroSearchSection from '../../components/HeroSearchSection';
import CourseCard from '../../components/CourseCard';
import ScrollToTop from '../../components/ScrollToTop';
import SocialMediaFloat from '../../components/SocialMediaFloat';
import { getAllCourses, Course } from '../../utils/courseService';
import { getBackendAssetUrl } from '../../utils/url';

function CommunityContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('الكل');
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initial = searchParams.get('search') || '';
    if (initial) {
      setSearchQuery(initial);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadAllCourses = async () => {
      try {
        setLoading(true);
        const courses = await getAllCourses({ per_page: 1000 });
        setAllCourses(courses);
      } catch (err) {
        console.error('Error loading community content:', err);
        setError('فشل في تحميل محتوى المجتمع');
      } finally {
        setLoading(false);
      }
    };

    loadAllCourses();
  }, []);

  const transformCourseData = (course: Course) => {
    if (!course?.id) {
      console.warn('Course without valid ID found:', course);
      return null;
    }
    const coverRaw = (course as any).cover_image_url || course.cover_image || '';
    const coverImage = getBackendAssetUrl(coverRaw) || '/banner.jpg';
    const instructorImageRaw = course?.instructor?.image || '';
    const instructorAvatar = getBackendAssetUrl(instructorImageRaw) || '/profile.jpg';
    const categoryName = typeof course?.category === 'string' 
      ? course.category 
      : course?.category?.name || 'عام';

    return {
      id: course.id.toString(),
      title: course.title || 'عنوان غير متوفر',
      image: coverImage,
      category: categoryName,
      rating: parseFloat(String(course.average_rating ?? course.rating ?? '0')),
      studentsCount: course.students_count || 0,
      duration: course.duration ? `${course.duration} ساعة` : '0 ساعة',
      lessonsCount: course.chapters_count || 
                   ((course.chapters || []).reduce((sum, ch) => sum + ((ch.lessons || []).length), 0)) || 
                   0,
      instructorName: course?.instructor?.name || 'مدرب',
      instructorAvatar,
      price: Number(course?.price ?? 0),
      language: 'العربية',
      level: 'متوسط',
      field: categoryName,
      createdAt: course?.created_at || new Date().toISOString(),
    };
  };

  const filteredCourses = useMemo(() => {
    if (loading || allCourses.length === 0) return [];

    const transformedCourses = allCourses
      .map(transformCourseData)
      .filter(course => course !== null);
    let filtered = [...transformedCourses];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((course: any) =>
        String(course?.title ?? '').toLowerCase().includes(query) ||
        String(course?.category ?? '').toLowerCase().includes(query) ||
        String(course?.instructorName ?? '').toLowerCase().includes(query)
      );
    }

    if (selectedFilter && selectedFilter !== 'الكل') {
      switch (selectedFilter) {
        case 'برمجة':
        case 'تصميم':
        case 'تسويق':
        case 'أعمال':
          filtered = filtered.filter(course => course.category === selectedFilter);
          break;
        case 'الأحدث':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'الأعلى تقييماً':
          filtered.sort((a, b) => b.rating - a.rating);
          break;
        case 'الأكثر مبيعاً':
          filtered.sort((a, b) => b.studentsCount - a.studentsCount);
          break;
        case 'السعر':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'المستوى':
          const levelOrder = { 'مبتدئ': 1, 'متوسط': 2, 'متقدم': 3 } as const;
          filtered.sort((a, b) => levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder]);
          break;
        case 'المجال':
          filtered.sort((a, b) => a.field.localeCompare(b.field));
          break;
        default:
          break;
      }
    }

    return filtered as any[];
  }, [searchQuery, selectedFilter, allCourses, loading]);

  return (
    <main>
      <HeroSearchSection 
        title="مجتمع أفق"
        onSearch={setSearchQuery}
        onFilterChange={setSelectedFilter}
        searchQuery={searchQuery}
        activeFilter={selectedFilter}
      />

      <section className="popular-courses-section">
        <div className="popular-courses-container">
          <div className="popular-courses-header">
            <div className="popular-courses-left">
              <div className="popular-badge">المجتمع</div>
              <h2 className="popular-title">
                {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'مجتمع أفق'}
                <span style={{ fontSize: '16px', color: '#666', marginRight: '10px' }}>
                  ({loading ? '...' : filteredCourses.length} نتيجة)
                </span>
              </h2>
            </div>
          </div>

          <div className="courses-grid">
            {loading ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px',
                fontSize: '18px'
              }}>
                جاري التحميل...
              </div>
            ) : error ? (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px', 
                color: '#e74c3c',
                fontSize: '18px'
              }}>
                {error}
              </div>
            ) : filteredCourses.length > 0 ? (
              filteredCourses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  image={course.image}
                  category={course.category}
                  rating={course.rating}
                  studentsCount={course.studentsCount}
                  duration={course.duration}
                  lessonsCount={course.lessonsCount}
                  instructorName={course.instructorName}
                  instructorAvatar={course.instructorAvatar}
                  price={course.price}
                />
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666',
                fontSize: '18px'
              }}>
                لا توجد نتائج تطابق معايير البحث
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function CommunityPage() {
  return (
    <div>
      <HomeHeader />
      <Suspense fallback={<div style={{ padding: '40px', textAlign: 'center' }}>جاري التحميل...</div>}>
        <CommunityContent />
      </Suspense>
      <Footer />
      <ScrollToTop />
      <SocialMediaFloat />
    </div>
  );
}