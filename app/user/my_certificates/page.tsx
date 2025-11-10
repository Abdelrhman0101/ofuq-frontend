'use client';

import React, { useEffect, useMemo, useState } from 'react';
import '../../../styles/my-certificates.css';
import { isAuthenticated, getAuthToken } from '../../../utils/authService';
import { getMyCourseCertificates, CourseCertificate } from '../../../utils/certificateService';
import { getBackendAssetUrl } from '../../../utils/url';

function formatDateLabel(cert: CourseCertificate): string {
  const d = cert.issued_at || cert.completion_date || '';
  return String(d);
}

export default function MyCertificatesPage() {
  const [items, setItems] = useState<CourseCertificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        if (!isAuthenticated()) {
          setError('يرجى تسجيل الدخول لعرض شهاداتك');
          setItems([]);
          return;
        }
        const data = await getMyCourseCertificates();
        if (!cancelled) setItems(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'فشل في تحميل الشهادات');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleView = (cert: CourseCertificate) => {
    let target = '';
    if (cert.file_path) {
      // طبّع المسار باستخدام NEXT_PUBLIC_ASSETS_BASE_URL حتى لا يفتح على localhost:3000
      target = getBackendAssetUrl(cert.file_path);
    } else if (cert.verification_url) {
      target = cert.verification_url;
    }
    if (!target) {
      alert('لا يوجد رابط عرض متاح لهذه الشهادة');
      return;
    }
    window.open(target, '_blank');
  };

  const handleDownload = async (cert: CourseCertificate) => {
    try {
      const url = cert.download_url;
      if (!url) {
        alert('رابط تنزيل غير متاح لهذه الشهادة');
        return;
      }
      const token = getAuthToken();
      if (!token) {
        alert('يرجى تسجيل الدخول لتنزيل الشهادة');
        return;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('فشل في تنزيل الشهادة');
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      const baseName = cert.serial_number || cert.course_title || `certificate-${cert.id}`;
      a.download = `${baseName}.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(objectUrl);
      a.remove();
    } catch (e) {
      alert((e as any)?.message || 'حدث خطأ أثناء التنزيل');
    }
  };

  const tableBody = useMemo(() => {
    return items.map((cert, idx) => (
      <tr key={cert.id}>
        <td className="mc-index">{idx + 1}</td>
        <td className="mc-title">{cert.course_title}</td>
        <td className="mc-serial">{cert.serial_number || '-'}</td>
        <td className="mc-date">{formatDateLabel(cert)}</td>
        <td className="mc-actions">
          <button className="mc-btn mc-download" onClick={() => handleDownload(cert)}>تحميل</button>
        </td>
        <td className="mc-actions">
          <button className="mc-btn mc-view" onClick={() => handleView(cert)}>عرض</button>
        </td>
      </tr>
    ));
  }, [items]);

  return (
    <div className="my-certificates-page">
      <div className="page-header">
        <h1>شهاداتي</h1>
        <p>عرض شهادات الكورسات المكتملة</p>
      </div>

      {loading && (
        <div className="mc-loading">جاري تحميل الشهادات...</div>
      )}

      {!loading && error && (
        <div className="mc-error">{error}</div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mc-empty">لا توجد شهادات متاحة حالياً</div>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="mc-table-wrap">
          <table className="mc-table" dir="rtl">
            <thead>
              <tr>
                <th>ترقيم</th>
                <th>اسم المقرر</th>
                <th>السريال</th>
                <th>التاريخ</th>
                <th>زرار التحميل</th>
                <th>زرار العرض</th>
              </tr>
            </thead>
            <tbody>
              {tableBody}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}