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
  question: string;
  options: string[];
  correct_answer?: number;
  explanation?: string | null;
}

export interface ChapterQuizResponse {
  quiz: QuizMeta;
  questions: QuizQuestion[];
}

export async function getChapterQuiz(chapterId: number | string): Promise<ChapterQuizResponse> {
  const res = await apiClient.get(`/quiz/${chapterId}`);
  const data = res.data || {};
  return {
    quiz: data.quiz,
    questions: Array.isArray(data.questions) ? data.questions : []
  } as ChapterQuizResponse;
}