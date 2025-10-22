'use client';

import React from 'react';

export default function AdminDashboard() {
  return (
    <>
      <div className="dashboard-header">
        <h1>لوحة التحكم الإدارية</h1>
        <p>مرحباً بك في لوحة التحكم الإدارية</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>إجمالي المقررات</h3>
          <p className="stat-number">12</p>
        </div>
        <div className="stat-card">
          <h3>الطلاب المسجلين</h3>
          <p className="stat-number">245</p>
        </div>
        <div className="stat-card">
          <h3>الإيرادات الشهرية</h3>
          <p className="stat-number">15,000 ج.م</p>
        </div>
        <div className="stat-card">
          <h3>المقررات المنشورة</h3>
          <p className="stat-number">8</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>الإجراءات السريعة</h2>
        <div className="actions-grid">
          <a href="/admin/courses" className="action-card">
            <h3>إدارة المقررات</h3>
            <p>إضافة وتعديل المقررات</p>
          </a>
          <a href="/admin/students" className="action-card">
            <h3>إدارة الطلاب</h3>
            <p>عرض وإدارة الطلاب المسجلين</p>
          </a>
          <a href="/admin/reports/financial" className="action-card">
            <h3>التقارير</h3>
            <p>عرض تقارير الأداء والإحصائيات</p>
          </a>
          <a href="/admin/profile-management" className="action-card">
            <h3>إدارة الملف الشخصي</h3>
            <p>إدارة معلومات المستخدم</p>
          </a>
        </div>
      </div>
    </>
  );
}