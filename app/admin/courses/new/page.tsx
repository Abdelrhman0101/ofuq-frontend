"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import { createCourse } from "@/utils/courseService";
import "@/styles/toast.css";
import "@/styles/admin-courses.css";

export default function NewCoursePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [instructorId, setInstructorId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [isFree, setIsFree] = useState<boolean>(false);
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>("draft");
  const [coverImage, setCoverImage] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setCoverImage(files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = {
        title,
        description,
        price,
        instructor_id: instructorId,
        category_id: categoryId,
        isFree,
        status,
      };
      if (coverImage) {
        payload.coverImage = coverImage;
      }

      const course = await createCourse(payload);
      setToastType("success");
      setToastMessage("تم إنشاء المقرر بنجاح");
      setToastVisible(true);

      // الانتقال لتفاصيل المقرر
      setTimeout(() => {
        router.push('/admin/courses');
      }, 600);
    } catch (err: any) {
      const code = err?.code || "";
      const status = err?.response?.status;
      let msg = err?.message || "فشل إنشاء المقرر";

      if (code === "ERR_NETWORK" || String(msg).includes("Network Error")) {
        const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
        msg = `تعذر الاتصال بالخادم. تأكد من تشغيل الباك اند على ${base} أو ضبط NEXT_PUBLIC_API_URL في .env.local.`;
      } else if (status === 401) {
        msg = "غير مصرح. يرجى تسجيل الدخول كمسؤول ثم المحاولة مرة أخرى.";
      } else if (status === 422) {
        const errors = err?.response?.data?.errors;
        if (errors) {
          const first = Object.values(errors)[0] as any;
          msg = Array.isArray(first) ? first[0] : (first || msg);
        }
      }

      setToastType("error");
      setToastMessage(msg);
      setToastVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-courses-container">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">إنشاء كورس جديد</h1>
        <p className="admin-courses-subtitle">إضافة كورس تعليمي جديد إلى المنصة</p>
      </div>

      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-section">
          <h3 className="form-section-title">المعلومات الأساسية</h3>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">العنوان *</label>
              <input 
                type="text" 
                className="form-input"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                placeholder="أدخل عنوان المقرر"
              />
            </div>
            <div className="form-group">
              <label className="form-label">السعر (بالريال)</label>
              <input 
                type="number" 
                className="form-input"
                step="0.01" 
                value={price} 
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0.00"
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
              placeholder="وصف مفصل عن محتوى المقرر وأهدافه"
            />
          </div>
        </div>

        <div className="form-section">
          <h3 className="form-section-title">إعدادات المقرر</h3>
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
        </div>

        <div className="form-section">
          <h3 className="form-section-title">صورة الغلاف</h3>
          <div className="form-group">
            <div className="file-upload-area">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                style={{ display: 'none' }}
                id="cover-image-input"
              />
              <label htmlFor="cover-image-input" style={{ cursor: 'pointer', display: 'block' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📷</div>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    {coverImage ? coverImage.name : 'اختر صورة الغلاف'}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    اسحب الصورة هنا أو انقر للاختيار
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="admin-courses-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "جارٍ الإنشاء..." : "إنشاء المقرر"}
          </button>
        </div>
      </form>

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