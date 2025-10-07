export interface MCQOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: MCQOption[];
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
}

export interface MCQBank {
  id: string;
  questions: MCQQuestion[];
  totalQuestions: number;
  passingScore: number; // النسبة المئوية للنجاح
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  videoFile?: File;
  videoUrl?: string; // رابط الفيديو من مصادر خارجية مثل Google Drive
  // تحديد إتاحة الفيديو للعامة أو لا
  isVideoPublic?: boolean;
  attachments: File[];
  duration?: number;
  order: number;
  questions: Question[];
  // روابط مصادر الدرس مع نوع الأيقونة
  resources?: {
    id: string;
    title: string;
    description?: string;
    url: string;
    type: 'website' | 'article' | 'video' | 'book' | 'tool' | 'other';
    domain?: string;
  }[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Instructor {
  id: string;
  name: string;
  profileImage?: string;
  email?: string;
  bio?: string;
  specialization?: string;
}

export interface Course {
  id:string;
  title: string;
  description: string;
  categoryId: string;
  coverImage?: File;
  price: number;
  isFree: boolean;
  chapters: Chapter[];
  createdAt: Date;
  status: 'draft' | 'published';
  instructor?: Instructor;
}

export type CourseCreationStep = 'basic-info' | 'content-management' | 'review';