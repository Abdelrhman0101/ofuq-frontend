import http from './apiClient';

export interface CourseItem {
  id: number;
  name: string;
  progress: number;
  image: string;
  category: string;
  instructor: { name: string; avatar: string };
  finalExamScore?: number;
}

export interface CertificateItem {
  id: number;
  courseId: number;
  courseName: string;
  issuedAt?: string;
  completionDate?: string | null;
  verificationToken?: string;
  verificationUrl?: string;
  downloadUrl?: string;
}

export interface StudentItem {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  blocked: boolean;
  courses: CourseItem[];
  certificates?: CertificateItem[];
}

function splitName(fullName: string) {
  const parts = (fullName || '').trim().split(/\s+/);
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  return { firstName, lastName };
}

export async function getStudentsStatus(): Promise<StudentItem[]> {
  const res = await http.get('/admin/students/status');
  const list = res.data?.data || [];
  return list.map((s: any) => {
    const { firstName, lastName } = splitName(s.student_name);
    const courses: CourseItem[] = (s.courses || []).map((c: any) => ({
      id: c.course_id,
      name: c.course_title,
      progress: Math.round(c.progress_percentage || 0),
      image: c.cover_image_url || '/hero-image.png',
      category: c.category || 'غير محدد',
      instructor: { name: c.instructor_name || 'غير معروف', avatar: '/profile.jpg' },
      finalExamScore: typeof c.final_exam_score === 'number' ? Math.round(c.final_exam_score) : undefined,
    }));
    return {
      id: s.student_id,
      firstName,
      lastName,
      email: s.student_email,
      blocked: !!s.is_blocked,
      courses,
    } as StudentItem;
  });
}

export async function deleteUser(userId: number): Promise<void> {
  await http.delete(`/admin/users/${userId}`);
}

export async function blockUser(userId: number, reason = 'Violation'): Promise<void> {
  await http.post('/admin/blocked-users', { user_id: userId, reason, is_blocked: true });
}

export async function unblockUser(userId: number): Promise<void> {
  await http.delete(`/admin/blocked-users/${userId}`);
}

export async function getUserCertificates(userId: number): Promise<CertificateItem[]> {
  const res = await http.get(`/admin/users/${userId}/certificates`);
  const certs = res.data?.certificates || [];
  return certs.map((c: any) => ({
    id: c.id,
    courseId: c.course_id,
    courseName: c.course_title,
    issuedAt: c.issued_at,
    completionDate: c.completion_date,
    verificationToken: c.verification_token,
    verificationUrl: c.verification_url,
    downloadUrl: c.download_url,
  }));
}