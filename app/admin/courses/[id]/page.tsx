"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "@/components/Toast";
import styles from "../new/NewCourse.module.css";
import "@/styles/toast.css";
import { getAdminCourse, updateCourse, type Course } from "@/utils/courseService";
import { getAdminCategories, type Diploma } from "@/utils/categoryService";
import { getInstructors, type Instructor } from "@/utils/instructorService";
import { getBackendAssetUrl } from "@/utils/url";

export default function EditCoursePage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const courseId = Number(id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  // add custom dropdown state
  const [isInstructorMenuOpen, setInstructorMenuOpen] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorId, setInstructorId] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [duration, setDuration] = useState<string>("");
  const [price, setPrice] = useState<string>("0");
  const [isFree, setIsFree] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [rank, setRank] = useState<string>('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("info");

  function showToast(msg: string, type: "success" | "error" | "warning" | "info" = "info") {
    setToastMessage(msg);
    setToastType(type);
    setToastVisible(true);
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [c, cats, ins] = await Promise.all([
          getAdminCourse(courseId),
          getAdminCategories(),
          getInstructors(),
        ]);
        if (!c) throw new Error("لم يتم العثور على بيانات المقرر");
        setCourse(c);
        setDiplomas(cats);
        // sort instructors by Arabic name
        const sortedIns = [...ins].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        setInstructors(sortedIns);
        // Prefill
        setTitle(String(c.title ?? ""));
        setDescription(String(c.description ?? ""));
        setInstructorId(String(c.instructor_id ?? c.instructor?.id ?? ""));
        setCategoryId(String(c.category_id ?? c.category?.id ?? ""));
        const isPub = (c.is_published === true) || (String(c.status || "published").toLowerCase() === "published");
        setStatus(isPub ? "published" : "draft");
        setDuration(String(c.duration ?? ""));
        setIsFree(Boolean(c.is_free));
        setPrice(String(c.price ?? 0));
        setRank(c.rank != null ? String(c.rank) : '');
        const existingCover = getBackendAssetUrl(c.cover_image ?? (c as any).cover_image_url);
        setCoverPreview(existingCover || null);
      } catch (err: any) {
        console.error(err);
        showToast(err?.message || "حدث خطأ في تحميل بيانات المقرر", "error");
      } finally {
        setLoading(false);
      }
    }
    if (!Number.isNaN(courseId) && courseId > 0) load();
    else {
      showToast("معرف مقرر غير صالح", "error");
      setLoading(false);
    }
  }, [courseId]);

  function onCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setCoverFile(file);
    setCoverPreview(file ? URL.createObjectURL(file) : coverPreview);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInstructorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelectInstructor(instr: Instructor) {
    setInstructorId(String(instr.id));
    setInstructorMenuOpen(false);
  }

  function formatInstructorLabel(instr?: Instructor) {
    if (!instr) return 'اختر المحاضر';
    return `${instr.name}`;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !description || !instructorId || !categoryId || !duration || (!isFree && !price)) {
      showToast("يرجى ملء جميع الحقول الإجبارية بقيم صحيحة", "error");
      return;
    }
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("instructor_id", instructorId);
      fd.append("category_id", categoryId);
      fd.append("is_published", status === "published" ? "1" : "0");
      fd.append("duration", duration);
      fd.append("price", price || "0");
      fd.append("is_free", isFree ? "1" : "0");
      if (rank && rank.trim() !== '') {
        fd.append('rank', rank.trim());
      }
      if (coverFile) fd.append("cover_image", coverFile);
      await updateCourse(courseId, fd);
      showToast("تم تعديل المقرر بنجاح", "success");
      setTimeout(() => {
        const cid = Number(categoryId);
        if (cid) router.push(`/admin/diplomas/${cid}`);
        else router.push("/admin/course-management");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      showToast(err?.message || "حدث خطأ أثناء حفظ التعديلات", "error");
    } finally {
      setSaving(false);
    }
  }

  function onCancel() {
    const cid = Number(categoryId || course?.category_id || course?.category?.id || 0);
    if (cid) router.push(`/admin/diplomas/${cid}`);
    else router.push("/admin/diplomas");
  }

  if (loading) return <div className={styles.loading}>جاري التحميل...</div>;
  if (!course) return <div className={styles.error}>لا توجد بيانات لهذا المقرر</div>;

  // derive instructor lists for UI
  const sortedInstructors = [...instructors];
  const selectedInstructor = sortedInstructors.find((i) => String(i.id) === instructorId);
  const filteredInstructors = sortedInstructors.filter((i) => {
    const q = instructorSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      (i.name || "").toLowerCase().includes(q) ||
      (i.title || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>تعديل المقرر</h1>
          <p className={styles.subtitle}>"{course.title}" — معرف: {course.id}</p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={onCancel} className={styles.backButton}>رجوع</button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">عنوان المقرر *</label>
            <input id="title" value={title} onChange={e=>setTitle(e.target.value)} className={styles.input} required />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">وصف المقرر *</label>
            <textarea id="description" value={description} onChange={e=>setDescription(e.target.value)} className={styles.textarea} rows={3} required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup} ref={dropdownRef}>
              <label>المحاضر *</label>
              <div className={styles.selectWrapper}>
                <button type="button" className={styles.selectButton} onClick={() => setInstructorMenuOpen(v => !v)}>
                  {formatInstructorLabel(selectedInstructor)}
                </button>
                {isInstructorMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <input
                      type="text"
                      className={styles.dropdownSearchInput}
                      placeholder="ابحث باسم المحاضر أو اللقب"
                      value={instructorSearch}
                      onChange={(e) => setInstructorSearch(e.target.value)}
                    />
                    <div className={styles.dropdownList}>
                      {filteredInstructors.map((instr) => (
                        <div
                          key={instr.id}
                          className={styles.dropdownItem}
                          onClick={() => handleSelectInstructor(instr)}
                        >
                          <div className={styles.dropdownItemTitle}>{instr.name}</div>
                          {instr.title && (
                            <div className={styles.dropdownItemSubtitle}>{instr.title}</div>
                          )}
                        </div>
                      ))}
                      {filteredInstructors.length === 0 && (
                        <div className={styles.dropdownEmpty}>لا توجد نتائج مطابقة</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* Hidden select ensures required validation and accessibility */}
              <select value={instructorId} onChange={e=>setInstructorId(e.target.value)} className={styles.hiddenSelect} required aria-hidden="true">
                <option value="">اختر المحاضر</option>
                {sortedInstructors.map(i=> (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category_id">الدبلومة *</label>
              <select id="category_id" value={categoryId} onChange={e=>setCategoryId(e.target.value)} className={styles.select} required>
                <option value="">اختر الدبلومة</option>
                {diplomas.map(d=> (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="duration">المدة (بالساعات) *</label>
              <input id="duration" type="number" min={1} value={duration} onChange={e=>setDuration(e.target.value)} className={styles.input} required />
            </div>
            {!isFree && (
              <div className={styles.formGroup}>
                <label htmlFor="price">السعر *</label>
                <input id="price" type="number" min={0} value={price} onChange={e=>setPrice(e.target.value)} className={styles.input} required />
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="rank">الترتيب (اختياري)</label>
              <input id="rank" type="number" min={1} value={rank} onChange={e=>setRank(e.target.value)} className={styles.input} placeholder="مثال: 1" />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="status">الحالة</label>
              <select id="status" value={status} onChange={e=>setStatus(e.target.value as any)} className={styles.select}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkbox} style={{ marginTop: "30px" }}>
                <input type="checkbox" checked={isFree} onChange={e=>{ setIsFree(e.target.checked); if (e.target.checked) setPrice("0"); }} /> مقرر مجاني
              </label>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cover_image">صورة الغلاف</label>
            <input id="cover_image" type="file" accept="image/*" onChange={onCoverChange} className={styles.file} />
            {coverPreview && (
              <div>
                <img src={coverPreview} alt="معاينة الغلاف" className={styles.coverPreview} />
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onCancel} className={styles.btnSecondary} disabled={saving}>إلغاء</button>
            <button type="submit" className={styles.btnPrimary} disabled={saving}>{saving ? "جاري الحفظ..." : "حفظ التغييرات"}</button>
          </div>
        </form>
      </div>

      <Toast message={toastMessage} type={toastType} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}