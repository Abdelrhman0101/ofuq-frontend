'use client';

import React, { useEffect, useState } from 'react';
import CertificateCard from '../../../components/CertificateCard';
import '../../../styles/my-courses.css';
import { isAuthenticated } from '../../../utils/authService';
import { getMyCertificates, getDownloadUrl, getVerificationUrl, CertificateItem } from '../../../utils/certificateService';

export default function MyCertificatesPage() {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        setLoading(true);
        if (!isAuthenticated()) {
          setError('يرجى تسجيل الدخول لعرض شهاداتك');
          setCertificates([]);
          return;
        }
        const data = await getMyCertificates();
        setCertificates(data);
      } catch (err) {
        console.error('Failed to load certificates', err);
        setError('فشل في تحميل الشهادات');
      } finally {
        setLoading(false);
      }
    };
    loadCertificates();
  }, []);

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

        {!loading && !error && certificates.map((cert) => (
          <CertificateCard
            key={cert.id}
            courseName={cert.course_title}
            completionDate={cert.completion_date || cert.issued_at}
            certificateId={String(cert.id)}
            certificateImage={'/certificates/certificate-template.png'}
            downloadUrl={getDownloadUrl(cert.download_url)}
            verificationUrl={getVerificationUrl(cert.verification_url || cert.verification_token)}
          />
        ))}
      </div>
    </div>
  );
}