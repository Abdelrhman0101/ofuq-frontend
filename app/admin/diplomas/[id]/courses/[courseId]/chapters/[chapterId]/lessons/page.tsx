'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Toast from '@/components/Toast';
import styles from '../../AdminCourseChapters.module.css';

// Services & types
import {
  getAdminCategory,
  type Diploma,
} from '@/utils/categoryService';

import {
  getAdminCourse,
  type Course,
} from '@/utils/courseService';

import {
  getCourseChapters,
  type Chapter,
} from '@/utils/chapterService';

import {
  getChapterLessons as getLessons,
  createLesson,
  updateLesson,
  deleteLessonAdmin as deleteLesson,
  type Lesson,
} from '@/utils/lessonService';

import {
  createQuestion,
  updateQuestion,
  type QuestionData,
} from '@/utils/questionService';

import {
  getOrCreateLessonQuiz,
  type Quiz,
} from '@/utils/quizService';

interface LessonFormData {
  title: string;
  content: string;
  video_url?: string;
  order: number;
}

export default function AdminChapterLessons() {
  const params = useParams();
  const router = useRouter();
  const diplomaId = Number(params.id);
  const courseId = Number(params.courseId);
  const chapterId = Number(params.chapterId);

  const [diploma, setDiploma] = useState<Diploma | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Question popup state
  const [isQuestionPopupOpen, setIsQuestionPopupOpen] = useState(false);
  const [questionLesson, setQuestionLesson] = useState<Lesson | null>(null);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [questionForm, setQuestionForm] = useState<{ text: string; options: string[]; correctIndex: number; explanation?: string }>({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  // Lesson form state
  const [lessonFormData, setLessonFormData] = useState<LessonFormData>({
    title: '',
    content: '',
    video_url: '',
    order: 1,
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch diploma details
        const diplomaData = await getAdminCategory(diplomaId);
        setDiploma(diplomaData);
        
        // Fetch course details
        const courseData = await getAdminCourse(courseId);
        setCourse(courseData);
        
        // Fetch chapter details via course chapters list
        const chaptersList = await getCourseChapters(courseId);
        const chapterData = chaptersList.find((c) => Number(c.id) === Number(chapterId)) || null;
        setChapter(chapterData);
        
        // Fetch lessons for this chapter
        const lessonsData = await getLessons(chapterId);
        setLessons(lessonsData);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'حدث خطأ غير متوقع';
        setError(errorMsg);
        showToast(errorMsg, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    if (diplomaId && courseId && chapterId) {
      fetchData();
    }
  }, [diplomaId, courseId, chapterId]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        title: lessonFormData.title,
        content: lessonFormData.content,
        video_url: lessonFormData.video_url || null,
        order: lessonFormData.order,
        chapter_id: chapterId,
      };

      if (editingLesson) {
        await updateLesson(editingLesson.id, payload);
        showToast('تم تحديث الدرس بنجاح', 'success');
      } else {
        await createLesson(chapterId, payload);
        showToast('تم إنشاء الدرس بنجاح', 'success');
      }

      // Refresh lessons list
      const lessonsData = await getLessons(chapterId);
      setLessons(lessonsData);

      // Reset form
      setLessonFormData({
        title: '',
        content: '',
        video_url: '',
        order: lessons.length + 1,
      });
      setShowLessonForm(false);
      setEditingLesson(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ غير متوقع', 'error');
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      content: lesson.content || '',
      video_url: lesson.video_url || '',
      order: lesson.order || lessons.indexOf(lesson) + 1,
    });
    setShowLessonForm(true);
  };

  const handleDelete = async (lessonId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;
    
    try {
      await deleteLesson(lessonId);
      showToast('تم حذف الدرس بنجاح', 'success');
      
      // Refresh lessons list
      const lessonsData = await getLessons(chapterId);
      setLessons(lessonsData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ غير متوقع', 'error');
    }
  };

  // Question popup handlers
  const openQuestionPopup = (lesson: Lesson) => {
    setQuestionLesson(lesson);
    setIsQuestionPopupOpen(true);
    
    // تحميل بيانات الاختبار المحفوظة إذا كانت موجودة
    if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
      const firstQuestion = lesson.quiz.questions[0];
      const questionText = firstQuestion.question || firstQuestion.text || '';
      
      let questionOptions: string[] = [];
      try {
        // محاولة تحليل الخيارات إذا كانت نصًا
        if (typeof firstQuestion.options === 'string') {
          questionOptions = JSON.parse(firstQuestion.options);
        } else if (Array.isArray(firstQuestion.options)) {
          questionOptions = firstQuestion.options;
        }
      } catch (e) {
        console.error("Failed to parse question options:", e);
        questionOptions = [];
      }

      // التأكد من وجود 4 خيارات على الأقل
      while (questionOptions.length < 4) {
        questionOptions.push('');
      }
      
      // تحديد فهرس الإجابة الصحيحة
      let correctIndex = -1;
      if (firstQuestion.correct_answer !== undefined && firstQuestion.correct_answer !== null) {
        const correctAnswerStr = String(firstQuestion.correct_answer);
        correctIndex = questionOptions.findIndex(option => String(option) === correctAnswerStr);
      }
      
      if (correctIndex === -1) {
        // إذا لم يتم العثور على الإجابة الصحيحة، حاول البحث عن طريق الفهرس
        const possibleIndex = Number(firstQuestion.correct_answer);
        if (!isNaN(possibleIndex) && possibleIndex >= 0 && possibleIndex < questionOptions.length) {
          correctIndex = possibleIndex;
        } else {
          correctIndex = 0; // القيمة الافتراضية
        }
      }
      
      setQuestionForm({
        text: questionText,
        options: questionOptions.slice(0, 4), // أخذ أول 4 خيارات فقط
        correctIndex: Math.max(0, Math.min(correctIndex, 3)), // التأكد من أن الفهرس صحيح
        explanation: firstQuestion.explanation || ''
      });
    } else {
      // إذا لم يكن هناك اختبار محفوظ، استخدم القيم الافتراضية
      setQuestionForm({ text: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });
    }
  };

  const closeQuestionPopup = () => {
    setIsQuestionPopupOpen(false);
    setQuestionLesson(null);
  };

  const handleSaveQuestion = async () => {
    if (!questionLesson) return;
    try {
      setQuestionSaving(true);
      const text = questionForm.text.trim();
      const options = questionForm.options.map(o => o.trim()).filter(o => o !== ''); // إزالة الخيارات الفارغة
      
      if (!text) {
        showToast('يرجى إدخال نص السؤال', 'error');
        setQuestionSaving(false);
        return;
      }
      
      // التحقق من وجود خيارين على الأقل
      if (options.length < 2) {
        showToast('يرجى إدخال خيارين على الأقل', 'error');
        setQuestionSaving(false);
        return;
      }
      
      // التأكد من أن فهرس الإجابة الصحيحة صحيح
      if (questionForm.correctIndex < 0 || questionForm.correctIndex >= options.length) {
        showToast('يرجى تحديد الإجابة الصحيحة من الخيارات المتاحة', 'error');
        setQuestionSaving(false);
        return;
      }

      // الحصول على اختبار الدرس أو إنشاؤه
      const quiz = await getOrCreateLessonQuiz(questionLesson.id, `أسئلة ${questionLesson.title}`);
      
      // إعداد بيانات السؤال
      const questionData: QuestionData = {
        text,
        options,
        correctAnswer: questionForm.correctIndex,
        explanation: questionForm.explanation || undefined,
      };

      // إنشاء السؤال الجديد
      await createQuestion(quiz.id, questionData);
      
      showToast('تم إضافة سؤال الدرس بنجاح', 'success');
      closeQuestionPopup();

      const lessonsData = await getLessons(chapterId);
      setLessons(lessonsData);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ السؤال', 'error');
    } finally {
      setQuestionSaving(false);
    }
  };

  const handleBackToChapters = () => {
    router.push(`/admin/diplomas/${diplomaId}/courses/${courseId}/chapters`);
  };

  if (loading) return <div className="loading">جاري التحميل...</div>;
  if (error) return (
    <div className="error">خطأ: {error} (يرجى تسجيل الخروج والمحاولة مرة أخرى)</div>
  );
  if (!diploma || !course || !chapter) return <div className="error">لم يتم العثور على البيانات المطلوبة</div>;

  return (
    <div className={styles.root}>
      <div className="admin-courses-container">
        {/* --- Header & Actions --- */}
        <div className="admin-courses-header">
          <div className="admin-courses-title-container">
            <button 
              className="btn-secondary back-button" 
              onClick={handleBackToChapters}
            >
              &larr; العودة للفصول
            </button>
            <h1 className="admin-courses-title">إدارة دروس الفصل: {chapter.title}</h1>
          </div>
          <p className="admin-courses-subtitle">
            <span>الدبلومة: {diploma.name}</span>
            <span> | </span>
            <span>المقرر: {course.title}</span>
            <span> | </span>
            <span>الفصل: {chapter.title}</span>
          </p>
        </div>

        <div className="admin-courses-actions">
          <button
            className="btn-primary"
            onClick={() => {
              setShowLessonForm(true);
              setEditingLesson(null);
              setLessonFormData({
                title: '',
                content: '',
                video_url: '',
                order: lessons.length + 1,
              });
            }}
          >
            + إضافة درس جديد
          </button>
        </div>

        {/* --- Add/Edit Lesson Modal --- */}
        {showLessonForm && (
          <div className="modal-overlay" onClick={() => setShowLessonForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}</h2>
                <button className="close-btn" onClick={() => setShowLessonForm(false)}>×</button>
              </div>
              <form onSubmit={handleLessonSubmit} className="course-form">
                <div className="form-section">
                  <h3 className="form-section-title">معلومات الدرس</h3>
                  <div className="form-grid">
                    {/* title */}
                    <div className="form-group">
                      <label htmlFor="title" className="form-label">عنوان الدرس <span className="required">*</span></label>
                      <input 
                        type="text" 
                        id="title" 
                        className="form-input" 
                        value={lessonFormData.title} 
                        onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })} 
                        required 
                        placeholder="أدخل عنوان الدرس"
                      />
                    </div>
                    
                    {/* order */}
                    <div className="form-group">
                      <label htmlFor="order" className="form-label">الترتيب</label>
                      <input 
                        type="number" 
                        id="order" 
                        className="form-input" 
                        value={lessonFormData.order} 
                        onChange={(e) => setLessonFormData({ ...lessonFormData, order: Number(e.target.value) })} 
                        min={1}
                        placeholder="ترتيب الدرس"
                      />
                    </div>
                    
                    {/* video_url */}
                    <div className="form-group form-grid-full">
                      <label htmlFor="video_url" className="form-label">رابط الفيديو</label>
                      <input 
                        type="url" 
                        id="video_url" 
                        className="form-input" 
                        value={lessonFormData.video_url || ''} 
                        onChange={(e) => setLessonFormData({ ...lessonFormData, video_url: e.target.value })} 
                        placeholder="أدخل رابط الفيديو (اختياري)"
                      />
                    </div>
                    
                    {/* content */}
                    <div className="form-group form-grid-full">
                      <label htmlFor="content" className="form-label">محتوى الدرس <span className="required">*</span></label>
                      <textarea 
                        id="content" 
                        className="form-textarea" 
                        value={lessonFormData.content} 
                        onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })} 
                        rows={10}
                        required
                        placeholder="أدخل محتوى الدرس"
                      />
                    </div>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">{editingLesson ? 'تحديث' : 'إضافة'}</button>
                  <button type="button" className="btn-secondary" onClick={() => setShowLessonForm(false)}>إلغاء</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- Lessons List --- */}
        <div className="admin-courses-list">
          <h2 className="section-title">قائمة الدروس في الفصل</h2>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>العنوان</th>
                  <th>الترتيب</th>
                  <th>فيديو</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>{lesson.title}</td>
                    <td>{lesson.order || lessons.indexOf(lesson) + 1}</td>
                    <td>{lesson.video_url ? 'متاح' : 'غير متاح'}</td>
                    <td className="actions-cell">
                      <button className="btn-action" onClick={() => handleEdit(lesson)}>تعديل</button>
                      <button className="btn-action btn-danger" onClick={() => handleDelete(lesson.id)}>حذف</button>
                      <button className="btn-action" onClick={() => openQuestionPopup(lesson)}>سؤال الدرس</button>
                    </td>
                  </tr>
                ))}
                {lessons.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center' }}>لا توجد دروس في هذا الفصل</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- Question Modal --- */}
        {isQuestionPopupOpen && questionLesson && (
          <div className="modal-overlay" onClick={closeQuestionPopup}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>سؤال الدرس: {questionLesson.title}</h2>
                <button className="close-btn" onClick={closeQuestionPopup}>×</button>
              </div>
              <div className="course-form">
                <div className="form-section">
                  <h3 className="form-section-title">بيانات السؤال</h3>
                  <div className="form-grid">
                    <div className="form-group form-grid-full">
                      <label className="form-label">نص السؤال <span className="required">*</span></label>
                      <input
                        type="text"
                        className="form-input"
                        value={questionForm.text}
                        onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                        placeholder="أدخل نص السؤال"
                        required
                      />
                    </div>

                    {questionForm.options.map((opt, idx) => (
                      <div className="form-group" key={idx}>
                        <label className="form-label">الإجابة {idx + 1}</label>
                        <input
                          type="text"
                          className="form-input"
                          value={opt}
                          onChange={(e) => {
                            const copy = [...questionForm.options];
                            copy[idx] = e.target.value;
                            setQuestionForm({ ...questionForm, options: copy });
                          }}
                          placeholder={`أدخل الإجابة رقم ${idx + 1}`}
                        />
                        <div className="form-group" style={{ marginTop: 8 }}>
                          <label className="form-label">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={questionForm.correctIndex === idx}
                              onChange={() => setQuestionForm({ ...questionForm, correctIndex: idx })}
                            />
                            <span style={{ marginInlineStart: 8 }}>الإجابة الصحيحة</span>
                          </label>
                        </div>
                      </div>
                    ))}

                    <div className="form-group form-grid-full">
                      <label className="form-label">شرح (اختياري)</label>
                      <textarea
                        className="form-textarea"
                        rows={3}
                        value={questionForm.explanation || ''}
                        onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                        placeholder="اكتب شرحًا مختصرًا إن رغبت"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button className="btn-primary" onClick={handleSaveQuestion} disabled={questionSaving}>
                    {questionSaving ? 'جاري الحفظ...' : 'تم'}
                  </button>
                  <button className="btn-secondary" onClick={closeQuestionPopup} disabled={questionSaving}>إلغاء</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Toast --- */}
        {toastVisible && (
          <Toast
            isVisible={toastVisible}
            message={toastMessage}
            type={toastType}
            onClose={() => setToastVisible(false)}
          />
            
        )}
      </div>
    </div>
  );
}