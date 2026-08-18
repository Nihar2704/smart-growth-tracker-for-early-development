import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp, Share2, Check } from 'lucide-react';

const STATUS_CONFIG = {
  'On Track': {
    badge: 'badge-routine',
    icon: CheckCircle2,
    title: 'Development On Track',
    subtitle: 'Child is meeting expected age-appropriate milestones across physical, motor, speech, and cognitive domains.',
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

  if (!assessment) return null;

  const statusInfo = STATUS_CONFIG[assessment.status] || STATUS_CONFIG['Incomplete'];
  const StatusIcon = statusInfo.icon;

  const generateWhatsAppMessage = () => {
    const domainText = assessment.domain_breakdown
      ? assessment.domain_breakdown.map((d) => `• ${d.domain_name}: ${d.score}% (${d.achieved_count} observed)`).join('\n')
      : `• Physical: ${assessment.gross_motor_score}%\n• Fine Motor: ${assessment.fine_motor_score}%\n• Speech: ${assessment.language_score}%\n• Cognitive: ${assessment.cognitive_score}%\n• Social: ${assessment.social_emotional_score}%`;

    return `🏥 *Smart Growth Tracker — Pediatric Health & Milestone Summary*

📅 *Assessment Date:* ${assessment.assessment_date}
👶 *Age Group:* ${assessment.age_group} months
📊 *Overall Status:* ${assessment.status}

🎯 *Developmental Domain Breakdown:*
${domainText}

${assessment.not_observed_count > 0 ? `⚠️ *Unobserved Milestones:* ${assessment.not_observed_count} items emerging` : '✅ *Milestones:* All age-appropriate milestones observed'}

_Note: Shared from Smart Growth Tracker for educational decision support during doctor visits._`;
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

  return (
    <div className="health-card p-6 space-y-6">
      {/* Top Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg health-card-subtle">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5">
            <StatusIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wider ${statusInfo.badge}`}>
                {assessment.status}
              </span>
              <span className="text-xs font-mono text-muted">
                Date: {assessment.assessment_date}
              </span>
            </div>
            <h3 className="text-base font-semibold text-main mt-1">
              {statusInfo.title}
            </h3>
            <p className="text-xs text-muted mt-0.5 leading-relaxed">{statusInfo.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Quick WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="px-3.5 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs rounded-lg transition flex items-center gap-2 cursor-pointer shadow-xs"
            title="Share summary via WhatsApp to doctor or caregiver"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={() => setShowDoctorNotes(!showDoctorNotes)}
            className="px-3 py-2 btn-secondary text-main font-medium text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{showDoctorNotes ? 'Hide Summary' : 'Doctor Notes'}</span>
            {showDoctorNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Doctor Visit Notes Section */}
      {showDoctorNotes && (
        <div className="p-4 rounded-lg health-card-subtle space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-main flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              <span>Well-Child Health Visit Summary</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="text-xs font-medium text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : null}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary Text'}</span>
              </button>
              <span className="text-xs text-muted font-mono">Age: {assessment.age_group}m</span>
            </div>
          </div>
          <p className="text-xs text-muted">
            Share this summary with your pediatrician during your child's routine wellness checkup:
          </p>
          <ul className="space-y-1 text-xs text-main list-disc list-inside p-3.5 rounded health-card font-mono leading-relaxed">
            <li><strong className="text-main">Assessment Date:</strong> {assessment.assessment_date} (Age: {assessment.age_months} months)</li>
            <li><strong className="text-main">Overall Observation:</strong> {statusInfo.title}</li>
            {assessment.not_observed_count > 0 ? (
              <li><strong className="text-amber-700 dark:text-amber-300">Unobserved Items ({assessment.not_observed_count}):</strong> Parent noted a few emerging milestones for routine observation.</li>
            ) : (
              <li><strong className="text-emerald-700 dark:text-emerald-300">Milestones:</strong> All age-appropriate milestones observed.</li>
            )}
          </ul>
        </div>
      )}

      {/* Domain Scores Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted">
          Developmental Domain Breakdown
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {assessment.domain_breakdown?.map((d) => {
            const isLow = d.score < 60;
            const isMid = d.score >= 60 && d.score < 80;
            const barColor = isLow
              ? 'bg-amber-600'
              : isMid
              ? 'bg-yellow-600'
              : 'bg-teal-600';

            return (
              <div key={d.domain} className="p-3.5 rounded-lg health-card-subtle space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-main">
                  <span>{d.domain_name}</span>
                  <span className="font-mono text-[var(--primary)]">{d.score}%</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-900 h-2 rounded overflow-hidden">
                  <div
                    className={`${barColor} h-full transition-all duration-300`}
                    style={{ width: `${d.score}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>{d.achieved_count} Observed</span>
                  {d.not_observed_count > 0 ? (
                    <span className="text-amber-700 dark:text-amber-400 font-medium">{d.not_observed_count} Not Yet</span>
                  ) : (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">✓ Complete</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Non-Diagnostic Disclaimer */}
      <div className="p-3.5 health-card-subtle rounded-lg flex items-start gap-2.5 text-xs text-muted">
        <Info className="w-4 h-4 text-muted shrink-0 mt-0.5" />
        <div className="leading-normal">
          <strong className="text-main">Developmental Reminder:</strong> Children develop at their own individual pace. This tool provides educational decision support and milestone tracking to share with your pediatrician. It is not a medical diagnosis.
        </div>
      </div>
    </div>
  );
}
