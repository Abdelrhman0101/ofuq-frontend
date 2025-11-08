'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminDiplomasQuestionBank.module.css';
import apiClient from '@/utils/apiClient';

interface CourseItem {
  id: number;
  title: string;
  is_published?: boolean;
  status?: string;
  instructor?: { id: number; name: string } | null;
  category?: { id: number; name: string } | null;
}

interface PaginationInfo {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export default function AdminCoursesQuestionBankPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [perPage, setPerPage] = useState<number>(10);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get<any>('/admin/courses', {
        params: { search: search || undefined, page, per_page: perPage },
      });
      const payload = res?.data ?? {};
      const items: any[] = Array.isArray(payload?.data) ? payload.data : [];
      const pg: PaginationInfo | null = payload?.pagination ?? null;

      const resolveText = (value: any): string => {
        if (value == null) return '';
        if (typeof value === 'string' || typeof value === 'number') return String(value);
        if (typeof value === 'object') {
          const candidates = [value.name, value.title, value.ar, value.en, value.slug];
          for (const v of candidates) {
            if (typeof v === 'string' || typeof v === 'number') return String(v);
          }
          if ('id' in value) return String((value as any).id);
        }
        return '';
      };

      const mapped: CourseItem[] = items.map((c: any) => ({
        id: Number(c.id),
        title: String(c.title ?? ''),
        is_published: Boolean(
          c.is_published === true || c.is_published === 1 || c.is_published === '1' || String(c.status ?? '').toLowerCase() === 'published'
        ),
        status: String(c.status ?? ''),
        instructor: c.instructor ? { id: Number(c.instructor.id ?? 0), name: resolveText(c.instructor?.name ?? c.instructor?.title ?? c.instructor) } : null,
        category: c.category ? { id: Number(c.category.id ?? 0), name: resolveText(c.category?.name ?? c.category?.title ?? c.category) } : null,
      }));

      setCourses(mapped);
      setPagination(pg);
      setError(null);
    } catch (err: any) {
      setError(err?.message || 'حدث خطأ أثناء جلب المقررات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, perPage]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCourses();
  };

  const handleManage = (courseId: number) => {
    router.push(`/admin/courses/${courseId}/question-bank`);
  };

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => (pagination ? Math.min(pagination.last_page, p + 1) : p + 1));

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>إدارة بنك الأسئلة - المقررات</div>
        <form className={styles.searchBar} onSubmit={onSearchSubmit} dir="rtl">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن مقرر..."
            className={styles.searchInput}
          />
          <select className={styles.perPageSelect} value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <button type="submit" className={styles.primaryBtn}>
            بحث
          </button>
        </form>
      </div>

      {loading && <div className={styles.message}>جاري التحميل...</div>}
      {error && <div className={styles.error}>⚠️ {error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>المعرف</th>
                <th className={styles.th}>اسم المقرر</th>
                <th className={styles.th}>المحاضر</th>
                <th className={styles.th}>الدبلومة</th>
                <th className={styles.th}>الحالة</th>
                <th className={styles.th}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className={styles.row}>
                  <td className={styles.td}>{c.id}</td>
                  <td className={styles.td}>{c.title}</td>
                  <td className={styles.td}>{c.instructor?.name ?? '—'}</td>
                  <td className={styles.td}>{c.category?.name ?? '—'}</td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${c.is_published ? styles.statusPublished : styles.statusDraft}`}>
                      {c.is_published ? 'منشورة' : 'مسودة'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button className={styles.primaryBtn} onClick={() => handleManage(c.id)}>
                      إدارة بنك الأسئلة
                    </button>
                  </td>
                </tr>
              ))}

              {courses.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={6}>
                    لا توجد مقررات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {pagination && (
            <div className={styles.pagination} dir="rtl">
              <button className={styles.pageButton} onClick={goPrev} disabled={page <= 1}>
                السابق
              </button>
              <span className={styles.pageInfo}>
                الصفحة {page} من {pagination.last_page} — إجمالي: {pagination.total}
              </span>
              <button className={styles.pageButton} onClick={goNext} disabled={page >= pagination.last_page}>
                التالي
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}