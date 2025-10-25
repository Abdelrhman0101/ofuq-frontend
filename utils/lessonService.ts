import apiClient from './apiClient';

// Interface for lesson data structure
export interface Lesson {
  id: number;
  title: string;
  description?: string;
  content?: string;
  order: number;
  chapter_id: number;
  video_url?: string;
  is_visible?: boolean;
  attachments?: any;
  resources?: any;
  created_at?: string;
  updated_at?: string;
  // --- (تم الإلغاء) ---
  // تم إلغاء الاختبارات المرتبطة بالدرس
  // quiz?: { ... };
  // أضفنا تعريفًا اختياريًا لدعم إدارة أسئلة الدرس في لوحة الإدارة
  quiz?: {
    id: number;
    title?: string;
    questions?: any[];
  };
}

// Interface for creating a new lesson
export interface CreateLessonData {
  title: string;
  description?: string;
  content?: string;
  order: number;
  is_visible?: boolean;
  [key: string]: any;
}

// Interface for API response
interface CreateLessonResponse {
  data: Lesson;
  message: string;
  success: boolean;
}

// Interface for updating lesson data
export interface UpdateLessonData {
  title?: string;
  description?: string;
  content?: string;
  order?: number;
  video_url?: string | null;
  is_visible?: boolean;
  attachments?: any;
  resources?: any;
  chapter_id?: number;
  // دعم تحديث الاختبار مدمج ضمن تحديث الدرس بحسب الباك إند
  quiz?: {
    title?: string;
    delete?: boolean;
    questions?: Array<{
      question: string;
      type?: string;
      options?: string[];
      correct_answer?: string | number | number[];
      points?: number;
      explanation?: string | null;
    }>;
  };
}

interface UpdateLessonResponse {
  data: Lesson;
  message: string;
  success: boolean;
}

/**
 * [Admin] إنشاء درس جديد لفصل معين
 */
export const createLesson = async (chapterId: number, lessonData: CreateLessonData): Promise<Lesson> => {
  try {
    console.log(`[CreateLesson] Sending request to /admin/chapters/${chapterId}/lessons`, lessonData);
    
    const payload = { ...lessonData, is_visible: lessonData.is_visible ?? true };
    const response = await apiClient.post<CreateLessonResponse>(`/admin/chapters/${chapterId}/lessons`, payload);
    
    console.log('[CreateLesson] API Response:', response.data);
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    
    let message = 'فشل في إنشاء الدرس';
    
    if (error.response) {
      if (error.response.status === 422 && error.response.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        message = `خطأ في البيانات: ${errorMessages.join(', ')}`;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `خطأ في الخادم: ${error.response.status}`;
      }
    } else if (error.request) {
      message = 'فشل في الاتصال بالخادم';
    }
    
    throw new Error(message);
  }
};

/**
 * [User] جلب تفاصيل الدرس للمستخدم
 */
export const getUserLesson = async (
  lessonId: number | string
): Promise<{ lesson: Lesson; progress: { status: string; started_at?: string; completed_at?: string } }> => {
  try {
    const response = await apiClient.get(`/lessons/${lessonId}`);
    const data = response.data || {};
    return {
      lesson: data.lesson,
      progress: data.progress || { status: 'not_started' }
    };
  } catch (error: any) {
    console.error('Error fetching user lesson:', error);
    let message = 'فشل في تحميل بيانات الدرس';
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
};

/**
 * [Admin] تحديث درس موجود
 */
export const updateLesson = async (lessonId: number, lessonData: UpdateLessonData): Promise<Lesson> => {
  try {
    console.log(`[UpdateLesson] Sending request to /admin/lessons/${lessonId}`, lessonData);
    
    const response = await apiClient.put<UpdateLessonResponse>(`/admin/lessons/${lessonId}`, lessonData);
    
    console.log('[UpdateLesson] API Response:', response.data);
    
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    
    let message = 'فشل في تحديث الدرس';
    
    if (error.response) {
      if (error.response.status === 422 && error.response.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        message = `خطأ في البيانات: ${errorMessages.join(', ')}`;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `خطأ في الخادم: ${error.response.status}`;
      }
    } else if (error.request) {
      message = 'فشل في الاتصال بالخادم';
    }
    
    throw new Error(message);
  }
};

/**
 * [User] وضع علامة إكمال للدرس للمستخدم الحالي
 */
export const completeLesson = async (
  lessonId: number | string
): Promise<{ status: string; completed_at?: string }> => {
  try {
    const response = await apiClient.post(`/lessons/${lessonId}/complete`);
    const data = response.data || {};
    return data?.progress || { status: 'completed', completed_at: data?.completed_at };
  } catch (error: any) {
    console.error('Error completing lesson:', error);
    let message = 'فشل في إكمال الدرس';
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
};

/**
 * [Admin] تحديث درس (تكرار لـ updateLesson، يمكن دمجها)
 */
export const updateLessonAdmin = async (lessonId: number, data: UpdateLessonData): Promise<Lesson> => {
  // هذه الدالة تكرار لـ updateLesson، يمكن استخدام updateLesson بدلاً منها
  return updateLesson(lessonId, data);
};

/**
 * [Admin] حذف درس
 */
export const deleteLessonAdmin = async (lessonId: number): Promise<void> => {
  try {
    console.log(`[DeleteLessonAdmin] DELETE /admin/lessons/${lessonId}`);
    await apiClient.delete(`/admin/lessons/${lessonId}`);
  } catch (error: any) {
    console.error('Error deleting lesson:', error);
    let message = 'فشل في حذف الدرس';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
};

/**
 * [Admin] جلب دروس فصل معين
 */
export const getChapterLessons = async (chapterId: number): Promise<Lesson[]> => {
  try {
    const res = await apiClient.get(`/admin/chapters/${chapterId}/lessons`);
    const data = (res as any)?.data?.data ?? (res as any)?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    throw new Error(err?.message || 'فشل في جلب الدروس');
}
};