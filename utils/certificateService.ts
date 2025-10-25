'use client';

import apiClient from './apiClient';

/**
 * واجهة شهادة الدبلومة (الجديدة)
 * بناءً على ملفات التصميم
 */
export interface DiplomaCertificate {
  id: number;
  uuid: string;         // معرف التحقق الفريد
  diploma_name: string; // اسم الدبلومة (سياتي من الباك اند)
  user_name: string;    // اسم الطالب (سياتي من الباك اند)
  issued_at: string;    // تاريخ الإصدار
  file_path: string;    // المسار الكامل لملف PDF
  qr_path: string;      // المسار الكامل لصورة QR Code
}

/**
 * واجهة البيانات التي تعود من صفحة التحقق العامة
 */
export interface VerifiedCertificateData {
  user_name: string;
  diploma_name: string;
  issued_at: string;
  status: 'Valid' | 'Invalid'; // حالة الشهادة
}

/**
 * [User] جلب شهادات الدبلومة الخاصة بالمستخدم
 * (نفترض أن الباك اند سيحدّث هذا الـ endpoint ليعيد شهادات الدبلومات)
 */
export async function getMyCertificates(): Promise<DiplomaCertificate[]> {
  try {
    const res = await apiClient.get('/my-certificates');
    const data = res.data;
    const list = Array.isArray(data?.certificates)
      ? data.certificates
      : Array.isArray(data?.data?.certificates)
      ? data.data.certificates
      : [];

    // تحويل البيانات (إذا لزم الأمر) أو الاعتماد على الباك اند لإرسال الشكل الجديد
    return list.map((cert: any) => ({
      id: cert.id,
      uuid: cert.uuid || cert.verification_token, // الحقل الجديد
      diploma_name: cert.diploma_name || cert.course_title, // اسم الدبلومة
      user_name: cert.user_name || 'اسم الطالب', // يجب أن يوفره الباك اند
      issued_at: cert.issued_at || cert.completion_date,
      file_path: cert.file_path || cert.download_url, // الحقل الجديد
      qr_path: cert.qr_path || '', // الحقل الجديد
    }));
  } catch (error: any) {
    console.error('Error fetching my certificates:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب الشهادات');
  }
}

/**
 * [Public] التحقق من شهادة عبر الـ UUID
 * (Endpoint جديد بناءً على ملفات التصميم)
 */
export async function verifyCertificate(uuid: string): Promise<VerifiedCertificateData> {
  try {
    // هذا endpoint عام ولا يتطلب مصادقة
    const res = await apiClient.get(`/api/certificates/verify/${uuid}`);
    const data = res.data?.data ?? res.data;
    
    if (!data || !data.user_name) {
      throw new Error('بيانات التحقق غير صالحة');
    }

    // إرجاع البيانات لعرضها في صفحة التحقق
    return {
      user_name: data.user_name,
      diploma_name: data.diploma_name,
      issued_at: data.issued_at,
      status: 'Valid',
    };
  } catch (error: any) {
    console.error('Error verifying certificate:', error);
    // إرجاع حالة "غير صالح" ليتم التعامل معها في الواجهة
    return {
      user_name: '',
      diploma_name: '',
      issued_at: '',
      status: 'Invalid',
    };
  }
}

/**
 * [Helper] بناء رابط صفحة التحقق (للاستخدام في الفرونت إند)
 */
export function getVerificationUrl(uuid: string): string {
  if (!uuid) return '';
  if (uuid.startsWith('http')) return uuid; // لو كان رابط كامل بالفعل
  return `/certificate/verify/${uuid}`; // المسار داخل تطبيق الفرونت
}

/**
 * [Helper] جلب رابط تحميل الشهادة (PDF)
 */
export function getDownloadUrl(filePath: string): string {
  // نفترض أن file_path هو رابط كامل يرسله الباك اند
  return filePath || '';
}