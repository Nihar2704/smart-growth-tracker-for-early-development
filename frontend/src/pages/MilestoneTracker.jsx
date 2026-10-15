import React, { useState, useEffect } from 'react';
import { getMilestoneAssessments } from '../services/api';
import MilestoneQuestionnaireModal from '../components/MilestoneQuestionnaireModal';
import MilestoneResultCard from '../components/MilestoneResultCard';
import MLPredictionCard from '../components/MLPredictionCard';
import MilestoneChatbot from '../components/MilestoneChatbot';
import { CheckCircle2, Plus, Users, History, AlertCircle, Bot, Sparkles } from 'lucide-react';

export default function MilestoneTracker({ children, selectedChild, onSelectChild }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotQuery, setChatbotQuery] = useState(null);


  const fetchAssessments = async () => {
    if (!selectedChild) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMilestoneAssessments(selectedChild.id);
      setAssessments(data);
      if (data.length > 0) {
        setActiveAssessment(data[0]);
      } else {
        setActiveAssessment(null);
      }
    } catch (err) {
      console.error('Failed to fetch milestone assessments:', err);
      setError('Could not load milestone records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [selectedChild]);

  const handleAssessmentSubmitted = (newAssessment) => {
    setAssessments((prev) => [newAssessment, ...prev]);
    setActiveAssessment(newAssessment);
  };

  if (!selectedChild) {
    return (
      <div className="panel-card p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <Users className="w-10 h-10 text-[var(--text-secondary)] mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[var(--text-main)]">Select a Child Profile</h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Select a child profile to conduct CDC developmental milestone assessments and generate AI monitoring predictions.
          </p>
        </div>
        {children && children.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectChild(c.id)}
                className="px-3.5 py-1.5 btn-secondary text-xs rounded-lg transition cursor-pointer"
              >
                {c.name} ({c.sex})
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--primary)] border border-teal-200">
              CDC Milestone Engine
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">Child: {selectedChild.name}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] mt-1 tracking-tight">
            Developmental Milestone Checkups
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Evaluate physical movement, fine motor skills, speech, cognitive reasoning, and social development across 5 core domains.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {children && children.length > 1 && (
            <select
              value={selectedChild.id}
              onChange={(e) => onSelectChild(Number(e.target.value))}
              className="bg-white border border-[var(--border-color)] text-[var(--text-main)] text-xs font-semibold rounded-xl px-3 py-2.2 focus:outline-none focus:border-[var(--primary)] shadow-2xs"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.age_in_months}m)
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              setChatbotQuery(null);
              setIsChatbotOpen(true);
            }}
            className="flex items-center gap-1.5 btn-secondary text-xs px-3.5 py-2.2 cursor-pointer shadow-xs rounded-xl active:scale-95"
          >
            <Bot className="w-4 h-4 text-[var(--primary)]" />
            <span>Ask Pediatric AI</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 btn-primary text-xs px-4 py-2.2 cursor-pointer shadow-xs rounded-xl active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Start Assessment</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-[var(--status-error-border)] bg-[var(--status-error-bg)] rounded-lg text-[var(--status-error-text)] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-[var(--text-secondary)]">Loading milestone records for {selectedChild.name}...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="panel-card p-10 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[var(--text-secondary)] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-[var(--text-main)]">No Milestone Assessments Recorded</h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mx-auto">
              Complete a 5-domain milestone assessment to evaluate {selectedChild.name}'s developmental progress.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 btn-primary text-xs px-4 py-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Start First Milestone Assessment</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Result View */}
          {activeAssessment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Latest Milestone Summary
                </h2>
                <span className="text-xs text-[var(--text-secondary)] font-mono">
                  Total Completed: {assessments.length}
                </span>
              </div>
              <MilestoneResultCard assessment={activeAssessment} />
              <MLPredictionCard childId={selectedChild.id} assessmentId={activeAssessment?.id} />
            </div>
          )}

          {/* Past Assessment History */}
          <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                <span>CDC Assessment Longitudinal Records</span>
              </h3>
              <span className="text-xs font-mono text-slate-500 font-medium">
                {assessments.length} {assessments.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>

            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-slate-500 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Age Bracket</th>
                    <th className="py-2.5 px-3">Physical</th>
                    <th className="py-2.5 px-3">Fine Motor</th>
                    <th className="py-2.5 px-3">Speech</th>
                    <th className="py-2.5 px-3">Cognitive</th>
                    <th className="py-2.5 px-3">Social</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-mono">
                  {assessments.map((a) => {
                    const isSelected = activeAssessment?.id === a.id;
                    const isRoutine = a.status.includes('Routine') || a.status === 'On Track';
                    return (
                      <tr
                        key={a.id}
                        className={`hover:bg-slate-50 transition cursor-pointer ${
                          isSelected ? 'bg-teal-50/50 font-semibold' : ''
                        }`}
                        onClick={() => setActiveAssessment(a)}
                      >
                        <td className="py-2.5 px-3 font-bold text-[var(--text-main)]">{a.assessment_date}</td>
                        <td className="py-2.5 px-3 text-[var(--primary)] font-bold">{a.age_group}m</td>
                        <td className="py-2.5 px-3">{a.gross_motor_score}%</td>
                        <td className="py-2.5 px-3">{a.fine_motor_score}%</td>
                        <td className="py-2.5 px-3">{a.language_score}%</td>
                        <td className="py-2.5 px-3">{a.cognitive_score}%</td>
                        <td className="py-2.5 px-3">{a.social_emotional_score}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isRoutine ? 'badge-routine' : 'badge-caution'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveAssessment(a);
                            }}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                              isSelected ? 'btn-primary' : 'btn-secondary'
                            }`}
                          >
                            {isSelected ? 'Active' : 'View'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Card View (Clean, touch-friendly, never cracks or overflows) */}
            <div className="md:hidden space-y-2.5">
              {assessments.map((a) => {
                const isSelected = activeAssessment?.id === a.id;
                const isRoutine = a.status.includes('Routine') || a.status === 'On Track';
                return (
                  <div
                    key={a.id}
                    onClick={() => setActiveAssessment(a)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 shadow-2xs ${
                      isSelected
                        ? 'border-[var(--primary)] bg-teal-50/30 ring-2 ring-[var(--primary)]/20'
                        : 'border-[var(--border-color)] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[var(--text-main)] font-mono">{a.assessment_date}</span>
                      <span className="text-[var(--primary)] font-bold text-xs bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 font-mono">
                        {a.age_group} Months Bracket
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isRoutine ? 'badge-routine' : 'badge-caution'
                      }`}>
                        {a.status}
                      </span>
                      <span className="text-[11px] font-bold text-[var(--primary)]">
                        {isSelected ? '✓ Currently Viewing' : 'Tap to View Report'}
                      </span>
                    </div>

                    {/* Compact 5-Domain Grid */}
                    <div className="grid grid-cols-5 gap-1 pt-1.5 border-t border-[var(--border-color)] text-center font-mono text-[10px]">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-500 text-[9px]">Phys</div>
                        <div className="font-bold text-[var(--text-main)]">{a.gross_motor_score}%</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-500 text-[9px]">Fine</div>
                        <div className="font-bold text-[var(--text-main)]">{a.fine_motor_score}%</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-500 text-[9px]">Speech</div>
                        <div className="font-bold text-[var(--text-main)]">{a.language_score}%</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-500 text-[9px]">Cogn</div>
                        <div className="font-bold text-[var(--text-main)]">{a.cognitive_score}%</div>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                        <div className="text-slate-500 text-[9px]">Soc</div>
                        <div className="font-bold text-[var(--text-main)]">{a.social_emotional_score}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <MilestoneQuestionnaireModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        child={selectedChild}
        onAssessmentSubmitted={handleAssessmentSubmitted}
        onOpenAssistant={(query) => {
          setChatbotQuery(query);
          setIsChatbotOpen(true);
        }}
      />

      <MilestoneChatbot
        child={selectedChild}
        activeAssessment={activeAssessment}
        isOpen={isChatbotOpen}
        onToggle={setIsChatbotOpen}
        initialQuery={chatbotQuery}
      />
    </div>
  );
}

