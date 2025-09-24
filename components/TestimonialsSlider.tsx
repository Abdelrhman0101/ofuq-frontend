'use client';

import React, { useState } from 'react';
import '../styles/testimonials-slider.css';

interface Testimonial {
  id: number;
  text: string;
  name: string;
  title: string;
  avatar: string;
}

const TestimonialsSlider: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: "أوصي في شخص يتطلع للتعلم الحديث أن يتردد على ذلك.",
      name: "ساجد مصطفى",
      title: "مدير المساعدات",
      avatar: "/profile.jpg"
    },
    {
      id: 2,
      text: "خلت هذه الدورة تجربة رائعة للغاية الحصول بودجة الدورة حيث خلت هذه الدورة تجربة رائعة للغاية الحصول بودجة الدورة حيث كمتدرب متطلع لم يتردد ذلك أن يتردد على ذلك.",
      name: "أوتيس محمد",
      title: "الطبيب الحديث",
      avatar: "/profile.jpg"
    },
    {
      id: 3,
      text: "تطبيقات تقنية لحل مشاكل الأعمال، مناهج الرقمة",
      name: "رانيا أحمد",
      title: "مطورة برمجيات",
      avatar: "/profile.jpg"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className="testimonials-section">
      <div className="testimonials-container">
        <div className="testimonials-header">
          <h2 className="testimonials-title">آراء طلابنا</h2>
          <p className="testimonials-subtitle">ماذا يقول طلابنا عن تجربتهم معنا</p>
        </div>

        <div className="testimonials-slider">
          <button className="slider-nav prev" onClick={prevSlide}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="testimonials-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">{testimonial.text}</p>
                  <div className="testimonial-author">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="author-avatar"
                    />
                    <div className="author-info">
                      <h4 className="author-name">{testimonial.name}</h4>
                      <p className="author-title">{testimonial.title}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button className="slider-nav next" onClick={nextSlide}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="testimonials-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSlider;