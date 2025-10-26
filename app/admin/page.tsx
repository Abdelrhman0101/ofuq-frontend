'use client';

import React, { useEffect, useState } from 'react';
import { getAdminCategories } from '../../utils/categoryService';
import { getStudentsStatus, EnrolledDiplomaItem } from '../../utils/studentsService';

export default function AdminDashboard() {
  const [totalDiplomas, setTotalDiplomas] = useState<number>(0);
  const [publishedDiplomas, setPublishedDiplomas] = useState<number>(0);
  const [totalStudents, setTotalStudents] = useState<number>(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [categories, studentsResp] = await Promise.all([
          getAdminCategories(),
          getStudentsStatus(),
        ]);

        const students = studentsResp?.data ?? [];
        const stats = studentsResp?.stats;

        setTotalDiplomas(categories.length);
        setPublishedDiplomas(categories.filter((c) => c.is_published).length);
        setTotalStudents(stats?.total_students ?? students.length);

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const enrollments: EnrolledDiplomaItem[] = students.flatMap((s: any) => s.diplomas || []);
        const monthlySum = enrollments.reduce((sum, d) => {
          const enrolledAt = d.enrolled_at ? new Date(d.enrolled_at) : null;
          const sameMonth = enrolledAt
            ? enrolledAt.getMonth() === currentMonth && enrolledAt.getFullYear() === currentYear
            : false;
          const isPaid = !d.is_free && Number(d.price) > 0;
          const isActive = (d.status || '').toLowerCase() === 'active';
          return sameMonth && isPaid && isActive ? sum + Number(d.price) : sum;
        }, 0);

        setMonthlyRevenue(monthlySum);
        setError('');
      } catch (e: any) {
        console.error('Failed to load admin stats', e);
        setError(e?.message || 'تعذر جلب الإحصائيات من الباك ايند');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 0 }).format(value) + ' ج.م';
    } catch {
      return `${value} ج.م`;
    }
  };

  return (
    <>
      <div className="dashboard-header">
        <h1>لوحة التحكم الإدارية</h1>
        <p>مرحباً بك في لوحة التحكم الإدارية</p>
      </div>

      {error ? (
        <div className="dashboard-error">{error}</div>
      ) : null}

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>إجمالي الدبلومات</h3>
          <p className="stat-number">{loading ? '...' : totalDiplomas}</p>
        </div>
        <div className="stat-card">
          <h3>الطلاب المسجلين</h3>
          <p className="stat-number">{loading ? '...' : totalStudents}</p>
        </div>
        <div className="stat-card">
          <h3>الإيرادات الشهرية</h3>
          <p className="stat-number">{loading ? '...' : formatCurrency(monthlyRevenue)}</p>
        </div>
        <div className="stat-card">
          <h3>الدبلومات المنشورة</h3>
          <p className="stat-number">{loading ? '...' : publishedDiplomas}</p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>الإجراءات السريعة</h2>
        <div className="actions-grid">
          <a href="/admin/diplomas" className="action-card">
            <h3>إدارة الدبلومات</h3>
            <p>إضافة وتعديل الدبلومات</p>
          </a>
          <a href="/admin/students" className="action-card">
            <h3>إدارة الطلاب</h3>
            <p>عرض وإدارة الطلاب المسجلين</p>
          </a>
          {/* <a href="/admin/reports/financial" className="action-card">
            <h3>التقارير</h3>
            <p>عرض تقارير الأداء والإحصائيات</p>
          </a> */}
          <a href="/admin/profile-management" className="action-card">
            <h3>إدارة الملف الشخصي</h3>
            <p>إدارة معلومات المستخدم</p>
          </a>
        </div>
      </div>
    </>
  );
}