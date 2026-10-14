import React, { useState } from 'react';
import { X, Calendar, Ruler, Scale } from 'lucide-react';

export default function AddMeasurementModal({ isOpen, onClose, onSave, childName, childDob }) {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const h = parseFloat(height);
    const w = parseFloat(weight);

    if (!h || h <= 0) {
      setError('Please enter a valid height in centimeters.');
      return;
    }
    if (!w || w <= 0) {
      setError('Please enter a valid weight in kilograms.');
      return;
    }
    if (childDob && date < childDob) {
      setError(`Measurement date cannot be before date of birth (${childDob}).`);
      return;
    }

    try {
      await onSave({
        height_cm: h,
        weight_kg: w,
        measurement_date: date,
      });
      setHeight('');
      setWeight('');
      setError('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record measurement');
    }
  };

  // Preview BMI calculation
  const hNum = parseFloat(height);
  const wNum = parseFloat(weight);
  const previewBmi = (hNum > 0 && wNum > 0) ? (wNum / Math.pow(hNum / 100, 2)).toFixed(2) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="panel-card w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div>
            <h2 className="font-bold text-lg text-[var(--text-main)]">Record Growth Entry</h2>
            <p className="text-xs text-[var(--primary)] font-medium mt-0.5">Child: {childName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 border border-[var(--status-error-border)] bg-[var(--status-error-bg)] rounded-lg text-[var(--status-error-text)] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Measurement Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="date"
                min={childDob}
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Height (cm) *
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-3 w-4 h-4 text-[var(--primary)]" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 85.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                Weight (kg) *
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-3 w-4 h-4 text-[var(--primary)]" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 12.4"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {previewBmi && (
            <div className="p-3 bg-[var(--status-routine-bg)] border border-[var(--status-routine-border)] rounded-lg flex items-center justify-between text-xs">
              <span className="font-semibold text-[var(--status-routine-text)]">Computed BMI:</span>
              <span className="font-bold text-[var(--primary)] font-mono text-sm">{previewBmi} kg/m²</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 btn-secondary text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 btn-primary text-xs font-semibold shadow-xs cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
