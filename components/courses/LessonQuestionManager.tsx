'use client';

import React, { useState } from 'react';
import '../../styles/lesson-questions.css';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface LessonQuestionManagerProps {
  lessonId: string;
  questions: Question[];
  onQuestionsChange: (questions: Question[]) => void;
}

const LessonQuestionManager: React.FC<LessonQuestionManagerProps> = ({
  lessonId,
  questions,
  onQuestionsChange,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  const generateId = () => `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleAddNewQuestion = () => {
    setFormData({
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    });
    setEditingQuestion(null);
    setIsEditing(true);
  };

  const handleEditQuestion = (index: number) => {
    const question = questions[index];
    setFormData({
      text: question.text,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || ''
    });
    setEditingQuestion(question);
    setCurrentQuestionIndex(index);
    setIsEditing(true);
  };

  const handleSaveQuestion = () => {
    if (!formData.text.trim() || formData.options.some(opt => !opt.trim())) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const questionData: Question = {
      id: editingQuestion?.id || generateId(),
      text: formData.text.trim(),
      options: formData.options.map(opt => opt.trim()),
      correctAnswer: formData.correctAnswer,
      explanation: formData.explanation.trim() || undefined
    };

    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = questions.map(q => 
        q.id === editingQuestion.id ? questionData : q
      );
    } else {
      updatedQuestions = [...questions, questionData];
      setCurrentQuestionIndex(questions.length);
    }

    onQuestionsChange(updatedQuestions);
    setIsEditing(false);
    setEditingQuestion(null);
  };

  const handleDeleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    onQuestionsChange(updatedQuestions);
    if (currentQuestionIndex >= updatedQuestions.length && updatedQuestions.length > 0) {
      setCurrentQuestionIndex(updatedQuestions.length - 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const updateFormField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const getOptionLetter = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getVisibleQuestionIndicators = () => {
    const totalQuestions = questions.length;
    
    // إذا كان عدد الأسئلة 7 أو أقل، اعرض جميع الأرقام
    if (totalQuestions <= 7) {
      return questions.map((_, index) => index);
    }
    
    // إذا كان عدد الأسئلة أكثر من 7، اعرض أول رقمين و ... و آخر رقم
    const visibleIndices = [];
    
    // أول رقمين
    visibleIndices.push(0, 1);
    
    // إضافة علامة ... (سنستخدم -1 كمؤشر للنقاط)
    visibleIndices.push(-1);
    
    // آخر رقم
    visibleIndices.push(totalQuestions - 1);
    
    return visibleIndices;
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="lesson-question-manager">
      <div className="question-manager-header">
        <h3 className="question-manager-title">
          <span className="question-icon">❓</span>
          أسئلة الدرس ({questions.length})
        </h3>
        <button 
          onClick={handleAddNewQuestion}
          className="add-question-btn"
        >
          <span className="btn-icon">➕</span>
          إضافة سؤال جديد
        </button>
      </div>

      {questions.length === 0 && !isEditing ? (
        <div className="empty-questions-state">
          <div className="empty-questions-icon">📝</div>
          <h4 className="empty-questions-title">لا توجد أسئلة بعد</h4>
          <p className="empty-questions-text">ابدأ بإضافة أسئلة تفاعلية لهذا الدرس</p>
          <button 
            onClick={handleAddNewQuestion}
            className="empty-add-question-btn"
          >
            إضافة أول سؤال
          </button>
        </div>
      ) : (
        <>
          {!isEditing && questions.length > 0 && (
            <div className="question-slider">
              <div className="question-card">
                <div className="question-card-header">
                  <div className="question-number">
                    السؤال {currentQuestionIndex + 1} من {questions.length}
                  </div>
                  <div className="question-actions">
                    <button 
                      onClick={() => handleEditQuestion(currentQuestionIndex)}
                      className="edit-question-btn"
                      title="تعديل السؤال"
                    >
                      تعديل
                    </button>
                    <button 
                      onClick={() => handleDeleteQuestion(currentQuestion.id)}
                      className="delete-question-btn"
                      title="حذف السؤال"
                    >
                      حذف
                    </button>
                  </div>
                </div>
                
                <div className="question-content">
                  <div className="question-text">{currentQuestion.text}</div>
                  <div className="question-options">
                    {currentQuestion.options.map((option, index) => (
                      <div 
                        key={index} 
                        className={`question-option ${index === currentQuestion.correctAnswer ? 'correct-option' : ''}`}
                      >
                        <span className="option-letter">{getOptionLetter(index)}</span>
                        <span className="option-text">{option}</span>
                        {index === currentQuestion.correctAnswer && <span className="correct-indicator">✓</span>}
                      </div>
                    ))}
                  </div>
                  
                  {currentQuestion.explanation && (
                    <div className="question-explanation">
                      <strong>الشرح:</strong> {currentQuestion.explanation}
                    </div>
                  )}
                </div>
              </div>

              <div className="question-navigation">
                <button 
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestionIndex === 0}
                  className="nav-btn prev-btn"
                >
                  <span className="nav-icon">⬅️</span>
                  السابق
                </button>
                
                <div className="question-indicators">
                  {getVisibleQuestionIndicators().map((index, arrayIndex) => {
                    if (index === -1) {
                      // عرض النقاط
                      return (
                        <span key="dots" className="question-dots">
                          ...
                        </span>
                      );
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`question-indicator ${index === currentQuestionIndex ? 'active' : ''}`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
                
                <button 
                  onClick={handleNextQuestion}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="nav-btn next-btn"
                >
                  التالي
                  <span className="nav-icon">➡️</span>
                </button>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="question-editor">
              <div className="editor-header">
                <h4 className="editor-title">
                  {editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}
                </h4>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="close-editor-btn"
                >
                  ✕
                </button>
              </div>

              <div className="editor-form">
                <div className="form-group">
                  <label className="form-label">نص السؤال</label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => updateFormField('text', e.target.value)}
                    placeholder="اكتب السؤال هنا..."
                    className="question-input"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">الخيارات</label>
                  <div className="options-list">
                    {formData.options.map((option, index) => (
                      <div key={index} className="option-input-group">
                        <div className="option-header">
                          <span className="option-letter">{getOptionLetter(index)}</span>
                          <input
                            type="radio"
                            name="correctAnswer"
                            checked={formData.correctAnswer === index}
                            onChange={() => updateFormField('correctAnswer', index)}
                            className="correct-radio"
                          />
                          <label className="correct-label">الإجابة الصحيحة</label>
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`الخيار ${getOptionLetter(index)}`}
                          className="option-text-input"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">الشرح (اختياري)</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => updateFormField('explanation', e.target.value)}
                    placeholder="اكتب شرحاً للإجابة الصحيحة..."
                    className="explanation-input"
                    rows={2}
                  />
                </div>

                <div className="editor-actions">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="cancel-btn"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleSaveQuestion}
                    className="save-question-btn"
                  >
                    
                    {editingQuestion ? 'حفظ التعديلات' : 'إضافة السؤال'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LessonQuestionManager;