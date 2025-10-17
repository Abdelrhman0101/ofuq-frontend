'use client';

import React, { useState } from 'react';
import '../styles/auth.css';
import VerificationCodeForm from './VerificationCodeForm';

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log('Forgot password form submitted:', { email });
    
    // Show verification code form after successful submission
    setShowVerification(true);
  };

  const handleBackToForgotPassword = () => {
    setShowVerification(false);
  };

  // Show verification code form if email was submitted
  if (showVerification) {
    return (
      <VerificationCodeForm 
        onBackToForgotPassword={handleBackToForgotPassword}
        email={email}
      />
    );
  }

  return (
    <div className="auth-form-container">
      {/* Logo */}
      <div className="auth-form-logo">
        <img src="/mahad_alofk2.png" alt="معهد الأفق للتعليم عن بعد" />
      </div>

      {/* Form Content Container */}
      <div className="form-content forgot-password-content">
        {/* Title */}
        <h1 className="forgot-password-title">إعادة تعيين كلمة السر</h1>
        
        {/* Subtitle */}
        <p className="forgot-password-subtitle">
          أدخل عنوان البريد الإلكتروني المرتبط بحسابك وسنرسل لك تعليمات
          لإعادة تعيين كلمة السر
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-field">
            <label className="form-label">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-input"
              placeholder="اكتب بريدك الإلكتروني..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="reset-btn">
            إرسال رابط إعادة التعيين
          </button>
        </form>

        {/* Back to Login Link */}
        <div className="back-to-login">
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin?.(); }}>
            الرجوع إلى تسجيل الدخول
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;