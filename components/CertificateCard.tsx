'use client';

import React, { useState } from 'react';
import '../styles/certificate-card.css';

interface CertificateCardProps {
  courseName: string;
  completionDate: string;
  certificateId?: string;
  certificateImage?: string;
  downloadUrl?: string;
  verificationUrl?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  courseName,
  completionDate,
  certificateId = "CERT-001",
  certificateImage,
  downloadUrl,
  verificationUrl
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleViewCertificate = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      return;
    }
    setShowModal(true);
  };

  const handleDownloadCertificate = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      return;
    }
    if (certificateImage) {
      const link = document.createElement('a');
      link.href = certificateImage;
      const fileExtension = certificateImage.split('.').pop() || 'png';
      link.download = `certificate-${certificateId}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('لا توجد شهادة متاحة للتحميل');
    }
  };

  const handleShareCertificate = () => {
    const url = verificationUrl || window.location.href;
    if (navigator.share && (certificateImage || downloadUrl)) {
      navigator.share({
        title: `شهادة إتمام ${courseName}`,
        text: `حصلت على شهادة إتمام دورة ${courseName} من معهد الأفق`,
        url
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('تم نسخ رابط الشهادة إلى الحافظة');
      }).catch(() => {
        alert('لا يمكن مشاركة الشهادة في الوقت الحالي');
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div className="certificate-card">
        <div className="certificate-content">
          <div className="certificate-info">
            <div className="certificate-icon">
              🏆
            </div>
            <div className="certificate-details">
              <h3 className="course-name">{courseName}</h3>
              <p className="completion-date">
                حصلت عليها في يوم <span className="date">{completionDate}</span>
              </p>
              <button 
                className="view-certificate-btn"
                onClick={handleViewCertificate}
              >
                عرض الشهادة
              </button>
            </div>
          </div>
          
          <div className="certificate-actions">
            <button 
              className="action-btn download-btn"
              onClick={handleDownloadCertificate}
              title="تحميل الشهادة"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
              </svg>
              تحميل
            </button>
            
            <button 
              className="action-btn share-btn"
              onClick={handleShareCertificate}
              title="مشاركة الشهادة"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
              مشاركة
            </button>
          </div>
        </div>
      </div>

      {/* Modal لعرض الشهادة */}
      {showModal && (
        <div className="certificate-modal" onClick={closeModal}>
          <div className="certificate-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>
              ×
            </button>
            <div className="certificate-preview">
              {certificateImage ? (
                <img 
                  src={certificateImage} 
                  alt={`شهادة ${courseName}`}
                  className="certificate-image"
                />
              ) : (
                <div className="no-certificate">
                  <p>لا توجد صورة للشهادة متاحة</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="modal-btn download-modal-btn"
                onClick={handleDownloadCertificate}
              >
                تحميل الشهادة
              </button>
              <button 
                className="modal-btn share-modal-btn"
                onClick={handleShareCertificate}
              >
                مشاركة الشهادة
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificateCard;