'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './AdminDiplomasQuestionBank.module.css';
import { getAdminCategories } from '@/utils/categoryService';

interface DiplomaItem {
  id: number;
  name: string;
  description?: string | null;
  price?: number | string;
  is_published?: boolean;
}

export default function AdminDiplomasQuestionBankPage() {
  const router = useRouter();
  const [diplomas, setDiplomas] = useState<DiplomaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiplomas = async () => {
      try {
        setLoading(true);
        const items = await getAdminCategories();
        const mapped = (items || []).map((c: any) => ({
          id: Number(c.id),
          name: String(c.name ?? ''),
          description: c.description ?? null,
          price: c.price,
          is_published: Boolean(c.is_published ?? c.published ?? false),
        }));
        setDiplomas(mapped);
        setError(null);
      } catch (err: any) {
        setError(err?.message || 'حدث خطأ أثناء جلب الدبلومات');
      } finally {
        setLoading(false);
      }
    };
    fetchDiplomas();
  }, []);

  const handleManage = (diplomaId: number) => {
    router.push(`/admin/diplomas/${diplomaId}/question-bank`);
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>إدارة بنك الأسئلة - الدبلومات</div>
      </div>

      {loading && <div className={styles.message}>جاري التحميل...</div>}
      {error && <div className={styles.error}>⚠️ {error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>المعرف</th>
                <th className={styles.th}>اسم الدبلومة</th>
                <th className={styles.th}>الحالة</th>
                <th className={styles.th}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {diplomas.map((d) => (
                <tr key={d.id} className={styles.row}>
                  <td className={styles.td}>{d.id}</td>
                  <td className={styles.td}>{d.name}</td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${d.is_published ? styles.statusPublished : styles.statusDraft}`}>
                      {d.is_published ? 'منشورة' : 'مسودة'}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <button className={styles.primaryBtn} onClick={() => handleManage(d.id)}>
                      إدارة بنك الأسئلة
                    </button>
                  </td>
                </tr>
              ))}

              {diplomas.length === 0 && (
                <tr>
                  <td className={styles.td} colSpan={4}>
                    لا توجد دبلومات حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}