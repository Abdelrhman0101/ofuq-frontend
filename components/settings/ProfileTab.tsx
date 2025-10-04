'use client';

import React, { useState } from 'react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
}

interface ProfileTabProps {
  profileData: ProfileData;
  onProfileChange: (field: string, value: string) => void;
  onSave: () => void;
}

export default function ProfileTab({ profileData, onProfileChange, onSave }: ProfileTabProps) {
  const [showImageModal, setShowImageModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageClick = () => {
    setShowImageModal(true);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = () => {
    setProfileImage(null);
  };

  const closeModal = () => {
    setShowImageModal(false);
  };

  return (
    <>
      <div className="profile-section">
        <div className="profile-image-section">
          <div className="profile-image-container">
            <div className="profile-image" onClick={handleImageClick}>
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-img" />
              ) : (
                <span className="profile-placeholder">👤</span>
              )}
              <div className="camera-icon">
                📷
              </div>
            </div>
          </div>
          <div className="profile-image-actions">
            <label className="image-button primary">
              إضافة صورة جديدة
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <button className="image-button secondary" onClick={handleDeleteImage}>
              مسح الصورة
            </button>
          </div>
        </div>

        <form className="settings-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">الاسم الأول</label>
              <input 
                type="text" 
                className="form-input"
                value={profileData.firstName}
                onChange={(e) => onProfileChange('firstName', e.target.value)}
                placeholder="أدخل الاسم الأول"
              />
            </div>
            <div className="form-group">
              <label className="form-label">الاسم الأخير</label>
              <input 
                type="text" 
                className="form-input"
                value={profileData.lastName}
                onChange={(e) => onProfileChange('lastName', e.target.value)}
                placeholder="أدخل الاسم الأخير"
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">البريد الإلكتروني</label>
            <input 
              type="email" 
              className="form-input"
              value={profileData.email}
              onChange={(e) => onProfileChange('email', e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
            />
          </div>
          <button type="button" className="save-button" onClick={onSave}>
            حفظ التغييرات
          </button>
        </form>
      </div>

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={closeModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeModal}>
              ×
            </button>
            <div className="modal-image-container">
              {profileImage ? (
                <img src={profileImage} alt="Profile Preview" className="modal-image" />
              ) : (
                <div className="modal-placeholder">
                  <span className="modal-placeholder-icon">👤</span>
                  <p>لا توجد صورة شخصية</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}