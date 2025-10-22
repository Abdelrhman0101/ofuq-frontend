// خدمة إدارة الأقسام - Category Management Service
import apiClient from './apiClient';

export interface Category {
  id: number;
  name: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryResponse {
  data: Category[];
  message?: string;
}

export interface CreateCategoryData {
  name: string;
  price?: number;
}

export interface UpdateCategoryData {
  name: string;
  price?: number;
}

// جلب جميع الأقسام - Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    console.log('[GetCategories] Sending request to /admin/categories');
    
    const response = await apiClient.get('/admin/categories');
    const result = response.data;
    
    console.log('[GetCategories] Response received:', result);
    
    // التعامل مع هيكل الاستجابة المختلف
    if (result.data && Array.isArray(result.data)) {
      return result.data;
    } else if (Array.isArray(result)) {
      return result;
    } else {
      console.warn('[GetCategories] Unexpected response structure:', result);
      return [];
    }
  } catch (error: any) {
    console.error('[GetCategories] Error:', error);
    let message = 'فشل في جلب الأقسام';
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.response.status === 403) {
        message = 'ليس لديك صلاحية للوصول إلى الأقسام.';
      } else if (error.response.status === 419) {
        message = 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    }
    
    throw new Error(message);
  }
};

// إنشاء قسم جديد - Create new category
export const createCategory = async (data: CreateCategoryData): Promise<Category> => {
  try {
    console.log('[CreateCategory] Sending request to /admin/categories', data);
    
    const response = await apiClient.post('/admin/categories', data);
    const result = response.data;
    
    console.log('[CreateCategory] Response received:', result);
    
    // التعامل مع هيكل الاستجابة المختلف
    if (result.data) {
      return result.data;
    } else if (result.category) {
      return result.category;
    } else {
      return result;
    }
  } catch (error: any) {
    console.error('[CreateCategory] Error:', error);
    let message = 'فشل في إنشاء القسم';
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.response.status === 403) {
        message = 'ليس لديك صلاحية لإنشاء الأقسام.';
      } else if (error.response.status === 422) {
        // التعامل مع أخطاء التحقق
        const validationErrors = error.response.data?.errors;
        if (validationErrors?.name) {
          message = validationErrors.name[0];
        } else if (validationErrors?.price) {
          message = validationErrors.price[0];
        } else {
          message = 'بيانات غير صحيحة. يرجى التحقق من اسم القسم والسعر.';
        }
      } else if (error.response.status === 419) {
        message = 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    }
    
    throw new Error(message);
  }
};

// تحديث قسم موجود - Update existing category
export const updateCategory = async (id: number, data: UpdateCategoryData): Promise<Category> => {
  try {
    console.log(`[UpdateCategory] Sending request to /admin/categories/${id}`, data);
    
    const response = await apiClient.put(`/admin/categories/${id}`, data);
    const result = response.data;
    
    console.log('[UpdateCategory] Response received:', result);
    
    // التعامل مع هيكل الاستجابة المختلف
    if (result.data) {
      return result.data;
    } else if (result.category) {
      return result.category;
    } else {
      return result;
    }
  } catch (error: any) {
    console.error('[UpdateCategory] Error:', error);
    let message = 'فشل في تحديث القسم';
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.response.status === 403) {
        message = 'ليس لديك صلاحية لتحديث الأقسام.';
      } else if (error.response.status === 404) {
        message = 'القسم المطلوب غير موجود.';
      } else if (error.response.status === 422) {
        // التعامل مع أخطاء التحقق
        const validationErrors = error.response.data?.errors;
        if (validationErrors?.name) {
          message = validationErrors.name[0];
        } else if (validationErrors?.price) {
          message = validationErrors.price[0];
        } else {
          message = 'بيانات غير صحيحة. يرجى التحقق من اسم القسم والسعر.';
        }
      } else if (error.response.status === 419) {
        message = 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    }
    
    throw new Error(message);
  }
};

// حذف قسم - Delete category
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    console.log(`[DeleteCategory] Sending request to /admin/categories/${id}`);
    
    const response = await apiClient.delete(`/admin/categories/${id}`);
    
    console.log('[DeleteCategory] Category deleted successfully');
  } catch (error: any) {
    console.error('[DeleteCategory] Error:', error);
    let message = 'فشل في حذف القسم';
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.response.status === 403) {
        message = 'ليس لديك صلاحية لحذف الأقسام.';
      } else if (error.response.status === 404) {
        message = 'القسم المطلوب غير موجود.';
      } else if (error.response.status === 409) {
        message = 'لا يمكن حذف هذا القسم لأنه مرتبط بدورات أخرى.';
      } else if (error.response.status === 419) {
        message = 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    }
    
    throw new Error(message);
  }
};

// جلب قسم واحد بالمعرف - Get single category by ID
export const getCategoryById = async (id: number): Promise<Category> => {
  try {
    console.log(`[GetCategoryById] Sending request to /admin/categories/${id}`);
    
    const response = await apiClient.get(`/admin/categories/${id}`);
    const result = response.data;
    
    console.log('[GetCategoryById] Response received:', result);
    
    // التعامل مع هيكل الاستجابة المختلف
    if (result.data) {
      return result.data;
    } else if (result.category) {
      return result.category;
    } else {
      return result;
    }
  } catch (error: any) {
    console.error('[GetCategoryById] Error:', error);
    let message = 'فشل في جلب بيانات القسم';
    
    if (error.response) {
      if (error.response.status === 401) {
        message = 'غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى.';
      } else if (error.response.status === 403) {
        message = 'ليس لديك صلاحية للوصول إلى الأقسام.';
      } else if (error.response.status === 404) {
        message = 'القسم المطلوب غير موجود.';
      } else if (error.response.status === 419) {
        message = 'انتهت صلاحية الجلسة. يرجى تحديث الصفحة والمحاولة مرة أخرى.';
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      }
    }
    
    throw new Error(message);
  }
};