// خدمة إدارة شهادات الدبلومات للأدمن - Admin Diploma Certificates Service
import apiClient from './apiClient';

// ---------------------------------------------------------------- //
// 1. الواجهات الأساسية (Interfaces)
// ---------------------------------------------------------------- //

/**
 * الطالب المستحق للشهادة
 */
export interface EligibleStudent {
  id: number;
  name: string;
  email: string;
  progress_percentage: number;
  final_exam_score?: number;
  completed_courses: number;
  total_courses: number;
  enrolled_at: string;
}

/**
 * الشهادة الصادرة
 */
export interface IssuedCertificate {
  id: number;
  uuid: string;
  student_name: string;
  student_email: string;
  serial_number: string;
  issued_at: string;
  file_url?: string;
  file_path?: string;
  diploma_name: string;
}

/**
 * استجابة جلب الطلاب المستحقين
 */
export interface EligibleStudentsResponse {
  data: EligibleStudent[];
  message?: string;
}

/**
 * استجابة جلب الشهادات الصادرة
 */
export interface IssuedCertificatesResponse {
  data: IssuedCertificate[];
  message?: string;
}

/**
 * استجابة إصدار الشهادة
 */
export interface IssueCertificateResponse {
  success: boolean;
  message: string;
  certificate?: IssuedCertificate;
}

// ---------------------------------------------------------------- //
// 2. دوال إدارة شهادات الدبلومات
// ---------------------------------------------------------------- //

/**
 * [Admin] جلب الطلاب المستحقين للشهادة في دبلومة معينة
 */
export const getEligibleStudents = async (diplomaId: number): Promise<EligibleStudent[]> => {
  try {
    console.log(`[GetEligibleStudents] Sending request to /admin/diplomas/${diplomaId}/eligible-students`);
    const response = await apiClient.get(`/admin/diplomas/${diplomaId}/eligible-students`);
    const result = response.data;
    
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }
    console.warn('[GetEligibleStudents] Unexpected response structure:', result);
    return [];
  } catch (error: any) {
    console.error('[GetEligibleStudents] Error:', error);
    const message = error.response?.data?.message || 'فشل في جلب الطلاب المستحقين';
    throw new Error(message);
  }
};

/**
 * [Admin] جلب الشهادات الصادرة لدبلومة معينة
 */
export const getIssuedCertificates = async (diplomaId: number): Promise<IssuedCertificate[]> => {
  try {
    console.log(`[GetIssuedCertificates] Sending request to /admin/diplomas/${diplomaId}/certificates`);
    const response = await apiClient.get(`/admin/diplomas/${diplomaId}/certificates`);
    const result = response.data;
    
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    }
    console.warn('[GetIssuedCertificates] Unexpected response structure:', result);
    return [];
  } catch (error: any) {
    console.error('[GetIssuedCertificates] Error:', error);
    const message = error.response?.data?.message || 'فشل في جلب الشهادات الصادرة';
    throw new Error(message);
  }
};

/**
 * [Admin] إصدار شهادة دبلومة لطالب معين
 */
export const issueDiplomaCertificate = async (
  diplomaId: number, 
  userId: number
): Promise<IssueCertificateResponse> => {
  try {
    console.log(`[IssueDiplomaCertificate] Sending request to /admin/diplomas/${diplomaId}/issue-certificates`);
    const response = await apiClient.post(`/admin/diplomas/${diplomaId}/issue-certificates`, {
      user_id: userId
    });
    
    const result = response.data;
    
    return {
      success: result.success ?? true,
      message: result.message || 'تم إصدار الشهادة بنجاح',
      certificate: result.certificate
    };
  } catch (error: any) {
    console.error('[IssueDiplomaCertificate] Error:', error);
    const message = error.response?.data?.message || 'فشل في إصدار الشهادة';
    throw new Error(message);
  }
};

/**
 * [Admin] تحميل ملف PDF الشهادة
 */
export const downloadCertificatePdf = (fileUrl: string): void => {
  if (!fileUrl) {
    throw new Error('رابط الملف غير متاح');
  }
  
  // إذا كان الرابط نسبيًا، نضيف BASE_URL
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${process.env.NEXT_PUBLIC_API_URL}${fileUrl}`;
  
  // فتح الرابط في نافذة جديدة لتنزيل الملف
  window.open(fullUrl, '_blank');
};

// Types are already exported above with 'export interface' declarations