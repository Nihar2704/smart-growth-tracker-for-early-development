import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';
import { getMilestoneQuestions } from '../services/api';

const STATUS_CONFIG = {
  'On Track': {
    badge: 'badge-routine',
    icon: CheckCircle2,
    title: 'Development On Track',
    subtitle: 'Child is meeting expected age-appropriate milestones across physical, motor, speech, and cognitive domains.',
  },
  'Routine Development Monitoring': {
    badge: 'badge-routine',
    icon: CheckCircle2,
    title: 'Routine Development Monitoring',
    subtitle: 'Overall milestone progress aligns with expected age benchmarks. Continue regular developmental monitoring.',
  },
  'Routine Monitoring': {
    badge: 'badge-routine',
    icon: CheckCircle2,
    title: 'Routine Development Monitoring',
    subtitle: 'Overall milestone progress aligns with expected age benchmarks. Continue regular developmental monitoring.',
  },
  'Additional Monitoring Recommended': {
    badge: 'badge-caution',
    icon: AlertCircle,
    title: 'Additional Monitoring Recommended',
    subtitle: 'Some age-appropriate milestones are marked "Not Yet Observed". Consider discussing these observations during your child\'s next routine health visit.',
  },
  Incomplete: {
    badge: 'health-card-subtle text-muted',
    icon: Info,
    title: 'Incomplete Assessment',
    subtitle: 'Please complete all questionnaire items for a full milestone assessment.',
  },
};

export default function MilestoneResultCard({ assessment }) {
  const [showDoctorNotes, setShowDoctorNotes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [questionsMap, setQuestionsMap] = useState({});

  useEffect(() => {
    if (assessment && assessment.age_months !== undefined) {
      getMilestoneQuestions(assessment.age_months)
        .then((data) => {
          if (data && data.questions) {
            const qMap = {};
            data.questions.forEach((q) => {
              qMap[q.id] = {
                text: q.text,
                hindi_text: q.hindi_text || '',
                domain: q.domain
              };
            });
            setQuestionsMap(qMap);
          }
        })
        .catch((err) => console.error('Could not fetch questions map for WhatsApp share:', err));
    }
  }, [assessment]);

  if (!assessment) return null;

  const statusInfo = STATUS_CONFIG[assessment.status] || STATUS_CONFIG['Incomplete'];
  const StatusIcon = statusInfo.icon;

  const generateWhatsAppMessage = () => {
    const domainText = assessment.domain_breakdown
      ? assessment.domain_breakdown
          .map((d) => `• *${d.domain_name}*: ${d.score || d.score_percentage}% (${d.achieved_count} Observed${d.not_observed_count > 0 ? `, ${d.not_observed_count} Emerging` : ''})`)
          .join('\n')
      : `• Physical: ${assessment.gross_motor_score}%\n• Fine Motor: ${assessment.fine_motor_score}%\n• Speech: ${assessment.language_score}%\n• Cognitive: ${assessment.cognitive_score}%\n• Social: ${assessment.social_emotional_score}%`;

    // Format itemized questionnaire questions and answers
    let questionnaireText = '';
    if (assessment.questionnaire && assessment.questionnaire.length > 0) {
      const formattedQ = assessment.questionnaire
        .map((item, index) => {
          const ansSymbol =
            item.answer === 'achieved'
              ? '✅ Observed / हाँ (करता है)'
              : item.answer === 'not_yet_observed'
              ? '⏳ Not Yet / अभी नहीं'
              : '❓ Unsure / पक्का नहीं';
          const hindiLine = item.hindi_text ? `\n     └ _(हिन्दी: ${item.hindi_text})_` : '';
          return `  ${index + 1}. [${item.domain_name || item.domain}] *${item.text}*${hindiLine}\n     └ Status: ${ansSymbol}`;
        })
        .join('\n\n');

      questionnaireText = `\n📋 *CDC Developmental Milestone Questionnaire (${assessment.questionnaire.length} Items):*\n\n${formattedQ}\n`;
    } else if (assessment.responses && Object.keys(assessment.responses).length > 0) {
      const formattedQ = Object.entries(assessment.responses)
        .map(([qId, ans], index) => {
          const qObj = questionsMap[qId];
          const qTitle = qObj?.text ? qObj.text : qId.toUpperCase().replace(/_/g, ' ');
          const hindiLine = qObj?.hindi_text ? `\n     └ _(हिन्दी: ${qObj.hindi_text})_` : '';
          const ansSymbol =
            ans === 'achieved'
              ? '✅ Observed / हाँ (करता है)'
              : ans === 'not_yet_observed'
              ? '⏳ Not Yet / अभी नहीं'
              : '❓ Unsure / पक्का नहीं';
          
          return `  ${index + 1}. *${qTitle}*${hindiLine}\n     └ Status: ${ansSymbol}`;
        })
        .join('\n\n');

      questionnaireText = `\n📋 *CDC Developmental Milestone Questionnaire (${Object.keys(assessment.responses).length} Items):*\n\n${formattedQ}\n`;
    }

    // Format guidance points
    const guidanceText =
      assessment.guidance && assessment.guidance.length > 0
        ? `\n💡 *Actionable Guidance:*\n${assessment.guidance.map((g) => `• ${g}`).join('\n')}\n`
        : '';

    return `🏥 *Smart Growth Tracker — Milestone Assessment & Questionnaire Report*

📅 *Assessment Date:* ${assessment.assessment_date}
👶 *Age Bracket:* ${assessment.age_group} Months (Age: ${assessment.age_months}m)
📊 *Overall Status:* ${assessment.status}
📈 *Completion Ratio:* ${Math.round((assessment.completion_ratio || 1) * 100)}%

🎯 *Developmental Domain Scores:*
${domainText}
${questionnaireText}${guidanceText}
_Shared from Smart Growth Tracker for educational decision support during pediatrician visits._`;
  };

  const handleWhatsAppShare = () => {
    const text = generateWhatsAppMessage();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const questionnaireItems = assessment.questionnaire || [];

  return (
    <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-6 shadow-2xs space-y-5">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0 mt-0.5 border border-teal-200">
            <StatusIcon className="w-5 h-5 stroke-[2.3]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusInfo.badge}`}>
                {assessment.status}
              </span>
              <span className="text-[11px] font-mono text-slate-500 font-medium">
                {assessment.assessment_date}
              </span>
            </div>
            <h3 className="text-base font-bold text-[var(--text-main)] mt-1">
              {statusInfo.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{statusInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Share report with full question text, Hindi translations, domain breakdown, and status via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.4]" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={() => setShowDoctorNotes(!showDoctorNotes)}
            className="px-3 py-2 btn-secondary text-slate-700 font-semibold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{showDoctorNotes ? 'Hide Summary' : 'Doctor Notes'}</span>
            {showDoctorNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Doctor Visit Notes Section */}
      {showDoctorNotes && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              <span>Well-Child Health Visit Summary & CDC Questionnaire</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Complete Report Text'}</span>
              </button>
              <span className="text-[11px] text-slate-500 font-mono">Bracket: {assessment.age_group}m</span>
            </div>
          </div>
          <p className="text-xs text-slate-600">
            Share this complete report with your pediatrician or family members:
          </p>
          <ul className="space-y-1 text-xs text-slate-800 list-disc list-inside p-3.5 rounded-xl bg-white border border-slate-200 font-mono leading-relaxed">
            <li><strong>Assessment Date:</strong> {assessment.assessment_date} (Age: {assessment.age_months} months)</li>
            <li><strong>Overall Observation:</strong> {statusInfo.title}</li>
            {assessment.not_observed_count > 0 ? (
              <li><strong className="text-amber-700">Unobserved Items ({assessment.not_observed_count}):</strong> Parent noted a few emerging milestones for routine observation.</li>
            ) : (
              <li><strong className="text-emerald-700">Milestones:</strong> All age-appropriate milestones observed.</li>
            )}
          </ul>

          {/* Questionnaire Breakdown in Doctor Notes */}
          {questionnaireItems.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h5 className="text-xs font-bold text-slate-800">Itemized Questions & Responses ({questionnaireItems.length} CDC Milestone Items)</h5>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {questionnaireItems.map((item, idx) => (
                  <div key={item.question_id || idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs flex items-start justify-between gap-3 shadow-2xs">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 leading-snug">
                        <span className="text-slate-500 font-normal mr-1.5">{idx + 1}. [{item.domain_name || item.domain}]</span>
                        {item.text}
                      </div>
                      {item.hindi_text && (
                        <div className="text-[11px] text-[var(--primary)] font-medium">
                          हिन्दी: {item.hindi_text}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      item.answer === 'achieved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.answer === 'not_yet_observed'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}>
                      {item.answer_label || item.answer}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Domain Scores Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Developmental Domain Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assessment.domain_breakdown?.map((d) => {
            const scoreVal = d.score !== undefined ? d.score : d.score_percentage;
            const isLow = scoreVal < 60;
            const isMid = scoreVal >= 60 && scoreVal < 80;
            const barColor = isLow
              ? 'bg-amber-600'
              : isMid
              ? 'bg-yellow-600'
              : 'bg-teal-600';

            return (
              <div key={d.domain || d.domain_key} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{d.domain_name}</span>
                  <span className="font-mono text-[var(--primary)]">{scoreVal}%</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${barColor} h-full transition-all duration-300 rounded-full`}
                    style={{ width: `${scoreVal}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{d.achieved_count} Observed</span>
                  {d.not_observed_count > 0 ? (
                    <span className="text-amber-700 font-semibold">{d.not_observed_count} Emerging</span>
                  ) : (
                    <span className="text-emerald-700 font-semibold">✓ Complete</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Non-Diagnostic Disclaimer */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed text-[11px] sm:text-xs">
          <strong className="text-slate-800">Developmental Guidance:</strong> Children reach milestones at their own unique pace. This report provides organized parent observations for your pediatrician's well-child visit. It is educational decision support and not a clinical diagnosis.
        </div>
      </div>
    </div>
  );
}
