'use client';
import React, { useEffect, useRef, useState } from 'react';
import '../styles/values-section.css';

const ValuesSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedPercentages, setAnimatedPercentages] = useState({
    success: 0,
    happy: 0,
    community: 0
  });
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          animateProgressBars();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [isVisible]);

  const animateProgressBars = () => {
    const targetPercentages = { success: 90, happy: 75, community: 63 };
    const duration = 2000; // 2 seconds
    const steps = 60; // 60 steps for smooth animation
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      
      setAnimatedPercentages({
        success: Math.round(targetPercentages.success * progress),
        happy: Math.round(targetPercentages.happy * progress),
        community: Math.round(targetPercentages.community * progress)
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);
  };

  return (
    <section className="values-section" ref={sectionRef}>
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
                <span className="stat-percentage">{animatedPercentages.success}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${animatedPercentages.success}%`,
                    transition: isVisible ? 'width 0.1s ease-out' : 'none'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">طالب سعيد</span>
                <span className="stat-percentage">{animatedPercentages.happy}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${animatedPercentages.happy}%`,
                    transition: isVisible ? 'width 0.1s ease-out' : 'none'
                  }}
                ></div>
              </div>
            </div>
            
            <div className="stat-item">
              <div className="stat-header">
                <span className="stat-label">مجتمع الطلاب</span>
                <span className="stat-percentage">{animatedPercentages.community}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{
                    width: `${animatedPercentages.community}%`,
                    transition: isVisible ? 'width 0.1s ease-out' : 'none'
                  }}
                ></div>
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