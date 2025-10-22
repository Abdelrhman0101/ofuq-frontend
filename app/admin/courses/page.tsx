'use client';

import { useState, useEffect } from 'react';
import Toast from '@/components/Toast';
import '@/styles/admin-courses.css';

interface Category {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor_id: number;
  cover_image?: string;
  video_url?: string | null;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  duration?: number;
  courses_count?: number;
  rating?: number | string;
  students_count?: number;
}

interface Course {
  id: number;
  category_id: number;
  title: string;
  description?: string;
  price?: number;
  instructor_id?: number;
  cover_image?: string;
  video_url?: string | null;
  is_free?: boolean;
  status?: "draft" | "published" | "archived";
  duration?: number;
  order?: number;
  created_at?: string;
  updated_at?: string;
}

export default function AdminCoursesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCourseForm, setShowCourseForm] = useState<{ categoryId: number } | null>(null);
  const [categoryDetails, setCategoryDetails] = useState<Category | null>(null);
  const [categoryCourses, setCategoryCourses] = useState<Course[]>([]);

  // Toast states
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info' | 'confirm'>('info');

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    instructor_id: '',
    is_free: false,
    status: 'draft' as Category['status']
  });

  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    price: '',
    instructor_id: '',
    is_free: false,
    status: 'draft' as Course['status'],
    duration: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('فشل في جلب البيانات');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      showToast('فشل في جلب البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryCourses = async (categoryId: number) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}/courses`);
      if (!response.ok) throw new Error('فشل في جلب المقررات');
      const data = await response.json();
      setCategoryCourses(data.data || []);
    } catch (err) {
      showToast('فشل في جلب المقررات', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('instructor_id', formData.instructor_id);
      formDataToSend.append('is_free', formData.is_free ? '1' : '0');
      formDataToSend.append('status', formData.status);

      let response;
      if (editingCategory) {
        formDataToSend.append('_method', 'PUT');
        response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'POST',
          body: formDataToSend,
        });
      } else {
        response = await fetch('/api/admin/categories', {
          method: 'POST',
          body: formDataToSend,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في العملية');
      }

      const result = await response.json();
      showToast(result.message || (editingCategory ? 'تم التعديل بنجاح' : 'تم إنشاء الدبلوم بنجاح'), 'success');
      
      // Reset form and refresh data
      setFormData({
        title: '',
        description: '',
        price: '',
        instructor_id: '',
        is_free: false,
        status: 'draft'
      });
      setShowAddForm(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ غير متوقع', 'error');
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showCourseForm) return;

    try {
      const courseData = {
        title: courseFormData.title,
        description: courseFormData.description,
        price: Number(courseFormData.price) || 0,
        instructor_id: Number(courseFormData.instructor_id) || undefined,
        is_free: courseFormData.is_free,
        status: courseFormData.status,
        duration: Number(courseFormData.duration) || 0
      };

      const response = await fetch(`/api/admin/categories/${showCourseForm.categoryId}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إنشاء المقرر');
      }

      const result = await response.json();
      showToast(result.message || 'تم إنشاء المقرر بنجاح', 'success');
      
      // Reset form and refresh data
      setCourseFormData({
        title: '',
        description: '',
        price: '',
        instructor_id: '',
        is_free: false,
        status: 'draft',
        duration: ''
      });
      setShowCourseForm(null);
      fetchCategories(); // Refresh to update courses count
      if (categoryDetails) {
        fetchCategoryCourses(categoryDetails.id);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ غير متوقع', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدبلوم؟')) return;

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في الحذف');
      }

      const result = await response.json();
      showToast(result.message || 'تم حذف الدبلوم بنجاح', 'success');
      fetchCategories();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'فشل في حذف الدبلوم', 'error');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description,
      price: category.price.toString(),
      instructor_id: category.instructor_id.toString(),
      is_free: category.is_free,
      status: category.status
    });
    setShowAddForm(true);
  };

  const handleViewDetails = async (category: Category) => {
    setCategoryDetails(category);
    await fetchCategoryCourses(category.id);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} ر.س`;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'archived': return 'مؤرشف';
      default: return 'نشط';
    }
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return <div className="error">خطأ: {error}</div>;

  return (
    <div className="admin-courses-container">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">إدارة الدبلومات</h1>
        <p className="admin-courses-subtitle">إدارة وتنظيم الدبلومات والمقررات التعليمية</p>
      </div>

      <div className="admin-courses-actions">
        <button 
          className="btn-primary"
          onClick={() => {
            setShowAddForm(true);
            setEditingCategory(null);
            setFormData({
              title: '',
              description: '',
              price: '',
              instructor_id: '',
              is_free: false,
              status: 'draft'
            });
          }}
        >
          + إضافة دبلوم جديد
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'تعديل الدبلوم' : 'إضافة دبلوم جديد'}</h2>
              <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="course-form">
              <div className="form-section">
                <h3 className="form-section-title">معلومات الدبلوم الأساسية</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="title" className="form-label">العنوان</label>
                    <input
                      type="text"
                      id="title"
                      className="form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="price" className="form-label">السعر</label>
                    <input
                      type="number"
                      id="price"
                      className="form-input"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      min="0"
                    />
                  </div>
                  <div className="form-group form-grid-full">
                    <label htmlFor="description" className="form-label">الوصف</label>
                    <textarea
                      id="description"
                      className="form-textarea"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="instructor_id" className="form-label">معرف المدرب</label>
                    <input
                      type="number"
                      id="instructor_id"
                      className="form-input"
                      value={formData.instructor_id}
                      onChange={(e) => setFormData({...formData, instructor_id: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status" className="form-label">الحالة</label>
                    <select
                      id="status"
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as Category['status']})}
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={formData.is_free}
                        onChange={(e) => setFormData({...formData, is_free: e.target.checked})}
                      />
                      مجاني
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'تحديث' : 'إضافة'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Form */}
      {showCourseForm && (
        <div className="modal-overlay" onClick={() => setShowCourseForm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>إضافة مقرر جديد</h2>
              <button className="close-btn" onClick={() => setShowCourseForm(null)}>×</button>
            </div>
            <form onSubmit={handleCourseSubmit} className="course-form">
              <div className="form-section">
                <h3 className="form-section-title">معلومات المقرر</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="course-title" className="form-label">عنوان المقرر</label>
                    <input
                      type="text"
                      id="course-title"
                      className="form-input"
                      value={courseFormData.title}
                      onChange={(e) => setCourseFormData({...courseFormData, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="course-price" className="form-label">سعر المقرر</label>
                    <input
                      type="number"
                      id="course-price"
                      className="form-input"
                      value={courseFormData.price}
                      onChange={(e) => setCourseFormData({...courseFormData, price: e.target.value})}
                      min="0"
                    />
                  </div>
                  <div className="form-group form-grid-full">
                    <label htmlFor="course-description" className="form-label">وصف المقرر</label>
                    <textarea
                      id="course-description"
                      className="form-textarea"
                      value={courseFormData.description}
                      onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="course-instructor" className="form-label">معرف المدرب</label>
                    <input
                      type="number"
                      id="course-instructor"
                      className="form-input"
                      value={courseFormData.instructor_id}
                      onChange={(e) => setCourseFormData({...courseFormData, instructor_id: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="course-duration" className="form-label">المدة (بالساعات)</label>
                    <input
                      type="number"
                      id="course-duration"
                      className="form-input"
                      value={courseFormData.duration}
                      onChange={(e) => setCourseFormData({...courseFormData, duration: e.target.value})}
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="course-status" className="form-label">حالة المقرر</label>
                    <select
                      id="course-status"
                      className="form-select"
                      value={courseFormData.status}
                      onChange={(e) => setCourseFormData({...courseFormData, status: e.target.value as Course['status']})}
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={courseFormData.is_free}
                        onChange={(e) => setCourseFormData({...courseFormData, is_free: e.target.checked})}
                      />
                      مقرر مجاني
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  إضافة المقرر
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowCourseForm(null)}>
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Details Modal */}
      {categoryDetails && (
        <div className="modal-overlay" onClick={() => setCategoryDetails(null)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>تفاصيل الدبلوم: {categoryDetails.title}</h2>
              <button className="close-btn" onClick={() => setCategoryDetails(null)}>×</button>
            </div>
            <div className="category-details">
              <div className="details-info">
                <p><strong>الوصف:</strong> {categoryDetails.description}</p>
                <p><strong>السعر:</strong> {formatPrice(categoryDetails.price)}</p>
                <p><strong>الحالة:</strong> {getStatusText(categoryDetails.status)}</p>
                <p><strong>عدد المقررات:</strong> {categoryDetails.courses_count || 0}</p>
                <p><strong>عدد الطلاب:</strong> {categoryDetails.students_count || 0}</p>
                <p><strong>التقييم:</strong> {categoryDetails.rating || 'غير متوفر'}</p>
              </div>
              
              <div className="courses-section">
                <div className="section-header">
                  <h3>المقررات ({categoryCourses.length})</h3>
                  <button 
                    className="btn-primary btn-sm"
                    onClick={() => window.location.href = `/admin/course-management?categoryId=${categoryDetails.id}`}
                  >
                    + إضافة مقرر
                  </button>
                </div>
                
                {categoryCourses.length > 0 ? (
                  <div className="courses-list">
                    {categoryCourses.map((course) => (
                      <div key={course.id} className="course-item">
                        <div className="course-info">
                          <h4>{course.title}</h4>
                          <p>{course.description}</p>
                          <div className="course-meta">
                            <span>السعر: {course.price ? formatPrice(course.price) : 'مجاني'}</span>
                            <span>المدة: {course.duration || 0} ساعة</span>
                            <span>الحالة: {getStatusText(course.status || 'draft')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>لا توجد مقررات في هذا الدبلوم بعد</p>
                    <button 
                      className="btn-primary"
                      onClick={() => window.location.href = `/admin/course-management?categoryId=${categoryDetails.id}`}
                    >
                      إضافة أول مقرر
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className="courses-table-container">
        {categories.length > 0 ? (
          <table className="courses-table">
            <thead>
              <tr>
                <th>المعرف</th>
                <th>العنوان</th>
                <th>السعر</th>
                <th>عدد المقررات</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    <div className="course-title">{category.title}</div>
                  </td>
                  <td>
                    <div className="course-price">{formatPrice(category.price)}</div>
                  </td>
                  <td>{category.courses_count || 0}</td>
                  <td>
                    <span className={`course-status status-${category.status}`}>
                      {getStatusText(category.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn-small btn-view"
                        onClick={() => handleViewDetails(category)}
                        title="عرض التفاصيل"
                      >
                        عرض
                      </button>
                      <button
                        className="btn-small btn-details"
                        onClick={() => window.location.href = `/admin/course-management?categoryId=${category.id}`}
                        title="إضافة مقرر"
                      >
                        + مقرر
                      </button>
                      <button
                        className="btn-small btn-edit"
                        onClick={() => handleEdit(category)}
                        title="تعديل"
                      >
                        تعديل
                      </button>
                      <button
                        className="btn-small btn-delete"
                        onClick={() => handleDelete(category.id)}
                        title="حذف"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <h3>لا توجد دبلومات</h3>
            <p>لم يتم إنشاء أي دبلومات بعد. ابدأ بإضافة دبلوم جديد.</p>
            <button 
              className="btn-primary"
              onClick={() => {
                setShowAddForm(true);
                setEditingCategory(null);
              }}
            >
              إضافة أول دبلوم
            </button>
          </div>
        )}
      </div>

      {/* Toast Component */}
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