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
import { getGrowthSummary, addGrowthMeasurement, deleteGrowthMeasurement } from '../services/api';

export default function ChildDetail({ child, onBack }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const data = await getGrowthSummary(child.id);
      setSummary(data);
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
    const text = `🏥 *Smart Growth Tracker — Child Growth Profile*

👶 *Child Name:* ${child.name} (${child.sex.toUpperCase()})
📅 *DOB:* ${child.date_of_birth} (Current Age: ${child.age_formatted})

📊 *Latest Physical Measurement Summary:*
• Height: ${summary?.latest_height_cm != null ? `${summary.latest_height_cm} cm` : 'No data'}
• Weight: ${summary?.latest_weight_kg != null ? `${summary.latest_weight_kg} kg` : 'No data'}
• Calculated BMI: ${summary?.latest_bmi != null ? `${summary.latest_bmi} kg/m²` : 'No data'}
• Total Records Logged: ${summary?.total_measurements || 0}

_Note: Educational growth report shared from Smart Growth Tracker for doctor visit decision support._`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  if (!child) return null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-main)] transition font-medium text-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Child Profiles</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Quick WhatsApp Share Button */}
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer shadow-xs"
            title="Share growth profile via WhatsApp to pediatrician"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 btn-primary text-xs px-3.5 py-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Growth Entry</span>
          </button>
        </div>
      </div>

      {/* Child Profile Info Banner */}
      <div className="panel-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${
              child.sex === 'male'
                ? 'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                : 'bg-pink-50 text-pink-800 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800'
            }`}
          >
            {child.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-[var(--text-main)]">{child.name}</h1>
              <span
                className={`px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider ${
                  child.sex === 'male' ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800' : 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800'
                }`}
              >
                {child.sex}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-1 text-xs text-[var(--text-secondary)] font-medium">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                DOB: <strong className="text-[var(--text-main)] font-mono">{child.date_of_birth}</strong>
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
                Current Age: <strong className="text-[var(--primary)] font-mono">{child.age_formatted} ({child.age_in_months}m)</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3 py-1 panel-card-subtle text-[var(--text-main)] rounded text-xs font-mono">
            {summary?.total_measurements || 0} Measurements Logged
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3 border border-[var(--status-error-border)] bg-[var(--status-error-bg)] rounded-lg text-[var(--status-error-text)] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Compact Stat Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="panel-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Latest Height</span>
            <Ruler className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-main)] font-mono">
            {summary?.latest_height_cm != null ? `${summary.latest_height_cm} cm` : 'No Entry'}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] font-mono">
            {summary?.latest_measurement_date ? `Recorded ${summary.latest_measurement_date}` : 'Add measurement'}
          </p>
        </div>

        <div className="panel-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Latest Weight</span>
            <Scale className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-main)] font-mono">
            {summary?.latest_weight_kg != null ? `${summary.latest_weight_kg} kg` : 'No Entry'}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)] font-mono">
            {summary?.latest_measurement_date ? `Recorded ${summary.latest_measurement_date}` : 'Add measurement'}
          </p>
        </div>

        <div className="panel-card p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] font-medium">
            <span>Calculated BMI</span>
            <Activity className="w-4 h-4 text-[var(--primary)]" />
          </div>
          <p className="text-xl font-semibold text-[var(--text-main)] font-mono">
            {summary?.latest_bmi != null ? `${summary.latest_bmi} kg/m²` : 'No Entry'}
          </p>
          <p className="text-[11px] text-[var(--text-secondary)]">Body Mass Index</p>
        </div>
      </div>

      {/* Growth Chart */}
      <GrowthChart measurements={summary?.measurements || []} />

      {/* ML Prediction Service Card */}
      <MLPredictionCard childId={child.id} />

      {/* Measurement History Table */}
      <div className="panel-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-[var(--text-main)]">
            Recorded Measurement History
          </h3>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="text-xs font-medium text-[var(--primary)] hover:underline cursor-pointer"
          >
            + Add Measurement
          </button>
        </div>

        {!summary?.measurements || summary.measurements.length === 0 ? (
          <div className="text-center py-6 text-[var(--text-secondary)] text-xs">
            No physical measurements recorded yet for {child.name}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-medium uppercase tracking-wider font-mono">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Age at Record</th>
                  <th className="py-2.5 px-3">Height (cm)</th>
                  <th className="py-2.5 px-3">Weight (kg)</th>
                  <th className="py-2.5 px-3">BMI (kg/m²)</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] font-mono">
                {summary.measurements.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--bg-subtle)] transition">
                    <td className="py-2.5 px-3 font-semibold text-[var(--text-main)]">{m.measurement_date}</td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)]">{m.age_months_at_measurement}m</td>
                    <td className="py-2.5 px-3 text-[var(--primary)] font-medium">{m.height_cm} cm</td>
                    <td className="py-2.5 px-3 text-[var(--primary)] font-medium">{m.weight_kg} kg</td>
                    <td className="py-2.5 px-3 font-medium">{m.bmi}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteMeasurement(m.id)}
                        className="p-1 rounded text-[var(--text-secondary)] hover:text-[var(--status-error-text)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
