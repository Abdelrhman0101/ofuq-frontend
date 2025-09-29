'use client';

import React, { useState } from 'react';
import '../styles/auth.css';
import ForgotPasswordForm from './ForgotPasswordForm';

interface LoginFormProps {
  onTabChange?: (tab: 'login' | 'signup') => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setShowForgotPassword(false); // Reset forgot password view when switching tabs
    onTabChange?.(tab);
  };

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log('Google login clicked');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    if (activeTab === 'signup') {
      console.log('Signup form submitted:', { firstName, lastName, email, password });
    } else {
      console.log('Login form submitted:', { email, password });
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // Show forgot password form if requested
  if (showForgotPassword) {
    return <ForgotPasswordForm onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="auth-form-container">
      {/* Logo */}
      <div className="auth-form-logo">
        <img src="/mahad_alofk2.png" alt="معهد الأفق للتعليم عن بعد" />
      </div>

      {/* Tab Switch Buttons */}
      <div className="auth-tabs">
        <button
          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => handleTabChange('login')}
        >
          تسجيل الدخول
        </button>
        <button
          className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
          onClick={() => handleTabChange('signup')}
        >
          إنشاء حساب
        </button>
      </div>

      {/* Form Content Container */}
      <div className="form-content">
        {/* Google Login Button */}
        <button className="google-login-btn" onClick={handleGoogleLogin}>
          <div className="google-icon"></div>
          تسجيل الدخول بجوجل
        </button>

        {/* Divider */}
        <div className="divider">
          <div className="line"></div>
          <span className="text">أو</span>
          <div className="line"></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
        {/* Name Fields Row - Only show for signup */}
        {activeTab === 'signup' && (
          <div className="name-fields-row">
            <div className="name-field">
              <input
                type="text"
                className="form-input"
                placeholder="الاسم الأول"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="name-field">
              <input
                type="text"
                className="form-input"
                placeholder="الاسم الأخير"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className="form-field">
          <input
            type="email"
            className="form-input"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <input
            type="password"
            className="form-input"
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {activeTab === 'login' && (
            <div className="forgot-password-link">
              <a href="#" onClick={handleForgotPasswordClick}>
                هل نسيت كلمة السر؟
              </a>
            </div>
          )}
        </div>

        <button type="submit" className="login-btn">
          {activeTab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
        </button>
      </form>

      {/* Footer Link */}
      <div className="footer-link">
        {activeTab === 'login' ? (
          <>
            ليس لديك حساب؟{' '}
            <a href="#" onClick={() => handleTabChange('signup')}>
              إنشاء حساب
            </a>
          </>
        ) : (
          <>
            لديك حساب بالفعل؟{' '}
            <a href="#" onClick={() => handleTabChange('login')}>
              تسجيل الدخول
            </a>
          </>
        )}
      </div>
      </div>
    </div>
  );
};

export default LoginForm;