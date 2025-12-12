'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/components/Toast';
import { createCourse } from '@/utils/courseService';
import { getAdminCategories, type Diploma } from '@/utils/categoryService';
import { getInstructors, type Instructor } from '@/utils/instructorService';
import styles from './NewCourse.module.css';
import '@/styles/toast.css';

// --- Component Wrapper for Suspense ---
function NewCoursePageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const diplomaId = searchParams.get('diploma_id');

  const [loading, setLoading] = useState(false);
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form state - Initialize category_id with diplomaId if available
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

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Fetch diplomas and instructors on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [diplomasData, instructorsData] = await Promise.all([
          getAdminCategories(),
          getInstructors()
        ]);
        setDiplomas(diplomasData);
        // Sort instructors by Arabic name
        setInstructors([...instructorsData].sort((a, b) => a.name.localeCompare(b.name, 'ar')));
      } catch (error: any) {
        console.error('Error fetching data:', error);
        if (error?.message?.includes('401') || error?.message?.includes('403')) {
          showToast('يرجى تسجيل الدخول أولاً', 'error');
        } else {
          showToast('فشل في جلب البيانات الأولية', 'error');
        }
      }
    };
    fetchData();
  }, []);

  // Effect to update category_id if diplomaId changes
  useEffect(() => {
    if (diplomaId) {
      setFormData(prev => ({ ...prev, category_id: diplomaId }));
    }
  }, [diplomaId]);

  const selectedDiploma = diplomaId ? diplomas.find(d => d.id === Number(diplomaId)) : undefined;

  // Instructor dropdown state and helpers (top-level, not inside JSX)
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

  const formatInstructorLabel = (instructor: Instructor) => {
    const full = `${instructor.name} — ${instructor.title || ''}`.trim();
    return full.length > 40 ? full.slice(0, 37) + '…' : full;
  };

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
      if (name === 'is_free' && (e.target as HTMLInputElement).checked) {
        // Hide price via conditional render; ensure preview unchanged
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
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

  const triggerFileEdit = () => {
    fileInputRef.current?.click();
  };

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

      // Debug: Log cover_image details before appending
      console.log('📸 Cover image check:', {
        hasCoverImage: !!formData.cover_image,
        coverImageName: formData.cover_image?.name,
        coverImageType: formData.cover_image?.type,
        coverImageSize: formData.cover_image?.size,
      });

      if (formData.cover_image) {
        formDataToSend.append('cover_image', formData.cover_image);
        console.log('✅ Cover image appended to FormData');
      } else {
        console.warn('⚠️ No cover image to append');
      }

      // Debug: Log all FormData entries
      console.log('📦 FormData contents before sending:');
      Array.from(formDataToSend.entries()).forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });

      await createCourse(formDataToSend);
      showToast('تم إنشاء المقرر بنجاح!', 'success');

      setTimeout(() => {
        if (diplomaId) {
          router.push(`/admin/diplomas/${diplomaId}`);
        } else {
          router.push('/admin/courses');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Error during course creation:', error);
      showToast(error?.message || 'حدث خطأ أثناء إنشاء المقرر', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (diplomaId) {
      router.push(`/admin/diplomas/${diplomaId}`);
    } else {
      router.push('/admin/diplomas');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>إضافة مقرر جديد</h1>
          <p className={styles.subtitle}>
            {selectedDiploma ? `إضافة مقرر جديد للدبلومة ${selectedDiploma.name}` : 'إنشاء مقرر تعليمي جديد'}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button type="button" onClick={handleBack} className={styles.backButton}>الرجوع للدبلومات</button>
        </div>
      </div>

      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Title */}
          <div className={styles.formGroup}>
            <label htmlFor="title">عنوان المقرر *</label>
            <input type="text" id="title" name="title" value={formData.title} onChange={handleInputChange} required placeholder="أدخل عنوان المقرر" className={styles.input} />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label htmlFor="description">وصف المقرر *</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="أدخل وصفاً مفصلاً للمقرر" className={styles.textarea} rows={4} required />
          </div>

          <div className={styles.formRow}>
            {/* Instructor */}
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

            {/* Category (Diploma) */}
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
            {/* Duration */}
            <div className={styles.formGroup}>
              <label htmlFor="duration">المدة (بالساعات) *</label>
              <input type="number" id="duration" name="duration" value={formData.duration} onChange={handleInputChange} placeholder="مثال: 20" className={styles.input} min="1" required />
            </div>

            {/* Price (hidden when free) */}
            {!formData.is_free && (
              <div className={styles.formGroup}>
                <label htmlFor="price">السعر *</label>
                <input type="number" id="price" name="price" value={formData.price} onChange={handleInputChange} className={styles.input} min="0" required />
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            {/* Status */}
            <div className={styles.formGroup}>
              <label htmlFor="status">الحالة</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className={styles.select}>
                <option value="draft">مسودة</option>
                <option value="published">منشور</option>
              </select>
            </div>
            {/* Is Free */}
            <div className={styles.formGroup}>
              <label className={styles.checkbox} style={{ marginTop: '30px' }}>
                <input type="checkbox" id="is_free" name="is_free" checked={formData.is_free} onChange={handleInputChange} /> مقرر مجاني
              </label>
            </div>
          </div>

          {/* Rank (optional) */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="rank">الترتيب (اختياري)</label>
              <input type="number" id="rank" name="rank" value={formData.rank} onChange={handleInputChange} placeholder="مثال: 1" className={styles.input} min="1" />
            </div>
          </div>

          {/* Cover Image */}
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

          {/* Actions */}
          <div className={styles.actions}>
            <button type="button" onClick={handleBack} className={styles.btnSecondary} disabled={loading}>إلغاء</button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء المقرر'}
            </button>
          </div>
        </form>
      </div>

      {/* Toast */}
      <Toast message={toastMessage} type={toastType} isVisible={toastVisible} onClose={() => setToastVisible(false)} />
    </div>
  );
}

export default function NewCoursePageWrapper() {
  return (
    <Suspense fallback={<div>جاري تحميل الصفحة...</div>}>
      <NewCoursePageComponent />
    </Suspense>
  );
}