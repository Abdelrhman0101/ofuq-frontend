'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="footer">
      {/* First Row - 4 Columns */}
      <div className="footer-content">
        {/* Column 1 - Logo and Description */}
        <div className="footer-column">
          <div className="logo-section">
            <Image 
              src="/mahad_alofk2.png" 
              alt="معهد أفق" 
              width={120} 
              height={80}
              className="footer-logo"
            />
            <p className="footer-description">
              نحن في معهد أفق نساعدك في<br />
              تحقيق هدفك والوصول لحلمك
            </p>
          </div>
        </div>

        {/* Column 2 - Contact Us */}
        <div className="footer-column">
          <h3 className="footer-title">تواصل معنا</h3>
          <div className="contact-info">
            <div className="contact-item">
              <svg className="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>المحافظة - مصر</span>
            </div>
            <div className="contact-item">
              <svg className="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>+06412398</span>
            </div>
            <div className="contact-item">
              <svg className="contact-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>&&&&@gmail.com</span>
            </div>
          </div>
        </div>

        {/* Column 3 - Browse Website */}
        <div className="footer-column">
          <h3 className="footer-title">تصفح الموقع</h3>
          <div className="footer-links">
            <Link href="/about" className="footer-link">عنّا</Link>
            <Link href="/privacy" className="footer-link">سياسة الخصوصية</Link>
            <Link href="/terms" className="footer-link">الشروط والأحكام</Link>
          </div>
        </div>

        {/* Column 4 - Follow Us */}
        <div className="footer-column">
          <h3 className="footer-title">تابعنا</h3>
          <div className="social-links1">
            <a href="#" className="social-link1 facebook">
              <span>Facebook</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              
            </a>
            <a href="#" className="social-link1 instagram">
              <span>Instagram</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="url(#instagram-gradient)">
                <defs>
                  <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#833AB4"/>
                    <stop offset="50%" stopColor="#FD1D1D"/>
                    <stop offset="100%" stopColor="#FCB045"/>
                  </linearGradient>
                </defs>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              
            </a>
            <a href="#" className="social-link1 whatsapp">
              <span>Whatsapp</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
              
            </a>
          </div>
        </div>
      </div>

      {/* Second Row - Copyright */}
      <div className="footer-bottom">
        <p className="copyright">
            Developed by Dawam Tech معهد أفق. Copyright © All Rights Reserved. 
        </p>
      </div>

      <style jsx>{`
        .footer {
          background-color: #000000;
          color: white;
          padding: 40px 20px 20px;
          font-family: 'Arial', sans-serif;
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
          margin-bottom: 30px;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
        }

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .footer-logo {
          margin-bottom: 15px;
          border-radius: 8px;
        }

        .footer-description {
          color: white;
          font-size: 14px;
          line-height: 1.6;
          margin: 0;
          text-align: right;
        }

        .footer-title {
          color: #4142D0;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 20px;
          text-align: right;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 14px;
          direction: rtl;
        }

        .contact-icon {
          color: white;
          flex-shrink: 0;
        }

        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-link {
          color: white;
          text-decoration: none;
          font-size: 14px;
          text-align: right;
          transition: color 0.3s ease;
        }

        .footer-link:hover {
          color: #4142D0;
        }

        .social-links1 {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .social-link1 {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          text-decoration: none;
          font-size: 14px;
          transition: opacity 0.3s ease;
          direction: rtl;
        }

        .social-link1:hover {
          opacity: 0.8;
        }

        .footer-bottom {
          border-top: 1px solid #333;
          padding-top: 20px;
          text-align: center;
        }

        .copyright {
          color: white;
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
          }
        }

        @media (max-width: 480px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 25px;
          }
          
          .footer {
            padding: 30px 15px 15px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;