"use client";

import React, { useState } from "react";
import CourseCard from "../../../components/CourseCard";
import CourseGrid from "../../../components/CourseGrid";
import type { Course as GridCourse } from "../../../components/CourseGrid";

import "../../../styles/course-cards.css";
import "../../../styles/fav.css";

type CardItem = {
  id: string;
  title: string;
  image: string;
  category: string;
  rating: number;
  studentsCount: number;
  duration: string;
  lessonsCount: number;
  instructorName: string;
  instructorAvatar: string;
  price: number;
};

const initialPurchased: GridCourse[] = [
  {
    id: 201,
    name: "تطوير المواقع",
    progress: 60,
    image: "/hero-image.png",
    category: "Backend",
    instructor: {
      name: "سارة أحمد",
      avatar: "/profile2.jpg",
    },
  },
  {
    id: 301,
    name: "تصميم واجهات المستخدم",
    progress: 85,
    image: "/hero-image.png",
    category: "UI/UX",
    instructor: {
      name: "فاطمة حسن",
      avatar: "/profile2.jpg",
    },
  },
  {
    id: 302,
    name: "تحليل البيانات",
    progress: 70,
    image: "/hero-image.png",
    category: "Data Science",
    instructor: {
      name: "نور الدين",
      avatar: "/profile2.jpg",
    },
  },
  {
    id: 401,
    name: "الأمن السيبراني",
    progress: 20,
    image: "/hero-image.png",
    category: "Security",
    instructor: {
      name: "يوسف أحمد",
      avatar: "/profile.jpg",
    },
  },
  {
    id: 402,
    name: "تطوير تطبيقات الجوال",
    progress: 85,
    image: "/hero-image.png",
    category: "Mobile",
    instructor: {
      name: "ليلى محمود",
      avatar: "/profile2.jpg",
    },
  },
  {
    id: 403,
    name: "التسويق الرقمي",
    progress: 40,
    image: "/hero-image.png",
    category: "Marketing",
    instructor: {
      name: "مريم سالم",
      avatar: "/profile.jpg",
    },
  },
  {
    id: 404,
    name: "أساسيات البرمجة المتقدمة",
    progress: 55,
    image: "/hero-image.png",
    category: "Programming",
    instructor: {
      name: "أحمد ياسين",
      avatar: "/profile2.jpg",
    },
  },
  {
    id: 405,
    name: "إدارة قواعد البيانات",
    progress: 35,
    image: "/hero-image.png",
    category: "Database",
    instructor: {
      name: "محمد زين",
      avatar: "/profile.jpg",
    },
  },
  {
    id: 406,
    name: "مقدمة في الذكاء الاصطناعي",
    progress: 25,
    image: "/hero-image.png",
    category: "AI",
    instructor: {
      name: "لين خالد",
      avatar: "/profile2.jpg",
    },
  },
];

const initialUnpurchased: CardItem[] = [
  {
    id: "c-101",
    title: "أساسيات البرمجة",
    image: "/hero-image.png",
    category: "Frontend",
    rating: 4.5,
    studentsCount: 1200,
    duration: "12 ساعة",
    lessonsCount: 24,
    instructorName: "أحمد محمد",
    instructorAvatar: "/profile.jpg",
    price: 299,
  },
  {
    id: "c-102",
    title: "قواعد البيانات",
    image: "/hero-image.png",
    category: "Database",
    rating: 4.2,
    studentsCount: 980,
    duration: "10 ساعات",
    lessonsCount: 18,
    instructorName: "محمد علي",
    instructorAvatar: "/profile.jpg",
    price: 249,
  },
  {
    id: "c-103",
    title: "الذكاء الاصطناعي",
    image: "/hero-image.png",
    category: "AI",
    rating: 4.8,
    studentsCount: 1500,
    duration: "15 ساعة",
    lessonsCount: 30,
    instructorName: "عمر خالد",
    instructorAvatar: "/profile.jpg",
    price: 399,
  },
  {
    id: "c-104",
    title: "تحليل البيانات للمبتدئين",
    image: "/hero-image.png",
    category: "Data Science",
    rating: 4.1,
    studentsCount: 800,
    duration: "9 ساعات",
    lessonsCount: 16,
    instructorName: "نور الدين",
    instructorAvatar: "/profile2.jpg",
    price: 279,
  },
  {
    id: "c-105",
    title: "UI/UX أساسيات",
    image: "/hero-image.png",
    category: "UI/UX",
    rating: 4.3,
    studentsCount: 1100,
    duration: "11 ساعة",
    lessonsCount: 20,
    instructorName: "فاطمة حسن",
    instructorAvatar: "/profile2.jpg",
    price: 289,
  },
  {
    id: "c-106",
    title: "الأمن السيبراني للمبتدئين",
    image: "/hero-image.png",
    category: "Security",
    rating: 4.0,
    studentsCount: 650,
    duration: "8 ساعات",
    lessonsCount: 14,
    instructorName: "يوسف أحمد",
    instructorAvatar: "/profile.jpg",
    price: 239,
  },
];

export default function FavPage() {
  const [purchased, setPurchased] = useState<GridCourse[]>(initialPurchased);
  const [unpurchased, setUnpurchased] = useState<CardItem[]>(initialUnpurchased);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnpurchasedModalOpen, setIsUnpurchasedModalOpen] = useState(false);

  const removePurchased = (id: number) => {
    setPurchased((prev) => prev.filter((c) => c.id !== id));
  };

  const removeUnpurchased = (id: string) => {
    setUnpurchased((prev) => prev.filter((c) => c.id !== id));
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const openUnpurchasedModal = () => setIsUnpurchasedModalOpen(true);
  const closeUnpurchasedModal = () => setIsUnpurchasedModalOpen(false);

  return (
    <section className="fav-section">
      <div className="fav-header">
        <h1 className="fav-title">المفضلة</h1>
      </div>

      {/* Top Purchased: grid of 3 cards + More button */}
      <div className="fav-top">
        <div className="fav-top-actions">
          <h2 className="fav-section-title">الدورات المشتراة</h2>
          <button className="fav-more-btn" onClick={openModal} aria-label="عرض المزيد">عرض المزيد</button>
        </div>
        {purchased.length === 0 ? (
          <div className="fav-empty">لا توجد دورات مشتراة حالياً.</div>
        ) : (
          <div className="fav-top-grid">
            {purchased.slice(0, 3).map((course) => (
              <div key={course.id} className="fav-item-wrapper grid-item">
                <button
                  className="fav-remove-btn"
                  aria-label="إزالة من المفضلة"
                  onClick={() => removePurchased(course.id)}
                  title="إزالة من المفضلة"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <CourseGrid courses={[course]} showAll={true} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal: 9 purchased courses */}
      {isModalOpen && (
        <div className="fav-modal-overlay" role="dialog" aria-modal="true" aria-label="الدورات المشتراة">
          <div className="fav-modal">
            <div className="fav-modal-header">
              <h3 className="fav-modal-title">الدورات المشتراة</h3>
              <button className="fav-close-btn" onClick={closeModal} aria-label="إغلاق">×</button>
            </div>
            <div className="fav-modal-grid">
              {purchased.slice(0, 9).map((course) => (
                <div key={course.id} className="fav-item-wrapper grid-item">
                  <button
                    className="fav-remove-btn"
                    aria-label="إزالة من المفضلة"
                    onClick={() => removePurchased(course.id)}
                    title="إزالة من المفضلة"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <CourseGrid courses={[course]} showAll={true} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Grid: unpurchased courses with price/enroll */}
      <div className="fav-bottom">
        <div className="fav-top-actions">
          <h2 className="fav-section-title">الدورات غير المشتراة</h2>
          <button className="fav-more-btn" onClick={openUnpurchasedModal} aria-label="عرض المزيد">عرض المزيد</button>
        </div>
        {unpurchased.length === 0 ? (
          <div className="fav-empty">لا توجد دورات غير مشتراة حالياً.</div>
        ) : (
          <div className="fav-top-grid">
            {unpurchased.slice(0, 3).map((card) => (
              <div key={card.id} className="fav-item-wrapper card-item">
                <button
                  className="fav-remove-btn"
                  aria-label="إزالة من المفضلة"
                  onClick={() => removeUnpurchased(card.id)}
                  title="إزالة من المفضلة"
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                <CourseCard {...card} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popup Modal for Unpurchased Courses */}
      {isUnpurchasedModalOpen && (
        <div className="fav-modal-overlay" role="dialog" aria-modal="true" aria-label="الدورات غير المشتراة">
          <div className="fav-modal">
            <div className="fav-modal-header">
              <h3 className="fav-modal-title">الدورات غير المشتراة</h3>
              <button className="fav-close-btn" onClick={closeUnpurchasedModal} aria-label="إغلاق">×</button>
            </div>
            <div className="fav-modal-grid">
              {unpurchased.map((card) => (
                <div key={card.id} className="fav-item-wrapper card-item">
                  <button
                    className="fav-remove-btn"
                    aria-label="إزالة من المفضلة"
                    onClick={() => removeUnpurchased(card.id)}
                    title="إزالة من المفضلة"
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18.01 4 20 6 20 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                  <CourseCard {...card} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}