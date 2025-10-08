import React, { useState } from 'react';
import { Instructor } from '../../types/course';

interface BasicInfoStepProps {
  courseBasicInfo: {
    title: string;
    description: string;
    price: number;
    isFree: boolean;
    coverImage: File | null;
    instructor?: Instructor;
    category?: string;
  };
  setCourseBasicInfo: (info: any) => void;
  handleCreateBasicCourse: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ courseBasicInfo, setCourseBasicInfo, handleCreateBasicCourse }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // قائمة تصنيفات الكورسات
  const courseCategories = [
    'التطوير والبرمجة',
    'التصميم والجرافيك',
    'التسويق الرقمي',
    'إدارة الأعمال',
    'اللغات',
    'التطوير الشخصي',
    'التكنولوجيا والذكاء الاصطناعي',
    'المالية والمحاسبة',
    'الصحة واللياقة',
    'الطبخ والحرف اليدوية'
  ];

  // Mock instructors data - في التطبيق الحقيقي ستأتي من API
  const instructors: Instructor[] = [
    {
      id: '1',
      name: 'د. أحمد محمد',
      profileImage: '/profile.jpg',
      email: 'ahmed@example.com',
      // specialization: 'مدرب معتمد'
    },
    {
      id: '2',
      name: 'د. فاطمة علي',
      profileImage: '/profile2.jpg',
      email: 'fatima@example.com',
      // specialization: 'خبير تدريب'
    },
    {
      id: '3',
      name: 'أ. محمد حسن',
      profileImage: '/profile.jpg',
      email: 'mohamed@example.com',
      // specialization: 'مستشار تعليمي'
    },
    {
      id: '4',
      name: 'د. سارة أحمد',
      profileImage: '/profile2.jpg',
      email: 'sara@example.com',
      // specialization: 'مدربة محترفة'
    }
  ];

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = courseCategories.filter(category =>
    category.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleInstructorSelect = (instructor: Instructor) => {
    setCourseBasicInfo({...courseBasicInfo, instructor});
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleCategorySelect = (category: string) => {
    setCourseBasicInfo({...courseBasicInfo, category});
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  return (
    <div className="step-content-container">
      <div className="step-header">
        <h2 className="step-main-title">
          معلومات الكورس الأساسية
        </h2>
        <p className="step-main-description">أدخل المعلومات الأساسية للكورس الجديد</p>
      </div>
      
      <div className="basic-info-form">
        <div className="form-grid">
          <div className="form-field">
            <div className="cover-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCourseBasicInfo({...courseBasicInfo, coverImage: e.target.files?.[0] || null})}
                className="cover-upload-input"
                id="cover-upload"
              />
              <label htmlFor="cover-upload" className="cover-upload-label">
                {courseBasicInfo.coverImage ? (
                  <div className="cover-preview">
                    <img src={URL.createObjectURL(courseBasicInfo.coverImage)} alt="Cover" className="cover-image" />
                    <div className="cover-overlay">
                      <span>تغيير الصورة</span>
                    </div>
                  </div>
                ) : (
                  <div className="cover-placeholder">
                    <span className="cover-placeholder-text">اختر صورة الغلاف</span>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>
        
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">
              عنوان الكورس *
            </label>
            <input
              type="text"
              value={courseBasicInfo.title}
              onChange={(e) => setCourseBasicInfo({...courseBasicInfo, title: e.target.value})}
              className="form-input"
              placeholder="أدخل عنوان الكورس"
            />
          </div>
          
          <div className="form-field">
            <label className="form-label">
              المحاضر *
            </label>
            <div className="instructor-dropdown-container">
              <div 
                className="instructor-dropdown-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {courseBasicInfo.instructor ? (
                  <div className="selected-instructor">
                    <img 
                      src={courseBasicInfo.instructor.profileImage || '/profile.jpg'} 
                      alt={courseBasicInfo.instructor.name}
                      className="instructor-avatar"
                    />
                    <div className="instructor-info">
                      <span className="instructor-name">{courseBasicInfo.instructor.name}</span>
                      <span className="instructor-specialization">{courseBasicInfo.instructor.specialization}</span>
                    </div>
                  </div>
                ) : (
                  <div className="instructor-placeholder">
                    <span>اختر المحاضر</span>
                  </div>
                )}
                <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
              </div>
              
              {isDropdownOpen && (
                <div className="instructor-dropdown-menu">
                  <div className="instructor-search">
                    <input
                      type="text"
                      placeholder="البحث عن محاضر..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="instructor-search-input"
                    />
                  </div>
                  <div className="instructor-list">
                    {filteredInstructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="instructor-item"
                        onClick={() => handleInstructorSelect(instructor)}
                      >
                        <img 
                          src={instructor.profileImage || '/profile.jpg'} 
                          alt={instructor.name}
                          className="instructor-avatar"
                        />
                        <div className="instructor-info">
                          <span className="instructor-name">{instructor.name}</span>
                          <span className="instructor-specialization">{instructor.specialization}</span>
                        </div>
                      </div>
                    ))}
                    {filteredInstructors.length === 0 && (
                      <div className="no-instructors">لا توجد نتائج</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">
              تصنيف الكورس *
            </label>
            <div className="instructor-dropdown-container">
              <div 
                className="instructor-dropdown-trigger"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                {courseBasicInfo.category ? (
                  <div className="selected-instructor">
                    <div className="category-icon">📚</div>
                    <div className="instructor-info">
                      <span className="instructor-name">{courseBasicInfo.category}</span>
                    </div>
                  </div>
                ) : (
                  <div className="instructor-placeholder">
                    <span>اختر تصنيف الكورس</span>
                  </div>
                )}
                <span className={`dropdown-arrow ${isCategoryDropdownOpen ? 'open' : ''}`}>▼</span>
              </div>
              
              {isCategoryDropdownOpen && (
                <div className="instructor-dropdown-menu">
                  <div className="instructor-search">
                    <input
                      type="text"
                      placeholder="البحث عن تصنيف..."
                      value={categorySearchTerm}
                      onChange={(e) => setCategorySearchTerm(e.target.value)}
                      className="instructor-search-input"
                    />
                  </div>
                  <div className="instructor-list">
                    {filteredCategories.map((category, index) => (
                      <div
                        key={index}
                        className="instructor-item"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="category-icon">📚</div>
                        <div className="instructor-info">
                          <span className="instructor-name">{category}</span>
                        </div>
                      </div>
                    ))}
                    {filteredCategories.length === 0 && (
                      <div className="no-instructors">لا توجد نتائج</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="form-field">
          <label className="form-label">
            وصف الكورس *
          </label>
          <textarea
            value={courseBasicInfo.description}
            onChange={(e) => setCourseBasicInfo({...courseBasicInfo, description: e.target.value})}
            rows={4}
            className="form-textarea"
            placeholder="أدخل وصف مفصل للكورس"
          />
        </div>
        
        <div className="pricing-section">
          <div className="pricing-toggle">
            <label className="toggle-container">
              <input
                type="checkbox"
                checked={courseBasicInfo.isFree}
                onChange={(e) => setCourseBasicInfo({...courseBasicInfo, isFree: e.target.checked, price: e.target.checked ? 0 : courseBasicInfo.price})}
                className="toggle-input"
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                {courseBasicInfo.isFree ? 'كورس مجاني' : 'كورس مدفوع'}
              </span>
            </label>
          </div>
          
          {!courseBasicInfo.isFree && (
            <div className="price-input-container">
              <label className="form-label">
                سعر الكورس (جنيه)
              </label>
              <input
                type="number"
                min="0"
                value={courseBasicInfo.price}
                onChange={(e) => setCourseBasicInfo({...courseBasicInfo, price: parseFloat(e.target.value) || 0})}
                className="form-input price-input"
                placeholder=""
              />
            </div>
          )}
        </div>
        
        <div className="step-actions">
          <button onClick={handleCreateBasicCourse} className="step-next-btn">
            <span className="btn-icon">➡️</span>
            التالي: إدارة المحتوى
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;