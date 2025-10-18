import React, { useState, useEffect } from 'react';
import { Instructor } from '../../types/course';
import { getInstructors } from '../../utils/instructorService';
import { getCategories, Category } from '../../utils/categoryService';

interface BasicInfoStepProps {
  courseBasicInfo: {
    title: string;
    description: string;
    price: number;
    isFree: boolean;
    coverImage: File | null;
    duration: number;
    instructor?: Instructor;
    category?: Category;
  };
  setCourseBasicInfo: (info: any) => void;
  onNext: () => void; // Changed from handleCreateBasicCourse to onNext
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ courseBasicInfo, setCourseBasicInfo, onNext }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // State for live data
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch live data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [instructorsData, categoriesData] = await Promise.all([
          getInstructors(),
          getCategories()
        ]);
        
        setInstructors(instructorsData);
        setCategories(categoriesData);
        console.log('Fetched instructors:', instructorsData);
        console.log('Fetched categories:', categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const handleInstructorSelect = (instructor: Instructor) => {
    setCourseBasicInfo({...courseBasicInfo, instructor});
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  const handleCategorySelect = (category: Category) => {
    setCourseBasicInfo({...courseBasicInfo, category});
    setIsCategoryDropdownOpen(false);
    setCategorySearchTerm('');
  };

  // Form submission handler - now only validates and navigates
  const handleFormSubmit = () => {
    if (!courseBasicInfo.title || !courseBasicInfo.description || !courseBasicInfo.instructor || !courseBasicInfo.category || courseBasicInfo.duration <= 0) {
      setError('يرجى ملء جميع الحقول المطلوبة وتأكد من أن مدة الكورس أكبر من صفر');
      return;
    }

    setError('');
    
    // Only update parent state and navigate to next step
    console.log('Basic info collected:', courseBasicInfo);
    onNext(); // Navigate to content management step
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
                    <div className="instructor-info">
                      <span className="instructor-name">{courseBasicInfo.instructor.name}</span>
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
                        className={`instructor-item ${courseBasicInfo.instructor?.id === instructor.id ? 'selected' : ''}`}
                        onClick={() => handleInstructorSelect(instructor)}
                      >
                        <div className="instructor-info">
                          <span className="instructor-name">{instructor.name}</span>
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
                      <span className="instructor-name">{courseBasicInfo.category.name}</span>
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
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="instructor-item"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <div className="category-icon">📚</div>
                        <div className="instructor-info">
                          <span className="instructor-name">{category.name}</span>
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
        
        <div className="form-field">
          <label className="form-label">
            مدة الكورس (بالدقائق) *
          </label>
          <input
            type="number"
            min="0"
            value={courseBasicInfo.duration}
            onChange={(e) => setCourseBasicInfo({...courseBasicInfo, duration: parseInt(e.target.value) || 0})}
            className="form-input"
            placeholder="مثال: 120"
            required
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
          {error && (
            <div className="error-message" style={{color: 'red', marginBottom: '10px', textAlign: 'center'}}>
              {error}
            </div>
          )}
          <button 
            onClick={handleFormSubmit} 
            className="step-next-btn"
            disabled={isLoading}
          >
            <span className="btn-icon">
              ➡️
            </span>
            التالي: إدارة المحتوى
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;