import React, { useState, useEffect } from 'react';
import { getMilestoneAssessments } from '../services/api';
import MilestoneQuestionnaireModal from '../components/MilestoneQuestionnaireModal';
import MilestoneResultCard from '../components/MilestoneResultCard';
import MLPredictionCard from '../components/MLPredictionCard';
import { CheckCircle2, Plus, Users, History, AlertCircle } from 'lucide-react';

export default function MilestoneTracker({ children, selectedChild, onSelectChild }) {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState(null);

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
      <div className="health-card p-8 text-center space-y-4 max-w-md mx-auto my-12">
        <Users className="w-10 h-10 text-slate-500 mx-auto" />
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-100">Select a Child Profile</h3>
          <p className="text-xs text-slate-400">
            Select a child profile to conduct CDC developmental milestone assessments and generate AI monitoring predictions.
          </p>
        </div>
        {children && children.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => onSelectChild(c.id)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-teal-700 hover:text-white text-slate-300 font-medium text-xs rounded-lg transition border border-slate-700 cursor-pointer"
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
              Milestone Assessment Module
            </span>
            <span className="text-xs text-slate-400 font-mono">Active Child: {selectedChild.name}</span>
          </div>
          <h1 className="text-xl font-semibold text-slate-100 mt-1">
            CDC Developmental Milestone Checkups
          </h1>
          <p className="text-xs text-slate-400 font-normal">
            Evaluate physical movement, fine motor skills, speech, cognitive reasoning, and social development.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {children && children.length > 1 && (
            <select
              value={selectedChild.id}
              onChange={(e) => onSelectChild(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg px-3 py-2 focus:outline-none focus:border-teal-500"
            >
              {children.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs px-4 py-2 rounded-lg transition border border-teal-600 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Start Milestone Assessment</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="py-12 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400">Loading milestone records for {selectedChild.name}...</p>
        </div>
      ) : assessments.length === 0 ? (
        <div className="health-card p-10 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-200">No Milestone Assessments Recorded</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Complete a 5-domain milestone assessment to evaluate {selectedChild.name}'s developmental progress.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-600 text-white font-medium text-xs px-4 py-2 rounded-lg transition border border-teal-600 cursor-pointer"
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
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Latest Milestone Summary
                </h2>
                <span className="text-xs text-slate-400 font-mono">
                  Total Completed: {assessments.length}
                </span>
              </div>
              <MilestoneResultCard assessment={activeAssessment} />
              <MLPredictionCard childId={selectedChild.id} assessmentId={activeAssessment?.id} />
            </div>
          )}

          {/* Past Assessment History Table */}
          <div className="health-card p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <span>Milestone Assessment History</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Age Group</th>
                    <th className="py-2.5 px-3">Physical</th>
                    <th className="py-2.5 px-3">Fine Motor</th>
                    <th className="py-2.5 px-3">Speech</th>
                    <th className="py-2.5 px-3">Cognitive</th>
                    <th className="py-2.5 px-3">Social</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {assessments.map((a) => {
                    const isSelected = activeAssessment?.id === a.id;
                    return (
                      <tr
                        key={a.id}
                        className={`hover:bg-slate-900/60 transition cursor-pointer ${
                          isSelected ? 'bg-slate-900 font-semibold' : ''
                        }`}
                        onClick={() => setActiveAssessment(a)}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-200">{a.assessment_date}</td>
                        <td className="py-2.5 px-3 text-teal-400 font-semibold">{a.age_group}m</td>
                        <td className="py-2.5 px-3">{a.gross_motor_score}%</td>
                        <td className="py-2.5 px-3">{a.fine_motor_score}%</td>
                        <td className="py-2.5 px-3">{a.language_score}%</td>
                        <td className="py-2.5 px-3">{a.cognitive_score}%</td>
                        <td className="py-2.5 px-3">{a.social_emotional_score}%</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            a.status === 'Additional Monitoring Recommended'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
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
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded border border-slate-700 transition cursor-pointer"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <MilestoneQuestionnaireModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        child={selectedChild}
        onAssessmentSubmitted={handleAssessmentSubmitted}
      />
    </div>
  );
}
