"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import styles from "./AdminCourses.module.css";
import "@/styles/toast.css";
import { getCourses, deleteCourse, type Course } from "@/utils/courseService";
import { getBackendAssetUrl } from "@/utils/url";
import SectionsManager from "@/components/SectionsManager";

export default function AdminCoursesPage() {
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info" | "confirm">("info");
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingDeleteCourseId, setPendingDeleteCourseId] = useState<number | null>(null);
  const [isDeletingCourseId, setIsDeletingCourseId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await getCourses();
      setCourses(list);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب الكورسات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  function isCoursePublished(course: Course): boolean {
    if (typeof (course as any).is_published === "boolean") return (course as any).is_published;
    if (typeof (course as any).status === "string") {
      const s = (course as any).status.toLowerCase();
      return s === "published" || s === "1" || s === "true";
    }
    return false;
  }

  function getStatusText(published: boolean): string {
    return published ? "منشور" : "مسودة";
  }

  const formatPrice = (price: number, isFree?: boolean) => {
    if (isFree || price === 0) return "مجاني";
    return `${price.toLocaleString()} ر.س`;
  };

  const confirmDeleteCourse = (courseId: number) => {
    setPendingDeleteCourseId(courseId);
    setToastMessage("هل أنت متأكد من حذف هذا الكورس؟");
    setToastType("confirm");
    setToastVisible(true);
  };

  const performDeleteCourse = async () => {
    if (!pendingDeleteCourseId) return;
    const courseId = pendingDeleteCourseId;
    try {
      setIsDeletingCourseId(courseId);
      await deleteCourse(courseId);
      setCourses((prev) => prev.filter((c) => Number(c.id) !== Number(courseId)));
      setToastType("success");
      setToastMessage("تم حذف الكورس بنجاح");
      setToastVisible(true);
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "فشل في حذف الكورس");
      setToastVisible(true);
    } finally {
      setIsDeletingCourseId(null);
      setPendingDeleteCourseId(null);
    }
  };

  return (
    <div className={styles["admin-courses-container"]}>
      <div className={styles["admin-courses-header"]}>
        <h1 className={styles["admin-courses-title"]}>إدارة الكورسات</h1>
        <p className={styles["admin-courses-subtitle"]}>إدارة وتنظيم جميع الكورسات التعليمية</p>
      </div>

      <div className={styles["admin-courses-actions"]}>
        <button 
          className={styles["btn-primary"]}
          onClick={() => router.push("/admin/course-management/new")}
        >
          + إضافة كورس جديد
        </button>
        <button 
          className={styles["btn-secondary"]}
          onClick={() => setSectionsOpen(true)}
          style={{ marginInlineStart: '0.5rem' }}
        >
          ادارة الاقسام
        </button>
      </div>

      {/* Search Bar */}
      <div className={styles["searchContainer"]}>
        <input
          type="text"
          placeholder="بحث عن كورس..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles["searchInput"]}
        />
        {searchQuery && (
          <button
            className={styles["clearSearch"]}
            onClick={() => setSearchQuery('')}
            aria-label="مسح البحث"
          >
            ×
          </button>
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
                <th className={styles["coverCell"]}>الغلاف</th>
                <th>العنوان</th>
                <th>المدرب</th>
                <th>الحالة</th>
                <th>السعر</th>
                <th>عدد الفصول</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {courses
                .filter((course) => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    course.title?.toLowerCase().includes(query) ||
                    (course as any).instructor?.name?.toLowerCase?.().includes(query) ||
                    course.description?.toLowerCase?.().includes(query)
                  );
                })
                .map((course) => {
                  const published = isCoursePublished(course);
                  const coverUrl = getBackendAssetUrl((course as any).cover_image ?? (course as any).cover_image_url);
                  const lessonsCount = Number((course as any).chapters_count ?? 0);
                  return (
                    <tr key={String(course.id)}>
                      <td className={styles["coverCell"]}>
                        {coverUrl ? (
                          <img className={styles["coverThumb"]} src={coverUrl} alt={course.title} />
                        ) : (
                          <div className={styles["coverThumb"]} style={{ display: "grid", placeItems: "center", color: "#6b7280" }}>—</div>
                        )}
                      </td>
                      <td>{course.title}</td>
                      <td>{(course as any).instructor?.name || "—"}</td>
                      <td>{getStatusText(published)}</td>
                      <td>{formatPrice(Number((course as any).price ?? 0), Boolean((course as any).is_free))}</td>
                      <td>{lessonsCount}</td>
                      <td className={styles["actionsCell"]}>
                        <button className={styles["btnAction"]} onClick={() => router.push(`/course-details/${course.id}`)}>عرض</button>
                        <button className={styles["btnAction"]} onClick={() => router.push(`/admin/courses/${course.id}/chapters`)}>إدارة الفصول</button>
                        <button className={styles["btnAction"]} onClick={() => router.push(`/admin/courses/${course.id}`)}>تعديل</button>
                        <button
                          className={`${styles["btnAction"]} ${styles["btnDelete"]}`}
                          onClick={() => confirmDeleteCourse(Number(course.id))}
                          disabled={isDeletingCourseId === Number(course.id)}
                        >
                          {isDeletingCourseId === Number(course.id) ? "جاري الحذف..." : "حذف"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className={styles["empty-state"]}>
                      <div className={styles["empty-state-icon"]}>📚</div>
                      <div className={styles["empty-state-title"]}>لا توجد كورسات</div>
                      <div className={styles["empty-state-description"]}>لم يتم إنشاء أي كورسات بعد. ابدأ بإنشاء كورس جديد.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        onConfirm={toastType === "confirm" ? performDeleteCourse : undefined}
        onCancel={toastType === "confirm" ? () => { setToastVisible(false); setPendingDeleteCourseId(null); } : undefined}
        duration={4000}
      />
      <SectionsManager isOpen={sectionsOpen} onClose={() => setSectionsOpen(false)} />
    </div>
  );
}
