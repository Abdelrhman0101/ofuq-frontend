'use client';

import apiClient from './apiClient';

export interface QuizMeta {
  id: number;
  title: string;
  description?: string | null;
  max_attempts: number;
  passing_score: number;
  time_limit?: number | null;
  attempts_used: number;
  attempts_remaining: number;
}

export interface QuizQuestion {
  id?: number;
  question: string;
  options: string[];
  correct_answer?: number | number[];
  explanation?: string | null;
}

export interface ChapterQuizResponse {
  quiz: QuizMeta;
  questions: QuizQuestion[];
}

export async function getChapterQuiz(chapterId: number | string): Promise<ChapterQuizResponse> {
  const res = await apiClient.get(`/chapters/${chapterId}/quiz`);
  const data = res.data || {};
  return {
    quiz: data.quiz,
    questions: Array.isArray(data.questions) ? data.questions : []
  } as ChapterQuizResponse;
}

// Final Exam meta for a course
export interface FinalExamMetaData {
  quiz_id: number;
  questions_pool_count: number;
  has_sufficient_question_bank: boolean;
  attempts_count: number;
}

export async function getFinalExamMeta(courseId: number | string): Promise<FinalExamMetaData> {
  const res = await apiClient.get(`/courses/${courseId}/final-exam/meta`);
  const meta = res?.data?.data ?? res?.data; // backend may wrap under data
  return {
    quiz_id: Number(meta?.quiz_id ?? 0),
    questions_pool_count: Number(meta?.questions_pool_count ?? 0),
    has_sufficient_question_bank: Boolean(meta?.has_sufficient_question_bank ?? false),
    attempts_count: Number(meta?.attempts_count ?? 0),
  };
}

// Quiz attempts for a quiz (used by final exam and chapter quizzes)
export interface QuizAttempt {
  id: number;
  score: number; // percentage or raw depending on backend
  total_questions?: number;
  correct_answers?: number;
  passed?: boolean;
  time_taken?: number; // seconds
  created_at?: string;
}

export async function getQuizAttempts(quizId: number | string): Promise<QuizAttempt[]> {
  const res = await apiClient.get(`/quiz/${quizId}/attempts`);
  const payload = res?.data;
  const items = Array.isArray(payload?.attempts)
    ? payload.attempts
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : [];

  return items.map((a: any) => ({
    id: Number(a.id ?? a.attempt_id ?? 0),
    score: Number(a.score ?? a.percentage ?? 0),
    total_questions: Number(a.total_questions ?? a.questions_count ?? 0),
    correct_answers: Number(a.correct_answers ?? a.correct ?? 0),
    passed: Boolean(a.passed ?? a.is_passed ?? false),
    time_taken: Number(a.time_taken ?? a.duration_seconds ?? 0),
    created_at: a.created_at ?? a.date ?? undefined,
  }));
}

export async function submitQuizAnswers(
  quizId: number | string,
  answers: Array<{ question_id: number; selected_indices: number[] }>,
  timeTaken?: number
): Promise<any> {
  const res = await apiClient.post(`/quiz/${quizId}/submit`, {
    answers,
    time_taken: timeTaken ?? null,
  });
  return res.data;
}