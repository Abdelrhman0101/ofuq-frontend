'use client';

import { Suspense } from 'react';
import BackupManager from '../../../components/BackupManager';

export default function DatabaseBackupsPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748', margin: 0 }}>
          النسخ الاحتياطية للبيانات
        </h1>
        <p style={{ color: '#718096', marginTop: '0.5rem' }}>
          إدارة النسخ الاحتياطية واسترجاع قاعدة البيانات عند الحاجة
        </p>
      </div>

      <Suspense fallback={<div>جاري التحميل...</div>}>
        <BackupManager />
      </Suspense>
    </div>
  );
}
