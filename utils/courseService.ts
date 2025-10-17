import apiClient from './apiClient';

// ... (الواجهات Interfaces تبقى كما هي)
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor_id: number;
  category_id: number;
  cover_image?: string;
  video_url?: string | null;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  // Optional fields returned by various endpoints and used in UI components
  duration?: number;
  chapters_count?: number;
  rating?: number | string;
  students_count?: number;
  reviews_count?: number;
  average_rating?: number;
  instructor?: {
    id: number;
    name: string;
    title: string;
    bio?: string;
    image?: string;
    rating?: number;
  };
  category?: {
    id: number;
    name: string;
  };
  // Loaded on course details: nested chapters and lessons
  chapters?: Array<{
    id: number;
    title: string;
    order?: number;
    lessons_count?: number;
    lessons?: Array<{
      id: number;
      title: string;
      order?: number;
      content?: string;
      video_url?: string | null;
      is_visible?: boolean;
    }>;
  }>;
}

interface CourseResponse {
  data: Course;
  message: string;
}

/**
 * Create a new course with chapters and lessons
 */
export const createCourse = async (courseData: any): Promise<Course> => {
  console.log("Attempting to create course...");
  
  // Check authentication status
  const token = localStorage.getItem('auth_token');
  console.log("🔍 Auth token exists:", !!token);
  console.log("🔍 Auth token (first 20 chars):", token ? token.substring(0, 20) + '...' : 'null');
  
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all course data to FormData
    Object.keys(courseData).forEach(key => {
      if (key === 'chaptersData') {
        // Handle chapters data as JSON string
        formData.append('chapters', JSON.stringify(courseData[key]));
      } else if (key === 'coverImage' && courseData[key] instanceof File) {
        // Handle file upload
        formData.append('cover_image', courseData[key]);
      } else if (courseData[key] !== null && courseData[key] !== undefined) {
        // Handle boolean fields properly
        if (key === 'is_published' || key === 'is_free') {
          formData.append(key, courseData[key] ? '1' : '0');
        } else {
          // Handle other data
          formData.append(key, courseData[key].toString());
        }
      }
    });

    console.log("🔍 FormData contents:");
    // Use Array.from to convert FormData entries to array for iteration
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    
    const response = await apiClient.post<CourseResponse>('/admin/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Success log
    console.log("✅ API call successful! Raw response:", response);

    if (response.data && response.data.data) {
      console.log("Course created successfully on backend. Returning data:", response.data.data);
      return response.data.data;
    } else {
      // This case should not happen, but we log it for safety
      console.error("❌ API reported success, but response format is unexpected:", response.data);
      throw new Error('API response was successful but improperly formatted.');
    }

  } catch (error: any) {
    // Failure log
    console.error("❌ API call failed! Full error object:", error);

    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
    }

    if (error.response && error.response.status === 422) {
      // This is a validation error from Laravel
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat().join('\n');
      throw new Error(`خطأ في البيانات:\n${errorMessages}`);
    }

    // Re-throw the error to be caught by the component
    throw new Error('Failed to create course. See console for details.');
  }
};

/**
 * Fetch all courses from the backend
 */
export const getCourses = async (): Promise<Course[]> => {
  try {
    // ✅ تم التعديل هنا: الرد المتوقع هو كائن يحتوي على مفتاح data
    const response = await apiClient.get<{ data: Course[] }>('/admin/courses');
    
    // ✅ تم التعديل هنا: نقوم بإرجاع قائمة الكورسات مباشرة من response.data.data
    // الباك ايند يرسل { success: true, data: [...] }
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.error('Unexpected API response structure:', response.data);
    return []; // إرجاع مصفوفة فارغة في حالة وجود هيكل غير متوقع
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }
};

/**
 * Update an existing course
 */
export const updateCourse = async (id: number, courseData: FormData): Promise<Course> => {
  try {
    // ✅ تم التعديل هنا: لإرسال FormData مع PUT/PATCH, نستخدم POST مع حقل _method
    courseData.append('_method', 'PUT');
    
    const response = await apiClient.post<CourseResponse>(`/admin/courses/${id}`, courseData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw new Error('Failed to update course');
  }
};

/**
 * Delete a course
 */
export const deleteCourse = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/courses/${id}`);
  } catch (error) {
    console.error('Error deleting course:', error);
    throw new Error('Failed to delete course');
  }
};

/**
 * Fetch featured courses from the public API (no authentication required)
 */
export const getFeaturedCourses = async (): Promise<Course[]> => {
  try {
    const response = await apiClient.get<{ data: any[] }>('/courses/featured');
    
    if (response.data && Array.isArray(response.data.data)) {
      // Transform the nested structure to flat Course objects
      return response.data.data.map((item: any) => ({
        id: item.course.id,
        title: item.course.title,
        description: item.course.description,
        price: parseFloat(item.course.price),
        instructor_id: item.course.instructor_id,
        category_id: item.course.category_id,
        cover_image: item.course.cover_image,
        is_free: item.course.is_free,
        status: item.course.status,
        created_at: item.course.created_at,
        updated_at: item.course.updated_at,
        instructor: item.course.instructor,
        category: item.course.category,
        // Add missing fields for CourseCard compatibility
        rating: item.course.rating || '4.5',
        duration: item.course.duration || 30,
        chapters_count: item.course.chapters_count || 0,
        students_count: item.course.students_count || 0
      }));
    }
    
    console.error('Unexpected API response structure for featured courses:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    throw new Error('Failed to fetch featured courses');
  }
};

/**
 * Fetch all courses from the public API (no authentication required)
 */
export const getAllCourses = async (params?: {
  search?: string;
  category?: string;
  sort?: string;
  per_page?: number;
}): Promise<Course[]> => {
  try {
    const response = await apiClient.get<{ data: Course[] }>('/allCourses', { params });
    
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    console.error('Unexpected API response structure for all courses:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw new Error('Failed to fetch all courses');
  }
};

/**
 * Fetch single course details from the public API (no authentication required)
 */
export const getCourseDetails = async (courseId: string | number): Promise<Course | null> => {
  try {
    const response = await apiClient.get<{ data: Course }>(`/course/${courseId}`);
    
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    console.error('Unexpected API response structure for course details:', response.data);
    return null;
  } catch (error) {
    console.error('Error fetching course details:', error);
    throw new Error('Failed to fetch course details');
  }
};

/**
 * Enroll current authenticated user in a course
 * Authorization header is handled by apiClient interceptor
 */
export const enrollCourse = async (courseId: number | string): Promise<any> => {
  try {
    const response = await apiClient.post(`/courses/${courseId}/enroll`, {});
    return response.data;
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    let message = 'فشل في الاشتراك بالكورس';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
};

/**
 * Get IDs of courses the current user is enrolled in
 */
export const getMyEnrollments = async (): Promise<number[]> => {
  try {
    const response = await apiClient.get<any>(`/my-enrollments`);

    const payload = response.data;

    // Normalize to array of items
    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload)
      ? payload
      : [];

    const ids: number[] = items
      .map((item: any) => {
        if (item?.course?.id) return Number(item.course.id);
        if (item?.id && item?.title) return Number(item.id);
        if (item?.course_id) return Number(item.course_id);
        return undefined;
      })
      .filter((v: any) => typeof v === 'number');

    return ids;
  } catch (error: any) {
    console.error('Error fetching my enrollments:', error);
    let message = 'فشل في جلب اشتراكات المستخدم';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
};

/**
 * Get enrolled courses for current user (full course objects)
 * Returns array of CourseResource-like objects
 */
export const getMyEnrolledCourses = async (): Promise<Course[]> => {
  try {
    const response = await apiClient.get<any>(`/my-enrollments`);
    const payload = response.data;

    // Extract list regardless of wrapping style
    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.data?.data)
      ? payload.data.data
      : Array.isArray(payload)
      ? payload
      : [];

    // Normalize to Course objects (handle nested {course})
    const courses: Course[] = items.map((item: any) => {
      const c = item?.course ?? item;
      return {
        id: Number(c.id),
        title: String(c.title ?? ''),
        description: String(c.description ?? ''),
        price: Number(c.price ?? 0),
        instructor_id: Number(c.instructor_id ?? c?.instructor?.id ?? 0),
        category_id: Number(c.category_id ?? c?.category?.id ?? 0),
        cover_image: c.cover_image ?? c.cover_image_url ?? undefined,
        is_free: Boolean(c.is_free),
        status: (c.status ?? 'published') as 'draft' | 'published' | 'archived',
        created_at: c.created_at,
        updated_at: c.updated_at,
        instructor: c.instructor
          ? {
              id: Number(c.instructor.id ?? 0),
              name: String(c.instructor.name ?? ''),
              title: String(c.instructor.title ?? ''),
              bio: c.instructor.bio ?? undefined,
              image: c.instructor.image ?? c.image_instructor_url ?? undefined,
              rating: c.instructor.rating ?? c.instructor.avg_rate ?? undefined,
            }
          : undefined,
        category: c.category
          ? { id: Number(c.category.id ?? 0), name: String(c.category.name ?? '') }
          : c.category || c.category_id
          ? { id: Number(c.category_id ?? 0), name: String(c.category ?? '') }
          : undefined,
      };
    });

    return courses;
  } catch (error: any) {
    console.error('Error fetching enrolled courses:', error);
    let message = 'فشل في جلب كورسات المستخدم المسجلة';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    }
    throw new Error(message);
  }
};

/**
 * Get overall course progress percentage for the current user
 */
export const getCourseProgress = async (
  courseId: number | string
): Promise<number> => {
  try {
    const response = await apiClient.get<any>(`/courses/${courseId}/progress`);
    const overall = response?.data?.course_progress?.overall_progress;
    if (typeof overall === 'number') return overall;
    return Number(overall ?? 0);
  } catch (error: any) {
    console.error('Error fetching course progress:', error);
    // If 403 (not enrolled) or other issue, fallback to 0
    return 0;
  }
};

/**
 * Favorite Courses API
 */
export const getMyFavoriteCourses = async (): Promise<Course[]> => {
  try {
    const res = await apiClient.get<any>('/user/favorite-courses');
    const payload = res?.data;

    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
      ? payload
      : [];

    return items.map((c: any) => ({
      id: Number(c.id),
      title: String(c.title ?? ''),
      description: String(c.description ?? ''),
      price: Number(c.price ?? 0),
      instructor_id: Number(c.instructor_id ?? 0),
      category_id: Number(c.category_id ?? 0),
      cover_image: c.cover_image_url ?? c.cover_image ?? undefined,
      is_free: Boolean(c.is_free),
      status: (c.status ?? 'published') as 'draft' | 'published' | 'archived',
      created_at: c.created_at,
      updated_at: c.updated_at,
      instructor: c.instructor
        ? {
            id: Number(c.instructor.id ?? 0),
            name: String(c.instructor.name ?? ''),
            title: String(c.instructor.title ?? ''),
            bio: c.instructor.bio ?? undefined,
            image: c.instructor.image ?? undefined,
            rating: c.instructor.rating ?? c.instructor.avg_rate ?? undefined,
          }
        : (c.name_instructor || c.image_instructor)
        ? {
            id: Number(c.instructor_id ?? 0),
            name: String(c.name_instructor ?? ''),
            title: String(c.title_instructor ?? ''),
            bio: c.bio_instructor ?? undefined,
            image: c.image_instructor ?? undefined,
            rating: c.avg_rate ?? undefined,
          }
        : undefined,
      category: c.category
        ? { id: Number(c.category.id ?? 0), name: String(c.category.name ?? '') }
        : c.category || c.category_id
        ? { id: Number(c.category_id ?? 0), name: String(c.category ?? '') }
        : undefined,
    }));
  } catch (error: any) {
    console.error('Error fetching favorite courses:', error);
    throw new Error(error?.response?.data?.message ?? 'فشل في جلب المفضلة');
  }
};

export const addCourseToFavorites = async (courseId: number | string): Promise<boolean> => {
  try {
    await apiClient.post(`/user/favorite-courses/${courseId}`);
    return true;
  } catch (error: any) {
    console.error('Error adding course to favorites:', error);
    return false;
  }
};

export const removeCourseFromFavorites = async (courseId: number | string): Promise<boolean> => {
  try {
    await apiClient.delete(`/user/favorite-courses/${courseId}`);
    return true;
  } catch (error: any) {
    console.error('Error removing course from favorites:', error);
    return false;
  }
};

export const getMyFavoriteCourseIds = async (): Promise<number[]> => {
  try {
    const favorites = await getMyFavoriteCourses();
    return favorites.map((c) => Number(c.id)).filter((id) => !isNaN(id));
  } catch (error) {
    console.error('Error fetching favorite course ids:', error);
    return [];
  }
};