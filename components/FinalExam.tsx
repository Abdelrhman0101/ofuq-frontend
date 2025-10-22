'use client';

import React, { useState } from 'react';
import '../styles/quiz.css';

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
}

interface FinalExamProps {
  questions?: ExamQuestion[];
  onComplete?: () => void;
  courseName?: string;
}

const FinalExam: React.FC<FinalExamProps> = ({ 
  questions = defaultExamQuestions, 
  onComplete,
  courseName = "كورس البرمجة الأساسية"
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

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
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="quiz-container">
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          الامتحان النهائي
        </h2>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', opacity: 0.9 }}>
          {courseName}
        </p>
      </div>

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
        <button 
          className="finish-button" 
          onClick={handleFinish}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold'
          }}
        >
          إنهاء الامتحان والحصول على الشهادة
          <div className="finish-arrow">
            🏆
          </div>
        </button>
      )}
    </div>
  );
};

// أسئلة الامتحان النهائي الوهمية
const defaultExamQuestions: ExamQuestion[] = [
  {
    id: 1,
    question: "ما هي الركائز الأساسية التي يقوم عليها منهج منصة أفق التعليمي؟",
    options: [
      "الجمع بين العلوم الشرعية والتربوية والتقنية والإعلامية",
      "التركيز على العلوم الشرعية فقط",
      "التركيز على التقنية الحديثة فقط",
      "التركيز على الإعلام والاتصال فقط"
    ]
  },
  {
    id: 2,
    question: "كيف تحقق منصة أفق التوازن بين الأصالة والمعاصرة في برامجه التعليمية؟",
    options: [
      "بدمج التراث الإسلامي مع الأساليب التعليمية الحديثة والتقنيات المتطورة",
      "بالتركيز على التراث القديم فقط",
      "بتجاهل التراث والتركيز على الحداثة",
      "بفصل التراث عن الأساليب الحديثة"
    ]
  },
  {
    id: 3,
    question: "ما هو الهدف من تطبيق مبادئ التربية الحديثة في منصة أفق؟",
    options: [
      "إعداد كوادر متخصصة قادرة على النهوض بمجتمعاتها وتحقيق التميز",
      "تخريج طلاب بمعلومات نظرية فقط",
      "التركيز على الحفظ والتلقين",
      "إنتاج خريجين للعمل في مجال واحد فقط"
    ]
  },
  {
    id: 4,
    question: "كيف تساهم التقنيات الحديثة في تحقيق رسالة منصة أفق التعليمية؟",
    options: [
      "بتوفير بيئة تعليمية تفاعلية تواكب احتياجات سوق العمل وتحديات العصر",
      "بتعقيد العملية التعليمية",
      "بإلغاء دور المعلم في التعليم",
      "بالتركيز على الترفيه دون التعلم"
    ]
  },
  {
    id: 5,
    question: "ما دور الإعلام التربوي في فلسفة منصة أفق التعليمية؟",
    options: [
      "نشر المحتوى التعليمي بطرق مبتكرة وجذابة تخدم أهداف التربية والتعليم",
      "الترويج للمنصة فقط",
      "نقل الأخبار العامة",
      "التركيز على الجانب التجاري"
    ]
  },
  {
    id: 6,
    question: "كيف تسد منصة أفق الفجوة بين التعليم النظري والممارسة العملية؟",
    options: [
      "من خلال مناهج علمية مبتكرة ومتكاملة تربط النظرية بالتطبيق العملي",
      "بالتركيز على النظرية فقط",
      "بالتركيز على التطبيق دون نظرية",
      "بفصل النظرية عن التطبيق"
    ]
  },
  {
    id: 7,
    question: "ما أهمية الاستفادة من نخبة الخبراء والمتخصصين في منصة أفق؟",
    options: [
      "ضمان جودة المناهج والبرامج التعليمية وتحقيق أعلى معايير التميز",
      "توفير التكاليف فقط",
      "زيادة عدد المدرسين",
      "تعقيد العملية التعليمية"
    ]
  },
  {
    id: 8,
    question: "كيف تخدم البرامج الدبلومية في منصة أفق احتياجات سوق العمل؟",
    options: [
      "بإعداد متخصصين مؤهلين في مجالات متنوعة تلبي متطلبات العصر الحديث",
      "بتخريج طلاب في تخصص واحد فقط",
      "بالتركيز على المعرفة النظرية دون المهارات العملية",
      "بإهمال احتياجات سوق العمل"
    ]
  }
];

export default FinalExam;