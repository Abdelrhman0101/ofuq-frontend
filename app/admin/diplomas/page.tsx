'use client';

import { useState, useEffect } from 'react';
import Toast from '@/components/Toast';
import styles from './AdminDiplomas.module.css';

// Services & types
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Diploma,
} from '@/utils/categoryService'; // تأكد من المسار

import {
  getCourses,
  type Course,
} from '@/utils/courseService'; // تأكد من المسار
import { getBackendAssetUrl } from '@/utils/url';
import '@/styles/toast.css';

// ----- Form Types -----
interface DiplomaFormData {
  name: string;
  description: string;
  price: string;
  is_free: boolean;
  is_published: boolean;
  slug: string;
  cover_image: File | null;
}

export default function AdminDiplomasPage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [allCourses, setAllCourses] = useState<Course[]>([]); // لتخزين كل الكورسات لغرض العد فقط
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDiplomaForm, setShowDiplomaForm] = useState(false);
  const [editingDiploma, setEditingDiploma] = useState<Diploma | null>(null);
  // --- تم إزالة حالة تفاصيل الدبلومة والمقررات لأنها ستعرض في صفحة منفصلة ---
  // const [diplomaDetails, setDiplomaDetails] = useState<Diploma | null>(null);
  // const [diplomaCourses, setDiplomaCourses] = useState<Course[]>([]);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Diploma form state
  const [diplomaFormData, setDiplomaFormData] = useState<DiplomaFormData>({
    name: '',
    description: '',
    price: '0',
    is_free: false,
    is_published: true,
    slug: '',
    cover_image: null,
  });
  // حالات وادوات واجهة المستخدم الذكية
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [lastPaidPrice, setLastPaidPrice] = useState<string>('0');
  const [slugEdited, setSlugEdited] = useState(false);
  const slugify = (s: string) => s
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0600-\u06FF]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // جلب الدبلومات والكورسات (الكورسات فقط لعدها في الجدول)
        const [diplomasData, coursesData] = await Promise.all([
          getAdminCategories(),
          getCourses(), // لجلب عدد المقررات لكل دبلومة
        ]);
        setDiplomas(diplomasData);
        setAllCourses(coursesData);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // --- تم التعديل: إرسال FormData ---
  const handleDiplomaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: diplomaFormData.name,
        description: diplomaFormData.description,
        price: Number(diplomaFormData.price || '0'),
        is_free: Boolean(diplomaFormData.is_free),
        is_published: Boolean(diplomaFormData.is_published),
        slug: diplomaFormData.slug,
        cover_image: diplomaFormData.cover_image || undefined,
      };

      if (editingDiploma) {
        await updateCategory(editingDiploma.id, payload);
      } else {
        await createCategory(payload);
      }

      showToast(editingDiploma ? 'تم التعديل بنجاح' : 'تم إنشاء الدبلوم بنجاح', 'success');

      // Reset form and state
      setDiplomaFormData({
        name: '', description: '', price: '0', is_free: false,
        is_published: true, slug: '', cover_image: null,
      });
      setShowDiplomaForm(false);
      setEditingDiploma(null);
      setDiplomas(await getAdminCategories()); // Refresh list
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ غير متوقع', 'error');
    }
  };


  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدبلوم؟ سيتم فك ارتباط المقررات به.')) return;
    try {
      await deleteCategory(id);
      showToast('تم حذف الدبلوم بنجاح', 'success');
      setDiplomas((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل في حذف الدبلوم', 'error');
    }
  };

  const handleEdit = (diploma: Diploma) => {
    setEditingDiploma(diploma);
    setDiplomaFormData({
      name: diploma.name,
      description: diploma.description ?? '',
      price: String(diploma.price ?? 0),
      is_free: Boolean(diploma.is_free),
      is_published: Boolean(diploma.is_published),
      slug: diploma.slug ?? '',
      cover_image: null,
    });
    setCoverPreview(diploma.cover_image_url ? getBackendAssetUrl(diploma.cover_image_url) : null);
  setLastPaidPrice(String(diploma.price ?? 0));
    setShowDiplomaForm(true);
  };

  // --- تم التعديل: التوجيه لصفحة التفاصيل ---
  const handleViewDetails = (diplomaId: number) => {
    // توجيه المستخدم إلى صفحة تفاصيل الدبلومة المخصصة
    window.location.href = `/admin/diplomas/${diplomaId}`;
  };

  const handleAddCourse = (diplomaId: number) => {
    // توجيه المستخدم إلى صفحة إنشاء مقرر جديد مع تمرير معرف الدبلوم
    window.location.href = `/admin/courses/new?diploma_id=${diplomaId}`; // <-- المسار الصحيح
  };

  const formatPrice = (price: number) => `${price.toLocaleString()} ر.س`;
  const getStatusText = (isPublished: boolean) => (isPublished ? 'منشور' : 'مسودة');

  if (loading) return <div className={styles.loading}>جاري التحميل...</div>;
  if (error) return (
    <div className={styles.error}>خطأ: {error} (يرجى تسجيل الخروج والمحاولة مرة أخرى)</div>
  );

  return (
    <div className={styles.container}>
      {/* --- Header & Add Diploma Button --- */}
      <div className={styles.header}>
        <h1 className={styles.title}>إدارة الدبلومات</h1>
        <p className={styles.subtitle}>إدارة وتنظيم الدبلومات التعليمية</p>
      </div>
      <div className={styles.actions}>        <button          className={styles.btnPrimary}          onClick={() => {
            setShowDiplomaForm(true);
            setEditingDiploma(null);
            setCoverPreview(null);
            setSlugEdited(false);
            setLastPaidPrice('0');
            setDiplomaFormData({ // Reset form
              name: '', description: '', price: '0', is_free: false,
              is_published: true, slug: '', cover_image: null,
            });
          }}
        >
          + إضافة دبلوم جديد
        </button>
      </div>

      {/* --- Add/Edit Diploma Modal --- */}
      {showDiplomaForm && (
        <div className={styles.modalOverlay} onClick={() => setShowDiplomaForm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingDiploma ? 'تعديل الدبلوم' : 'إضافة دبلوم جديد'}</h2>
              <button className={styles.closeBtn} onClick={() => setShowDiplomaForm(false)}>×</button>
            </div>
            {/* الفورم هنا صحيحة وتستخدم diplomaFormData */}
            <form onSubmit={handleDiplomaSubmit} className={styles.form}>
               <div className={styles.formSection}>
                 <h3 className={styles.formSectionTitle}>معلومات الدبلوم الأساسية</h3>
                 <div className={styles.formGrid}>
                   {/* name */}
                   <div className={styles.formGroup}>
                     <label htmlFor="name" className={styles.formLabel}>اسم الدبلوم</label>
                     <input type="text" id="name" className={styles.formInput} value={diplomaFormData.name} onChange={(e) => {
                       const newName = e.target.value;
                       setDiplomaFormData({
                         ...diplomaFormData,
                         name: newName,
                         slug: slugEdited ? diplomaFormData.slug : slugify(newName)
                       });
                     }} required />
                   </div>
                   {/* slug */}
                   <div className={styles.formGroup}>
                     <label htmlFor="slug" className={styles.formLabel}>الرابط (Slug)</label>
                     <input type="text" id="slug" className={styles.formInput} value={diplomaFormData.slug} onChange={(e) => { setSlugEdited(true); setDiplomaFormData({ ...diplomaFormData, slug: e.target.value }); }} required />
                   </div>
                   {/* description */}
                   <div className={`${styles.formGroup} ${styles.formGridFull}`}>
                     <label htmlFor="description" className={styles.formLabel}>الوصف</label>
                     <textarea id="description" className={styles.formTextarea} value={diplomaFormData.description} onChange={(e) => setDiplomaFormData({ ...diplomaFormData, description: e.target.value })} rows={3} />
                   </div>
                   {/* price */}
                   {!diplomaFormData.is_free && (
                     <div className={styles.formGroup}>
                       <label htmlFor="price" className={styles.formLabel}>السعر</label>
                       <input type="number" id="price" className={styles.formInput} value={diplomaFormData.price} onChange={(e) => setDiplomaFormData({ ...diplomaFormData, price: e.target.value })} min={0} />
                     </div>
                   )}
                   {/* cover_image */}
                   <div className={styles.formGroup}>
                     <label htmlFor="cover_image" className={styles.formLabel}>صورة الغلاف</label>
                     <input type="file" id="cover_image" className={styles.formInput} accept="image/*" onChange={(e) => { const file = e.currentTarget.files?.[0] ?? null; setDiplomaFormData({ ...diplomaFormData, cover_image: file }); setCoverPreview(file ? URL.createObjectURL(file) : null); }} />
                   </div>
                   {coverPreview && (
                     <div className={`${styles.previewWrap} ${styles.formGridFull}`}>
                       <img src={coverPreview} alt="معاينة صورة الغلاف" className={styles.previewImg} />
                       <button type="button" className={styles.btnSecondary} onClick={() => { setCoverPreview(null); setDiplomaFormData({ ...diplomaFormData, cover_image: null }); }}>إزالة المعاينة</button>
                     </div>
                   )}
                   {/* is_free */}
                   <div className={styles.formGroup}>
                     <label className={styles.formCheckbox}>
                       <input type="checkbox" checked={diplomaFormData.is_free} onChange={(e) => {
                         const checked = e.target.checked;
                         if (checked) {
                           setLastPaidPrice(diplomaFormData.price || '0');
                           setDiplomaFormData({ ...diplomaFormData, is_free: true, price: '0' });
                         } else {
                           setDiplomaFormData({ ...diplomaFormData, is_free: false, price: lastPaidPrice || '0' });
                         }
                       }} /> مجاني
                     </label>
                   </div>
                   <div className={`${styles.formHint} ${styles.formGridFull}`}>عند اختيار مجاني، يتم إخفاء السعر وتصفيـره لتجنب إرسال قيمة خاطئة.</div>
                   {/* is_published */}
                   <div className={styles.formGroup}>
                     <label className={styles.formCheckbox}>
                       <input type="checkbox" checked={diplomaFormData.is_published} onChange={(e) => setDiplomaFormData({ ...diplomaFormData, is_published: e.target.checked, })} /> منشور
                     </label>
                   </div>
                 </div>
               </div>
               <div className={styles.formActions}>
                 <button type="submit" className={styles.btnPrimary}>{editingDiploma ? 'تحديث' : 'إضافة'}</button>
                 <button type="button" className={styles.btnSecondary} onClick={() => setShowDiplomaForm(false)}>إلغاء</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Diplomas List Table --- */}
      <div className={styles.list}> {/* يمكن تغيير اسم الكلاس لاحقًا */}
        <h2 className={styles.sectionTitle}>قائمة الدبلومات</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}> {/* يمكن تغيير اسم الكلاس لاحقًا */}
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الصورة</th>
                <th>الوصف</th>
                <th>التسعير</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {diplomas.map((diploma) => (
                <tr key={diploma.id}>
                  <td>
                    <div className={styles.nameCell}>
                      <div>{diploma.name}</div>
                      <div className={styles.slugText}>{diploma.slug}</div>
                    </div>
                  </td>
                  <td>
                    <img className={styles.thumb} src={getBackendAssetUrl(diploma.cover_image_url || '/logo.png')} alt={`غلاف ${diploma.name}`} />
                  </td>
                  <td>
                    <div className={styles.descCell}>{diploma.description || '-'}</div>
                  </td>
                  <td>
                    {diploma.is_free ? (
                      <span className={styles.priceFree}>مجاني</span>
                    ) : (
                      formatPrice(diploma.price || 0)
                    )}
                  </td>
                  <td>
                    <span className={`${styles.badge} ${diploma.is_published ? styles.badgePublished : styles.badgeDraft}`}>
                      {getStatusText(Boolean(diploma.is_published))}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button className={styles.btnAction} onClick={() => handleViewDetails(diploma.id)}>عرض</button>
                    <button className={styles.btnAction} onClick={() => handleEdit(diploma)}>تعديل</button>
                    <button className={`${styles.btnAction} ${styles.btnDanger}`} onClick={() => handleDelete(diploma.id)}>حذف</button>
                    <button className={`${styles.btnAction} ${styles.btnSuccess}`} onClick={() => handleAddCourse(diploma.id)}>+ مقرر</button>
                  </td>
                </tr>
              ))}
              {diplomas.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>لا توجد دبلومات متاحة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- تم إزالة قسم تفاصيل الدبلومة من هنا --- */}

      {/* --- Toast --- */}
      <Toast
         message={toastMessage}
         type={toastType}
         isVisible={toastVisible}
         onClose={() => setToastVisible(false)}
       />
    </div>
  );
}