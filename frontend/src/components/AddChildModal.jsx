import React, { useState, useEffect } from 'react';
import { X, User, Calendar } from 'lucide-react';

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
      setError('Child name is required.');
      return;
    }
    if (!dob) {
      setError('Date of birth is required.');
      return;
    }

    try {
      await onSave({ name, date_of_birth: dob, sex }, childToEdit?.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save child profile');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="panel-card w-full max-w-md rounded-2xl p-6 shadow-2xl relative border border-[var(--border-color)] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
          <h2 className="font-bold text-lg text-[var(--text-main)]">
            {childToEdit ? 'Edit Child Profile' : 'Add New Child Profile'}
          </h2>
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
              Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Date of Birth *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-[var(--text-muted)]" />
              <input
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--primary)] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
              Biological Sex *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSex('male')}
                className={`py-2.5 px-4 rounded-lg font-semibold text-xs border transition cursor-pointer ${
                  sex === 'male'
                    ? 'bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-400'
                    : 'panel-card-subtle text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                Male (Boy)
              </button>
              <button
                type="button"
                onClick={() => setSex('female')}
                className={`py-2.5 px-4 rounded-lg font-semibold text-xs border transition cursor-pointer ${
                  sex === 'female'
                    ? 'bg-pink-50 text-pink-800 border-pink-300 ring-1 ring-pink-400'
                    : 'panel-card-subtle text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                Female (Girl)
              </button>
            </div>
          </div>

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
              {childToEdit ? 'Save Changes' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
