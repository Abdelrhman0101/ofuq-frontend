import apiClient from './apiClient';

// Interface for chapter data structure
export interface Chapter {
  id: number;
  title: string;
  description?: string;
  order: number;
  course_id: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for creating a new chapter
export interface CreateChapterData {
  title: string;
  description?: string;
  order: number;
}

// Interface for API response
interface CreateChapterResponse {
  data: Chapter;
  message: string;
  success: boolean;
}

/**
 * Create a new chapter for a specific course
 * @param courseId - The ID of the course to add the chapter to
 * @param chapterData - The chapter data (title, description, order)
 * @returns Promise<Chapter> - The newly created chapter with database ID
 */
export const createChapter = async (courseId: number, chapterData: CreateChapterData): Promise<Chapter> => {
  try {
    console.log(`[CreateChapter] Sending request to /admin/courses/${courseId}/chapters`, chapterData);
    
    const response = await apiClient.post<CreateChapterResponse>(`/admin/courses/${courseId}/chapters`, chapterData);
    
    console.log('[CreateChapter] API Response:', response.data);
    
    // Return the newly created chapter from the API response
    return response.data.data;
  } catch (error: any) {
    console.error('Error creating chapter:', error);
    
    let message = 'فشل في إنشاء الفصل';
    
    if (error.response) {
      if (error.response.status === 422 && error.response.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        message = errorMessages.join(', ');
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `HTTP ${error.response.status}: ${JSON.stringify(error.response.data).slice(0, 200)}`;
      }
    }
    
    throw new Error(message);
  }
};