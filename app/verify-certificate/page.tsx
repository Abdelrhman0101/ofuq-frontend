'use client';

import { useState } from 'react';
import { http } from '@/lib/http';
import HomeHeader from '@/components/HomeHeader';
import Footer from '@/components/Footer';
import './verify-certificate.css';

interface CertificateData {
  student_name: string;
  course_title: string;
  exam_grade: string;
  exam_date: string;
  serial_number: string;
}

interface ApiResponse {
  success: boolean;
  data?: CertificateData;
  message?: string;
}

function VerifyCertificateContent() {
  const [serialNumber, setSerialNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serialNumber.trim()) {
      setError('يرجى إدخال الرقم التسلسلي');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await http.get(`/public/verify-certificate?serial_number=${serialNumber}`);
      setResult(response.data.data); // استخدام response.data.data للوصول للبيانات الفعلية
      setError(''); // مسح أي خطأ سابق عند النجاح
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('لم يتم العثور على شهادة بهذا الرقم التسلسلي. يرجى التحقق من الرقم والمحاولة مرة أخرى.');
      } else if (err.response?.status === 400) {
        setError('الرقم التسلسلي المدخل غير صحيح. يرجى التأكد من إدخال الرقم كاملاً.');
      } else {
        setError('حدث خطأ أثناء التحقق من الشهادة. يرجى المحاولة مرة أخرى لاحقًا.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-certificate-main">
      {/* Hero Section */}
      <section className="verify-hero">
        <div className="hero-content">
          <h1 className="hero-title">التحقق من الشهادات</h1>
          <p className="hero-subtitle">
            تحقق من صحة الشهادات الصادرة عن منصة أفق للتعليم
          </p>
          <p className="hero-description">
            أدخل الرقم التسلسلي الموجود على الشهادة للتحقق من صحتها ومعلوماتها
          </p>
        </div>
      </section>

      {/* Verification Section */}
      <section className="verify-content">
        <div className="verify-form-container">
          <form onSubmit={handleVerify} className="verify-form">
            <div className="form-header">
              <h2 className="form-title">التحقق من الشهادة</h2>
              <p className="form-subtitle">أدخل الرقم التسلسلي للتحقق</p>
            </div>
            
            <div className="input-group">
              <label htmlFor="serialNumber" className="input-label">
                الرقم التسلسلي للشهادة
              </label>
              <input
                id="serialNumber"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="أدخل الرقم التسلسلي الموجود على الشهادة"
                className="serial-input"
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="verify-button" disabled={loading}>
              {loading ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                  <span>جاري التحقق...</span>
                </div>
              ) : (
                'تحقق من الشهادة'
              )}
            </button>
          </form>

          {loading && (
            <div className="ofuq-loader-overlay">
              <div className="ofuq-loader">
                <div className="loader-circle">
                  <div className="inner-circle"></div>
                  <div className="outer-circle"></div>
                  <div className="center-dot"></div>
                </div>
                <div className="loader-text">يتم التحقق من الشهادة...</div>
                <div className="loader-subtext">يرجى الانتظار لحظة</div>
              </div>
            </div>
          )}

          {error && (
            <div className="result-card error-card">
              <div className="result-icon error-icon"></div>
              <h3 className="result-title">لم يتم العثور على الشهادة</h3>
              <p className="result-message">{error}</p>
            </div>
          )}

          {result && (
            <div className="result-card success-card">
              
              <h3 className="result-title">الشهادة موثقة وصحيحة</h3>
              
              <div className="certificate-details">
                <div className="detail-row">
                  <span className="detail-label">اسم الطالب:</span>
                  <span className="detail-value">{result.student_name}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">اسم الدورة:</span>
                  <span className="detail-value">{result.course_title}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">النتيجة:</span>
                  <span className="detail-value grade-value">{result.exam_grade}</span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">تاريخ الاختبار:</span>
                  <span className="detail-value">
                    {result.exam_date ? new Date(result.exam_date).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : '-'}
                  </span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">الرقم التسلسلي:</span>
                  <span className="detail-value serial-value">{result.serial_number}</span>
                </div>
              </div>
              
              <div className="verification-badge">
                <div className="badge-icon">🔒</div>
                <span>تم التحقق من قبل منصة أفق</span>
              </div>
            </div>
          )}

          <div className="verify-footer">
            <p className="footer-text">
              هذه الخدمة مقدمة من منصة أفق للتعليم عن بعد
            </p>
            <p className="footer-subtext">
              للاستفسارات أو المساعدة، يرجى التواصل مع فريق الدعم
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function VerifyCertificate() {
  return (
    <div>
      <HomeHeader />
      <VerifyCertificateContent />
      <Footer />
    </div>
  );
}