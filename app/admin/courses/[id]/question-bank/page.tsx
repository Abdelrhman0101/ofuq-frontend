'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styles from './AdminCourseQuestionBank.module.css';

import { getCourseFinalExamMeta, createCourseQuiz } from '@/utils/quizService';
import { getQuizQuestions, createQuestion, deleteQuestion, updateQuestion, type Question, type QuestionData } from '@/utils/questionService';

export default function AdminCourseQuestionBankPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = useMemo(() => Number(params?.id), [params]);

  const [loadingMeta, setLoadingMeta] = useState<boolean>(true);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<number | null>(null);
  const [questionsPoolCount, setQuestionsPoolCount] = useState<number>(0);
  const [hasSufficientBank, setHasSufficientBank] = useState<boolean>(false);

  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qError, setQError] = useState<string | null>(null);

  const [form, setForm] = useState<{ text: string; options: string[]; correctIndex: number; explanation?: string }>({
    text: '',
    options: ['', '', ''], // 3 خيارات أساسية + خيار رابع اختياري
    correctIndex: 0,
    explanation: ''
  });
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [filterQuery, setFilterQuery] = useState<string>('');

  // Preview & Edit states
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editForm, setEditForm] = useState<{ text: string; options: string[]; correctIndex: number; explanation?: string }>({
    text: '',
    options: ['', '', ''],
    correctIndex: 0,
    explanation: ''
  });

  const loadMeta = async () => {
    try {
      setLoadingMeta(true);
      setMetaError(null);
      const meta = await getCourseFinalExamMeta(courseId);
      const id = Number(meta.quiz_id || 0);
      setQuizId(id > 0 ? id : null);
      setQuestionsPoolCount(Number(meta.questions_pool_count || 0));
      setHasSufficientBank(Boolean(meta.has_sufficient_question_bank || false));
    } catch (err: any) {
      setMetaError(err?.message || 'تعذر جلب بيانات الامتحان النهائي للمقرر');
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadQuestions = async (qid: number) => {
    try {
      setLoadingQuestions(true);
      setQError(null);
      const items = await getQuizQuestions(qid);
      setQuestions(items);
    } catch (err: any) {
      setQError(err?.message || 'تعذر جلب قائمة الأسئلة');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (!courseId || Number.isNaN(courseId)) return;
    loadMeta();
  }, [courseId]);

  useEffect(() => {
    if (quizId) {
      loadQuestions(quizId);
    }
  }, [quizId]);

  const handleCreateFinalExam = async () => {
    try {
      setSubmitting(true);
      const quiz = await createCourseQuiz(courseId, { title: 'الامتحان النهائي للمقرر' });
      setQuizId(Number(quiz.id));
      await loadMeta();
    } catch (err: any) {
      alert(err?.message || 'تعذر إنشاء الامتحان النهائي');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFormChange = (index: number, value: string) => {
    const next = [...form.options];
    next[index] = value;
    setForm((f) => ({ ...f, options: next }));
  };

  const addFourthOption = () => {
    if (form.options.length < 4) {
      setForm((f) => ({ ...f, options: [...f.options, ''] }));
    }
  };

  const removeFourthOption = () => {
    if (form.options.length > 3) {
      const next = form.options.slice(0, 3);
      const correctedIndex = Math.min(form.correctIndex, next.length - 1);
      setForm((f) => ({ ...f, options: next, correctIndex: correctedIndex }));
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId) {
      alert('يرجى إنشاء الامتحان النهائي أولاً');
      return;
    }
    const trimmedOptions = form.options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!form.text.trim() || trimmedOptions.length < 3) {
      alert('يرجى إدخال نص السؤال و3 خيارات على الأقل');
      return;
    }
    const payload: QuestionData = {
      text: form.text.trim(),
      options: trimmedOptions,
      correctAnswer: Math.min(Number(form.correctIndex), trimmedOptions.length - 1),
      explanation: form.explanation?.trim() || undefined,
    };
    try {
      setSubmitting(true);
      await createQuestion(quizId, payload);
      setForm({ text: '', options: ['', '', ''], correctIndex: 0, explanation: '' });
      await loadQuestions(quizId);
      await loadMeta();
    } catch (err: any) {
      alert(err?.message || 'تعذر إنشاء السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('هل تريد حذف هذا السؤال؟')) return;
    try {
      setSubmitting(true);
      await deleteQuestion(questionId);
      if (quizId) {
        await loadQuestions(quizId);
        await loadMeta();
      }
    } catch (err: any) {
      alert(err?.message || 'تعذر حذف السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  const openPreview = (q: Question) => {
    setPreviewQuestion(q);
  };

  const closePreview = () => {
    setPreviewQuestion(null);
  };

  const openEdit = (q: Question) => {
    setEditingQuestion(q);
    const baseText = q.text || q.question || '';
    const opts = Array.isArray(q.options) && q.options.length > 0 ? q.options : ['', '', ''];
    const correctIdx = Number(q.correctAnswer ?? 0);
    setEditForm({
      text: baseText,
      options: [...opts].slice(0, Math.min(opts.length, 4)),
      correctIndex: Number.isNaN(correctIdx) ? 0 : correctIdx,
      explanation: q.explanation || ''
    });
  };

  const cancelEdit = () => {
    setEditingQuestion(null);
    setEditForm({ text: '', options: ['', '', ''], correctIndex: 0, explanation: '' });
  };

  const handleEditOptionChange = (index: number, value: string) => {
    const next = [...editForm.options];
    next[index] = value;
    setEditForm((f) => ({ ...f, options: next }));
  };

  const addFourthOptionEdit = () => {
    if (editForm.options.length < 4) {
      setEditForm((f) => ({ ...f, options: [...f.options, ''] }));
    }
  };

  const removeFourthOptionEdit = () => {
    if (editForm.options.length > 3) {
      const next = editForm.options.slice(0, 3);
      const correctedIndex = Math.min(editForm.correctIndex, next.length - 1);
      setEditForm((f) => ({ ...f, options: next, correctIndex: correctedIndex }));
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuestion) return;
    const trimmedOptions = editForm.options.map((o) => o.trim()).filter((o) => o.length > 0);
    if (!editForm.text.trim() || trimmedOptions.length < 3) {
      alert('يرجى إدخال نص السؤال و3 خيارات على الأقل');
      return;
    }
    try {
      setSubmitting(true);
      await updateQuestion(Number(editingQuestion.id), {
        text: editForm.text.trim(),
        options: trimmedOptions,
        correctAnswer: Math.min(Number(editForm.correctIndex), trimmedOptions.length - 1),
        explanation: editForm.explanation?.trim() || undefined,
      });
      if (quizId) await loadQuestions(quizId);
      cancelEdit();
    } catch (err: any) {
      alert(err?.message || 'تعذر تحديث السؤال');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <div className={styles.title}>إدارة بنك الأسئلة - مقرر #{courseId}</div>
        <div className={styles.actions}>
          <button className={styles.secondaryBtn} onClick={() => router.push('/admin/diplomas/question-bank')}>عودة لقائمة المقررات</button>
        </div>
      </div>

      {loadingMeta && <div className={styles.message}>جاري جلب بيانات الامتحان...</div>}
      {metaError && <div className={styles.error}>⚠️ {metaError}</div>}

      {!loadingMeta && !metaError && (
        <div className={styles.metaBox}>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>الحالة</div>
            <div>
              <span className={`${styles.statusPill} ${hasSufficientBank ? styles.statusReady : styles.statusNotReady}`}>
                {hasSufficientBank ? 'جاهز للاستخدام' : 'بحاجة إلى المزيد من الأسئلة'}
              </span>
            </div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>عدد الأسئلة المتاحة</div>
            <div className={styles.metaValue}>{questionsPoolCount}</div>
          </div>
          <div className={styles.metaItem}>
            <div className={styles.metaLabel}>رقم الامتحان (للمراجعة التقنية)</div>
            <div className={styles.muted}>{quizId ?? '—'}</div>
          </div>
          {!quizId && (
            <button className={styles.primaryBtn} onClick={handleCreateFinalExam} disabled={submitting}>
              إنشاء الامتحان النهائي للمقرر
            </button>
          )}
        </div>
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>إضافة سؤال جديد</h3>
        <form className={styles.form} onSubmit={handleAddQuestion} dir="rtl">
          <div className={styles.formGroup}>
            <label className={styles.label}>نص السؤال</label>
            <input
              type="text"
              className={styles.input}
              value={form.text}
              onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              placeholder="اكتب نص السؤال هنا"
            />
          </div>

          <div className={styles.optionsGrid}>
            {form.options.map((opt, idx) => (
              <div key={idx} className={styles.formGroup}>
                <label className={styles.label}>الخيار {idx + 1}</label>
                <input
                  type="text"
                  className={styles.input}
                  value={opt}
                  onChange={(e) => handleFormChange(idx, e.target.value)}
                  placeholder={`أدخل الخيار رقم ${idx + 1}`}
                />
              </div>
            ))}
          </div>

          <div className={styles.formActions}>
            {form.options.length === 3 ? (
              <button type="button" className={styles.toggleBtn} onClick={addFourthOption}>➕ إضافة خيار رابع (اختياري)</button>
            ) : (
              <button type="button" className={styles.toggleBtn} onClick={removeFourthOption}>➖ إزالة الخيار الرابع</button>
            )}
            <span className={styles.mutedSmall}>عدد الخيارات الحالي: <span className={styles.countBadge}>{form.options.length}</span></span>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>الإجابة الصحيحة</label>
              <select
                className={styles.select}
                value={form.correctIndex}
                onChange={(e) => setForm((f) => ({ ...f, correctIndex: Number(e.target.value) }))}
              >
                {Array.from({ length: form.options.length }).map((_, i) => (
                  <option key={i} value={i}>الخيار {i + 1}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>شرح (اختياري)</label>
              <input
                type="text"
                className={styles.input}
                value={form.explanation}
                onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
                placeholder="شرح السؤال أو سبب الإجابة"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryBtn} disabled={submitting || !quizId}>إضافة السؤال</button>
          </div>
        </form>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>قائمة الأسئلة</h3>
        {loadingQuestions && <div className={styles.message}>جاري تحميل الأسئلة...</div>}
        {qError && <div className={styles.error}>⚠️ {qError}</div>}
        {!loadingQuestions && !qError && (
          <div className={styles.tableWrap}>
            <div className={styles.searchRow}>
              <input
                type="text"
                className={styles.searchInput}
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="بحث بالسؤال..."
              />
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>#</th>
                  <th className={styles.th}>السؤال</th>
                  <th className={styles.th}>عدد الخيارات</th>
                  <th className={styles.th}>الإجابة الصحيحة</th>
                  <th className={styles.th}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {questions
                  .filter((q) => {
                    const text = (q.text || q.question || '').toLowerCase();
                    return text.includes(filterQuery.toLowerCase().trim());
                  })
                  .map((q, idx) => {
                  const correctIdx = Number(q.correctAnswer ?? 0);
                  const correctLabel = Array.isArray(q.options) && q.options[correctIdx] ? q.options[correctIdx] : `الخيار ${correctIdx + 1}`;
                  return (
                    <tr key={q.id} className={styles.row}>
                      <td className={styles.td}>{idx + 1}</td>
                      <td className={styles.td}>{q.text || q.question}</td>
                      <td className={styles.td}>{Array.isArray(q.options) ? q.options.length : 0}</td>
                      <td className={styles.td}>{correctLabel}</td>
                      <td className={styles.td}>
                        <div className={styles.actionGroup}>
                          <button className={styles.secondaryBtn} onClick={() => openPreview(q)} disabled={submitting}>عرض</button>
                          <button className={styles.primaryBtn} onClick={() => openEdit(q)} disabled={submitting}>تعديل</button>
                          <button className={styles.dangerBtn} onClick={() => handleDeleteQuestion(q.id)} disabled={submitting}>حذف</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {questions.length === 0 && (
                  <tr>
                    <td className={styles.td} colSpan={5}>لا توجد أسئلة حالياً</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Panel */}
      {previewQuestion && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>معاينة السؤال</div>
            <button className={styles.secondaryBtn} onClick={closePreview}>إغلاق</button>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.previewQuestionText}>{previewQuestion.text || previewQuestion.question}</div>
            <div className={styles.choices}>
              {Array.isArray(previewQuestion.options) && previewQuestion.options.map((opt, idx) => {
                const isCorrect = Number(previewQuestion.correctAnswer ?? 0) === idx;
                return (
                  <div key={idx} className={`${styles.choice} ${isCorrect ? styles.choiceCorrect : ''}`}>
                    <span className={styles.choiceIndex}>{idx + 1}.</span>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>
            {previewQuestion.explanation && (
              <div className={styles.explanation}>الشرح: {previewQuestion.explanation}</div>
            )}
          </div>
        </div>
      )}

      {/* Edit Panel */}
      {editingQuestion && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>تعديل السؤال #{editingQuestion.id}</div>
            <div className={styles.panelActions}>
              <button className={styles.secondaryBtn} onClick={cancelEdit}>إلغاء</button>
            </div>
          </div>
          <div className={styles.panelBody}>
            <form className={styles.form} onSubmit={handleUpdateQuestion} dir="rtl">
              <div className={styles.formGroup}>
                <label className={styles.label}>نص السؤال</label>
                <input
                  type="text"
                  className={styles.input}
                  value={editForm.text}
                  onChange={(e) => setEditForm((f) => ({ ...f, text: e.target.value }))}
                />
              </div>

              <div className={styles.optionsGrid}>
                {editForm.options.map((opt, idx) => (
                  <div key={idx} className={styles.formGroup}>
                    <label className={styles.label}>الخيار {idx + 1}</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={opt}
                      onChange={(e) => handleEditOptionChange(idx, e.target.value)}
                    />
                  </div>
                ))}
              </div>

              <div className={styles.formActions}>
                {editForm.options.length === 3 ? (
                  <button type="button" className={styles.toggleBtn} onClick={addFourthOptionEdit}>➕ إضافة خيار رابع (اختياري)</button>
                ) : (
                  <button type="button" className={styles.toggleBtn} onClick={removeFourthOptionEdit}>➖ إزالة الخيار الرابع</button>
                )}
                <span className={styles.mutedSmall}>عدد الخيارات الحالي: <span className={styles.countBadge}>{editForm.options.length}</span></span>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>الإجابة الصحيحة</label>
                  <select
                    className={styles.select}
                    value={editForm.correctIndex}
                    onChange={(e) => setEditForm((f) => ({ ...f, correctIndex: Number(e.target.value) }))}
                  >
                    {Array.from({ length: editForm.options.length }).map((_, i) => (
                      <option key={i} value={i}>الخيار {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>شرح (اختياري)</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={editForm.explanation}
                    onChange={(e) => setEditForm((f) => ({ ...f, explanation: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>حفظ التعديلات</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}