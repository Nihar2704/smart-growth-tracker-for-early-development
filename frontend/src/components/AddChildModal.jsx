import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Baby, Heart } from 'lucide-react';

export default function AddChildModal({ isOpen, onClose, onSave, childToEdit = null }) {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [sex, setSex] = useState('male');
  const [error, setError] = useState('');

  useEffect(() => {
    if (childToEdit) {
      setName(childToEdit.name);
      setDob(childToEdit.date_of_birth);
      setSex(childToEdit.sex);
    } else {
      setName('');
      setDob('');
      setSex('male');
    }
    setError('');
  }, [childToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Child full name is required.');
      return;
    }
    if (!dob) {
      setError('Date of birth is required for WHO/CDC percentile accuracy.');
      return;
    }

    try {
      await onSave({ name: name.trim(), date_of_birth: dob, sex }, childToEdit?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save child profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl relative border border-[var(--border-color)] max-h-[90vh] overflow-y-auto">
        {/* Mobile Pull Bar */}
        <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-[var(--primary)] shrink-0">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[var(--text-main)]">
                {childToEdit ? 'Edit Child Profile' : 'Add Child Profile'}
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)]">
                WHO & CDC developmental tracking
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 border border-rose-200 bg-rose-50 rounded-xl text-rose-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Child's Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Date of Birth *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Required to calculate exact WHO percentiles and CDC age checklists.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
              Biological Sex *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSex('male')}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs border transition cursor-pointer flex items-center justify-center gap-2 ${
                  sex === 'male'
                    ? 'bg-sky-50 text-sky-800 border-sky-300 ring-2 ring-sky-400/40 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Boy (Male)</span>
              </button>
              <button
                type="button"
                onClick={() => setSex('female')}
                className={`py-2.5 px-3 rounded-xl font-semibold text-xs border transition cursor-pointer flex items-center justify-center gap-2 ${
                  sex === 'female'
                    ? 'bg-pink-50 text-pink-800 border-pink-300 ring-2 ring-pink-400/40 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Girl (Female)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 btn-secondary text-xs font-medium cursor-pointer rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 btn-primary text-xs font-semibold shadow-xs cursor-pointer rounded-xl active:scale-95"
            >
              {childToEdit ? 'Update Profile' : 'Save Child Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
