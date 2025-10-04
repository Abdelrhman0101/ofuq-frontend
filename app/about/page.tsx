"use client";
import React, { useEffect } from 'react';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import '../../styles/about.css';

export default function AboutPage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
        }
      });
    }, observerOptions);

    // Observe all sections
    const sections = document.querySelectorAll('.about-section, .about-header, .hero-section, .dual-section, .final-section');
    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section);
      });
    };
  }, []);

  return (
    <>
      <HomeHeader />
      <div className="about-container">
        {/* Floating animated icons */}
        <div className="floating-icon icon-1">📚</div>
        <div className="floating-icon icon-2">🎓</div>
        <div className="floating-icon icon-3">💡</div>
        <div className="floating-icon icon-4">🌟</div>
        <div className="floating-icon icon-5">🚀</div>
        {/* <div className="floating-icon icon-6">🎯</div> */}
        
        {/* Header Section */}
        <div className="about-header animate-on-scroll">
          <h1 className="about-title">عن المنصة - About Us</h1>
          <p className="about-subtitle">منصة تعليمية متطورة لمستقبل أفضل</p>
        </div>

        {/* First Section: Who We Are with Image */}
        <div className="hero-section animate-on-scroll">
          <div className="hero-content">
            <div className="hero-text-box">
              <div className="section-icon">
                <span className="icon-emoji">👥</span>
              </div>
              <h2 className="section-title">من نحن</h2>
              <p className="section-content">
                نحن منصة تعليمية رقمية حديثة، هدفها تبسيط عملية التعلم وجعلها متاحة للجميع بطريقة عملية واحترافية.
                نؤمن أن المعرفة ليست مجرد محتوى، بل تجربة متكاملة تبدأ من أول دخول للمنصة وتنتهي بإنجاز ملموس يضيف لمسيرة المتعلم.
              </p>
            </div>
            <div className="hero-image">
              <img src="/mahad_alofk2.png" alt="معهد الأفق التعليمي" />
            </div>
          </div>
        </div>

        {/* Second Section: Vision and Mission */}
        <div className="dual-section animate-on-scroll">
          <div className="dual-box vision-box">
            <div className="box-icon">
              <span className="icon-emoji">🔮</span>
            </div>
            <h2 className="section-title">رؤيتنا</h2>
            <p className="section-content">
              بناء بيئة تعليمية عربية وعالمية تفاعلية، توفر للطلاب تجربة تعليمية ممتعة، مرنة، وشخصية 
              <span className="highlight-text"> (Personalized Learning)</span> مدعومة بالتقنيات الحديثة.
            </p>
          </div>
          
          <div className="dual-box mission-box">
            <div className="box-icon">
              <span className="icon-emoji">🎯</span>
            </div>
            <h2 className="section-title">رسالتنا</h2>
            <p className="section-content">
              إيصال التعليم بجودة عالية لكل طالب وطالبة، عبر محتوى متدرج من الأساسيات حتى الاحتراف، مع شهادات موثوقة
              يمكن مشاركتها والتحقق منها.
            </p>
          </div>
        </div>

        {/* Third Section: Goals and What Distinguishes Us */}
        <div className="final-section animate-on-scroll">
          <div className="final-box goals-section">
            <div className="box-icon">
              <span className="icon-emoji">🎯</span>
            </div>
            <h2 className="section-title">أهدافنا</h2>
            <ul className="goals-list">
              <li>تمكين الطلاب من اكتساب مهارات عملية مباشرة.</li>
              <li>توفير محتوى تعليمي متنوع (مجاني ومدفوع) يناسب مختلف المستويات.</li>
              <li>بناء مجتمع تعلم تفاعلي يعتمد على التجارب والنتائج.</li>
              <li>اعتماد معايير تصميم حديثة (UX/UI) تجعل تجربة الطالب بسيطة وممتعة.</li>
            </ul>
          </div>

          <div className="final-box features-section">
            <div className="box-icon">
              <span className="icon-emoji">⭐</span>
            </div>
            <h2 className="section-title">ما يميزنا</h2>
            <ul className="features-list">
              <li><span className="highlight-text">شهادات رقمية موثقة:</span> نحمل QR للتحقق Online.</li>
              <li><span className="highlight-text">تجربة تعليمية شخصية:</span> توصيات ذكية مبنية على اهتماماتك وإنجازاتك.</li>
              <li><span className="highlight-text">تعلم ممتع:</span> عناصر تحفيزية مثل الشارات (Badges) والمستويات (Levels).</li>
              <li><span className="highlight-text">مرونة كاملة:</span> إمكانية التعلم من أي جهاز، في أي وقت.</li>
              <li><span className="highlight-text">محتوى احترافي:</span> مقدم من مدربين خبراء في مجالاتهم.</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}