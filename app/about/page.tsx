"use client";
import React, { useEffect, useState } from 'react';
import HomeHeader from '../../components/HomeHeader';
import Footer from '../../components/Footer';
import '../../styles/about.css';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'values' | 'goals' | 'programs' | 'methodology' | 'competitive'>('values');
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
    const sections = document.querySelectorAll('.content-section, .fade-in');
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
        {/* Header Section */}
        <div className="about-header">
          <h1 className="about-title">منصة <span className="brand-accent">أفق</span> للتعليم عن بعد</h1>
        </div>

        {/* تعريف المنصة */}
        <div className="hero-section content-section">
          <div className="hero-text">
            <h2 className="section-title">تعريف المنصة:</h2>
            <p className="section-content">
              أفق مؤسسة تعليمية رائدة متخصصة في بناء وتقديم برامج دبلوم احترافية في مجالات متنوعة تجمع بين الأصالة والمعاصرة. تأسست الشركة لسد الفجوة بين التعليم النظري والممارسة العملية من خلال مناهج علمية مبتكرة ومتكاملة تواكب احتياجات سوق العمل وتحديات العصر.
            </p>
            <p className="section-content">
              تتميز "أفق" بنهجها المتكامل الذي يجمع بين العلوم الشرعية والتربوية والتقنية والإعلامية، مما يمكنها من إعداد كوادر متخصصة قادرة على النهوض بمجتمعاتها وتحقيق التميز في مجالاتها. تعتمد الشركة على نخبة من الخبراء والمتخصصين في تصميم مناهجها وتقديم برامجها، مع الاستفادة من أحدث التقنيات والمنهجيات التعليمية العالمية.
            </p>
          </div>
          <div className="hero-image">
            <img src="/mahad_alofk2.png" alt="منصة الأفق التعليمية" />
          </div>
        </div>

        {/* الرؤية والرسالة */}
        <div className="cards-grid content-section">
          <div className="info-card">
            <div className="card-icon">🔮</div>
            <h3 className="card-title">الرؤية:</h3>
            <p className="card-content">
              أن تكون "أفق" المرجع الأول في تكوين الكفاءات المتخصصة ذات التأثير الإيجابي في المجتمع، من خلال منظومة تعليمية متكاملة تجمع بين الأصالة والمعاصرة.
            </p>
          </div>

          <div className="info-card">
            <div className="card-icon">🎯</div>
            <h3 className="card-title">الرسالة:</h3>
            <p className="card-content">
              نسعى إلى بناء كفاءات متميزة من خلال برامج دبلوم نوعية تجمع بين المعرفة النظرية والمهارات التطبيقية، وفق منهجية متوازنة تراعي أصالة القيم وتستشرف متطلبات المستقبل، لإعداد قيادات فاعلة قادرة على إحداث تغيير إيجابي في مجتمعاتها.
            </p>
          </div>
        </div>

        {/* Tabs Section - قيم/أهداف/برامج/منهجية/ميزات */}
        <div className="content-section">
          <div className="tabs-container">
            <div className="tabs-nav">
              <button 
                className={`tab-button ${activeTab === 'values' ? 'active' : ''}`}
                onClick={() => setActiveTab('values')}
              >
                القيم
              </button>
              <button 
                className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
                onClick={() => setActiveTab('goals')}
              >
                الأهداف الاستراتيجية
              </button>
              <button 
                className={`tab-button ${activeTab === 'programs' ? 'active' : ''}`}
                onClick={() => setActiveTab('programs')}
              >
                البرامج والدبلومات
              </button>
              <button 
                className={`tab-button ${activeTab === 'methodology' ? 'active' : ''}`}
                onClick={() => setActiveTab('methodology')}
              >
                منهجية التعليم والتدريب
              </button>
              <button 
                className={`tab-button ${activeTab === 'competitive' ? 'active' : ''}`}
                onClick={() => setActiveTab('competitive')}
              >
                الميزات التنافسية
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'values' && (
                <div className="info-card">
                  <div className="card-icon">⭐</div>
                  <h3 className="card-title">القيم:</h3>
                  <ul className="feature-list">
                    <li>1- الأصالة والمعاصرة: الالتزام بالقيم الأصيلة مع مواكبة متطلبات العصر ومستجداته</li>
                    <li>2- التكامل المعرفي: تبني منهجية متكاملة تجمع بين مختلف العلوم والمعارف لتكوين رؤية شمولية.</li>
                    <li>3- الإتقان والتميز: الالتزام بأعلى معايير الجودة  في جميع البرامج والخدمات المقدمة.</li>
                    <li>4- الابتكار والإبداع: تشجيع التفكير الإبداعي وتبني الحلول المبتكرة في العملية التعليمية.</li>
                    <li>5- المسؤولية المجتمعية: تعزيز الوعي بالمسؤولية تجاه المجتمع والمساهمة في تنميته.</li>
                    <li>6- الشراكة والتعاون: بناء شراكات استراتيجية مع المؤسسات المحلية والعالمية لتحقيق الأهداف المشتركة.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'goals' && (
                <div className="info-card">
                  <div className="card-icon">🎯</div>
                  <h3 className="card-title">الأهداف الاستراتيجية:</h3>
                  <ul className="feature-list">
                    <li>1-  تطوير مناهج نوعية: بناء وتطوير برامج دبلوم متخصصة تلبي احتياجات سوق العمل وتواكب التطورات العالمية.</li>
                    <li>2- إعداد كوادر متميزة: تخريج كفاءات متخصصة تمتلك المعرفة النظرية والمهارات العملية اللازمة للتميز في مجالاتها.</li>
                    <li>3-  بناء شراكات استراتيجية: إقامة شراكات مع مؤسسات تعليمية وتدريبية عالمية لتبادل الخبرات وتعزيز جودة البرامج.</li>
                    <li>4- الريادة في التعليم المدمج: تبني أحدث تقنيات التعليم والتدريب التي تجمع بين التعلم التقليدي والرقمي.</li>
                    <li>5-  نشر المعرفة المتخصصة: إثراء المحتوى المعرفي العربي من خلال نشر الدراسات والأبحاث المتخصصة.</li>
                    <li>6-  التوسع الجغرافي: الوصول إلى مختلف المناطق من خلال المنصات الرقمية والفروع المتعددة.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'programs' && (
                <div className="info-card">
                  <div className="card-icon">🎓</div>
                  <h3 className="card-title">البرامج والدبلومات:</h3>
                  <ul className="feature-list">
                    <li>تقدم "أفق" مجموعة متنوعة من برامج الدبلوم المتخصصة، منها:</li>
                    <li>1- دبلوم صناعة القيادات الإعلامية: لإعداد كوادر إعلامية متميزة قادرة على إدارة المؤسسات الإعلامية وصناعة المحتوى الهادف.</li>
                    <li>2-  دبلوم تكوين العلماء الشرعيين: لتأهيل طلاب العلم الشرعي وفق منهجية علمية تجمع بين فقه النصوص وفقه الواقع.</li>
                    <li>3- دبلوم الذكاء الاصطناعي: لتمكين المتخصصين من فهم وتطبيق تقنيات الذكاء الاصطناعي وتوظيفها في مختلف المجالات.</li>
                    <li>4- دبلوم تأهيل الدعاة: لتزويد الدعاة بالمهارات والمعارف اللازمة للتأثير الإيجابي وفق منهجية وسطية معاصرة.</li>
                    <li>5- دبلوم رعاية الموهوبين: لتأهيل المتخصصين في اكتشاف ورعاية الموهوبين وتنمية قدراتهم.</li>
                    <li>6- دبلوم الإشراف التربوي: لتطوير مهارات المشرفين التربويين وتمكينهم من قيادة العملية التعليمية بكفاءة.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'methodology' && (
                <div className="info-card">
                  <div className="card-icon">🧭</div>
                  <h3 className="card-title">منهجية التعليم والتدريب:</h3>
                  <ul className="feature-list">
                    <li>تتبنّى "أفق" منهجية متكاملة في التعليم والتدريب تقوم على:</li>
                    <li>1- التعلم بالممارسة: التركيز على تطبيق المعارف النظرية في بيئات عملية واقعية.</li>
                    <li>2- التعلم المدمج: الجمع بين التعليم المباشر والتعليم الإلكتروني لتحقيق أقصى استفادة.</li>
                    <li>3- التعلم المبني على المشاريع: تكليف المتدربين بمشاريع تطبيقية تعكس واقع سوق العمل.</li>
                    <li>4- الإرشاد المهني: توفير مرشدين متخصصين لتوجيه المتدربين خلال رحلتهم التعليمية.</li>
                    <li>5- التقييم المستمر: اعتماد نظام تقييم شامل يقيس مدى تحقق الأهداف التعليمية.</li>
                  </ul>
                </div>
              )}

              {activeTab === 'competitive' && (
                <div className="info-card">
                  <div className="card-icon">💎</div>
                  <h3 className="card-title">الميزات التنافسية:</h3>
                  <ul className="feature-list">
                    <li>1-  التكامل المعرفي: الجمع بين مختلف التخصصات لإعداد كوادر ذات رؤية شمولية.</li>
                    <li>2- الاعتماد الأكاديمي: السعي للحصول على اعتمادات أكاديمية محلية وعالمية لجميع البرامج.</li>
                    <li>3- الخبرة العملية: الاعتماد على مدربين وخبراء ذوي خبرة عملية واسعة في مجالاتهم.</li>
                    <li>4- البنية التقنية المتطورة: توظيف أحدث التقنيات والمنصات الرقمية في العملية التعليمية.</li>
                    <li>5- المرونة والتكيف: تطوير البرامج باستمرار لتواكب المتغيرات المتسارعة في سوق العمل</li>
                    <li>6- شبكة العلاقات المهنية: توفير فرص للمتدربين للتواصل مع الخبراء وأصحاب التجارب الناجحة.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* خاتمة */}
        <div className="content-section">
          <div className="closing-box">
            <div className="closing-divider" aria-hidden="true" />
            <p className="section-content">
              من خلال هذه الهوية المؤسسية المتكاملة، تسعى شركة أفق لأن تكون صرحًا تعليميا متميزًا يسهم في إعداد جيل من القادة المتخصصين القادرين على مواجهة تحديات العصر وتحقيق التنمية المستدامة لمجتمعاتهم.
            </p>
            <p className="section-content author">م.د. عبدالله أحمد الحجري</p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}