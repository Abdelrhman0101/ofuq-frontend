'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Footer.module.css';
import { motion } from 'framer-motion';
import { FaFacebook, FaInstagram, FaWhatsapp, FaXTwitter } from 'react-icons/fa6';
import { FaLinkedin, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  const phoneNumber = '201554517102';
  const phoneDial = '+201554517102';
  const whatsappLink = `https://wa.me/${phoneNumber}`;
  const emailAddress = 'info@ofuq.academy';
  const locationText = 'القاهرة - مصر';

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
            <motion.div className={styles['contact-item']} whileHover={{ scale: 1.01 }}>
              <FaMapMarkerAlt className={styles['contact-icon']} />
              <span>{locationText}</span>
            </motion.div>

            <motion.div className={styles['contact-item']} whileHover={{ scale: 1.01 }}>
              <FaWhatsapp className={`${styles['contact-icon']} ${styles['whatsapp']}`} />
              <span className={styles['phone-wrap']}>
                <span className={styles['phone-number']}>{phoneNumber}</span>
                <span className={styles['phone-plus']}>+</span>
              </span>
              <div className={styles['contact-actions']}>
                <motion.a
                  href={`tel:${phoneDial}`}
                  className={`${styles['contact-btn']} ${styles['contact-btn-outline']}`}
                  aria-label="اتصال"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaPhone style={{ marginLeft: 6 }} />
                  اتصال
                </motion.a>
                <motion.a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles['contact-btn']} ${styles['contact-btn-primary']}`}
                  aria-label="واتساب"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaWhatsapp style={{ marginLeft: 6 }} />
                  واتساب
                </motion.a>
              </div>
            </motion.div>

            <motion.div className={styles['contact-item']} whileHover={{ scale: 1.01 }}>
              <FaEnvelope className={styles['contact-icon']} />
              <span>{emailAddress}</span>
              <motion.a
                href={`mailto:${emailAddress}`}
                className={`${styles['contact-btn']} ${styles['contact-btn-outline']}`}
                aria-label="إرسال بريد"
                whileHover={{ scale: 1.05 }}
              >
                إرسال بريد
              </motion.a>
            </motion.div>
          </div>
          {/* Social icons row under contact info */}
          <div className={styles['social-row']}>
            {/*
            <motion.a href="#" className={styles['social-icon']} aria-label="Facebook" whileHover={{ scale: 1.05 }}>
              <FaFacebook />
            </motion.a>
            <motion.a href="#" className={styles['social-icon']} aria-label="Instagram" whileHover={{ scale: 1.05 }}>
              <FaInstagram />
            </motion.a>
            */}
            {/* واتساب مكرر أعلى — نزيله من صف السوشيال */}
            {/*
            <motion.a href={whatsappLink} target="_blank" rel="noopener noreferrer" className={styles['social-icon']} aria-label="Whatsapp" whileHover={{ scale: 1.05 }}>
              <FaWhatsapp />
            </motion.a>
            */}
            {/*
            <motion.a href="#" className={styles['social-icon']} aria-label="Twitter/X" whileHover={{ scale: 1.05 }}>
              <FaXTwitter />
            </motion.a>
            <motion.a href="#" className={styles['social-icon']} aria-label="LinkedIn" whileHover={{ scale: 1.05 }}>
              <FaLinkedin />
            </motion.a>
            */}
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
            <li className={styles['footer-item']}><Link href="/diplomas/baraa">بارع</Link></li>
            <li className={styles['footer-item']}><Link href="/community">مجتمع أفق</Link></li>
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