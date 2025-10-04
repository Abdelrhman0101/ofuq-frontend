'use client';

import React, { useState } from 'react';
import '../../../styles/dashboard.css';
import '../../../styles/settings.css';
import ProfileTab from '../../../components/settings/ProfileTab';
import PasswordTab from '../../../components/settings/PasswordTab';
import PreferencesTab from '../../../components/settings/PreferencesTab';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    language: 'ar'
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreferenceToggle = (field: string) => {
    setPreferences(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }));
  };

  const handleLanguageChange = (language: string) => {
    setPreferences(prev => ({ ...prev, language }));
  };

  const handleSaveProfile = () => {
    console.log('حفظ بيانات الملف الشخصي:', profileData);
  };

  const handleSavePassword = () => {
    console.log('حفظ كلمة المرور:', passwordData);
  };

  const handleSavePreferences = () => {
    console.log('حفظ التفضيلات:', preferences);
  };

  return (
    <div className="dashboard-container settings-page">
      <div className="settings-header">
        <h1 className="settings-title">الإعدادات</h1>
        <p className="settings-subtitle">إدارة إعدادات حسابك وتفضيلاتك</p>
      </div>

      {/* Tabs Navigation */}
      <div className="settings-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          تعديل الحساب
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          كلمة السر
        </button>
        <button 
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          التفضيلات
        </button>
      </div>

      {/* Profile Tab */}
      <div className={`tab-content ${activeTab === 'profile' ? 'active' : ''}`}>
        <ProfileTab 
          profileData={profileData}
          onProfileChange={handleProfileChange}
          onSave={handleSaveProfile}
        />
      </div>

      {/* Password Tab */}
      <div className={`tab-content ${activeTab === 'password' ? 'active' : ''}`}>
        <PasswordTab 
          passwordData={passwordData}
          onPasswordChange={handlePasswordChange}
          onSave={handleSavePassword}
        />
      </div>

      {/* Preferences Tab */}
      <div className={`tab-content ${activeTab === 'preferences' ? 'active' : ''}`}>
        <PreferencesTab 
          preferences={preferences}
          onPreferenceToggle={handlePreferenceToggle}
          onLanguageChange={handleLanguageChange}
          onSave={handleSavePreferences}
        />
      </div>
    </div>
  );
}