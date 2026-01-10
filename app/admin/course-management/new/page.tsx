"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/Toast';
import { createCourse } from '@/utils/courseService';
import { getAdminCategories, type Diploma } from '@/utils/categoryService';
import { getInstructors, type Instructor } from '@/utils/instructorService';
import styles from './NewCourse.module.css';
import '@/styles/toast.css';
import { useMemo } from 'react';

function NewManageCourseComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const diplomaId = searchParams.get('diploma_id');

  const [loading, setLoading] = useState(false);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor_id: '',
    category_id: diplomaId || '',
    status: 'published' as 'draft' | 'published',
    duration: '',
    price: '0',
    is_free: false,
    cover_image: null as File | null,
    rank: ''
  });
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [sections, setSections] = useState<Array<{ label: string; slug: string }>>([]);
  const [selectedSectionSlug, setSelectedSectionSlug] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diplomasData, instructorsData] = await Promise.all([
          getAdminCategories(),
          getInstructors()
        ]);
        setDiplomas(diplomasData);
        setInstructors([...instructorsData].sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      } catch (error: any) {
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          showToast('يرجى تسجيل الدخول أولاً', 'error');
        } else {
          showToast('فشل في جلب البيانات الأولية', 'error');
        }
      }
    };
    fetchData();
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('ofuq_sections') : null;
      const parsed = raw ? JSON.parse(raw) : null;
      const defaults = [
        { label: 'التربوية', slug: 'educational' },
        { label: 'الدعوية', slug: 'dawah' },
        { label: 'الإعلامية', slug: 'media' },
        { label: 'الإدارية', slug: 'management' },
        { label: 'الشرعية', slug: 'sharia' },
        { label: 'تطوير الذات', slug: 'self-development' },
        { label: 'التقنية', slug: 'tech' },
        { label: 'السلوكية', slug: 'behavioral' },
        { label: 'المهنية', slug: 'professional' },
        { label: 'خدمة المجتمع', slug: 'community-service' },
      ];
      const list = Array.isArray(parsed) ? parsed : defaults;
      setSections(list);
    } catch {}
  }, []);

  useEffect(() => {
    if (diplomaId) {
      setFormData(prev => ({ ...prev, category_id: diplomaId }));
    }
  }, [diplomaId]);

  const selectedDiploma = diplomaId ? diplomas.find(d => d.id === Number(diplomaId)) : undefined;

  const [isInstructorMenuOpen, setInstructorMenuOpen] = useState(false);
  const [instructorSearch, setInstructorSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setInstructorMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedInstructor = instructors.find(i => String(i.id) === formData.instructor_id);
  const filteredInstructors = instructors.filter(i => {
    const q = instructorSearch.trim();
    if (!q) return true;
    const s = `${i.name || ''} ${i.title || ''}`;
    return s.includes(q);
  });

  function handleSelectInstructor(i: Instructor) {
    setFormData(prev => ({ ...prev, instructor_id: String(i.id) }));
    setInstructorMenuOpen(false);
  }

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checked,
        ...(name === 'is_free' && checked && { price: '0' })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, cover_image: file }));
    if (file) {
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    } else {
      setCoverPreview(null);
    }
  };

  const triggerFileEdit = () => fileInputRef.current?.click();

  const clearCoverImage = () => {
    setFormData(prev => ({ ...prev, cover_image: null }));
    setCoverPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title || !formData.description || !formData.instructor_id || !formData.category_id || !formData.duration || (!formData.is_free && !formData.price)) {
      showToast('يرجى التأكد من ملء جميع الحقول الإجبارية بقيم صالحة.', 'error');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('instructor_id', formData.instructor_id);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('is_published', formData.status === 'published' ? '1' : '0');
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('is_free', formData.is_free ? '1' : '0');
      if (formData.rank && formData.rank.trim() !== '') {
        formDataToSend.append('rank', formData.rank.trim());
      }
      if (formData.cover_image) {
        formDataToSend.append('cover_image', formData.cover_image);
      }

      await createCourse(formDataToSend);
      showToast('تم إنشاء المقرر بنجاح!', 'success');

      setTimeout(() => {
        if (diplomaId) {
          router.push(`/admin/diplomas/${diplomaId}`);
        } else {
          router.push('/admin/course-management');
        }
      }, 1200);
    } catch (error: any) {
      showToast(error?.message || 'حدث خطأ أثناء إنشاء المقرر', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/course-management');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>إضافة كورس جديد</h1>
          <p className={styles.subtitle}>
            {selectedDiploma ? `إضافة كورس جديد للدبلومة ${selectedDiploma.name}` : 'إنشاء كورس تعليمي جديد'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleBack} className={styles.backButton}>الرجوع لإدارة الكورسات</button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">عنوان الكورس *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="أدخل عنوان الكورس" className={styles.input} />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">وصف الكورس *</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="أدخل وصفاً مفصلاً للكورس" className={styles.textarea} rows={4} required />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>المحاضر *</label>
              <div className={styles.dropdown} ref={dropdownRef}>
                <button type="button" className={styles.dropdownToggle} onClick={() => setInstructorMenuOpen(v => !v)}>
                  <div className={styles.dropdownSelectedText}>
                    {selectedInstructor ? (
                      <>
                        <div className={styles.dropdownItemName}>{selectedInstructor.name}</div>
                        {selectedInstructor.title && (
                          <div className={styles.dropdownItemTitle}>{selectedInstructor.title}</div>
                        )}
                      </>
                    ) : (
                      'اختر المحاضر'
                    )}
                  </div>
                  <span className={styles.dropdownCaret} aria-hidden="true" />
                </button>
                {isInstructorMenuOpen && (
                  <div className={styles.dropdownMenu}>
                    <div className={styles.dropdownSearch}>
                      <input
                        type="text"
                        placeholder="ابحث بالاسم أو الوصف"
                        value={instructorSearch}
                        onChange={(e) => setInstructorSearch(e.target.value)}
                      />
                    </div>
                    {filteredInstructors.map(i => (
                      <div key={i.id} className={styles.dropdownItem} onClick={() => handleSelectInstructor(i)}>
                        <div className={styles.dropdownItemName}>{i.name}</div>
                        {i.title && <div className={styles.dropdownItemTitle}>{i.title}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category_id">الدبلومة *</label>
              <select id="category_id" name="category_id" value={formData.category_id} onChange={handleInputChange} required className={styles.select} disabled={!!diplomaId}>
                <option value="">اختر الدبلومة</option>
                {diplomas.map((diploma) => (
                  <option key={diploma.id} value={diploma.id}>
                    {diploma.name}
                  </option>
                ))}
              </select>
              {diplomaId && <input type="hidden" name="category_id" value={diplomaId} />}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="section_slug">القسم</label>
              <select
                id="section_slug"
                name="section_slug"
                value={selectedSectionSlug}
                onChange={(e) => setSelectedSectionSlug(e.target.value)}
                className={styles.select}
              >
                <option value="">اختر القسم (اختياري)</option>
                {sections.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="duration">المدة (بالساعات) *</label>
              <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="مثال: 20" className={styles.input} min="1" required />
            </div>
            {!formData.is_free && (
              <div className={styles.formGroup}>
                <label htmlFor="price">السعر *</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className={styles.input} min="0" required />
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="status">الحالة</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className={styles.select}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.checkbox} style={{ marginTop: '30px' }}>
                <input type="checkbox" id="is_free" name="is_free" checked={formData.is_free} onChange={handleInputChange} /> كورس مجاني
              </label>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="rank">الترتيب (اختياري)</label>
              <input type="number" id="rank" name="rank" value={formData.rank} onChange={handleInputChange} placeholder="مثال: 1" className={styles.input} min="1" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cover_image">صورة الغلاف</label>
            <input ref={fileInputRef} type="file" id="cover_image" name="cover_image" accept="image/*" onChange={handleFileChange} className={styles.file} />
            {formData.cover_image && (
              <p className={styles.fileSelected}>تم اختيار الملف: {formData.cover_image.name}</p>
            )}
            {coverPreview && (
              <div>
                <img src={coverPreview} alt="معاينة الغلاف" className={styles.coverPreview} />
                <div className={styles.coverActions}>
                  <button type="button" className={styles.btnSecondary} onClick={triggerFileEdit}>تعديل الصورة</button>
                  <button type="button" className={styles.btnSecondary} onClick={clearCoverImage}>حذف الصورة</button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" onClick={handleBack} className={styles.btnSecondary} disabled={loading}>إلغاء</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الكورس'}
            </button>
          </div>
        </form>
      </div>

      <Toast message={toastMessage} type={toastType} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}

export default function NewManageCourseWrapper() {
  return (
    <Suspense fallback={<div>جاري تحميل الصفحة...</div>}>
      <NewManageCourseComponent />
    </Suspense>
  );
}
