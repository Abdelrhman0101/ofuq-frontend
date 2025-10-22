"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";
import { createChapter, getCourseChapters, type Chapter } from "@/utils/chapterService";
import "@/styles/toast.css";
import "@/styles/admin-courses.css";

export default function CourseChaptersPage({ params }: { params: { id: string } }) {
  const courseId = Number(params.id);

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [order, setOrder] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const list = await getCourseChapters(courseId);
      setChapters(list);
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "فشل في جلب الوحدات");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: any = {
        title,
        description: description || undefined,
        order: order,
      };
      await createChapter(courseId, payload);
      setToastType("success");
      setToastMessage("تم إنشاء الوحدة بنجاح");
      setToastVisible(true);
      setTitle("");
      setDescription("");
      setOrder(undefined);
      await fetchChapters();
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "حدث خطأ أثناء إنشاء الوحدة");
      setToastVisible(true);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-courses-container" dir="rtl">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">فصول المقرر</h1>
        <p className="admin-courses-subtitle">إدارة فصول المقرر رقم {courseId}</p>
      </div>

      <div className="admin-courses-actions">
        <Link href="/admin/courses" className="btn-primary">↩ رجوع إلى المقررات</Link>
      </div>

      <form onSubmit={handleCreate} className="course-form">
        <div className="form-section">
          <h3 className="form-section-title">إضافة فصل جديد</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">عنوان الوحدة *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="أدخل عنوان الوحدة"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ترتيب الوحدة</label>
              <input
                type="number"
                className="form-input"
                value={order ?? ""}
                onChange={(e) => setOrder(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="مثلاً 1"
              />
            </div>
          </div>
          <div className="form-group form-grid-full">
            <label className="form-label">وصف الوحدة</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف مختصر للفصل"
            />
          </div>
          <div className="admin-courses-actions">
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? "جارٍ الإنشاء..." : "اضافة فصل"}
            </button>
          </div>
        </div>
      </form>

      {loading ? (
        <div className="loading"><div className="spinner"></div></div>
      ) : (
        <div className="courses-table-container" dir="rtl">
          <table className="courses-table">
            <thead>
              <tr>
                <th>المعرف</th>
                <th>العنوان</th>
                <th>الترتيب</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {chapters.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📘</div>
                      <div className="empty-state-title">لا توجد فصول</div>
                      <div className="empty-state-description">أضف فصلًا جديدًا من النموذج أعلاه.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                chapters.map((ch) => (
                  <tr key={ch.id}>
                    <td>{ch.id}</td>
                    <td>
                      <div className="course-title">{ch.title}</div>
                      {ch.description && (
                        <div className="course-description">
                          {ch.description.length > 100 ? ch.description.substring(0, 100) + "..." : ch.description}
                        </div>
                      )}
                    </td>
                    <td>{ch.order ?? '-'}</td>
                    <td>
                      <div className="table-actions">
                        <Link href={`/admin/courses/${courseId}/chapters/${ch.id}/lessons`} className="btn-small btn-view">اضافة محتوي</Link>
                      </div>
                    </td>
                  </tr>
                ))
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
        duration={4000}
      />
    </div>
  );
}