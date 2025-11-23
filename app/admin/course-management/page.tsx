"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Toast from "@/components/Toast";
import CourseDetailsPopup from "@/components/CourseDetailsPopup";
import { getCourses, deleteCourse, getAdminCourse, type Course } from "@/utils/courseService";
import styles from "./AdminCourses.module.css";

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
    <div className={styles["admin-courses-container"]}>
      <div className={styles["admin-courses-header"]}>
        <h1 className={styles["admin-courses-title"]}>
          {categoryId ? `إدارة مقررات الدبلوم #${categoryId}` : 'إدارة المقررات'}
        </h1>
        <p className={styles["admin-courses-subtitle"]}>
          {categoryId ? 'إدارة وتنظيم مقررات هذا الدبلوم' : 'إدارة وتنظيم جميع المقررات التعليمية'}
        </p>
      </div>

      <div className={styles["admin-courses-actions"]}>
        <Link 
          href={categoryId ? `/admin/courses/new?categoryId=${categoryId}` : "/admin/courses/new"} 
          className={styles["btn-primary"]}
        >
          + إنشاء مقرر جديد
        </Link>
        {categoryId && (
          <Link href="/admin/courses" className={styles["btn-secondary"]}>
            العودة إلى إدارة الدبلومات
          </Link>
        )}
      </div>

      {loading && (
        <div className={styles["loading"]}>
          <div className={styles["spinner"]}></div>
        </div>
      )}
      
      {error && (
        <div className={`${styles["message"]} ${styles["message-error"]}`}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className={styles["courses-table-container"]} dir="rtl">
          <table className={styles["courses-table"]}>
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
                    <div className={styles["empty-state"]}>
                      <div className={styles["empty-state-icon"]}>📚</div>
                      <div className={styles["empty-state-title"]}>لا توجد مقررات</div>
                      <div className={styles["empty-state-description"]}>لم يتم إنشاء أي مقررات بعد. ابدأ بإنشاء مقرر جديد.</div>
                    </div>
                  </td>
                </tr>
              )}
              {courses.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <div className={styles["course-title"]}>{c.title}</div>
                    {c.description && (
                      <div className={styles["course-description"]}>
                        {c.description.length > 100 
                          ? c.description.substring(0, 100) + '...' 
                          : c.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`${styles["course-status"]} ${
                      c.status === 'published' ? styles["status-active"] :
                      c.status === 'draft' ? styles["status-draft"] : 
                      styles["status-archived"]
                    }`}>
                      {c.status === 'published' ? 'نشط' : 
                       c.status === 'draft' ? 'مسودة' : 
                       'مؤرشف'}
                    </span>
                  </td>
                  
                  <td>{c.chapters_count ?? c.chapters?.length ?? 0}</td>
                  <td>
                    <div className={styles["table-actions"]}>
                      <button 
                        className={`${styles["btn-small"]} ${styles["btn-details"]}`}
                        onClick={() => handleViewCourseDetails(c.id)}
                        disabled={loadingCourseDetails}
                      >
                        {loadingCourseDetails ? 'جاري التحميل...' : 'عرض التفاصيل'}
                      </button>
                      <Link href={`/admin/courses/${c.id}/chapters`} className={`${styles["btn-small"]} ${styles["btn-view"]}`}>اضافة محتوي</Link>
                      <Link href={`/admin/courses/${c.id}`} className={`${styles["btn-small"]} ${styles["btn-edit"]}`}>تعديل</Link>
                      <button className={`${styles["btn-small"]} ${styles["btn-delete"]}`} onClick={() => confirmDelete(c.id)}>حذف</button>
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
            instructor: selectedCourse.instructor?.name || selectedCourse.instructor?.title || undefined,
            duration: selectedCourse.duration ? String(selectedCourse.duration) : undefined,
            chapters: (selectedCourse.chapters ?? []).map((ch, chIndex) => ({
              id: String(ch.id),
              title: ch.title,
              order: chIndex + 1, // Use index as order since order property might not exist
              description: undefined, // Optional property
              lessons: (ch.lessons ?? []).map((lesson, index) => ({
                id: String(lesson.id),
                title: lesson.title,
                order: index + 1,
                status: 'published' as 'published' | 'draft',
              })),
            })),
          }}
          isOpen={popupVisible}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}