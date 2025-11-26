import apiClient from './apiClient';

// ... (الواجهات Interfaces تبقى كما هي)
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  instructor_id: number;
  category_id: number; // معرف الدبلومة
  cover_image?: string;
  video_url?: string | null;
  is_free: boolean;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  // Optional fields
  duration?: number;
  chapters_count?: number;
  rating?: number | string;
  students_count?: number;
  reviews_count?: number;
  average_rating?: number;
  // ترتيب عرض الكورس في القوائم (اختياري)
  rank?: number | null;
  // تمت الإضافة: حالة النشر كقيمة منطقية لاستخدامها في لوحات الإدارة
  is_published?: boolean;
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
    title?: string;
    label?: string;
  };
  chapters?: Array<{
    id: number;
    title: string;
    // ... (باقي الحقول)
    lessons?: Array<{
      id: number;
      title: string;
      // ... (باقي الحقول)
    }>;
  }>;
}

interface CourseResponse {
  data: Course;
  message: string;
}

/**
 * [Admin] إنشاء كورس جديد
 */
export const createCourse = async (courseData: any): Promise<Course> => {
  console.log("Attempting to create course...");

  const token = localStorage.getItem('auth_token');
  console.log("🔍 Auth token exists:", !!token);

  try {
    // If a FormData was provided, use it directly; otherwise, build one
    const formData = courseData instanceof FormData ? courseData : new FormData();

    if (!(courseData instanceof FormData)) {
      Object.keys(courseData).forEach(key => {
        if (key === 'chaptersData') {
          formData.append('chapters', JSON.stringify(courseData[key]));
        } else if (key === 'coverImage' && courseData[key] instanceof File) {
          formData.append('cover_image', courseData[key]);
        } else if (key === 'isFree') {
          formData.append('is_free', courseData[key] ? '1' : '0');
        } else if (courseData[key] !== null && courseData[key] !== undefined) {
          if (key === 'is_published' || key === 'is_free') {
            formData.append(key, courseData[key] ? '1' : '0');
          } else {
            formData.append(key, courseData[key].toString());
          }
        }
      });
    }

    console.log("🔍 FormData contents:");
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });

    const response = await apiClient.post<CourseResponse>('/admin/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("✅ API call successful! Raw response:", response);

    if (response.data && response.data.data) {
      console.log("Course created successfully on backend. Returning data:", response.data.data);
      return response.data.data;
    } else {
      console.error("❌ API reported success, but response format is unexpected:", response.data);
      throw new Error('API response was successful but improperly formatted.');
    }

  } catch (error: any) {
    console.error("❌ API call failed! Full error object:", error);

    if (error.response) {
      console.error("Error Response Data:", error.response.data);
      console.error("Error Response Status:", error.response.status);
    }

    if (error.response && error.response.status === 422) {
      const errors = error.response.data.errors;
      const errorMessages = Object.values(errors).flat().join('\n');
      throw new Error(`خطأ في البيانات:\n${errorMessages}`);
    }

    throw new Error('Failed to create course. See console for details.');
  }
};

/**
 * [Admin] جلب جميع الكورسات
 */
export const getCourses = async (): Promise<Course[]> => {
  try {
    const response = await apiClient.get<{ data: Course[] }>(
      '/admin/courses',
      { params: { per_page: 1000 } }
    );
    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses');
  }
};

/**
 * [Admin] تحديث كورس
 */
export const updateCourse = async (id: number, courseData: FormData): Promise<Course> => {
  try {
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
 * [Admin] حذف كورس
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
 * [Public] جلب الكورسات المميزة
 */
export const getFeaturedCourses = async (): Promise<Course[]> => {
  try {
    const response = await apiClient.get<{ data: any[] }>('/courses/featured');

    if (response.data && Array.isArray(response.data.data)) {
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
 * [Public] جلب جميع الكورسات
 */
export const getAllCourses = async (params?: {
  search?: string;
  category?: string;
  sort?: string;
  per_page?: number;
}): Promise<Course[]> => {
  try {
    const response = await apiClient.get<any>('/allCourses', { params: { per_page: 1000, ...(params || {}) } });
    const payload = response?.data?.data?.data
      ?? response?.data?.data
      ?? response?.data
      ?? [];
    const items = Array.isArray(payload)
      ? payload
      : Array.isArray(response?.data?.data)
        ? response.data.data
        : [];

    return items.map((c: any) => ({
      id: Number(c.id),
      title: String(c.title ?? ''),
      description: String(c.description ?? ''),
      price: Number(c.price ?? 0),
      instructor_id: Number(c.instructor_id ?? c.instructor?.id ?? 0),
      category_id: Number(c.category_id ?? c.category?.id ?? 0),
      cover_image: c.cover_image_url ?? c.cover_image ?? undefined,
      is_free: Boolean(c.is_free),
      status: (c.status ?? 'published') as 'draft' | 'published' | 'archived',
      // تمت الإضافة: اشتقاق is_published من حقول متعددة لضمان الاتساق
      is_published: Boolean(
        c.is_published === true || c.is_published === 1 || c.is_published === '1' || (c.status && String(c.status).toLowerCase() === 'published')
      ),
      created_at: c.created_at,
      updated_at: c.updated_at,
      duration: Number(c.duration ?? 0),
      chapters_count: Number(c.chapters_count ?? 0),
      rating: c.rating ?? c.average_rating ?? undefined,
      students_count: c.students_count ?? undefined,
      reviews_count: c.reviews_count ?? undefined,
      average_rating: c.average_rating ?? undefined,
      instructor: c.instructor
        ? {
          id: Number(c.instructor.id ?? 0),
          name: String(c.instructor.name ?? ''),
          title: String(c.instructor.title ?? ''),
          bio: c.instructor.bio ?? undefined,
          image: c.instructor.image ?? undefined,
          rating: c.instructor.rating ?? c.instructor.avg_rate ?? undefined,
        }
        : undefined,
      category: c.category
        ? { id: Number(c.category.id ?? 0), name: String(c.category.name ?? '') }
        : (c.category || c.category_id)
          ? { id: Number(c.category_id ?? 0), name: String(c.category ?? '') }
          : undefined,
    }));
  } catch (error) {
    console.error('Error fetching all courses:', error);
    throw new Error('Failed to fetch all courses');
  }
};

/**
 * [Public] جلب تفاصيل كورس واحد
 */
export const getCourseDetails = async (courseId: string | number): Promise<Course | null> => {
  try {
    const response = await apiClient.get<{ data: Course }>(`/course/${courseId}`, { cacheTTL: 300 });

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
 * [User] جلب نسبة التقدم في الكورس
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
    return 0;
  }
};

/**
 * فحص صلاحية الوصول إلى محتوى الكورس عبر مسار الحماية الرسمي
 * يستخدم نفس المنطق المستخدم داخل عرض الدروس والاختبارات.
 * 200 → مسموح، 403 → غير مسجل بالدبلومة/الكورس، 401 → غير مصرح (غير مسجل دخولًا)
 */
export type CourseAccessResult = {
  allowed: boolean;
  reason?: 'forbidden' | 'unauthenticated';
  statusCode?: number;
  data?: any;
};

export const checkCourseAccess = async (
  courseId: number | string
): Promise<CourseAccessResult> => {
  try {
    const res = await apiClient.get<any>(`/courses/${courseId}/progress`);
    return { allowed: true, statusCode: 200, data: res?.data };
  } catch (error: any) {
    const status = error?.response?.status;
    if (status === 403) {
      return { allowed: false, reason: 'forbidden', statusCode: 403 };
    }
    if (status === 401) {
      return { allowed: false, reason: 'unauthenticated', statusCode: 401 };
    }
    throw error;
  }
};

export interface CourseProgressDetails {
  overall_progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | string;
  completed_at?: string | null;
  lessons: Array<{
    lesson_id: number;
    lesson_title: string;
    status: 'not_started' | 'in_progress' | 'completed' | string;
    started_at?: string | null;
    completed_at?: string | null;
    quiz_passed?: boolean;
  }>;
}

/**
 * [User] جلب تفاصيل التقدم في الكورس
 */
export const getCourseProgressDetails = async (
  courseId: number | string
): Promise<CourseProgressDetails | null> => {
  try {
    const response = await apiClient.get<any>(`/courses/${courseId}/progress`);
    const cp = response?.data?.course_progress;
    const details: CourseProgressDetails = {
      overall_progress: Number(cp?.overall_progress ?? 0),
      status: (cp?.status ?? 'not_started') as any,
      completed_at: cp?.completed_at ?? null,
      lessons: Array.isArray(cp?.lessons) ? cp.lessons.map((l: any) => ({
        lesson_id: Number(l.lesson_id),
        lesson_title: String(l.lesson_title ?? ''),
        status: String(l.status ?? 'not_started') as any,
        started_at: l.started_at ?? null,
        completed_at: l.completed_at ?? null,
        quiz_passed: Boolean(l.quiz_passed ?? false),
      })) : [],
    };
    return details;
  } catch (error: any) {
    console.error('Error fetching course progress details:', error);
    return null;
  }
};

/**
 * [User] جلب الكورسات المفضلة
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

/**
 * [User] إضافة كورس للمفضلة
 */
export const addCourseToFavorites = async (courseId: number | string): Promise<boolean> => {
  try {
    await apiClient.post(`/user/favorite-courses/${courseId}`);
    return true;
  } catch (error: any) {
    console.error('Error adding course to favorites:', error);
    return false;
  }
};

/**
 * [User] إزالة كورس من المفضلة
 */
export const removeCourseFromFavorites = async (courseId: number | string): Promise<boolean> => {
  try {
    await apiClient.delete(`/user/favorite-courses/${courseId}`);
    return true;
  } catch (error: any) {
    console.error('Error removing course from favorites:', error);
    return false;
  }
};

/**
 * [User] جلب IDs الكورسات المفضلة
 */
export const getMyFavoriteCourseIds = async (): Promise<number[]> => {
  try {
    const favorites = await getMyFavoriteCourses();
    return favorites.map((c) => Number(c.id)).filter((id) => !isNaN(id));
  } catch (error) {
    console.error('Error fetching favorite course ids:', error);
    return [];
  }
};

export interface Review {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    email?: string;
  };
}

interface ReviewsResponse {
  success: boolean;
  data: {
    data: Review[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

interface ReviewSubmissionResponse {
  success: boolean;
  message: string;
  data: Review;
}

/**
 * [Public] جلب تقييمات الكورس
 */
export const getCourseReviews = async (courseId: number | string, page: number = 1, perPage: number = 15): Promise<Review[]> => {
  try {
    const response = await apiClient.get<ReviewsResponse>(`/courses/${courseId}/reviews`, {
      params: { page, per_page: perPage }
    });

    if (response.data && response.data.success && response.data.data) {
      return response.data.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching course reviews:', error);
    return [];
  }
};

/**
 * [User] إرسال تقييم للكورس
 */
export const submitCourseReview = async (courseId: number | string, reviewData: {
  rating: number;
  comment: string;
}): Promise<Review | null> => {
  try {
    const response = await apiClient.post<ReviewSubmissionResponse>(`/courses/${courseId}/reviews`, reviewData);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error: any) {
    console.error('Error submitting review:', error);

    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('فشل في إرسال التقييم');
  }
};

/**
 * [User] تحديث تقييم
 */
export const updateCourseReview = async (courseId: number | string, reviewId: number, reviewData: {
  comment: string;
}): Promise<Review | null> => {
  try {
    const response = await apiClient.put<ReviewSubmissionResponse>(`/courses/${courseId}/reviews/${reviewId}`, reviewData);

    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }

    return null;
  } catch (error: any) {
    console.error('Error updating review:', error);

    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }

    throw new Error('فشل في تحديث التقييم');
  }
};

/**
 * [User] حذف تقييم
 */
export const deleteCourseReview = async (courseId: number | string, reviewId: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/courses/${courseId}/reviews/${reviewId}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return false;
  }
};

/**
 * [Admin] جلب تفاصيل كورس واحد (للإدارة)
 */
export const getAdminCourse = async (courseId: number | string): Promise<Course | null> => {
  try {
    const response = await apiClient.get<CourseResponse>(`/admin/courses/${courseId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching admin course:', error);
    throw new Error(error?.response?.data?.message ?? 'فشل في جلب بيانات المقرر');
  }
};

// Add missing enrollment functions
export interface PaginatedCourses {
  data: Course[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}

export const getMyEnrollments = async (page: number = 1, perPage: number = 12): Promise<PaginatedCourses> => {
  try {
    const response = await apiClient.get<any>('/my-enrollments', {
      params: { page, per_page: perPage }
    });

    // Handle new paginated structure
    if (response.data?.pagination) {
      const items = response.data.data || [];
      const mappedItems = items.map((course: any) => ({
        id: Number(course.id),
        title: String(course.title ?? ''),
        description: String(course.description ?? ''),
        price: Number(course.price ?? 0),
        instructor_id: Number(course.instructor_id ?? 0),
        category_id: Number(course.category_id ?? 0),
        cover_image: course.cover_image_url ?? course.cover_image ?? undefined,
        is_free: Boolean(course.is_free),
        status: (course.status ?? 'published') as 'draft' | 'published' | 'archived',
        created_at: course.created_at,
        updated_at: course.updated_at,
        instructor: course.instructor
          ? {
            id: Number(course.instructor.id ?? 0),
            name: String(course.instructor.name ?? ''),
            title: String(course.instructor.title ?? ''),
            bio: course.instructor.bio ?? undefined,
            image: course.instructor.image ?? undefined,
            rating: course.instructor.rating ?? course.instructor.avg_rate ?? undefined,
          }
          : undefined,
        category: course.category
          ? { id: Number(course.category.id ?? 0), name: String(course.category.name ?? '') }
          : undefined,
      }));

      return {
        data: mappedItems,
        pagination: response.data.pagination
      };
    }

    // Fallback for legacy structure
    const payload = response?.data;
    console.warn('Pagination missing. Keys:', Object.keys(payload || {}));
    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : [];

    const mappedItems = items.map((enrollment: any) => {
      const course = enrollment.course || enrollment;
      return {
        id: Number(course.id),
        title: String(course.title ?? ''),
        description: String(course.description ?? ''),
        price: Number(course.price ?? 0),
        instructor_id: Number(course.instructor_id ?? 0),
        category_id: Number(course.category_id ?? 0),
        cover_image: course.cover_image_url ?? course.cover_image ?? undefined,
        is_free: Boolean(course.is_free),
        status: (course.status ?? 'published') as 'draft' | 'published' | 'archived',
        created_at: course.created_at,
        updated_at: course.updated_at,
        instructor: course.instructor
          ? {
            id: Number(course.instructor.id ?? 0),
            name: String(course.instructor.name ?? ''),
            title: String(course.instructor.title ?? ''),
            bio: course.instructor.bio ?? undefined,
            image: course.instructor.image ?? undefined,
            rating: course.instructor.rating ?? course.instructor.avg_rate ?? undefined,
          }
          : undefined,
        category: course.category
          ? { id: Number(course.category.id ?? 0), name: String(course.category.name ?? '') }
          : undefined,
      };
    });

    return {
      data: mappedItems,
      pagination: {
        total: mappedItems.length,
        per_page: perPage,
        current_page: 1,
        last_page: 1,
        from: 1,
        to: mappedItems.length
      }
    };

  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    throw new Error(error?.response?.data?.message ?? 'فشل في جلب المقررات المسجلة');
  }
};

export const getMyEnrolledCourses = async (page: number = 1, perPage: number = 12): Promise<PaginatedCourses> => {
  return getMyEnrollments(page, perPage);
};

export const enrollCourse = async (courseId: number | string): Promise<boolean> => {
  try {
    const response = await apiClient.post(`/courses/${courseId}/enroll`);
    return response.data.success ?? true;
  } catch (error: any) {
    console.error('Error enrolling in course:', error);
    throw new Error(error?.response?.data?.message ?? 'فشل في التسجيل في المقرر');
  }
};