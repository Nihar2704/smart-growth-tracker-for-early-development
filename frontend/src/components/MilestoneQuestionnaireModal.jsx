import React, { useState, useEffect } from 'react';
import { getMilestoneQuestions, submitMilestoneAssessment } from '../services/api';
import { CheckCircle2, ChevronRight, ChevronLeft, X } from 'lucide-react';

const DOMAIN_STEPS = [
  { key: 'gross_motor', title: 'Gross Motor Skills', hindiTitle: 'शारीरिक विकास (गौण व स्थूल गति)', subtitle: 'Running, hopping, balancing, crawling' },
  { key: 'fine_motor', title: 'Fine Motor Skills', hindiTitle: 'हाथ व उँगलियों का विकास', subtitle: 'Drawing, holding objects, building blocks' },
  { key: 'language', title: 'Language & Communication', hindiTitle: 'भाषा व संवाद कौशल', subtitle: 'Making sounds, saying words, listening' },
  { key: 'cognitive', title: 'Cognitive Development', hindiTitle: 'मानसिक व सोचने का विकास', subtitle: 'Exploring, solving puzzles, counting' },
  { key: 'social_emotional', title: 'Social & Emotional', hindiTitle: 'सामाजिक व भावनात्मक विकास', subtitle: 'Smiling, sharing, expressing emotions' },
];

export default function MilestoneQuestionnaireModal({ isOpen, onClose, child, onAssessmentSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [questionsSet, setQuestionsSet] = useState(null);
  const [answers, setAnswers] = useState({});
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const calculateAgeMonths = (dobStr) => {
    if (!dobStr) return 12;
    const dob = new Date(dobStr);
    const today = new Date();
    const diffTime = Math.abs(today - dob);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.floor(diffDays / 30.4375));
  };

  useEffect(() => {
    if (isOpen && child) {
      loadQuestions();
    }
  }, [isOpen, child]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentStepIdx(0);
      const ageMonths = calculateAgeMonths(child.date_of_birth);
      const data = await getMilestoneQuestions(ageMonths);
      setQuestionsSet(data);

      const initialAnswers = {};
      data.questions.forEach((q) => {
        initialAnswers[q.id] = '';
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error('Failed to load milestone questions:', err);
      setError(err.response?.data?.detail || 'Could not load milestone questions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !child) return null;

  const totalQuestions = questionsSet?.questions.length || 0;
  const answeredCount = Object.values(answers).filter((a) => a !== '').length;
  const progressPct = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const currentDomain = DOMAIN_STEPS[currentStepIdx];
  const stepQuestions = questionsSet?.questions.filter((q) => q.domain === currentDomain.key) || [];

  const handleSelectAnswer = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: option,
    }));
  };

  const handleQuickFillAll = () => {
    if (!questionsSet) return;
    const newAnswers = {};
    questionsSet.questions.forEach((q) => {
      newAnswers[q.id] = 'achieved';
    });
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (answeredCount < totalQuestions) {
      if (!window.confirm(`You have answered ${answeredCount} of ${totalQuestions} questions. Do you want to submit your assessment now?`)) {
        return;
      }
    }

    try {
      setSubmitting(true);
      setError(null);

      const responsePayload = {
        assessment_date: assessmentDate,
        responses: Object.entries(answers)
          .filter(([_, ans]) => ans !== '')
          .map(([qId, ans]) => ({
            question_id: qId,
            answer: ans,
          })),
      };

      const result = await submitMilestoneAssessment(child.id, responsePayload);
      onAssessmentSubmitted(result);
      onClose();
    } catch (err) {
      console.error('Failed to submit milestone assessment:', err);
      setError(err.response?.data?.detail || 'Failed to save milestone assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="panel-card border border-[var(--border-color)] rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[var(--border-color)] panel-card sticky top-0 z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[var(--text-main)]">
                Developmental Milestone Assessment: {child.name}
              </h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono mt-0.5">
                Target Age Bracket: {questionsSet?.age_group || 24} Months (विकास आंकलन)
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-subtle)] transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium font-mono">
              <span>Step {currentStepIdx + 1} of 5: {currentDomain.title} ({currentDomain.hindiTitle})</span>
              <span className="text-[var(--primary)] font-bold">{progressPct}% ({answeredCount}/{totalQuestions})</span>
            </div>

            <div className="w-full bg-[var(--bg-subtle)] h-2 rounded overflow-hidden border border-[var(--border-color)]">
              <div
                className="bg-[var(--primary)] h-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center justify-between pt-1 gap-1.5 overflow-x-auto">
              {DOMAIN_STEPS.map((step, idx) => {
                const isCurrent = idx === currentStepIdx;
                const isComplete = questionsSet?.questions
                  .filter((q) => q.domain === step.key)
                  .every((q) => answers[q.id] && answers[q.id] !== '');

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => setCurrentStepIdx(idx)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'btn-primary font-semibold shadow-xs'
                        : isComplete
                        ? 'badge-routine'
                        : 'panel-card-subtle text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span>{step.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3.5 border border-[var(--status-error-border)] bg-[var(--status-error-bg)] rounded-lg text-[var(--status-error-text)] text-xs font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-[var(--text-secondary)]">
                Loading age-appropriate questionnaire items...
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Domain Header Banner */}
              <div className="p-4 rounded-lg panel-card-subtle flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-main)]">
                    {currentDomain.title}
                  </h3>
                  <p className="text-xs text-[var(--primary)] font-medium mt-0.5">{currentDomain.hindiTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillAll}
                  className="px-3.5 py-1.5 btn-secondary rounded text-xs font-semibold text-[var(--primary)] transition cursor-pointer"
                >
                  Quick Fill (All Observed / सभी हाँ)
                </button>
              </div>

              {/* Date Input */}
              {currentStepIdx === 0 && (
                <div className="panel-card-subtle p-3.5 rounded-lg flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--text-main)]">
                    Assessment Date (जाँच की तिथि):
                  </span>
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded px-3 py-1.5 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono text-xs"
                  />
                </div>
              )}

              {/* Dual-Language Questions List (English first, Hindi below) */}
              <div className="space-y-5">
                {stepQuestions.map((q, qIdx) => {
                  const currentAns = answers[q.id] || '';

                  return (
                    <div
                      key={q.id}
                      className="panel-card rounded-lg p-5 space-y-4"
                    >
                      {/* Dual-Language Question Title */}
                      <div className="space-y-1">
                        <span className="text-xs font-mono text-[var(--primary)] font-semibold">
                          Question {qIdx + 1} of {stepQuestions.length}
                        </span>
                        
                        {/* 1. Primary English Question */}
                        <h4 className="text-base font-semibold text-[var(--text-main)] leading-snug">
                          {q.text}
                        </h4>
                        
                        {/* 2. Secondary Hindi Question Below */}
                        {q.hindi_text && (
                          <p className="text-sm font-medium text-[var(--primary)] leading-snug">
                            {q.hindi_text}
                          </p>
                        )}
                      </div>



                      {/* Dual-Language 3-Way Segmented Control */}
                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, 'achieved')}
                          className={`py-2.5 px-3 rounded-lg text-xs flex flex-col items-center justify-center transition cursor-pointer border ${
                            currentAns === 'achieved'
                              ? 'badge-routine border-[var(--status-routine-border)] shadow-xs'
                              : 'btn-secondary text-[var(--text-secondary)]'
                          }`}
                        >
                          <span className="font-semibold">Achieved / Observed</span>
                          <span className="text-[11px] opacity-90 font-medium">✓ हाँ (करता है)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, 'not_yet_observed')}
                          className={`py-2.5 px-3 rounded-lg text-xs flex flex-col items-center justify-center transition cursor-pointer border ${
                            currentAns === 'not_yet_observed'
                              ? 'badge-caution border-[var(--status-caution-border)] shadow-xs'
                              : 'btn-secondary text-[var(--text-secondary)]'
                          }`}
                        >
                          <span className="font-semibold">Not Yet Observed</span>
                          <span className="text-[11px] opacity-90 font-medium">⏳ अभी नहीं</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, 'unsure')}
                          className={`py-2.5 px-3 rounded-lg text-xs flex flex-col items-center justify-center transition cursor-pointer border ${
                            currentAns === 'unsure'
                              ? 'panel-card-subtle text-[var(--text-main)] font-bold shadow-xs'
                              : 'btn-secondary text-[var(--text-secondary)]'
                          }`}
                        >
                          <span className="font-semibold">Unsure</span>
                          <span className="text-[11px] opacity-90 font-medium">❓ पक्का नहीं</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[var(--border-color)] panel-card flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIdx === 0}
            className="px-4 py-2.5 btn-secondary text-xs font-semibold transition disabled:opacity-30 flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Domain</span>
          </button>

          {currentStepIdx < DOMAIN_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStepIdx((prev) => Math.min(DOMAIN_STEPS.length - 1, prev + 1))}
              className="px-5 py-2.5 btn-primary text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>Next Domain ({DOMAIN_STEPS[currentStepIdx + 1].title})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="px-6 py-2.5 btn-primary text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs"
            >
              {submitting ? (
                <span>Saving Assessment...</span>
              ) : (
                <span>Complete & View Summary</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
