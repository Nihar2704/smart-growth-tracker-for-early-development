import React from 'react';
import { Calendar, User, TrendingUp, ChevronRight, Edit3, Trash2 } from 'lucide-react';

export default function ChildCard({ child, onSelect, onEdit, onDelete }) {
  const isMale = child.sex === 'male';

  return (
    <div className="panel-card p-6 flex flex-col justify-between space-y-4 hover:border-[var(--primary)] transition duration-150">
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center font-bold text-base ${
              isMale
                ? 'bg-sky-50 text-sky-800 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                : 'bg-pink-50 text-pink-800 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800'
            }`}>
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-[var(--text-main)]">{child.name}</h3>
              <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded uppercase tracking-wider ${
                isMale
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300 dark:border-pink-800'
              }`}>
                {child.sex}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(child); }}
              className="p-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
              title="Edit Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(child.id); }}
              className="p-1.5 rounded text-[var(--text-secondary)] hover:text-[var(--status-error-text)] hover:bg-[var(--bg-subtle)] transition cursor-pointer"
              title="Delete Profile"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-3.5 border-t border-[var(--border-color)] my-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center justify-between">
            <span className="font-normal flex items-center gap-1.5 text-sm">
              <Calendar className="w-4 h-4 text-[var(--text-secondary)]" />
              Date of Birth:
            </span>
            <span className="font-mono font-medium text-sm text-[var(--text-main)]">{child.date_of_birth}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-normal flex items-center gap-1.5 text-sm">
              <User className="w-4 h-4 text-[var(--text-secondary)]" />
              Current Age:
            </span>
            <span className="font-mono text-[var(--primary)] text-xs font-semibold panel-card-subtle px-2.5 py-0.5 rounded">
              {child.age_formatted} ({child.age_in_months}m)
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSelect(child.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 btn-secondary text-sm rounded-lg transition cursor-pointer"
      >
        <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
        <span>View Child Profile</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
