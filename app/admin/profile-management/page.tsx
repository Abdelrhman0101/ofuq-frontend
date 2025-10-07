'use client';

import React, { useState } from 'react';
import ProfileTab from '../../../components/settings/ProfileTab';
import PreferencesTab from '../../../components/settings/PreferencesTab';
import PasswordTab from '../../../components/settings/PasswordTab';
import '../../../styles/settings.css';

export default function ProfileManagementPage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  // بيانات البروفايل
  const [profileData, setProfileData] = useState({
    firstName: 'أحمد',
    lastName: 'محمد',
    email: 'ahmed@example.com'
  });

  // بيانات التفضيلات
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    language: 'ar'
  });

  // بيانات كلمة المرور
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // دوال التحديث
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceToggle = (field: string) => {
    setPreferences(prev => ({
      ...prev,
      [field]: !prev[field as keyof typeof prev]
    }));
  };

  const handleLanguageChange = (language: string) => {
    setPreferences(prev => ({
      ...prev,
      language
    }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // دوال الحفظ
  const handleSaveProfile = () => {
    console.log('حفظ بيانات البروفايل:', profileData);
    // يمكن إضافة منطق الحفظ هنا
  };

  const handleSavePreferences = () => {
    console.log('حفظ التفضيلات:', preferences);
    // يمكن إضافة منطق الحفظ هنا
  };

  const handleSavePassword = () => {
    console.log('حفظ كلمة المرور:', passwordData);
    // يمكن إضافة منطق الحفظ هنا
  };

  return (
    <div className="profile-management-page">
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">إدارة الملف الشخصي</h1>
          <p className="settings-subtitle">قم بإدارة معلوماتك الشخصية وتفضيلاتك</p>
        </div>

        <div className="settings-content">
          <div className="settings-tabs">
            <button 
              className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              الملف الشخصي
            </button>
            <button 
              className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              كلمة المرور
            </button>
            <button 
              className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              التفضيلات
            </button>
            
          </div>

          <div className="settings-tab-content">
            {activeTab === 'profile' && (
              <ProfileTab 
                profileData={profileData}
                onProfileChange={handleProfileChange}
                onSave={handleSaveProfile}
              />
            )}
            {activeTab === 'preferences' && (
              <PreferencesTab 
                preferences={preferences}
                onPreferenceToggle={handlePreferenceToggle}
                onLanguageChange={handleLanguageChange}
                onSave={handleSavePreferences}
              />
            )}
            {activeTab === 'password' && (
              <PasswordTab 
                passwordData={passwordData}
                onPasswordChange={handlePasswordChange}
                onSave={handleSavePassword}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}