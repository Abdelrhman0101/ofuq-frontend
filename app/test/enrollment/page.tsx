'use client';

import React, { useState } from 'react';
import '../../../styles/dashboard.css';
import EnrollmentInfoModal from '../../../components/EnrollmentInfoModal';
import { EnrollmentProfile } from '../../../utils/userService';

export default function EnrollmentTestPage() {
  const [open, setOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<EnrollmentProfile | null>(null);

  return (
    <div style={{ padding: 20 }} dir="rtl">
      <h2 style={{ marginBottom: 12 }}>اختبار مودال معلومات الالتحاق</h2>
      <p style={{ marginBottom: 20 }}>
        هذا مجرد صفحة اختبار لعرض المودال. قد تحتاج لتسجيل الدخول حتى تعمل جلب/حفظ البيانات.
      </p>

      <button className="btn" onClick={() => setOpen(true)} style={{ padding: '10px 16px' }}>
        فتح مودال الالتحاق
      </button>

      {lastSaved && (
        <div style={{ marginTop: 16, background: '#f8f9fa', padding: 12, borderRadius: 8 }}>
          <strong>آخر حفظ:</strong>
          <div>المؤهل: {lastSaved.qualification || '-'}</div>
          <div>قطاع العمل الإعلامي: {lastSaved.media_work_sector || '-'}</div>
          <div>تاريخ الميلاد: {lastSaved.date_of_birth || '-'}</div>
          <div>المجال السابق: {lastSaved.previous_field || '-'}</div>
        </div>
      )}

      <EnrollmentInfoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSubmit={(profile) => {
          setLastSaved(profile);
        }}
      />
    </div>
  );
}