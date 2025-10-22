"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Toast from "@/components/Toast";
import {
  getAdminCourse,
  updateCourse,
  type Course
} from "@/utils/courseService";
import { createChapter, type CreateChapterData } from "@/utils/chapterService";
import "@/styles/toast.css";
import "@/styles/admin-courses.css";

export default function AdminCourseDetailsPage() {
  const params = useParams();
  const courseId = useMemo(() => {
    const pid = params?.id;
    if (Array.isArray(pid)) return Number(pid[0]);
    return Number(pid as string);
  }, [params]);

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [instructorId, setInstructorId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>("draft");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  // New chapter state
  const [chTitle, setChTitle] = useState("");
  const [chDescription, setChDescription] = useState("");
  const [chOrder, setChOrder] = useState<number>(1);

  const [saving, setSaving] = useState(false);
  const [creatingChapter, setCreatingChapter] = useState(false);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCoverImage(files[0]);
    }
  };

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminCourse(courseId);
      if (!data) throw new Error("لم يتم العثور على المقرر");
      setCourse(data);
      // Prime form fields
      setTitle(data.title || "");
      setDescription(data.description || "");
      setPrice(Number(data.price ?? 0));
      setInstructorId(Number(data.instructor_id ?? 0));
      setCategoryId(Number(data.category_id ?? 0));
      setIsFree(Boolean(data.is_free));
      setStatus((data.status ?? "draft") as any);
    } catch (err: any) {
      setError(err?.message || "فشل في جلب تفاصيل المقرر");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(courseId)) return;
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", String(price));
      formData.append("instructor_id", String(instructorId));
      formData.append("category_id", String(categoryId));
      formData.append("is_free", isFree ? "1" : "0");
      formData.append("status", status);
      if (coverImage) {
        formData.append("cover_image", coverImage);
      }

      const updated = await updateCourse(courseId, formData);
      setCourse(updated);
      setToastType("success");
      setToastMessage("تم حفظ تعديلات المقرر");
      setToastVisible(true);
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "فشل حفظ التعديلات");
      setToastVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingChapter(true);
    try {
      const payload: CreateChapterData = {
        title: chTitle,
        description: chDescription || undefined,
        order: chOrder,
      };
      await createChapter(courseId, payload);
      setToastType("success");
      setToastMessage("تم إنشاء الوحدة بنجاح");
      setToastVisible(true);
      setChTitle("");
      setChDescription("");
      setChOrder((course?.chapters?.length ?? 0) + 1);
      await loadCourse();
    } catch (err: any) {
      setToastType("error");
      setToastMessage(err?.message || "فشل إنشاء الوحدة");
      setToastVisible(true);
    } finally {
      setCreatingChapter(false);
    }
  };

  return (
    <div className="admin-courses-container">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">تفاصيل المقرر</h1>
        <p className="admin-courses-subtitle">تعديل بيانات المقرر وإدارة الوحدات</p>
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

      {!loading && !error && course && (
        <>
          <div className="course-form">
            <div className="form-section">
              <h3 className="form-section-title">تعديل بيانات المقرر</h3>
              <form onSubmit={handleSave}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">العنوان *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)} 
                      required 
                      placeholder="عنوان المقرر"
                    />
                  </div>
                 
                </div>
                
                <div className="form-group form-grid-full">
                  <label className="form-label">الوصف</label>
                  <textarea 
                    className="form-textarea"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    rows={4}
                    placeholder="وصف المقرر"
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">رقم المحاضر</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={instructorId} 
                      onChange={(e) => setInstructorId(Number(e.target.value))}
                      placeholder="معرف المحاضر"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">رقم القسم</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={categoryId} 
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      placeholder="معرف القسم"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الحالة</label>
                    <select 
                      className="form-select"
                      value={status} 
                      onChange={(e) => setStatus(e.target.value as any)}
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">أرشيف</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      <input 
                        type="checkbox" 
                        checked={isFree} 
                        onChange={(e) => setIsFree(e.target.checked)}
                        style={{ marginLeft: '8px' }}
                      />
                      كورس مجاني
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">تغيير صورة الغلاف</label>
                  <div className="file-upload-area">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="cover-image-input-edit"
                    />
                    <label htmlFor="cover-image-input-edit" style={{ cursor: 'pointer', display: 'block' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📷</div>
                        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                          {coverImage ? coverImage.name : 'اختر صورة جديدة للغلاف'}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          اسحب الصورة هنا أو انقر للاختيار
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="admin-courses-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="chapters-section">
            <div className="form-section">
              <h3 className="form-section-title">الوحدات الموجودة</h3>
              <div className="courses-table-container">
                <table className="courses-table">
                  <thead>
                    <tr>
                      <th>عدد الدروس</th>
                      <th>الترتيب</th>
                      <th>العنوان</th>
                      <th>المعرف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(course.chapters ?? []).length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          <div className="empty-state">
                            <div className="empty-state-icon">📖</div>
                            <div className="empty-state-title">لا توجد فصول</div>
                            <div className="empty-state-description">لم يتم إنشاء أي فصول لهذا المقرر بعد.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {(course.chapters ?? []).map((ch) => (
                      <tr key={ch.id}>
                        <td>{ch.lessons_count ?? ch.lessons?.length ?? 0}</td>
                        <td>{ch.order ?? "-"}</td>
                        <td>
                          <div className="chapter-title">{ch.title}</div>
                          {(ch as any).description && (
                            <div className="chapter-description">
                              {(ch as any).description.length > 80 
                                ? (ch as any).description.substring(0, 80) + '...' 
                                : (ch as any).description}
                            </div>
                          )}
                        </td>
                        <td>{ch.id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">إضافة فصل جديد</h3>
              <form onSubmit={handleCreateChapter}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">عنوان الوحدة *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      value={chTitle} 
                      onChange={(e) => setChTitle(e.target.value)} 
                      required 
                      placeholder="عنوان الوحدة الجديد"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">الترتيب</label>
                    <input 
                      type="number" 
                      className="form-input"
                      value={chOrder} 
                      onChange={(e) => setChOrder(Number(e.target.value))} 
                      min={1}
                      placeholder="ترتيب الوحدة"
                    />
                  </div>
                </div>
                <div className="form-group form-grid-full">
                  <label className="form-label">الوصف</label>
                  <textarea 
                    className="form-textarea"
                    value={chDescription} 
                    onChange={(e) => setChDescription(e.target.value)} 
                    rows={3}
                    placeholder="وصف مختصر للفصل"
                  />
                </div>
                <div className="admin-courses-actions">
                  <button type="submit" className="btn-success" disabled={creatingChapter}>
                    {creatingChapter ? "جارٍ الإضافة..." : "إضافة فصل"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
        duration={4500}
      />
    </div>
  );
}