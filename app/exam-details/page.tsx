'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ExamDetails from '../../components/ExamDetails';

function ExamDetailsContent() {
  const searchParams = useSearchParams();
  const courseName = searchParams.get('courseName') || 'اختبار أساسيات البرمجة';
  const completionPercentage = parseInt(searchParams.get('progress') || '75');

  return (
    <ExamDetails 
      onBack={() => window.history.back()}
      courseName={courseName}
      completionPercentage={completionPercentage}
    />
  );
}

export default function ExamDetailsPage() {
  return (
    <div>
      <Suspense fallback={<div>جاري التحميل...</div>}>
        <ExamDetailsContent />
      </Suspense>
    </div>
  );
}