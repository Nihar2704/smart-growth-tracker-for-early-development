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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-slate-700/60 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-xl text-white">Record Growth Entry</h2>
            <p className="text-xs text-teal-400 mt-0.5">For {childName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Measurement Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="date"
                min={childDob}
                max={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Height (cm) *
              </label>
              <div className="relative">
                <Ruler className="absolute left-3 top-3 w-4 h-4 text-teal-400" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 85.5"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Weight (kg) *
              </label>
              <div className="relative">
                <Scale className="absolute left-3 top-3 w-4 h-4 text-cyan-400" />
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 12.4"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
          </div>

          {previewBmi && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Computed BMI:</span>
              <span className="font-bold text-teal-300 text-sm">{previewBmi} kg/m²</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-teal-500/20 cursor-pointer"
            >
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
