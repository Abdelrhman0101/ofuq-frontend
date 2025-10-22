"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Toast from "@/components/Toast";
import { createLesson, getChapterLessons, type Lesson } from "@/utils/lessonService";
import "@/styles/toast.css";
import "@/styles/admin-courses.css";

export default function ChapterLessonsPage({ params }: { params: { id: string; chapterId: string } }) {
  const courseId = Number(params.id);
  const chapterId = Number(params.chapterId);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [order, setOrder] = useState<number | undefined>(undefined);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const list = await getChapterLessons(chapterId);
      setLessons(list);
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "فشل في جلب الدروس");
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload: any = {
        title,
        description: description || undefined,
        content: content || undefined,
        order: order,
        is_visible: isVisible,
      };
      await createLesson(chapterId, payload);
      setToastType("success");
      setToastMessage("تم إنشاء الدرس بنجاح");
      setToastVisible(true);
      setTitle("");
      setDescription("");
      setContent("");
      setOrder(undefined);
      setIsVisible(true);
      await fetchLessons();
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "حدث خطأ أثناء إنشاء الدرس");
      setToastVisible(true);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="admin-courses-container" dir="rtl">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">دروس الوحدة</h1>
        <p className="admin-courses-subtitle">إدارة دروس الوحدة رقم {chapterId} في المقرر رقم {courseId}</p>
      </div>

      <div className="admin-courses-actions">
        <Link href={`/admin/courses/${courseId}/chapters`} className="btn-primary">↩ رجوع إلى الوحدات</Link>
        <Link href="/admin/courses" className="btn-outline-primary" style={{ marginInlineStart: 8 }}>↩ رجوع إلى المقررات</Link>
      </div>

      <form onSubmit={handleCreate} className="course-form">
        <div className="form-section">
          <h3 className="form-section-title">إضافة درس جديد</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">عنوان الدرس *</label>
              <input
                type="text"
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="أدخل عنوان الدرس"
              />
            </div>
            <div className="form-group">
              <label className="form-label">ترتيب الدرس</label>
              <input
                type="number"
                className="form-input"
                value={order ?? ""}
                onChange={(e) => setOrder(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="مثلاً 1"
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                <input type="checkbox" checked={isVisible} onChange={(e) => setIsVisible(e.target.checked)} style={{ marginLeft: 8 }} />
                مرئي للطلاب
              </label>
            </div>
          </div>
          <div className="form-group form-grid-full">
            <label className="form-label">وصف الدرس</label>
            <textarea
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="وصف مختصر للدرس"
            />
          </div>
          <div className="form-group form-grid-full">
            <label className="form-label">المحتوى</label>
            <textarea
              className="form-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              placeholder="نص أو تعليمات أو رابط فيديو..."
            />
          </div>
          <div className="admin-courses-actions">
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? "جارٍ الإنشاء..." : "اضافة درس"}
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
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {lessons.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📗</div>
                      <div className="empty-state-title">لا توجد دروس</div>
                      <div className="empty-state-description">أضف درسًا جديدًا من النموذج أعلاه.</div>
                    </div>
                  </td>
                </tr>
              ) : (
                lessons.map((ls) => (
                  <tr key={ls.id}>
                    <td>{ls.id}</td>
                    <td>
                      <div className="course-title">{ls.title}</div>
                      {ls.description && (
                        <div className="course-description">
                          {ls.description.length > 100 ? ls.description.substring(0, 100) + "..." : ls.description}
                        </div>
                      )}
                    </td>
                    <td>{ls.order ?? '-'}</td>
                    <td>
                      <span className={`course-status ${ls.is_visible ? 'status-active' : 'status-archived'}`}>
                        {ls.is_visible ? 'مرئي' : 'مخفي'}
                      </span>
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