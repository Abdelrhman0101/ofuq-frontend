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
  const techSupportNumber = '201555855857';
  const techSupportDial = '+201555855857';
  const techSupportWhatsappMessage = 'دعم فني لمنصة أفق:\n\n';
  const techSupportWhatsappLink = `https://wa.me/${techSupportNumber}?text=${encodeURIComponent(techSupportWhatsappMessage)}`;
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
              أفق منصة تعليمية رائدة متخصصة في بناء وتقديم برامج دبلوم احترافية في مجالات متنوعة تجمع بين الأصالة والمعاصرة. تأسست المنصة لسد الفجوة بين التعليم النظري والممارسة العملية من خلال مناهج علمية مبتكرة ومتكاملة تواكب احتياجات سوق العمل وتحديات العصر.
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

            {/* للاستفسارات الأكاديمية */}
            <motion.div className={`${styles['contact-item']} ${styles['contact-item-stacked']}`} whileHover={{ scale: 1.01 }}>
              <div className={styles['contact-label']}>للاستفسارات الأكاديمية</div>
              <div className={styles['contact-row']}>
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
              </div>
            </motion.div>

            {/* للدعم الفني التقني */}
            <motion.div className={`${styles['contact-item']} ${styles['contact-item-stacked']}`} whileHover={{ scale: 1.01 }}>
              <div className={styles['contact-label']}>للدعم الفني التقني</div>
              <div className={styles['contact-row']}>
                <FaWhatsapp className={`${styles['contact-icon']} ${styles['whatsapp']}`} />
                <span className={styles['phone-wrap']}>
                  <span className={styles['phone-number']}>{techSupportNumber}</span>
                  <span className={styles['phone-plus']}>+</span>
                </span>
                <div className={styles['contact-actions']}>
                  {/* <motion.a
                    href={`tel:${techSupportDial}`}
                    className={`${styles['contact-btn']} ${styles['contact-btn-outline']}`}
                    aria-label="اتصال"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaPhone style={{ marginLeft: 6 }} />
                    اتصال
                  </motion.a> */}
                  <motion.a
                    href={techSupportWhatsappLink}
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
            <Link href="/verify-certificate" className={styles['footer-link']}>التحقق من الشهادة</Link>
            <Link href="/privacy" className={styles['footer-link']}>سياسة الخصوصية</Link>
            <Link href="/terms" className={styles['footer-link']}>الشروط والأحكام</Link>
          </div>
        </div>

        {/* Column 4 - Diplomas */}
        <div className={styles['footer-column']}>
          <motion.h3 className={styles['footer-title']} whileHover={{ scale: 1.02 }}>الدبلومات</motion.h3>
          <ul className={styles['footer-list']}>
            <Link href="/diplomas/baree3"><li className={styles['footer-item']}>بارع</li></Link>
            <Link href="/community"><li className={styles['footer-item']}>مجتمع أفق</li></Link>
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