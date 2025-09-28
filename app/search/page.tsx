'use client';

import { useState, useMemo } from 'react';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import HeroSearchSection from '../../components/HeroSearchSection';
import CourseCard from '../../components/CourseCard';
import '../../styles/course-cards.css';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('الكل');

  // Sample course data for 9 courses with new fields
  const allCourses = [
    {
      id: '1',
      title: 'تطوير تطبيقات الويب باستخدام React',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'برمجة',
      rating: 4.8,
      studentsCount: 1250,
      duration: '12 ساعة',
      lessonsCount: 24,
      instructorName: 'أحمد محمد',
      instructorAvatar: '/profile.jpg',
      price: 299,
      language: 'العربية',
      level: 'متوسط',
      field: 'تقنية المعلومات',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      title: 'أساسيات التصميم الجرافيكي',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'تصميم',
      rating: 4.6,
      studentsCount: 890,
      duration: '8 ساعات',
      lessonsCount: 16,
      instructorName: 'فاطمة علي',
      instructorAvatar: '/profile.jpg',
      price: 199,
      language: 'العربية',
      level: 'مبتدئ',
      field: 'الفنون والتصميم',
      createdAt: '2024-01-10'
    },
    {
      id: '3',
      title: 'التسويق الرقمي المتقدم',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'تسويق',
      rating: 4.9,
      studentsCount: 2100,
      duration: '15 ساعة',
      lessonsCount: 30,
      instructorName: 'محمد حسن',
      instructorAvatar: '/profile.jpg',
      price: 399,
      language: 'العربية',
      level: 'متقدم',
      field: 'الأعمال والتسويق',
      createdAt: '2024-01-20'
    },
    {
      id: '4',
      title: 'إدارة المشاريع الاحترافية',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'إدارة',
      rating: 4.7,
      studentsCount: 1560,
      duration: '10 ساعات',
      lessonsCount: 20,
      instructorName: 'سارة أحمد',
      instructorAvatar: '/profile.jpg',
      price: 249,
      language: 'الإنجليزية',
      level: 'متوسط',
      field: 'الإدارة والقيادة',
      createdAt: '2024-01-12'
    },
    {
      id: '5',
      title: 'تحليل البيانات باستخدام Python',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'تحليل البيانات',
      rating: 4.8,
      studentsCount: 980,
      duration: '14 ساعة',
      lessonsCount: 28,
      instructorName: 'عمر خالد',
      instructorAvatar: '/profile.jpg',
      price: 349,
      language: 'الإنجليزية',
      level: 'متقدم',
      field: 'تقنية المعلومات',
      createdAt: '2024-01-18'
    },
    {
      id: '6',
      title: 'التصوير الفوتوغرافي الاحترافي',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'فنون',
      rating: 4.5,
      studentsCount: 720,
      duration: '6 ساعات',
      lessonsCount: 12,
      instructorName: 'ليلى محمود',
      instructorAvatar: '/profile.jpg',
      price: 179,
      language: 'العربية',
      level: 'مبتدئ',
      field: 'الفنون والتصميم',
      createdAt: '2024-01-08'
    },
    {
      id: '7',
      title: 'الذكاء الاصطناعي للمبتدئين',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'تقنية',
      rating: 4.9,
      studentsCount: 1800,
      duration: '18 ساعة',
      lessonsCount: 36,
      instructorName: 'يوسف عبدالله',
      instructorAvatar: '/profile.jpg',
      price: 449,
      language: 'العربية',
      level: 'مبتدئ',
      field: 'تقنية المعلومات',
      createdAt: '2024-01-22'
    },
    {
      id: '8',
      title: 'كتابة المحتوى الإبداعي',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'كتابة',
      rating: 4.6,
      studentsCount: 650,
      duration: '7 ساعات',
      lessonsCount: 14,
      instructorName: 'نور الدين',
      instructorAvatar: '/profile.jpg',
      price: 159,
      language: 'العربية',
      level: 'متوسط',
      field: 'الإعلام والكتابة',
      createdAt: '2024-01-14'
    },
    {
      id: '9',
      title: 'ريادة الأعمال والابتكار',
      image: '/gamification-creative-collage-concept.jpg',
      category: 'أعمال',
      rating: 4.7,
      studentsCount: 1320,
      duration: '11 ساعة',
      lessonsCount: 22,
      instructorName: 'هالة سعد',
      instructorAvatar: '/profile.jpg',
      price: 279,
      language: 'العربية',
      level: 'متقدم',
      field: 'الأعمال والتسويق',
      createdAt: '2024-01-16'
    }
  ];

  // Smart search and filter functionality
  const filteredCourses = useMemo(() => {
    let filtered = allCourses;

    // Search by title, category, or instructor name
    if (searchQuery.trim()) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters based on selected filter
    if (selectedFilter !== 'الكل') {
      switch (selectedFilter) {
        case 'الأحدث':
          filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'اللغة':
          // Group by language - show Arabic courses first
          filtered.sort((a, b) => {
            if (a.language === 'العربية' && b.language !== 'العربية') return -1;
            if (a.language !== 'العربية' && b.language === 'العربية') return 1;
            return 0;
          });
          break;
        case 'المستوى':
          // Sort by level: مبتدئ, متوسط, متقدم
          const levelOrder = { 'مبتدئ': 1, 'متوسط': 2, 'متقدم': 3 };
          filtered.sort((a, b) => levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder]);
          break;
        case 'المجال':
          // Group by field
          filtered.sort((a, b) => a.field.localeCompare(b.field));
          break;
        default:
          break;
      }
    }

    return filtered;
  }, [searchQuery, selectedFilter, allCourses]);

  return (
    <div>
      <HomeHeader />
      <main>
        <HeroSearchSection 
          onSearch={setSearchQuery}
          onFilterChange={setSelectedFilter}
          searchQuery={searchQuery}
          activeFilter={selectedFilter}
        />
        
        {/* Course Cards Section */}
        <section className="popular-courses-section">
          <div className="popular-courses-container">
            <div className="popular-courses-header">
              <div className="popular-courses-left">
                <div className="popular-badge">نتائج البحث</div>
                <h2 className="popular-title">
                  {searchQuery ? `نتائج البحث عن "${searchQuery}"` : 'الكورسات المتاحة'}
                  <span style={{ fontSize: '16px', color: '#666', marginRight: '10px' }}>
                    ({filteredCourses.length} كورس)
                  </span>
                </h2>
              </div>
             
            </div>
            
            <div className="courses-grid">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
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
                  لا توجد كورسات تطابق معايير البحث
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}