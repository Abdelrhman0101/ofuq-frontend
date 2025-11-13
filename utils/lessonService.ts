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
  thumbnail?: string;
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

/**
 * [User] جلب بيانات تنقل الدرس (السابق/التالي وهل الحالي هو الأخير)
 */
export interface LessonNavigation {
  current_lesson_id: number;
  prev_lesson_id: number | null;
  next_lesson_id: number | null;
  last_lesson_id: number;
  is_last_lesson: boolean;
  is_next_last: boolean;
  finish_course_available?: boolean;
}

export const getLessonNavigation = async (
  lessonId: number | string
): Promise<LessonNavigation> => {
  try {
    const res = await apiClient.get<any>(`/lessons/${lessonId}/navigation`);
    const raw = res?.data;
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const data = payload?.data ?? payload ?? {};

    return {
      current_lesson_id: Number(data.current_lesson_id ?? lessonId),
      prev_lesson_id: data.prev_lesson_id != null ? Number(data.prev_lesson_id) : null,
      next_lesson_id: data.next_lesson_id != null ? Number(data.next_lesson_id) : null,
      last_lesson_id: Number(data.last_lesson_id ?? data.next_lesson_id ?? lessonId),
      is_last_lesson: Boolean(data.is_last_lesson ?? (data.next_lesson_id == null)),
      is_next_last: Boolean(data.is_next_last ?? false),
      finish_course_available: Boolean(data.finish_course_available ?? false),
    };
  } catch (error: any) {
    console.error('Error fetching lesson navigation:', error);
    throw new Error('فشل في جلب بيانات تنقل الدرس');
  }
};

/**
 * [User] جلب حالة مشاهدة الدرس للمستخدم الحالي
 * يعيد إحدى الحالات: 'completed' | 'in_progress' | 'not_enrolled'
 */
export type LessonWatchStatus = 'completed' | 'in_progress' | 'not_enrolled';

export const getLessonWatchStatus = async (
  lessonId: number | string
): Promise<LessonWatchStatus> => {
  try {
    console.log('[LessonWatchStatus][request]', { lessonId });
    const res = await apiClient.get<any>(`/lessons/${lessonId}/status`);
    const raw = res?.data;
    const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const statusRaw = String(payload?.status ?? '').trim();
    console.log('[LessonWatchStatus][response]', { lessonId, payload });
    if (statusRaw === 'completed' || statusRaw === 'in_progress' || statusRaw === 'not_enrolled') {
      return statusRaw as LessonWatchStatus;
    }
    // في حالة رد غير متوقع نعتبرها in_progress
    return 'in_progress';
  } catch (error: any) {
    // لا نكسر الواجهة؛ نعيد in_progress عند الأخطاء (مثل 401 أو فشل الشبكة)
    console.warn('[LessonWatchStatus][error]', { lessonId, error: error?.message || error });
    return 'in_progress';
  }
};