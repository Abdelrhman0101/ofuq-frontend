'use client';

import React, { useMemo, useState } from 'react';
import '../styles/quiz.css';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface QuizProps {
  questions?: QuizQuestion[];
  requireAllAnswered?: boolean;
  onComplete?: (answers: { [key: number]: number }) => void;
}

const Quiz: React.FC<QuizProps> = ({ questions = defaultQuestions, requireAllAnswered = true, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  const allAnswered = useMemo(() => {
    if (!questions || questions.length === 0) return true;
    return questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  }, [questions, selectedAnswers]);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (requireAllAnswered && !allAnswered) {
      return;
    }
    setIsFinished(true);
    if (onComplete) {
      onComplete(selectedAnswers);
    }
  };

  if (isFinished) {
    return (
      <div className="quiz-container">
        <div className="question-box">
          <h2 style={{ textAlign: 'center', color: '#019EBB' }}>
            تم إنهاء الاختبار بنجاح!
          </h2>
          <p style={{ textAlign: 'center', fontSize: '18px', marginTop: '20px' }}>
            شكراً لك على إكمال الاختبار
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-progress">
        السؤال {currentQuestionIndex + 1} من {questions.length}
      </div>

      <div className="question-box">
        <div className="question-number">
          السؤال {currentQuestionIndex + 1}
        </div>
        <div className="question-text">
          {currentQuestion.question}
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          className="nav-button" 
          onClick={handlePrevious}
          disabled={isFirstQuestion}
        >
          السابق
        </button>
        <button 
          className="nav-button" 
          onClick={handleNext}
          disabled={isLastQuestion}
        >
          التالي
        </button>
      </div>

      <div className="options-container">
        {currentQuestion.options.map((option, index) => (
          <div
            key={index}
            className={`option-item ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
            onClick={() => handleOptionSelect(index)}
          >
            <input
              type="radio"
              name={`question-${currentQuestionIndex}`}
              value={index}
              checked={selectedAnswers[currentQuestionIndex] === index}
              onChange={() => handleOptionSelect(index)}
              className="option-radio"
            />
            {option}
          </div>
        ))}
      </div>

      {isLastQuestion && (
        <button className="finish-button" onClick={handleFinish} disabled={requireAllAnswered && !allAnswered}>
          أنتهيت
          <div className="finish-arrow">
            ←
          </div>
        </button>
      )}
      {requireAllAnswered && !allAnswered && (
        <p style={{ marginTop: 10, color: '#d35400', fontWeight: 600, textAlign: 'center' }}>
          يجب الإجابة على جميع الأسئلة قبل الإنهاء.
        </p>
      )}
    </div>
  );
};

// Default sample questions for testing
const defaultQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "ما هي عاصمة مصر؟",
    options: ["الإسكندرية", "القاهرة", "الجيزة", "أسوان"],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "كم عدد أيام السنة الميلادية؟",
    options: ["364 يوم", "365 يوم", "366 يوم", "367 يوم"],
    correctAnswer: 1
  },
  {
    id: 3,
    question: "ما هو أكبر محيط في العالم؟",
    options: ["المحيط الأطلسي", "المحيط الهندي", "المحيط الهادئ", "المحيط المتجمد الشمالي"],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "من هو مؤلف رواية 'مئة عام من العزلة'؟",
    options: ["غابرييل غارسيا ماركيز", "خورخي لويس بورخيس", "ماريو فارغاس يوسا", "إيزابيل الليندي"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "ما هو العنصر الكيميائي الذي رمزه Au؟",
    options: ["الفضة", "الذهب", "النحاس", "البلاتين"],
    correctAnswer: 1
  },
  {
    id: 6,
    question: "في أي قارة تقع دولة البرازيل؟",
    options: ["أمريكا الشمالية", "أمريكا الجنوبية", "أفريقيا", "آسيا"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "ما هو أطول نهر في العالم؟",
    options: ["نهر النيل", "نهر الأمازون", "نهر المسيسيبي", "نهر اليانغتسي"],
    correctAnswer: 0
  },
  {
    id: 8,
    question: "كم عدد عظام جسم الإنسان البالغ؟",
    options: ["206 عظمة", "208 عظمة", "210 عظمة", "212 عظمة"],
    correctAnswer: 0
  },
  {
    id: 9,
    question: "ما هي أصغر دولة في العالم؟",
    options: ["موناكو", "سان مارينو", "الفاتيكان", "ليختنشتاين"],
    correctAnswer: 2
  },
  {
    id: 10,
    question: "من اخترع المصباح الكهربائي؟",
    options: ["نيكولا تيسلا", "توماس إديسون", "ألكسندر غراهام بيل", "بنجامين فرانكلين"],
    correctAnswer: 1
  }
];

export default Quiz;