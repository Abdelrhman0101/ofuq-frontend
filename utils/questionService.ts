import apiClient from './apiClient';

// Interface for question data
export interface QuestionData {
  text: string;
  options: string[];
  correctAnswer: number; // نفترض أنه index
  explanation?: string;
}

// Interface for question response
export interface Question {
  id: number;
  text: string; // اسم الحقل في الواجهة
  question: string; // اسم الحقل من الباك اند
  options: string[];
  correctAnswer: number; // نفترض أنه index
  correct_answer: string | string[]; // الحقل من الباك اند
  explanation?: string;
  quiz_id?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * [Admin] إنشاء سؤال جديد لاختبار معين
 */
export const createQuestion = async (
  quizId: number,
  questionData: QuestionData
): Promise<Question> => {
  try {
    // التحويل من واجهة الفرونت إلى الباك اند
    const payload = {
      question: questionData.text,
      options: questionData.options,
      correct_answer: String(questionData.correctAnswer), // الباك اند يتوقع string
      explanation: questionData.explanation,
    };

    // لاحظ أن الباك اند (File 3) يستخدم /admin/quizzes وليس /api/admin/quizzes
    const response = await apiClient.post(`/admin/quizzes/${quizId}/questions`, payload);

    const q = response.data?.data ?? response.data?.question ?? response.data;
    if (!q) {
      throw new Error(response.data?.message || 'Failed to create question');
    }

    // التحويل من الباك اند إلى واجهة الفرونت
    const correctRaw = q.correct_answer;
    const correctIndex = Array.isArray(correctRaw)
      ? Number(correctRaw[0])
      : Number(correctRaw);

    return {
      id: Number(q.id),
      text: q.question,
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: Number.isNaN(correctIndex) ? 0 : correctIndex,
      correct_answer: q.correct_answer,
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
 * [Admin] تحديث سؤال موجود
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

    const response = await apiClient.put(`/admin/questions/${questionId}`, payload);

    const q = response.data?.data ?? response.data?.question ?? response.data;
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
      question: q.question,
      options: Array.isArray(q.options) ? q.options : [],
      correctAnswer: Number.isNaN(correctIndex) ? 0 : correctIndex,
      correct_answer: q.correct_answer,
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
 * [Admin] حذف سؤال
 */
export const deleteQuestion = async (questionId: number): Promise<void> => {
  try {
    await apiClient.delete(`/admin/questions/${questionId}`);
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
 * [Admin] جلب جميع أسئلة اختبار معين
 */
export const getQuizQuestions = async (quizId: number): Promise<Question[]> => {
  try {
    // المسار الصحيح من (File 3)
    const response = await apiClient.get(`/admin/quizzes/${quizId}/questions`);
    
    const data = response.data?.data ?? response.data;
    if (Array.isArray(data)) {
      return data.map((q: any) => {
        // توحيد شكل الرد
        const correctRaw = q.correct_answer;
        const correctIndex = Array.isArray(correctRaw)
          ? Number(correctRaw[0])
          : Number(correctRaw);
        
        return {
          id: Number(q.id),
          text: q.question,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswer: Number.isNaN(correctIndex) ? 0 : correctIndex,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          quiz_id: Number(q.quiz_id)
        };
      });
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