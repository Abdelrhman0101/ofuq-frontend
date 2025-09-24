import React from 'react';
import '../styles/values-section.css';

const ValuesSection = () => {
  return (
    <section className="values-section">
      <div className="values-container">
        {/* Left Section */}
        <div className="values-left">
          <p className="values-subtitle">قيم حالتنا</p>
          <h2 className="values-title">برامجنا التدريبية مختلفة جدا عن جميع البرامج الاخرى</h2>
          <p className="values-description">
            لوريم إيبسوم دولور سيت أميت، كونسيتيتور أديبيسكنغ إليت، سيد دو أيوسمود تيبور إنسيديدنت أوت ليبوري.
          </p>
          
          {/* Statistics */}
          <div className="statistics">
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">نجاح دراسة الحالة</span>
                <span className="stat-percentage">90%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '90%'}}></div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">طالب سعيد</span>
                <span className="stat-percentage">75%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">مجتمع الطلاب</span>
                <span className="stat-percentage">63%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '63%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="values-right">
          <div className="image-container">
            <img 
              src="/front-view-stacked-books-graduation-cap-ladders-education-day 1.jpg" 
              alt="Education Books and Graduation Cap" 
              className="values-image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;