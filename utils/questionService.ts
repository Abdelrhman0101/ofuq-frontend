import apiClient from './apiClient';

// Interface for question data
export interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

// Interface for question response
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  quiz_id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new question for a specific quiz
 * @param quizId - The ID of the quiz to add the question to
 * @param questionData - The question data to create
 * @returns Promise<Question> - The created question
 */
export const createQuestion = async (
  quizId: number,
  questionData: QuestionData
): Promise<Question> => {
  try {
    const payload = {
      question: questionData.text,
      options: questionData.options,
      correct_answer: String(questionData.correctAnswer),
      explanation: questionData.explanation,
    };

    const response = await apiClient.post(`/api/admin/quizzes/${quizId}/questions`, payload);

    const q = response.data?.question ?? response.data;
    if (!q) {
      throw new Error(response.data?.message || 'Failed to create question');
    }

    const correctRaw = q.correct_answer;
    const correctIndex = Array.isArray(correctRaw)
      ? Number(correctRaw[0])
      : Number(correctRaw);

    return {
      id: Number(q.id),
      text: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: Number.isNaN(correctIndex) ? 0 : correctIndex,
      explanation: q.explanation,
      quiz_id: quizId,
    };
  } catch (error: any) {
    console.error('Error creating question:', error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred while creating the question'
    );
  }
};

/**
 * Update an existing question
 * @param questionId - The ID of the question to update
 * @param questionData - The updated question data
 * @returns Promise<Question> - The updated question
 */
export const updateQuestion = async (
  questionId: number,
  questionData: QuestionData
): Promise<Question> => {
  try {
    const payload = {
      question: questionData.text,
      options: questionData.options,
      correct_answer: String(questionData.correctAnswer),
      explanation: questionData.explanation,
    };

    const response = await apiClient.put(`/api/admin/questions/${questionId}`, payload);

    const q = response.data?.question ?? response.data;
    if (!q) {
      throw new Error(response.data?.message || 'Failed to update question');
    }

    const correctRaw = q.correct_answer;
    const correctIndex = Array.isArray(correctRaw)
      ? Number(correctRaw[0])
      : Number(correctRaw);

    return {
      id: Number(q.id),
      text: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: Number.isNaN(correctIndex) ? 0 : correctIndex,
      explanation: q.explanation,
    };
  } catch (error: any) {
    console.error('Error updating question:', error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred while updating the question'
    );
  }
};

/**
 * Delete a question
 * @param questionId - The ID of the question to delete
 * @returns Promise<void>
 */
export const deleteQuestion = async (questionId: number): Promise<void> => {
  try {
    await apiClient.delete(`/api/admin/questions/${questionId}`);
  } catch (error: any) {
    console.error('Error deleting question:', error);
    throw new Error(
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred while deleting the question'
    );
  }
};

/**
 * Get all questions for a specific quiz
 * @param quizId - The ID of the quiz to get questions for
 * @returns Promise<Question[]> - Array of questions
 */
export const getQuizQuestions = async (quizId: number): Promise<Question[]> => {
  try {
    const response = await apiClient.get(`/api/quiz/${quizId}/questions`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch questions');
    }
  } catch (error: any) {
    console.error('Error fetching questions:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
      'An error occurred while fetching questions'
    );
  }
};