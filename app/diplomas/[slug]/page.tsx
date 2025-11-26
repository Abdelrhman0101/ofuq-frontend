'use client';

import React, { useEffect, useState, useRef } from 'react';
export const dynamic = 'force-dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiBook, FiStar, FiDollarSign, FiEye, FiPlay, FiUser } from 'react-icons/fi';
import HomeHeader from '../../../components/HomeHeader';
import Footer from '../../../components/Footer';
import ScrollToTop from '../../../components/ScrollToTop';
import SocialMediaFloat from '../../../components/SocialMediaFloat';
import EnrollmentInfoModal from '../../../components/EnrollmentInfoModal';
import Toast from '../../../components/Toast';
import '@/styles/toast.css';
import { getPublicDiplomaDetails, enrollInDiploma, getMyDiplomas, type Diploma, type MyDiploma } from '../../../utils/categoryService';
import { type Course } from '../../../utils/courseService';
import { getBackendAssetUrl } from '../../../utils/url';
import { isAuthenticated } from '../../../utils/authService';
import styles from './DiplomaDetails.module.css';

// نوسّع نوع الدبلومة ليشمل المقررات المتوقعة من الـ API
type DiplomaDetails = Diploma & { courses?: Course[] };

export default function DiplomaDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug;
  const coursesRef = useRef<HTMLElement>(null);

  const [diploma, setDiploma] = useState<DiplomaDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollStatus, setEnrollStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ type: 'idle' });
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info', duration = 3000) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    if (duration > 0) {
      setTimeout(() => setToastVisible(false), duration);
    }
  };

  // Check if user is enrolled in this diploma
  const checkEnrollmentStatus = async () => {
    if (!diploma || !isAuthenticated()) {
      setIsEnrolled(false);
      return;
    }

    try {
      setCheckingEnrollment(true);
      const myDiplomas = await getMyDiplomas();
      const enrolled = myDiplomas.some((myDiploma: MyDiploma) =>
        myDiploma.category?.id === diploma.id || myDiploma.category?.slug === diploma.slug
      );
      setIsEnrolled(enrolled);
    } catch (error) {
      console.error('Error checking enrollment status:', error);
      setIsEnrolled(false);
    } finally {
      setCheckingEnrollment(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!slug) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getPublicDiplomaDetails(String(slug));
        setDiploma(data as unknown as DiplomaDetails);
      } catch (e: any) {
        setError(e?.message || 'حدث خطأ أثناء جلب بيانات الدبلومة');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [slug]);

  // عرض تنبيه عند الوصول من صفحة المقرر بضرورة الاشتراك
  useEffect(() => {
    try {
      const notice = searchParams?.get('notice');
      if (notice === 'enroll_required') {
        showToast('يرجى الاشتراك في الدبلومة لعرض محتويات هذا المقرر', 'warning', 4000);
      }
    } catch { }
  }, [searchParams]);

  // Check enrollment status when diploma is loaded
  useEffect(() => {
    if (diploma) {
      checkEnrollmentStatus();
    }
  }, [diploma]);

  const scrollToCourses = () => {
    if (coursesRef.current) {
      coursesRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleEnroll = async () => {
    if (!diploma) return;

    // If already enrolled, scroll to courses section
    if (isEnrolled) {
      scrollToCourses();
      return;
    }

    const loggedIn = isAuthenticated();
    if (!loggedIn) {
      setEnrollStatus({ type: 'error', message: 'يرجى تسجيل الدخول لإتمام التسجيل' });
      router.push('/auth');
      return;
    }
    setIsEnrollmentModalOpen(true);
  };

  const handleEnrollmentSubmit = async () => {
    if (!diploma) return;
    try {
      setEnrollStatus({ type: 'loading' });
      const res = await enrollInDiploma(diploma.id);
      setEnrollStatus({ type: 'success', message: res?.message || 'تم التسجيل بنجاح' });
      setIsEnrollmentModalOpen(false);
      // Update enrollment status
      setIsEnrolled(true);
      try { router.push('/dashboard/my-diplomas'); } catch { }
    } catch (e: any) {
      setEnrollStatus({ type: 'error', message: e?.message || 'فشلت عملية التسجيل بالدبلومة' });
    }
  };

  const transformCourse = (course: Course) => {
    const coverRaw = (course as any).cover_image_url || (course as any).coverImage || (course as any).image || course.cover_image || '';
    const image = getBackendAssetUrl(coverRaw) || '/banner.jpg';
    const instructorName = (course?.instructor as any)?.name || 'مدرب';
    const desc = (course?.description || '').trim();
    const description = desc.length > 120 ? desc.slice(0, 120) + '…' : desc;
    return {
      id: String(course.id),
      title: course.title || 'مقرر تعليمي',
      image,
      description,
      instructorName,
      priceText: course.is_free ? 'مجاني' : `${course.price} جنيه`,
    };
  };

  const getButtonText = () => {
    if (checkingEnrollment) return 'جاري التحقق...';
    if (enrollStatus.type === 'loading') return 'جارِ التسجيل…';
    if (isEnrolled) return 'شاهد المقررات';
    return 'التسجيل بالدبلومة';
  };

  const getButtonClass = () => {
    if (isEnrolled) return `${styles.enrollButton} ${styles.viewCoursesButton}`;
    return styles.enrollButton;
  };

  return (
    <div>
      <HomeHeader />

      {loading && (
        <section className={styles.loadingSection}>
          <div className={styles.loader}>جاري تحميل تفاصيل الدبلومة…</div>
        </section>
      )}

      {!loading && error && (
        <section className={styles.errorSection}>
          <div className={styles.errorBox}>
            <p className={styles.errorMessage}>{error}</p>
            <button className={styles.retryButton} onClick={() => router.refresh()}>إعادة المحاولة</button>
          </div>
        </section>
      )}

      {!loading && !error && diploma && (
        <main className={styles.page} dir="rtl">
          {/* Enhanced Hero Section */}
          {/* <section className={styles.hero}>
            <div className={styles.heroBackground}>
              <div className={styles.heroPattern}></div>
            </div>
            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <h1 className={styles.heroTitle}>{diploma?.name}</h1>
                <p className={styles.heroSubtitle}>
                  {diploma?.description ? 
                    (diploma.description.length > 150 ? 
                      diploma.description.slice(0, 150) + '...' : 
                      diploma.description
                    ) : 
                    'اكتشف عالماً جديداً من المعرفة والمهارات المتقدمة'
                  }
                </p>
                  disabled={enrollStatus.type === 'loading' || checkingEnrollment}
                >
                  <span className={styles.buttonText}>{getButtonText()}</span>
                  <span className={styles.buttonIcon}>
                    {isEnrolled ? <FiEye /> : <FiBook />}
                  </span>
                </button>
                {enrollStatus.message && (
                  <div className={`${styles.enrollStatus} ${styles[enrollStatus.type]}`}>
                    {enrollStatus.message}
                  </div>
                )}
              </div>
            </div>
          </section> */}

          {/* تفاصيل الدبلومة */}
          <section className={styles.detailsSection}>
            <div className={styles.detailsGrid}>
              <div className={styles.coverWrapper}>
                <img
                  className={styles.coverImage}
                  src={getBackendAssetUrl(diploma?.cover_image_url || '') || '/banner.jpg'}
                  alt={diploma?.name || 'غلاف الدبلومة'}
                />
                <div className={styles.coverOverlay}>
                  <button
                    className={styles.playButton}
                    onClick={handleEnroll}
                    disabled={enrollStatus.type === 'loading' || checkingEnrollment}
                  >
                    {isEnrolled ? <FiEye /> : <FiPlay />}
                  </button>
                  aria-label={isEnrolled ? 'مشاهدة المقررات' : 'التسجيل بالدبلومة'}
                  >
                  <span className={styles.buttonText}>{getButtonText()}</span>
                  <span className={styles.buttonIconSmall} aria-hidden="true">
                    {isEnrolled ? <FiEye /> : <FiBook />}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

          {/* مقررات الدبلومة */}
      <section ref={coursesRef} className={styles.coursesSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>مقررات الدبلومة</h2>
          <div className={styles.sectionLine}></div>
        </div>

        <div className={styles.coursesGrid}>
          {(diploma?.courses || []).length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}><FiBook /></div>
              <p>لا توجد مقررات مرتبطة حالياً.</p>
            </div>
          )}

          {(diploma?.courses || []).map((course) => {
            const c = transformCourse(course);
            return (
              <Link href={`/course-details/${c.id}`} key={c.id} className={styles.courseCard}>
                <div className={styles.courseImageWrapper}>
                  <img src={c.image} alt={c.title} className={styles.courseImage} />
                  <div className={styles.courseOverlay}>
                    <div className={styles.coursePlayButton}><FiPlay /></div>
                  </div>
                  <div className={styles.courseBadge}>
                    {c.priceText}
}

                    <EnrollmentInfoModal
                      isOpen={isEnrollmentModalOpen}
                      onClose={() => setIsEnrollmentModalOpen(false)}
                      onSubmit={handleEnrollmentSubmit}
                    />

                    <Footer />
                    <ScrollToTop />
                    <SocialMediaFloat />
                    <Toast
                      message={toastMessage}
                      type={toastType}
                      isVisible={toastVisible}
                      onClose={() => setToastVisible(false)}
                      duration={3000}
                    />
                  </div >
                  );
}