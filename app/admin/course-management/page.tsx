"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import CourseDetailsPopup from "@/components/CourseDetailsPopup";
import { getCourses, deleteCourse, getAdminCourse, type Course } from "@/utils/courseService";
import "@/styles/toast.css";
import "@/styles/admin-courses.css";

export default function AdminCoursesPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info" | "confirm">("info");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<number | null>(null);

  // حالات النافذة المنبثقة
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loadingCourseDetails, setLoadingCourseDetails] = useState(false);

  // وظيفة عرض تفاصيل المقرر
  const handleViewCourseDetails = async (courseId: number) => {
    setLoadingCourseDetails(true);
    try {
      const courseDetails = await getAdminCourse(courseId);
      if (courseDetails) {
        setSelectedCourse(courseDetails);
        setPopupVisible(true);
      } else {
        setToastType("error");
        setToastMessage("فشل في جلب تفاصيل المقرر");
        setToastVisible(true);
      }
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "حدث خطأ أثناء جلب تفاصيل المقرر");
      setToastVisible(true);
    } finally {
      setLoadingCourseDetails(false);
    }
  };

  // وظيفة إغلاق النافذة المنبثقة
  const handleClosePopup = () => {
    setPopupVisible(false);
    setSelectedCourse(null);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCourses();
      setCourses(list);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب المقررات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const confirmDelete = (id: number) => {
    setTargetDeleteId(id);
    setToastType("confirm");
    setToastMessage("هل تريد حذف هذا المقرر؟");
    setConfirmVisible(true);
    setToastVisible(true);
  };

  const handleDelete = async () => {
    if (!targetDeleteId) return;
    try {
      await deleteCourse(targetDeleteId);
      setToastType("success");
      setToastMessage("تم حذف المقرر بنجاح");
      setConfirmVisible(false);
      setToastVisible(true);
      setTargetDeleteId(null);
      await fetchData();
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "حدث خطأ أثناء الحذف");
      setConfirmVisible(false);
      setToastVisible(true);
    }
  };

  return (
    <div className="admin-courses-container">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">
          {categoryId ? `إدارة مقررات الدبلوم #${categoryId}` : 'إدارة المقررات'}
        </h1>
        <p className="admin-courses-subtitle">
          {categoryId ? 'إدارة وتنظيم مقررات هذا الدبلوم' : 'إدارة وتنظيم جميع المقررات التعليمية'}
        </p>
      </div>

      <div className="admin-courses-actions">
        <Link 
          href={categoryId ? `/admin/courses/new?categoryId=${categoryId}` : "/admin/courses/new"} 
          className="btn-primary"
        >
          + إنشاء مقرر جديد
        </Link>
        {categoryId && (
          <Link href="/admin/courses" className="btn-secondary">
            العودة إلى إدارة الدبلومات
          </Link>
        )}
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      )}
      
      {error && (
        <div className="message message-error">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="courses-table-container" dir="rtl">
          <table className="courses-table">
            <thead>
              <tr>
                <th>المعرف</th>
                <th>العنوان</th>
                <th>الحالة</th>
                <th>عدد الوحدات</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📚</div>
                      <div className="empty-state-title">لا توجد مقررات</div>
                      <div className="empty-state-description">لم يتم إنشاء أي مقررات بعد. ابدأ بإنشاء مقرر جديد.</div>
                    </div>
                  </td>
                </tr>
              )}
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <div className="course-title">{c.title}</div>
                    {c.description && (
                      <div className="course-description">
                        {c.description.length > 100 
                          ? c.description.substring(0, 100) + '...' 
                          : c.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`course-status ${
                      c.status === 'published' ? 'status-active' :
                      c.status === 'draft' ? 'status-draft' : 
                      'status-archived'
                    }`}>
                      {c.status === 'published' ? 'نشط' : 
                       c.status === 'draft' ? 'مسودة' : 
                       'مؤرشف'}
                    </span>
                  </td>
                  
                  <td>{c.chapters_count ?? c.chapters?.length ?? 0}</td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-small btn-details" 
                        onClick={() => handleViewCourseDetails(c.id)}
                        disabled={loadingCourseDetails}
                      >
                        {loadingCourseDetails ? 'جاري التحميل...' : 'عرض التفاصيل'}
                      </button>
                      <Link href={`/admin/courses/${c.id}/chapters`} className="btn-small btn-view">اضافة محتوي</Link>
                      <Link href={`/admin/courses/${c.id}`} className="btn-small btn-edit">تعديل</Link>
                      <button className="btn-small btn-delete" onClick={() => confirmDelete(c.id)}>حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Toast
        message={toastMessage}
        type={confirmVisible ? "confirm" : toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        onConfirm={confirmVisible ? handleDelete : undefined}
        onCancel={confirmVisible ? () => { setConfirmVisible(false); setToastVisible(false); setTargetDeleteId(null); } : undefined}
        duration={4000}
      />

      {/* النافذة المنبثقة لعرض تفاصيل المقرر */}
      {selectedCourse && (
        <CourseDetailsPopup
          course={{
            ...selectedCourse,
            id: String(selectedCourse.id),
            status: selectedCourse.status === 'archived' ? 'draft' : selectedCourse.status,
            chapters: (selectedCourse.chapters ?? []).map(ch => ({
              ...ch,
              id: String(ch.id),
              order: ch.order ?? 0,
            })),
          }}
          isOpen={popupVisible}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}