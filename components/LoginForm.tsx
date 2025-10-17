'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './LoginForm.module.css';
import ForgotPasswordForm from './ForgotPasswordForm';
import { signup, signin, googleAuth, handleGoogleCallback } from '../utils/authService';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // Check for Google OAuth callback on component mount
  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        const result = await handleGoogleCallback();
        if (result) {
          console.log('Google OAuth successful:', result);
          
          // Redirect based on role
          if (result.user.role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/user');
          }
        }
      } catch (error: any) {
        console.error('Google OAuth callback error:', error);
        setError(error.message || 'فشل في تسجيل الدخول عبر Google');
      }
    };

    processGoogleCallback();
  }, [router]);

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setShowForgotPassword(false); // Reset forgot password view when switching tabs
    setError(''); // Clear any errors when switching tabs
    onTabChange?.(tab);
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsGoogleLoading(true);
      
      // Call the Google OAuth function
      googleAuth();
    } catch (error: any) {
      console.error('Google login error:', error);
      setError(error.message || 'فشل في تسجيل الدخول عبر Google');
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[AuthForm] Submit clicked', { mode: activeTab });
      if (activeTab === 'signup') {
        // Validate password confirmation
        if (password !== confirmPassword) {
          setError('كلمات السر غير متطابقة');
          console.log('[Signup] Password mismatch');
          setIsLoading(false);
          return;
        }

        // Validate password strength
        if (password.length < 6) {
          setError('كلمة السر يجب أن تكون 6 أحرف على الأقل');
          setIsLoading(false);
          return;
        }

        const fullName = `${firstName} ${lastName}`;
        console.log('[Signup] Full name composed', { fullName });
        console.log('[Signup] Calling signup API');
        const result = await signup({
          name: fullName,
          email,
          password,
          password_confirmation: confirmPassword
        });

        console.log('Signup successful:', result);
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          console.log('[Signup] Routing to /admin');
          router.push('/admin');
        } else {
          console.log('[Signup] Routing to /user');
          router.push('/user');
        }
      } else {
        console.log('[Signin] Calling signin API');
        const result = await signin({
          email,
          password
        });

        console.log('Signin successful:', result);
        
        // Redirect based on role
        if (result.user.role === 'admin') {
          console.log('[Signin] Routing to /admin');
          router.push('/admin');
        } else {
          console.log('[Signin] Routing to /user');
          router.push('/user');
        }
      }
    } catch (error: any) {
      console.log('Authentication Error:', error);
      
      // Enhanced error handling
      if (error.message.includes('email')) {
        setError('البريد الإلكتروني مستخدم بالفعل');
      } else if (error.message.includes('password')) {
        setError('كلمة السر غير صحيحة');
      } else if (error.message.includes('credentials')) {
        setError('بيانات تسجيل الدخول غير صحيحة');
      } else if (error.message.includes('validation')) {
        setError('يرجى التحقق من البيانات المدخلة');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        setError('خطأ في الاتصال، يرجى المحاولة مرة أخرى');
      } else {
        setError(error.message || 'حدث خطأ أثناء المعالجة');
      }
    } finally {
      setIsLoading(false);
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
    <div className={styles.authFormContainer}>
      {/* Logo */}
      <div className={styles.authFormLogo}>
        <img src="/mahad_alofk2.png" alt="معهد الأفق للتعليم عن بعد" />
      </div>

      {/* Tab Switch Buttons */}
      <div className={styles.authTabs}>
        <button
          className={`${styles.authTab} ${activeTab === 'login' ? styles.active : ''}`}
          onClick={() => handleTabChange('login')}
        >
          تسجيل الدخول
        </button>
        <button
          className={`${styles.authTab} ${activeTab === 'signup' ? styles.active : ''}`}
          onClick={() => handleTabChange('signup')}
        >
          إنشاء حساب
        </button>
      </div>

      {/* Form Content Container */}
      <div className={styles.formContent}>
        {/* Google Login Button */}
        <button 
          className={styles.googleLoginBtn} 
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isLoading}
        >
          <div className={styles.googleIcon}></div>
          {isGoogleLoading ? 'جاري التوجيه إلى Google...' : 
           activeTab === 'login' ? 'تسجيل الدخول بجوجل' : 'إنشاء حساب بجوجل'}
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <div className={styles.line}></div>
          <span className={styles.text}>أو</span>
          <div className={styles.line}></div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
        {/* Name Fields Row - Only show for signup */}
        {activeTab === 'signup' && (
          <div className={styles.nameFieldsRow}>
            <div className={styles.nameField}>
              <input
                type="text"
                className={styles.formInput}
                placeholder="الاسم الأول"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.nameField}>
              <input
                type="text"
                className={styles.formInput}
                placeholder="الاسم الأخير"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        <div className={styles.formField}>
          <input
            type="email"
            className={styles.formInput}
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className={styles.formField}>
          <input
            type="password"
            className={styles.formInput}
            placeholder="كلمة السر"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {activeTab === 'login' && (
            <div className={styles.forgotPasswordLink}>
              <a href="#" onClick={handleForgotPasswordClick}>
                هل نسيت كلمة السر؟
              </a>
            </div>
          )}
        </div>

        {/* Confirm Password Field - Only show for signup */}
        {activeTab === 'signup' && (
          <div className={styles.formField}>
            <input
              type="password"
              className={styles.formInput}
              placeholder="تأكيد كلمة السر"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <button type="submit" className={styles.loginBtn} disabled={isLoading || isGoogleLoading}>
          {isLoading ? 'جاري المعالجة...' : (activeTab === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب')}
        </button>
      </form>

      {/* Footer Link */}
      <div className={styles.footerLink}>
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