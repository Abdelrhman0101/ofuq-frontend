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
  video_url?: string;
  is_visible?: boolean;
  [key: string]: any;
}

// Interface for update API response
interface UpdateLessonResponse {
  data: Lesson;
  message: string;
  success: boolean;
}

/**
 * Create a new lesson for a specific chapter
 * @param chapterId - The ID of the chapter to add the lesson to
 * @param lessonData - The lesson data (title, description, order, etc.)
 * @returns Promise<Lesson> - The newly created lesson with database ID
 */
export const createLesson = async (chapterId: number, lessonData: CreateLessonData): Promise<Lesson> => {
  try {
    console.log(`[CreateLesson] Sending request to /admin/chapters/${chapterId}/lessons`, lessonData);
    
    const response = await apiClient.post<CreateLessonResponse>(`/admin/chapters/${chapterId}/lessons`, lessonData);
    
    console.log('[CreateLesson] API Response:', response.data);
    
    // Return the newly created lesson from the API response
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating lesson:', error);
    
    let message = 'فشل في إنشاء الدرس';
    
    if (error.response) {
      if (error.response.status === 422 && error.response.data?.errors) {
        // Validation errors
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
 * Get user-accessible lesson details and progress (protected endpoint)
 * @param lessonId - The lesson ID to fetch
 * @returns Promise<{ lesson: Lesson; progress: { status: string; started_at?: string; completed_at?: string } }>
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
 * Update an existing lesson
 * @param lessonId - The ID of the lesson to update
 * @param lessonData - The lesson data to update (title, description, video_url, is_visible, etc.)
 * @returns Promise<Lesson> - The updated lesson object
 */
export const updateLesson = async (lessonId: number, lessonData: UpdateLessonData): Promise<Lesson> => {
  try {
    console.log(`[UpdateLesson] Sending request to /admin/lessons/${lessonId}`, lessonData);
    
    const response = await apiClient.put<UpdateLessonResponse>(`/admin/lessons/${lessonId}`, lessonData);
    
    console.log('[UpdateLesson] API Response:', response.data);
    
    // Return the updated lesson from the API response
    return response.data.data;
  } catch (error: any) {
    console.error('Error updating lesson:', error);
    
    let message = 'فشل في تحديث الدرس';
    
    if (error.response) {
      if (error.response.status === 422 && error.response.data?.errors) {
        // Validation errors
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