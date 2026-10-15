import React, { useState, useEffect } from 'react';
import { getMilestoneQuestions, submitMilestoneAssessment } from '../services/api';
import { CheckCircle2, ChevronRight, ChevronLeft, X, Sparkles, Bot } from 'lucide-react';

const DOMAIN_STEPS = [
  { key: 'gross_motor', title: 'Gross Motor Skills', hindiTitle: 'शारीरिक विकास (गौण व स्थूल गति)', subtitle: 'Running, hopping, balancing, crawling' },
  { key: 'fine_motor', title: 'Fine Motor Skills', hindiTitle: 'हाथ व उँगलियों का विकास', subtitle: 'Drawing, holding objects, building blocks' },
  { key: 'language', title: 'Language & Communication', hindiTitle: 'भाषा व संवाद कौशल', subtitle: 'Making sounds, saying words, listening' },
  { key: 'cognitive', title: 'Cognitive Development', hindiTitle: 'मानसिक व सोचने का विकास', subtitle: 'Exploring, solving puzzles, counting' },
  { key: 'social_emotional', title: 'Social & Emotional', hindiTitle: 'सामाजिक व भावनात्मक विकास', subtitle: 'Smiling, sharing, expressing emotions' },
];

export default function MilestoneQuestionnaireModal({ isOpen, onClose, child, onAssessmentSubmitted, onOpenAssistant }) {

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [questionsSet, setQuestionsSet] = useState(null);
  const [answers, setAnswers] = useState({});
  const [assessmentDate, setAssessmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const calculateAgeMonths = (dobStr, refDateStr = null) => {
    if (!dobStr) return 12;
    const dob = new Date(dobStr);
    const refDate = refDateStr ? new Date(refDateStr) : new Date();
    const diffTime = Math.max(0, refDate - dob);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.floor(diffDays / 30.4375));
  };

  useEffect(() => {
    if (isOpen && child) {
      loadQuestions(assessmentDate);
    }
  }, [isOpen, child, assessmentDate]);

  const loadQuestions = async (targetDate = assessmentDate) => {
    try {
      setLoading(true);
      setError(null);
      const ageMonths = calculateAgeMonths(child.date_of_birth, targetDate);
      const data = await getMilestoneQuestions(ageMonths);
      setQuestionsSet(data);

      const draftKey = `smart_growth_draft_${child.id}_age_${data.age_group}`;
      let savedDraft = {};
      try {
        const stored = localStorage.getItem(draftKey);
        if (stored) savedDraft = JSON.parse(stored);
      } catch (e) {
        console.warn('Could not parse saved draft:', e);
      }

      const initialAnswers = {};
      data.questions.forEach((q) => {
        initialAnswers[q.id] = savedDraft[q.id] || '';
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
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [qId]: option };
      const draftKey = `smart_growth_draft_${child.id}_age_${questionsSet?.age_group || 'default'}`;
      try {
        localStorage.setItem(draftKey, JSON.stringify(nextAnswers));
      } catch (e) {
        console.warn('Failed to save assessment draft to localStorage:', e);
      }
      return nextAnswers;
    });
  };

  const handleQuickFillAll = () => {
    if (!questionsSet) return;
    const newAnswers = {};
    questionsSet.questions.forEach((q) => {
      newAnswers[q.id] = 'achieved';
    });
    setAnswers(newAnswers);
    const draftKey = `smart_growth_draft_${child.id}_age_${questionsSet?.age_group || 'default'}`;
    try {
      localStorage.setItem(draftKey, JSON.stringify(newAnswers));
    } catch (e) {
      console.warn('Failed to save quick fill draft:', e);
    }
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
      try {
        localStorage.removeItem(`smart_growth_draft_${child.id}_age_${questionsSet?.age_group || 'default'}`);
        localStorage.removeItem(`smart_growth_draft_${child.id}`);
      } catch (e) {
        console.warn('Failed to remove assessment draft:', e);
      }
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-[var(--border-color)] rounded-t-3xl sm:rounded-2xl w-full max-w-3xl max-h-[94vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-color)] bg-white sticky top-0 z-10 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)] truncate">
                CDC Milestone Checkup: {child.name}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-mono mt-0.5">
                Target Age Bracket: <strong className="text-[var(--primary)]">{questionsSet?.age_group || 24} Months</strong> (विकास आंकलन)
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-600 font-medium font-mono">
              <span className="truncate max-w-[240px] sm:max-w-none">
                Domain {currentStepIdx + 1}/5: {currentDomain.title}
              </span>
              <span className="text-[var(--primary)] font-bold shrink-0">
                {progressPct}% ({answeredCount}/{totalQuestions})
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div
                className="bg-gradient-to-r from-[var(--primary)] to-teal-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 cursor-pointer ${
                      isCurrent
                        ? 'btn-primary shadow-xs'
                        : isComplete
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{step.title.split(' ')[0]}</span>
                    {isComplete && <span className="ml-1 text-emerald-600">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-5 bg-[#FAFBFB]">
          {error && (
            <div className="p-3 border border-rose-200 bg-rose-50 rounded-xl text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500">Loading age-appropriate CDC questions...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Domain Header Banner */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--text-main)]">
                    {currentDomain.title}
                  </h3>
                  <p className="text-xs text-[var(--primary)] font-medium mt-0.5">{currentDomain.hindiTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickFillAll}
                  className="px-3 py-1.5 btn-secondary rounded-lg text-xs font-semibold text-[var(--primary)] transition cursor-pointer self-start sm:self-auto hover:bg-teal-50"
                >
                  Quick Fill (All Observed / सभी हाँ)
                </button>
              </div>

              {/* Date Input */}
              {currentStepIdx === 0 && (
                <div className="bg-white border border-[var(--border-color)] p-3 sm:p-3.5 rounded-xl flex items-center justify-between text-xs shadow-2xs">
                  <span className="font-semibold text-slate-700">
                    Assessment Date (जाँच की तिथि):
                  </span>
                  <input
                    type="date"
                    value={assessmentDate}
                    onChange={(e) => setAssessmentDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[var(--primary)] font-mono text-xs"
                  />
                </div>
              )}

              {/* Dual-Language Questions List (English first, Hindi below) */}
              <div className="space-y-3.5 sm:space-y-4">
                {stepQuestions.map((q, qIdx) => {
                  const currentAns = answers[q.id] || '';

                  return (
                    <div
                      key={q.id}
                      className="bg-white border border-[var(--border-color)] rounded-xl p-4 sm:p-5 space-y-3 shadow-2xs"
                    >
                      {/* Dual-Language Question Title */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-[var(--primary)] font-bold uppercase tracking-wider">
                          Question {qIdx + 1} of {stepQuestions.length}
                        </span>
                        
                        {/* 1. Primary English Question */}
                        <h4 className="text-sm sm:text-base font-bold text-[var(--text-main)] leading-snug">
                          {q.text}
                        </h4>
                        
                        {/* 2. Secondary Hindi Question Below */}
                        {q.hindi_text && (
                          <p className="text-xs sm:text-sm font-medium text-[var(--primary)] leading-snug">
                            हिन्दी: {q.hindi_text}
                          </p>
                        )}

                        {/* 3. AI Clarification Button */}
                        {onOpenAssistant && (
                          <div className="pt-1 flex items-center">
                            <button
                              type="button"
                              onClick={() =>
                                onOpenAssistant(
                                  `Could you please explain what to look for in this milestone question: "${q.text}" for my child?`
                                )
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition cursor-pointer shadow-2xs"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              <span>Clarify with Pediatric AI</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dual-Language 3-Way Segmented Control */}
                      <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, 'achieved')}
                          className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-center flex flex-col items-center justify-center transition cursor-pointer border ${
                            currentAns === 'achieved'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/30 shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <span className="font-bold text-[11px] sm:text-xs">Observed</span>
                          <span className="text-[10px] sm:text-[11px] font-medium opacity-90">✓ हाँ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, 'not_yet_observed')}
                          className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-center flex flex-col items-center justify-center transition cursor-pointer border ${
                            currentAns === 'not_yet_observed'
                              ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <span className="font-bold text-[11px] sm:text-xs">Not Yet</span>
                          <span className="text-[10px] sm:text-[11px] font-medium opacity-90">⏳ अभी नहीं</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectAnswer(q.id, 'unsure')}
                          className={`py-2 sm:py-2.5 px-1.5 sm:px-3 rounded-xl text-center flex flex-col items-center justify-center transition cursor-pointer border ${
                            currentAns === 'unsure'
                              ? 'bg-slate-200 text-slate-900 border-slate-400 ring-2 ring-slate-400/30 shadow-xs font-bold'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                          }`}
                        >
                          <span className="font-bold text-[11px] sm:text-xs">Unsure</span>
                          <span className="text-[10px] sm:text-[11px] font-medium opacity-90">❓ पक्का नहीं</span>
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
        <div className="p-3.5 sm:p-4 border-t border-[var(--border-color)] bg-white flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIdx === 0}
            className="px-3.5 py-2 btn-secondary text-xs font-semibold transition disabled:opacity-30 flex items-center gap-1 cursor-pointer rounded-xl"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Previous Domain</span>
            <span className="sm:hidden">Back</span>
          </button>

          {currentStepIdx < DOMAIN_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStepIdx((prev) => Math.min(DOMAIN_STEPS.length - 1, prev + 1))}
              className="px-4 sm:px-5 py-2 btn-primary text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs rounded-xl active:scale-95"
            >
              <span>Next ({DOMAIN_STEPS[currentStepIdx + 1].title.split(' ')[0]})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading}
              className="px-4 sm:px-6 py-2 btn-primary text-xs font-semibold transition flex items-center gap-1 cursor-pointer shadow-xs rounded-xl active:scale-95"
            >
              {submitting ? (
                <span>Saving Assessment...</span>
              ) : (
                <span>Complete Assessment</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
