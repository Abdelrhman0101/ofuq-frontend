'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className={styles['footer']}>
      {/* First Row - 4 Columns */}
      <div className={styles['footer-content']}>
        {/* Column 1 - Logo and Description */}
        <div className={styles['footer-column']}>
          <div className={styles['logo-section']}>
            <div className={styles['logo-card']}>
              <Link href="/" className={styles['logo-link']}>
              <Image 
                src="/logo.png" 
                alt="منصة أفق" 
                width={240} 
                height={130}
                className={styles['footer-logo']}
              />
              </Link>
            </div>
            <p className={styles['footer-description']}>
              أفق مؤسسة تعليمية رائدة متخصصة في بناء وتقديم برامج دبلوم احترافية في مجالات متنوعة تجمع بين الأصالة والمعاصرة. تأسست الشركة لسد الفجوة بين التعليم النظري والممارسة العملية من خلال مناهج علمية مبتكرة ومتكاملة تواكب احتياجات سوق العمل وتحديات العصر.
            </p>
          </div>
        </div>

        {/* Column 2 - Contact Us */}
        <div className={styles['footer-column']}>
          
          <motion.h3 className={styles['footer-title']} whileHover={{ scale: 1.02 }}>
            تواصل معنا
          </motion.h3>
          <div className={styles['contact-info']}>
            <div className={styles['contact-item']}>
              <svg className={styles['contact-icon']} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <span>القاهرة - مصر</span>
            </div>
            <div className={styles['contact-item']}>
              <FaWhatsapp className={`${styles['contact-icon']} ${styles['whatsapp']}`} />
              <span className={styles['phone-wrap']}>
                <span className={styles['phone-number']}>201554517102</span>
                <span className={styles['phone-plus']}>+</span>
              </span>
            </div>
            <div className={styles['contact-item']}>
              <svg className={styles['contact-icon']} width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>info@ofuq.academy</span>
            </div>
          </div>
          {/* Social icons row under contact info */}
          <div className={styles['social-row']}>
            <motion.a href="#" className={styles['social-icon']} aria-label="Facebook" whileHover={{ scale: 1.05 }}>
              <FaFacebook />
            </motion.a>
            <motion.a href="#" className={styles['social-icon']} aria-label="Instagram" whileHover={{ scale: 1.05 }}>
              <FaInstagram />
            </motion.a>
            <motion.a href="#" className={styles['social-icon']} aria-label="Whatsapp" whileHover={{ scale: 1.05 }}>
              <FaWhatsapp />
            </motion.a>
            <motion.a href="#" className={styles['social-icon']} aria-label="Twitter/X" whileHover={{ scale: 1.05 }}>
              <FaXTwitter />
            </motion.a>
            <motion.a href="#" className={styles['social-icon']} aria-label="LinkedIn" whileHover={{ scale: 1.05 }}>
              <FaLinkedin />
            </motion.a>
          </div>
        </div>

        {/* Column 3 - Browse Website */}
        <div className={styles['footer-column']}>
          <motion.h3 className={styles['footer-title']} whileHover={{ scale: 1.02 }}>تصفح الموقع</motion.h3>
          <div className={styles['footer-links']}>
            <Link href="/about" className={styles['footer-link']}>عنّا</Link>
            <Link href="/privacy" className={styles['footer-link']}>سياسة الخصوصية</Link>
            <Link href="/terms" className={styles['footer-link']}>الشروط والأحكام</Link>
          </div>
        </div>

        {/* Column 4 - Diplomas */}
        <div className={styles['footer-column']}>
          <motion.h3 className={styles['footer-title']} whileHover={{ scale: 1.02 }}>الدبلومات</motion.h3>
          <ul className={styles['footer-list']}>
            <li className={styles['footer-item']}>بارع</li>
            <li className={styles['footer-item']}>مجتمع أفق</li>
          </ul>
        </div>
      </div>

      {/* Second Row - Copyright */}
      <div className={styles['footer-bottom']}>
        <p className={styles['copyright']}>
            Developed by Dawam Tech منصة أفق. Copyright © All Rights Reserved. 
        </p>
      </div>

      {/* removed styled-jsx in favor of CSS Modules */}
    </footer>
  );
};

export default Footer;