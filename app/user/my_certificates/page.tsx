'use client';

import React, { useEffect, useState } from 'react';
import CertificateCard from '../../../components/CertificateCard';
import '../../../styles/my-courses.css';
import { isAuthenticated } from '../../../utils/authService';
import { getMyCertificates, getDownloadUrl, DiplomaCertificate, getDiplomaVerificationUrl, getCourseVerificationUrl } from '../../../utils/certificateService';
import { http } from '@/lib/http';

const LOG_PREFIX = '[MyCertificates]';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<DiplomaCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        console.log(LOG_PREFIX, 'init loadCertificates');
        setLoading(true);
        if (!isAuthenticated()) {
          console.warn(LOG_PREFIX, 'user not authenticated');
          setError('يرجى تسجيل الدخول لعرض شهاداتك');
          setCertificates([]);
          return;
        }
        console.log(LOG_PREFIX, 'authenticated, calling getMyCertificates', {
          baseURL: http.defaults.baseURL,
          endpoint: '/my-certificates'
        });
        const data = await getMyCertificates();
        console.log(LOG_PREFIX, 'getMyCertificates succeeded', {
          count: data?.length ?? 0,
          sample: data && data.length ? {
            id: data[0].id,
            type: data[0].type,
            file_path: data[0].file_path,
            course_id: data[0].course_id,
            category_id: data[0].category_id,
            uuid: data[0].uuid
          } : null
        });
        setCertificates(data);
      } catch (err) {
        console.error(LOG_PREFIX, 'Failed to load certificates', {
          message: (err as any)?.message,
          error: err
        });
        setError('فشل في تحميل الشهادات');
      } finally {
        setLoading(false);
        console.log(LOG_PREFIX, 'loadCertificates finished');
      }
    };
    loadCertificates();
  }, []);

  useEffect(() => {
    console.log(LOG_PREFIX, 'state update', { loading, error, certificatesCount: certificates.length });
  }, [loading, error, certificates]);

  return (
    <div className="my-courses-page">
      <div className="page-header">
        <h1>شهاداتي</h1>
        <p>عرض جميع الشهادات التي حصلت عليها من الدورات المكتملة</p>
      </div>

      <div className="courses-container">
        {loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            fontSize: '16px'
          }}>
            جاري تحميل الشهادات...
          </div>
        )}

        {!loading && error && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            fontSize: '16px',
            color: '#e74c3c'
          }}>
            {error}
          </div>
        )}

        {!loading && !error && certificates.length === 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '200px',
            fontSize: '16px'
          }}>
            لا توجد شهادات متاحة حالياً
          </div>
        )}

        {!loading && !error && certificates.map((cert) => {
          const fileUrl = getDownloadUrl(cert.file_path);
          const verificationUrl = cert.category_id
            ? getDiplomaVerificationUrl(cert.uuid)
            : getCourseVerificationUrl(cert.uuid);

          console.log(LOG_PREFIX, 'render certificate', {
            id: cert.id,
            type: cert.type,
            file_path: cert.file_path,
            course_id: cert.course_id,
            category_id: cert.category_id,
            computed: { fileUrl, verificationUrl }
          });

          return (
            <CertificateCard
              key={cert.id}
              courseName={cert.diploma_name}
              completionDate={cert.issued_at}
              certificateId={String(cert.id)}
              certificateImage={'/certificates/certificate-template.png'}
              downloadUrl={fileUrl}
              verificationUrl={verificationUrl}
              type={cert.type}
              courseId={cert.course_id as number | undefined}
              categoryId={cert.category_id as number | undefined}
              userName={cert.user_name}
            />
          );
        })}
      </div>
    </div>
  );
}