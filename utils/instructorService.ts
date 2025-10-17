import apiClient from './apiClient';

// Interface for instructor data structure
export interface Instructor {
  id: number;
  name: string;
  title: string;
  email?: string;
  bio: string;
  image?: string;
  rating: number;
  courses_count: number;
  students_count: number;
  avg_rate: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for API response
interface InstructorsResponse {
  data: Instructor[];
  message?: string;
}

interface CreateInstructorResponse {
  data: Instructor;
  message: string;
}

/**
 * Fetch all instructors from the backend
 * @returns Promise<Instructor[]> - Array of instructors
 */
export const getInstructors = async (): Promise<Instructor[]> => {
  try {
    const response = await apiClient.get<any>('/admin/instructors');
    console.log('API Response:', response.data); // Debug log
    
    // Handle Laravel paginated response structure
    if (response.data && response.data.success) {
      // Check if response has data property
      if (response.data.data) {
        // Check if it's paginated data (Laravel pagination structure)
        if (response.data.data.data && Array.isArray(response.data.data.data)) {
          console.log('Found paginated data:', response.data.data.data);
          return response.data.data.data;
        }
        // Check if it's direct array in data
        else if (Array.isArray(response.data.data)) {
          console.log('Found direct array in data:', response.data.data);
          return response.data.data;
        }
      }
    }
    // Fallback for direct array response
    else if (Array.isArray(response.data)) {
      console.log('Found direct array response:', response.data);
      return response.data;
    }
    
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching instructors:', error);
    throw new Error('Failed to fetch instructors');
  }
};

/**
 * Create a new instructor
 * @param instructorData - FormData containing instructor information
 * @returns Promise<Instructor> - The created instructor data
 */
export const createInstructor = async (instructorData: FormData): Promise<Instructor> => {
  try {
    // Debug: Log FormData contents
    console.log('FormData contents:');
    Array.from(instructorData.entries()).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    
    // Create a new apiClient instance with multipart/form-data headers for file upload
    const response = await apiClient.post<CreateInstructorResponse>('/admin/instructors', instructorData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating instructor:', error);
    throw new Error('Failed to create instructor');
  }
};

/**
 * Update an existing instructor
 * @param id - Instructor ID
 * @param instructorData - FormData containing updated instructor information
 * @returns Promise<Instructor> - The updated instructor data
 */
export const updateInstructor = async (id: number, instructorData: FormData): Promise<Instructor> => {
  try {
    // Add method spoofing for Laravel
    instructorData.append('_method', 'PUT');
    
    const response = await apiClient.post<CreateInstructorResponse>(`/admin/instructors/${id}`, instructorData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating instructor:', error);
    throw new Error('Failed to update instructor');
  }
};

/**
 * Delete an instructor
 * @param id - Instructor ID
 * @returns Promise<void>
 */
export const deleteInstructor = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/instructors/${id}`);
  } catch (error) {
    console.error('Error deleting instructor:', error);
    throw new Error('Failed to delete instructor');
  }
};