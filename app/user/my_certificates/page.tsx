'use client';

import React from 'react';
import CertificateCard from '../../../components/CertificateCard';
import '../../../styles/my-courses.css';

export default function MyCertificatesPage() {
  return (
    <div className="my-courses-page">
      <div className="page-header">
        <h1>شهاداتي</h1>
        <p>عرض جميع الشهادات التي حصلت عليها من الدورات المكتملة</p>
      </div>
      
      <div className="courses-container">
        <CertificateCard 
          courseName="دورة تطوير المواقع الإلكترونية"
          completionDate="15 ديسمبر 2023"
          certificateId="WEB-2023-001"
          certificateImage="/certificates/certificate-template.png"
        />
        
        <CertificateCard 
          courseName="دورة البرمجة بـ JavaScript"
          completionDate="22 نوفمبر 2023"
          certificateId="JS-2023-002"
          certificateImage="/certificates/certificate-template.png"
        />
      </div>
    </div>
  );
}