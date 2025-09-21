import React from 'react';

interface BasicInfoStepProps {
  courseBasicInfo: {
    title: string;
    description: string;
    price: number;
    isFree: boolean;
    coverImage: File | null;
  };
  setCourseBasicInfo: (info: any) => void;
  handleCreateBasicCourse: () => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ courseBasicInfo, setCourseBasicInfo, handleCreateBasicCourse }) => {
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