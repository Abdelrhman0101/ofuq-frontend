"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import styles from "./AdminDiplomaCourses.module.css";
import "@/styles/toast.css";
import { getAdminCategory, type Diploma } from "@/utils/categoryService";
import { getCourses, getAllCourses, type Course } from "@/utils/courseService";
import { getBackendAssetUrl } from "@/utils/url";

function isCoursePublished(course: Course): boolean {
  // Normalize publish logic: prefer explicit flag, otherwise infer from status
  if (typeof course.is_published === "boolean") return course.is_published;
  if (typeof course.status === "string") {
    const s = course.status.toLowerCase();
    return s === "published" || s === "1" || s === "true";
  }
  // Admin view typically includes drafts; default to true only if ambiguous
  return false;
}

function getStatusText(published: boolean): string {
  return published ? "منشور" : "مسودة";
}

export default function AdminDiplomaPage() {
  const { id } = useParams() as { id: string };
  const diplomaId = Number(id);
  const router = useRouter();

  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info" | "confirm">("info");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const dip = await getAdminCategory(diplomaId);
        setDiploma(dip);

        // Fetch admin courses and filter by this diploma/category (support multiple shapes)
        const adminCourses = await getCourses();
        const filteredAdmin = adminCourses.filter((c) => {
          const catId = Number(c.category_id ?? c.category?.id ?? (c as any).categoryId ?? 0);
          return catId === diplomaId;
        });

        if (filteredAdmin.length > 0) {
          setCourses(filteredAdmin);
        } else {
          // Fallback to public courses mapping to ensure data visibility
          const publicCourses = await getAllCourses({ per_page: 1000 });
          const filteredPublic = publicCourses.filter((c) => Number(c.category_id ?? c.category?.id ?? 0) === diplomaId);
          setCourses(filteredPublic);
        }
      } catch (err: any) {
        setError(err?.message || "حدث خطأ في تحميل بيانات الدبلومة");
        setToastMessage(err?.message || "حدث خطأ");
        setToastType("error");
        setToastVisible(true);
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(diplomaId) && diplomaId > 0) {
      fetchData();
    } else {
      setError("معرف دبلومة غير صالح");
      setLoading(false);
    }
  }, [diplomaId]);

  const handleAddCourse = () => {
    router.push(`/admin/courses/new?diploma_id=${diplomaId}`);
  };

  const goBack = () => router.push("/admin/diplomas");

  const formatPrice = (price: number, isFree?: boolean) => {
    if (isFree || price === 0) return "مجاني";
    return `${price.toLocaleString()} ر.س`;
  };

  if (loading) {
    return <div className={styles.loading}>جاري التحميل...</div>;
  }
  if (error) {
    return <div className={styles.error}>حدث خطأ: {error}</div>;
  }
  if (!diploma) {
    return <div className={styles.error}>لا توجد بيانات لهذه الدبلومة</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <div>
            <h1 className={styles.title}>دبلومة: {diploma?.name}</h1>
            <p className={styles.subtitle}>
              الحالة: {getStatusText(Boolean(diploma.is_published))} • عدد المقررات: {courses.length}
            </p>
          </div>
          <button className={styles.backButton} onClick={goBack}>عودة</button>
        </div>
      </div>

      <div className={styles.diplomaCard}>
        <div className={styles.diplomaInfo}>
          <div><strong>الوصف:</strong> {diploma?.description || "—"}</div>
          <div><strong>المعرف:</strong> {diploma?.id}</div>
          <div><strong>السعر:</strong> {formatPrice(Number(diploma?.price ?? 0), Boolean(diploma?.is_free))}</div>
        </div>
        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={handleAddCourse}>إضافة مقرر جديد</button>
        </div>
      </div>

      <div className={styles.list}>
        <h2 className={styles.sectionTitle}>قائمة المقررات</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.coverCell}>الغلاف</th>
                <th>العنوان</th>
                <th>المدرب</th>
                <th>الحالة</th>
                <th>السعر</th>
                <th>عدد الفصول</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => {
                const published = isCoursePublished(course);
                const coverUrl = getBackendAssetUrl(course.cover_image ?? (course as any).cover_image_url);
                const lessonsCount = Number(course.chapters_count ?? 0);
                return (
                  <tr key={String(course.id)}>
                    <td className={styles.coverCell}>
                      {coverUrl ? (
                        <img className={styles.coverThumb} src={coverUrl} alt={course.title} />
                      ) : (
                        <div className={styles.coverThumb} style={{ display: "grid", placeItems: "center", color: "#6b7280" }}>—</div>
                      )}
                    </td>
                    <td>{course.title}</td>
                    <td>{course.instructor?.name || "—"}</td>
                    <td>{getStatusText(published)}</td>
                    <td>{formatPrice(Number(course.price ?? 0), Boolean(course.is_free))}</td>
                    <td>{lessonsCount}</td>
                    <td className={styles.actionsCell}>
                      <button className={styles.btnAction} onClick={() => router.push(`/course-details/${course.id}`)}>عرض</button>
                      <button className={styles.btnAction} onClick={() => router.push(`/admin/diplomas/${diplomaId}/courses/${course.id}/chapters`)}>إدارة الفصول</button>
                      <button className={styles.btnAction} onClick={() => router.push(`/admin/courses/${course.id}`)}>تعديل</button>
                    </td>
                  </tr>
                );
              })}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "#6b7280" }}>لا توجد مقررات مرتبطة بهذه الدبلومة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </div>
  );
}