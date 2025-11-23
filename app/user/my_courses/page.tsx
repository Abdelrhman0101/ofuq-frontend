"use client";

import React, { useEffect, useState } from 'react';
import { getMyDiplomas, MyDiploma } from '../../../utils/categoryService';
import { getBackendAssetUrl } from '../../../utils/url';
import { isAuthenticated } from '../../../utils/authService';
import styles from './MyCourses.module.css';

interface DiplomaCard {
  id: number;
  name: string;
  description: string;
  image: string;
  status: 'active' | 'pending_payment';
  enrolled_at: string;
  courses_count?: number;
  slug?: string;
  category_id?: number;
}

export default function MyDiplomas() {
  const [diplomas, setDiplomas] = useState<DiplomaCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Ensure user is authenticated for protected endpoints
        if (!isAuthenticated()) {
          setError('الرجاء تسجيل الدخول لعرض دبلوماتك');
          setLoading(false);
          return;
        }

        const myDiplomas = await getMyDiplomas();
        
        const diplomaCards: DiplomaCard[] = myDiplomas.map((enrollment: MyDiploma) => ({
          id: enrollment.id,
          name: enrollment.category.name,
          description: enrollment.category.description,
          image: getBackendAssetUrl(enrollment.category.cover_image_url ?? ''),
          status: enrollment.status,
          enrolled_at: enrollment.enrolled_at,
          courses_count: enrollment.category.courses_count,
          slug: enrollment.category.slug,
          category_id: (enrollment.category as any)?.id,
        }));

        setDiplomas(diplomaCards);
      } catch (err: any) {
        setError(err?.message ?? 'حدث خطأ أثناء جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getStatusText = (status: 'active' | 'pending_payment') => {
    return status === 'active' ? 'نشط' : 'في انتظار الدفع';
  };

  const getStatusClass = (status: 'active' | 'pending_payment') => {
    return status === 'active' ? 'status-active' : 'status-pending';
  };

  return (
    <div className={`my-courses-page ${styles.myCoursesPage}`}>
      <div className="page-header">
        <h1>الدبلومات والمقررات</h1>
        <p>جميع الدبلومات التي تتابعها</p>
      </div>
      
      <div className="courses-container">
        {loading && (
          <div className="loading-state">جاري التحميل...</div>
        )}
        {error && !loading && (
          <div className="error-state">{error}</div>
        )}
        {!loading && !error && (
          <div className="diplomas-grid">
            {diplomas.length === 0 ? (
              <div className="empty-state">
                <p>لم تسجل في أي دبلومة بعد</p>
              </div>
            ) : (
              diplomas.map((diploma) => (
                <div key={diploma.id} className="diploma-card">
                  <div className="diploma-image">
                    <img 
                      src={diploma.image || '/placeholder-diploma.jpg'} 
                      alt={diploma.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-diploma.jpg';
                      }}
                    />
                  </div>
                  <div className="diploma-content">
                    <h3 className="diploma-title">{diploma.name}</h3>
                    <p className="diploma-description">{diploma.description}</p>
                    <div className="diploma-meta">
                      <span className={`diploma-status ${getStatusClass(diploma.status)}`}>
                        {getStatusText(diploma.status)}
                      </span>
                      {diploma.courses_count && (
                        <span className="courses-count">
                          {diploma.courses_count} مقرر
                        </span>
                      )}
                    </div>
                    <div className="diploma-date">
                      تاريخ التسجيل: {new Date(diploma.enrolled_at).toLocaleDateString('ar-SA')}
                    </div>
                    <div className="diploma-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => window.location.href = `/diplomas/${diploma.slug || diploma.category_id}`}
                      >
                        عرض الدبلومة
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}