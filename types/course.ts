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
  attachments: File[];
  duration?: number;
  order: number;
  questions: Question[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
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
}

export type CourseCreationStep = 'basic-info' | 'content-management' | 'review';