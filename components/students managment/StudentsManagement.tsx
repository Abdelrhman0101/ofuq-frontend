'use client';

import React, { useMemo, useState, useEffect } from 'react';
import '../../styles/students-management.css';
import '../../styles/toast.css';
import CourseGrid, { Course as CourseGridCourse } from '../CourseGrid';
import CertificateCard from '../CertificateCard';
import FinalGradesList from './FinalGradesList';
import Toast from '../Toast';
import { getStudentsStatus, deleteUser as apiDeleteUser, blockUser as apiBlockUser, unblockUser as apiUnblockUser, getUserCertificates } from '../../utils/studentsService';

type StudentCourse = CourseGridCourse & { finalExamScore: number };

interface CertificateItem {
  courseName: string;
  completionDate: string;
  certificateId?: string;
  certificateImage?: string;
  downloadUrl?: string;
  verificationUrl?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  blocked: boolean;
  courses: StudentCourse[];
  certificates: CertificateItem[];
}

export default function StudentsManagement() {
  const [students, setStudents] = useState<Student[]>([]);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [sortOption, setSortOption] = useState<'none' | 'highestGrade' | 'courseCount'>('none');

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'courses' | 'certificates' | 'finalGrades' | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [certLoading, setCertLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getStudentsStatus()
      .then((data) => {
        setStudents(data.map((s) => ({
          ...s,
          courses: s.courses.map((c) => ({
            ...c,
            finalExamScore: c.finalExamScore ?? 0,
          })),
          certificates: [],
        })));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load students', err);
        setError('فشل تحميل بيانات الطلاب');
        setToastMessage('فشل تحميل بيانات الطلاب');
        setToastType('error');
        setToastVisible(true);
        setLoading(false);
      });
  }, []);

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const openCoursesModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setModalType('courses');
    setModalOpen(true);
  };

  const openCertificatesModal = async (studentId: number) => {
    setSelectedStudentId(studentId);
    setModalType('certificates');
    setModalOpen(true);
    try {
      setCertLoading(true);
      const certs = await getUserCertificates(studentId);
      setStudents((prev) => prev.map((s) => (
        s.id === studentId
          ? {
              ...s,
              certificates: (certs || []).map((c) => ({
                courseName: c.courseName,
                completionDate: c.completionDate || '',
                certificateId: c.id?.toString(),
                certificateImage: undefined,
                downloadUrl: c.downloadUrl,
                verificationUrl: c.verificationUrl,
              })),
            }
          : s
      )));
    } catch (e) {
      console.error('Failed to load certificates', e);
      setToastMessage('تعذر تحميل شهادات الطالب');
      setToastType('error');
      setToastVisible(true);
    } finally {
      setCertLoading(false);
    }
  };

  const openFinalGradesModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setModalType('finalGrades');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedStudentId(null);
    setModalType(null);
  };

  const deleteStudent = (id: number) => {
    setToastMessage('هل أنت متأكد من حذف الطالب؟');
    setToastType('confirm');
    setPendingDeleteId(id);
    setToastVisible(true);
  };

  const confirmDelete = async () => {
    if (pendingDeleteId !== null) {
      try {
        await apiDeleteUser(pendingDeleteId);
        setStudents((prev) => prev.filter((s) => s.id !== pendingDeleteId));
        setToastMessage('تم حذف الطالب بنجاح');
        setToastType('success');
      } catch (e) {
        console.error('Delete user failed', e);
        setToastMessage('فشل حذف الطالب');
        setToastType('error');
      } finally {
        setPendingDeleteId(null);
        setTimeout(() => setToastVisible(false), 2000);
      }
    }
  };

  const cancelDelete = () => {
    setPendingDeleteId(null);
    setToastVisible(false);
  };

  const closeToast = () => {
    setToastVisible(false);
    setPendingDeleteId(null);
  };

  const toggleBlockStudent = async (id: number) => {
    const target = students.find((s) => s.id === id);
    if (!target) return;
    const willBlock = !target.blocked;
    try {
      if (willBlock) {
        await apiBlockUser(id, 'Admin action');
      } else {
        await apiUnblockUser(id);
      }
      setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, blocked: willBlock } : s)));
    } catch (e) {
      console.error('Block/unblock failed', e);
      setToastMessage('تعذر تحديث حالة الحساب');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const calcFinalExamAverage = (student: Student) => {
    if (!student.courses.length) return 0;
    const total = student.courses.reduce((sum, c) => sum + (c.finalExamScore || 0), 0);
    return Math.round(total / student.courses.length);
  };

  // General stats (independent of filters)
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter((s) => !s.blocked).length;
    const blocked = students.filter((s) => s.blocked).length;
    return { total, active, blocked };
  }, [students]);

  // Derived list after applying search, filter, and sort
  const visibleStudents = useMemo(() => {
    let list = [...students];

    // Search by name (first + last) or email
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        const name = `${s.firstName} ${s.lastName}`.toLowerCase();
        const email = s.email.toLowerCase();
        return name.includes(q) || email.includes(q);
      });
    }

    // Filter by status
    if (statusFilter === 'active') {
      list = list.filter((s) => !s.blocked);
    } else if (statusFilter === 'blocked') {
      list = list.filter((s) => s.blocked);
    }

    // Sort options
    if (sortOption === 'highestGrade') {
      list.sort((a, b) => calcFinalExamAverage(b) - calcFinalExamAverage(a));
    } else if (sortOption === 'courseCount') {
      list.sort((a, b) => b.courses.length - a.courses.length);
    }

    return list;
  }, [students, searchQuery, statusFilter, sortOption]);

  return (
    <div className="students-management">
      {loading && (
        <div className="sm-loading">جاري تحميل بيانات الطلاب...</div>
      )}
      {error && (
        <div className="sm-error">{error}</div>
      )}
      <div className="sm-header">
        <h1 className="sm-title">إدارة الطلاب</h1>
        <p className="sm-subtitle">عرض وإدارة بيانات الطلاب ضمن لوحة الإدارة</p>
      </div>

      {/* Controls: Search, Filter, Sort */}
      <div className="sm-controls">
        <input
          type="text"
          className="sm-input"
          placeholder="بحث بالاسم أو البريد"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select
          className="sm-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'blocked')}
        >
          <option value="all">جميع الحالات</option>
          <option value="active">نشط</option>
          <option value="blocked">محظور</option>
        </select>

        <select
          className="sm-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value as 'none' | 'highestGrade' | 'courseCount')}
        >
          <option value="none">بدون فرز</option>
          <option value="highestGrade">أعلى درجة</option>
          <option value="courseCount">عدد الدورات</option>
        </select>

        <button
          className="sm-btn sm-reset-btn"
          onClick={() => {
            setSearchQuery('');
            setStatusFilter('all');
            setSortOption('none');
          }}
        >
          إعادة تعيين
        </button>
      </div>

      {/* General stats above the table */}
      <div className="sm-stats" aria-label="إحصائيات عامة">
        <div className="sm-stat-card">
          <div className="sm-stat-label">إجمالي الطلاب المسجلين</div>
          <div className="sm-stat-value">{stats.total}</div>
        </div>
        <div className="sm-stat-card">
          <div className="sm-stat-label">عدد النشطين</div>
          <div className="sm-stat-value sm-stat-positive">{stats.active}</div>
        </div>
        <div className="sm-stat-card">
          <div className="sm-stat-label">عدد المحظورين</div>
          <div className="sm-stat-value sm-stat-negative">{stats.blocked}</div>
        </div>
      </div>

      <div className="sm-table-wrapper">
        <table className="sm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>الاسم الأول</th>
              <th>الاسم الأخير</th>
              <th>البريد الإلكتروني</th>
              <th>عدد الدورات</th>
              <th>عرض الدورات</th>
              <th>عدد الشهادات</th>
              <th>عرض الشهادات</th>
              <th>متوسط الامتحان النهائي</th>
              <th>حالة الحساب</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {visibleStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.email}</td>
                <td>{student.courses.length}</td>
                <td>
                  <button className="sm-btn view-btn" onClick={() => openCoursesModal(student.id)}>
                    عرض
                  </button>
                </td>
                <td>{student.certificates.length}</td>
                <td>
                  <button className="sm-btn view-cert-btn" onClick={() => openCertificatesModal(student.id)}>
                    عرض
                  </button>
                </td>
                <td>
                  <button 
                    className="sm-btn grade-btn" 
                    onClick={() => openFinalGradesModal(student.id)}
                    title="عرض درجات الامتحان النهائي"
                  >
                    {calcFinalExamAverage(student)}%
                  </button>
                </td>
                <td>
                  {student.blocked ? (
                    <span className="blocked-badge">محظور</span>
                  ) : (
                    <span className="active-badge">نشط</span>
                  )}
                </td>
                <td className="sm-actions">
                  <button className="sm-btn delete-btn" onClick={() => deleteStudent(student.id)}>
                    حذف
                  </button>
                  <button className="sm-btn block-btn" onClick={() => toggleBlockStudent(student.id)}>
                    {student.blocked ? 'إلغاء الحظر' : 'حظر الحساب'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && selectedStudent && (
        <div className="sm-modal" onClick={closeModal}>
          <div className="sm-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="sm-modal-close" onClick={closeModal}>
              ×
            </button>
            {modalType === 'courses' && (
              <div>
                <h2 className="sm-modal-title">دورات الطالب: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
                <CourseGrid courses={selectedStudent.courses} showAll={true} />
              </div>
            )}
            {modalType === 'certificates' && (
              <div>
                <h2 className="sm-modal-title">شهادات الطالب: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
                {certLoading ? (
                  <p className="sm-empty">جاري تحميل الشهادات...</p>
                ) : (
                  <div className="sm-certificates-list">
                    {selectedStudent.certificates.length ? (
                      selectedStudent.certificates.map((cert, idx) => (
                        <CertificateCard
                          key={`${selectedStudent.id}-${idx}`}
                          courseName={cert.courseName}
                          completionDate={cert.completionDate}
                          certificateId={cert.certificateId}
                          certificateImage={cert.certificateImage}
                          downloadUrl={cert.downloadUrl}
                          verificationUrl={cert.verificationUrl}
                        />
                      ))
                    ) : (
                      <p className="sm-empty">لا توجد شهادات لهذا الطالب</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {modalType === 'finalGrades' && (
              <div>
                <h2 className="sm-modal-title">درجات الامتحان النهائي: {selectedStudent.firstName} {selectedStudent.lastName}</h2>
                <FinalGradesList courses={selectedStudent.courses} />
              </div>
            )}
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={closeToast}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}