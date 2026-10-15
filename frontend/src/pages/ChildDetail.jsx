import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Ruler,
  Scale,
  Activity,
  Calendar,
  User,
  Trash2,
  AlertCircle,
  Share2,
} from 'lucide-react';
import GrowthChart from '../components/GrowthChart';
import AddMeasurementModal from '../components/AddMeasurementModal';
import MLPredictionCard from '../components/MLPredictionCard';
import { getGrowthSummary, addGrowthMeasurement, deleteGrowthMeasurement, getMilestoneAssessments } from '../services/api';

export default function ChildDetail({ child, onBack }) {
  const [summary, setSummary] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const [growthData, milestoneData] = await Promise.allSettled([
        getGrowthSummary(child.id),
        getMilestoneAssessments(child.id),
      ]);

      if (growthData.status === 'fulfilled') {
        setSummary(growthData.value);
      }
      if (milestoneData.status === 'fulfilled' && Array.isArray(milestoneData.value) && milestoneData.value.length > 0) {
        setLatestAssessment(milestoneData.value[0]);
      }
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load growth summary.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (child?.id) {
      fetchSummary();
    }
  }, [child?.id]);

  const handleSaveMeasurement = async (measurementData) => {
    await addGrowthMeasurement(child.id, measurementData);
    await fetchSummary();
  };

  const handleDeleteMeasurement = async (measurementId) => {
    if (window.confirm('Are you sure you want to delete this measurement record?')) {
      await deleteGrowthMeasurement(measurementId);
      await fetchSummary();
    }
  };

  const handleWhatsAppShare = () => {
    let milestoneSection = '';
    if (latestAssessment) {
      const domainScores = latestAssessment.domain_breakdown
        ? latestAssessment.domain_breakdown
            .map((d) => `• *${d.domain_name}*: ${d.score || d.score_percentage}% (${d.achieved_count} Observed)`)
            .join('\n')
        : '';

      let questionnaireList = '';
      if (latestAssessment.questionnaire && latestAssessment.questionnaire.length > 0) {
        questionnaireList = latestAssessment.questionnaire
          .map((item, idx) => {
            const ansSymbol =
              item.answer === 'achieved'
                ? '✅ Observed / हाँ (करता है)'
                : item.answer === 'not_yet_observed'
                ? '⏳ Not Yet / अभी नहीं'
                : '❓ Unsure / पक्का नहीं';
            const hindiLine = item.hindi_text ? `\n     └ _(हिन्दी: ${item.hindi_text})_` : '';
            return `  ${idx + 1}. [${item.domain_name || item.domain}] *${item.text}*${hindiLine}\n     └ Status: ${ansSymbol}`;
          })
          .join('\n\n');
      }

      milestoneSection = `

🎯 *Latest CDC Milestone Assessment (${latestAssessment.assessment_date})*
👶 Age Bracket: ${latestAssessment.age_group} Months
📊 Overall Status: *${latestAssessment.status}*
${domainScores ? `\nDomain Breakdown:\n${domainScores}\n` : ''}${questionnaireList ? `\n📋 *CDC Developmental Milestone Questionnaire (${latestAssessment.questionnaire.length} Items):*\n\n${questionnaireList}\n` : ''}`;
    }

    const text = `🏥 *Smart Growth Tracker — Child Health & Milestone Report*

👶 *Child Name:* ${child.name} (${child.sex.toUpperCase()})
📅 *DOB:* ${child.date_of_birth} (Current Age: ${child.age_formatted})

📊 *Latest Physical Measurement Summary:*
• Height: ${summary?.latest_height_cm != null ? `${summary.latest_height_cm} cm` : 'No data'}
• Weight: ${summary?.latest_weight_kg != null ? `${summary.latest_weight_kg} kg` : 'No data'}
• Calculated BMI: ${summary?.latest_bmi != null ? `${summary.latest_bmi} kg/m²` : 'No data'}
• Total Records Logged: ${summary?.total_measurements || 0}${milestoneSection}

_Note: Educational report shared from Smart Growth Tracker for pediatrician consultation._`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!child) return null;

  return (
    <div className="space-y-6">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition font-medium text-xs cursor-pointer self-start py-1 px-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Child Profiles</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs px-3.5 py-2.2 rounded-xl transition cursor-pointer shadow-xs active:scale-95"
            title="Share full growth and CDC milestone questionnaire report via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 stroke-[2.4]" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 btn-primary text-xs px-3.5 py-2.2 cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Growth Entry</span>
          </button>
        </div>
      </div>

      {/* Child Profile Info Banner */}
      <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div
            className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center font-bold text-lg sm:text-xl shrink-0 shadow-2xs ${
              child.sex === 'male'
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : 'bg-pink-50 text-pink-800 border border-pink-200'
            }`}
          >
            {child.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--text-main)] tracking-tight">{child.name}</h1>
              <span
                className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  child.sex === 'male' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                }`}
              >
                {child.sex === 'male' ? 'Boy' : 'Girl'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 text-xs text-slate-600 font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                DOB: <strong className="text-slate-800 font-mono">{child.date_of_birth}</strong>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Age: <strong className="text-[var(--primary)] font-mono font-bold">{child.age_formatted} ({child.age_in_months}m)</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-mono font-medium">
            {summary?.total_measurements || 0} Measurements Logged
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-[var(--status-error-border)] bg-[var(--status-error-bg)] rounded-xl text-[var(--status-error-text)] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compact Stat Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Latest Height</span>
            <div className="p-1 rounded bg-teal-50 text-[var(--primary)]">
              <Ruler className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-main)] font-mono">
            {summary?.latest_height_cm != null ? `${summary.latest_height_cm} cm` : 'No Entry'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono truncate">
            {summary?.latest_measurement_date ? `Recorded ${summary.latest_measurement_date}` : 'Add first measurement'}
          </p>
        </div>

        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Latest Weight</span>
            <div className="p-1 rounded bg-teal-50 text-[var(--primary)]">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-main)] font-mono">
            {summary?.latest_weight_kg != null ? `${summary.latest_weight_kg} kg` : 'No Entry'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono truncate">
            {summary?.latest_measurement_date ? `Recorded ${summary.latest_measurement_date}` : 'Add first measurement'}
          </p>
        </div>

        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-4.5 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Calculated BMI</span>
            <div className="p-1 rounded bg-indigo-50 text-indigo-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[var(--text-main)] font-mono">
            {summary?.latest_bmi != null ? `${summary.latest_bmi} kg/m²` : 'No Entry'}
          </p>
          <p className="text-[11px] text-slate-500">WHO Body Mass Index</p>
        </div>
      </div>

      {/* Growth Chart */}
      <GrowthChart measurements={summary?.measurements || []} />

      {/* ML Prediction Service Card */}
      <MLPredictionCard childId={child.id} />

      {/* Measurement History Table */}
      <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-[var(--text-main)]">
              Logged Measurement History
            </h3>
            <p className="text-xs text-slate-500">Longitudinal physical growth measurements</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Entry</span>
          </button>
        </div>

        {!summary?.measurements || summary.measurements.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs sm:text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No physical measurements recorded yet for {child.name}. Tap "+ Add Entry" to record initial height and weight.
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-slate-500 font-semibold uppercase tracking-wider font-mono">
                    <th className="py-3 px-3.5">Date</th>
                    <th className="py-3 px-3.5">Age at Checkup</th>
                    <th className="py-3 px-3.5">Height (cm)</th>
                    <th className="py-3 px-3.5">Weight (kg)</th>
                    <th className="py-3 px-3.5">BMI (kg/m²)</th>
                    <th className="py-3 px-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)] font-mono">
                  {summary.measurements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3.5 font-bold text-[var(--text-main)]">{m.measurement_date}</td>
                      <td className="py-3 px-3.5 text-slate-600">{m.age_months_at_measurement}m</td>
                      <td className="py-3 px-3.5 text-[var(--primary)] font-bold">{m.height_cm} cm</td>
                      <td className="py-3 px-3.5 text-[var(--primary)] font-bold">{m.weight_kg} kg</td>
                      <td className="py-3 px-3.5 font-bold text-slate-800">{m.bmi}</td>
                      <td className="py-3 px-3.5 text-right">
                        <button
                          onClick={() => handleDeleteMeasurement(m.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-2.5">
              {summary.measurements.map((m) => (
                <div
                  key={m.id}
                  className="p-3.5 rounded-xl border border-[var(--border-color)] bg-white space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-main)] font-mono">{m.measurement_date}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
                        {m.age_months_at_measurement}m old
                      </span>
                      <button
                        onClick={() => handleDeleteMeasurement(m.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[var(--border-color)] text-center font-mono">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500">Height</div>
                      <div className="font-bold text-xs text-[var(--primary)]">{m.height_cm} cm</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500">Weight</div>
                      <div className="font-bold text-xs text-[var(--primary)]">{m.weight_kg} kg</div>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <div className="text-[10px] text-slate-500">BMI</div>
                      <div className="font-bold text-xs text-slate-800">{m.bmi}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AddMeasurementModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveMeasurement}
        childName={child.name}
        childDob={child.date_of_birth}
      />
    </div>
  );
}
