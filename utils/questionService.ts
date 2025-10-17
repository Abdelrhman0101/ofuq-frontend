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
  quiz_id: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Create a new question for a specific quiz
 * @param quizId - The ID of the quiz to add the question to
 * @param questionData - The question data to create
 * @returns Promise<Question> - The created question
 */
export const createQuestion = async (quizId: number, questionData: QuestionData): Promise<Question> => {
  try {
    const response = await apiClient.post(`/api/quiz/${quizId}/questions`, questionData);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create question');
    }
  } catch (error: any) {
    console.error('Error creating question:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
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
export const updateQuestion = async (questionId: number, questionData: QuestionData): Promise<Question> => {
  try {
    const response = await apiClient.put(`/api/questions/${questionId}`, questionData);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update question');
    }
  } catch (error: any) {
    console.error('Error updating question:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
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
    const response = await apiClient.delete(`/api/questions/${questionId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete question');
    }
  } catch (error: any) {
    console.error('Error deleting question:', error);
    throw new Error(
      error.response?.data?.message || 
      error.message || 
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