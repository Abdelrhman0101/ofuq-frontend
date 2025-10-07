'use client';

import React, { useState } from 'react';
import '../styles/instructors-management.css';

interface Instructor {
  id: number;
  name: string;
  description: string;
  bio: string;
  profileImage: string;
}

const InstructorsManagement: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    bio: '',
    profileImage: ''
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<number | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profileImage: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.bio) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (editingId !== null) {
      // تحديث محاضر موجود
      setInstructors(prev => prev.map(instructor => 
        instructor.id === editingId 
          ? { ...instructor, ...formData }
          : instructor
      ));
      setEditingId(null);
    } else {
      // إضافة محاضر جديد
      const newInstructor: Instructor = {
        id: Date.now(),
        ...formData
      };
      setInstructors(prev => [...prev, newInstructor]);
    }

    // إعادة تعيين النموذج
    setFormData({
      name: '',
      description: '',
      bio: '',
      profileImage: ''
    });
  };

  const handleEdit = (instructor: Instructor) => {
    setFormData({
      name: instructor.name,
      description: instructor.description,
      bio: instructor.bio,
      profileImage: instructor.profileImage
    });
    setEditingId(instructor.id);
  };

  const handleDelete = (id: number) => {
    setInstructors(prev => prev.filter(instructor => instructor.id !== id));
    setShowDeleteModal(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      bio: '',
      profileImage: ''
    });
  };

  return (
    <div className="instructors-management">
      <div className="instructors-header">
        <h1>إدارة المحاضرين</h1>
        <p>إضافة وإدارة بيانات المحاضرين في المنصة</p>
      </div>

      {/* نموذج إضافة/تعديل المحاضر */}
      <div className="instructor-form-container">
        <h2>{editingId ? 'تعديل بيانات المحاضر' : 'إضافة محاضر جديد'}</h2>
        <form onSubmit={handleSubmit} className="instructor-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="profileImage">صورة البروفايل</label>
              <input
                type="file"
                id="profileImage"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
              />
              {formData.profileImage && (
                <div className="image-preview">
                  <img src={formData.profileImage} alt="معاينة الصورة" />
                </div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="name">اسم المحاضر *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="أدخل اسم المحاضر"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">التعريف البسيط *</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="تعريف بسيط تحت الاسم"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">نبذة مختصرة عن المحاضر *</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="اكتب نبذة مختصرة عن المحاضر وخبراته"
              rows={4}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-btn">
              {editingId ? 'تحديث البيانات' : 'إضافة المحاضر'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="cancel-btn">
                إلغاء التعديل
              </button>
            )}
          </div>
        </form>
      </div>

      {/* جدول عرض المحاضرين */}
      <div className="instructors-table-container">
        <h2>قائمة المحاضرين</h2>
        {instructors.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد بيانات محاضرين حتى الآن</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="instructors-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>الصورة</th>
                  <th>الاسم</th>
                  <th>التعريف</th>
                  <th>النبذة</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {instructors.map((instructor) => (
                  <tr key={instructor.id}>
                    <td>{instructor.id}</td>
                    <td>
                      {instructor.profileImage ? (
                        <img 
                          src={instructor.profileImage} 
                          alt={instructor.name}
                          className="table-profile-image"
                        />
                      ) : (
                        <div className="no-image">لا توجد صورة</div>
                      )}
                    </td>
                    <td>{instructor.name}</td>
                    <td>{instructor.description}</td>
                    <td className="bio-cell">{instructor.bio}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEdit(instructor)}
                          className="edit-btn"
                        >
                          تعديل
                        </button>
                        <button 
                          onClick={() => setShowDeleteModal(instructor.id)}
                          className="delete-btn"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* نافذة تأكيد الحذف */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="delete-modal">
            <h3>تأكيد الحذف</h3>
            <p>هل أنت متأكد من حذف بيانات هذا المحاضر؟</p>
            <p className="warning-text">
              سيتم حذف جميع بيانات المحاضر وانتسابه للكورسات
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => handleDelete(showDeleteModal)}
                className="confirm-delete-btn"
              >
                نعم، احذف
              </button>
              <button 
                onClick={() => setShowDeleteModal(null)}
                className="cancel-delete-btn"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsManagement;