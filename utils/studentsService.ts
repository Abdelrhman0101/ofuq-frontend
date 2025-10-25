import { http } from '../lib/http';

export interface EnrolledDiplomaItem {
  id: number;
  category_id: number;
  category_name: string;
  category_slug: string;
  status: string;
  enrolled_at: string;
  courses_count: number;
  is_free: boolean;
  price: number;
}

export interface DiplomaCertificateItem {
  courseName: string;
  completionDate: string;
  certificateId?: string;
  certificateImage?: string;
  downloadUrl?: string;
  verificationUrl?: string;
}

export interface StudentCourse {
  id: number;
  title: string;
  instructor: string;
  category: string;
  cover_image_url: string;
  status: string;
  progress_percentage: number;
  completed_at: string | null;
  final_exam_score: number | null;
  certificate_id: string | null;
}

export interface StudentItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  qualification: string | null;
  media_work_sector: string | null;
  date_of_birth: string | null;
  previous_field: string | null;
  created_at: string;
  email_verified_at: string | null;
  is_blocked: boolean;
  courses: StudentCourse[];
  diplomas: EnrolledDiplomaItem[];
  total_courses: number;
  total_diplomas: number;
  completed_courses: number;
  active_diplomas: number;
}

export async function getStudentsStatus(): Promise<StudentItem[]> {
  try {
    const response = await http.get('/admin/students');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching students status:', error);
    throw error;
  }
}

export async function deleteUser(userId: number): Promise<void> {
  try {
    await http.delete(`/admin/users/${userId}`);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

export async function blockUser(userId: number): Promise<void> {
  try {
    await http.post('/admin/blocked-users', { user_id: userId });
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
}

export async function unblockUser(userId: number): Promise<void> {
  try {
    await http.delete(`/admin/blocked-users/${userId}`);
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
  }
}

export async function getUserCertificates(userId: number): Promise<DiplomaCertificateItem[]> {
  try {
    const response = await http.get(`/admin/users/${userId}/certificates`);
    const raw = response.data;
    const list = Array.isArray(raw?.certificates)
      ? raw.certificates
      : Array.isArray(raw?.data?.certificates)
      ? raw.data.certificates
      : [];
    return list.map((c: any) => ({
      courseName: c.course_title,
      completionDate: c.completion_date || '',
      certificateId: c.id?.toString(),
      certificateImage: undefined,
      downloadUrl: c.download_url,
      verificationUrl: c.verification_url,
    }));
  } catch (error) {
    console.error('Error fetching user certificates:', error);
    throw error;
  }
}