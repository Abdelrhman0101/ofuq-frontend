'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import styles from './AdminDiplomaCertificates.module.css';

import {
  getEligibleStudents,
  getIssuedCertificates,
  issueDiplomaCertificate,
} from '@/utils/adminDiplomaCertificatesService';

interface EligibleStudent {
  id: number;
  name: string;
  email: string;
  progress_percentage: number;
  final_exam_score?: number;
}

interface IssuedCertificate {
  id: number;
  student_name: string;
  serial_number: string;
  issued_at: string;
  file_url?: string;
}

export default function AdminDiplomaCertificatesPage() {
  const params = useParams();
  const diplomaId = params?.id as string;
  
  const [activeTab, setActiveTab] = useState<'eligible' | 'issued'>('eligible');
  const [eligibleStudents, setEligibleStudents] = useState<EligibleStudent[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issuingCertificates, setIssuingCertificates] = useState<Set<number>>(new Set());
  const [diplomaName, setDiplomaName] = useState('');

  useEffect(() => {
    if (diplomaId) {
      fetchData();
    }
  }, [diplomaId]);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('يرجى تسجيل الدخول أولاً. يمكنك استخدام صفحة اختبار المصادقة لتعيين توكن للتطوير.');
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check for authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        setError('test-auth: يرجى تسجيل الدخول أولاً للوصول إلى هذه الصفحة');
        setLoading(false);
        return;
      }

      const numericDiplomaId = parseInt(diplomaId, 10);
      
      // Fetch eligible students from external backend
      const eligibleStudentsData = await getEligibleStudents(numericDiplomaId);
      setEligibleStudents(eligibleStudentsData);

      // Fetch issued certificates from external backend
      const issuedCertificatesData = await getIssuedCertificates(numericDiplomaId);
      setIssuedCertificates(issuedCertificatesData);

      // Set default diploma name for now since we're using external API
      setDiplomaName(`دبلوم رقم ${numericDiplomaId}`);
      
    } catch (error: any) {
      console.error('Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في تحميل البيانات';
      setError(errorMessage);
      
      // Handle authentication errors
      if (errorMessage.includes('Unauthenticated') || errorMessage.includes('غير مصرح')) {
        alert('يجب تسجيل الدخول كمسؤول للوصول إلى هذه الصفحة');
      } else {
        alert(`حدث خطأ في تحميل البيانات: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async (studentId: number) => {
    try {
      setIssuingCertificates(prev => new Set(prev).add(studentId));
      
      const numericDiplomaId = parseInt(diplomaId, 10);
      const response = await issueDiplomaCertificate(numericDiplomaId, studentId);
      
      // Refresh data after successful issuance
      await fetchData();
      alert(response.message || 'تم إصدار الشهادة بنجاح!');
      
    } catch (error: any) {
      console.error('Error issuing certificate:', error);
      alert(`فشل إصدار الشهادة: ${error.message || 'حدث خطأ غير متوقع'}`);
    } finally {
      setIssuingCertificates(prev => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  const downloadCertificate = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  if (loading) return <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>جاري التحميل...</p></div>;
  if (error) return (
    <div className={styles.errorContainer}>
      <p>خطأ: {error}</p>
      {error.includes('test-auth') && (
        <a href="/test-auth" target="_blank" className={styles.authLink}>
          الذهاب إلى صفحة اختبار المصادقة
        </a>
      )}
      <button onClick={fetchData} className={styles.retryButton}>إعادة المحاولة</button>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>شهادات الدبلومة: {diplomaName}</h1>
        <button 
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          ← رجوع
        </button>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'eligible' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('eligible')}
        >
          الطلاب المستحقين ({eligibleStudents.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'issued' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('issued')}
        >
          الشهادات الصادرة ({issuedCertificates.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'eligible' && (
          <div className={styles.tableContainer}>
            <h2 className={styles.sectionTitle}>الطلاب المستحقين للشهادة</h2>
            {eligibleStudents.length === 0 ? (
              <div className={styles.emptyState}>
                لا يوجد طلاب مستحقين للشهادة حالياً
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>اسم الطالب</th>
                    <th>البريد الإلكتروني</th>
                    <th>نسبة الإنجاز</th>
                    <th>الدرجة النهائية</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {eligibleStudents.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.progress_percentage}%</td>
                      <td>{student.final_exam_score ? `${student.final_exam_score}%` : '-'}</td>
                      <td>
                        <button
                          className={styles.issueButton}
                          onClick={() => issueCertificate(student.id)}
                          disabled={issuingCertificates.has(student.id)}
                        >
                          {issuingCertificates.has(student.id) ? (
                            <span className={styles.spinner}></span>
                          ) : (
                            'إصدار الشهادة'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'issued' && (
          <div className={styles.tableContainer}>
            <h2 className={styles.sectionTitle}>الشهادات الصادرة</h2>
            {issuedCertificates.length === 0 ? (
              <div className={styles.emptyState}>
                لا توجد شهادات صادرة حالياً
              </div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>اسم الطالب</th>
                    <th>الرقم التسلسلي</th>
                    <th>تاريخ الإصدار</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {issuedCertificates.map((certificate) => (
                    <tr key={certificate.id}>
                      <td>{certificate.student_name}</td>
                      <td>{certificate.serial_number}</td>
                      <td>{new Date(certificate.issued_at).toLocaleDateString('ar-EG')}</td>
                      <td>
                        {certificate.file_url && (
                          <button
                            className={styles.downloadButton}
                            onClick={() => downloadCertificate(certificate.file_url!)}
                          >
                            تحميل PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}