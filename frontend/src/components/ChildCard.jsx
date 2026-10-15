import React from 'react';
import { Calendar, User, TrendingUp, ChevronRight, Edit3, Trash2 } from 'lucide-react';

export default function ChildCard({ child, onSelect, onEdit, onDelete }) {
  const isMale = child.sex === 'male';

  return (
    <div className="bg-white border border-[var(--border-color)] rounded-2xl p-4.5 sm:p-5 flex flex-col justify-between space-y-4 hover:shadow-md hover:border-teal-300 transition-all duration-200 group">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base shadow-2xs shrink-0 ${
              isMale
                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                : 'bg-pink-50 text-pink-800 border border-pink-200'
            }`}>
              {child.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-base sm:text-lg text-[var(--text-main)] truncate tracking-tight">{child.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  isMale
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-pink-50 text-pink-700 border border-pink-200'
                }`}>
                  {isMale ? 'Boy' : 'Girl'}
                </span>
                <span className="text-[11px] font-medium text-slate-500 font-mono">
                  {child.age_in_months}m
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(child); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Edit Child Profile"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(child.id); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Delete Child Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="space-y-2 pt-3.5 border-t border-[var(--border-color)] my-3 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Date of Birth:
            </span>
            <span className="font-mono font-semibold text-slate-800">{child.date_of_birth}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Chronological Age:
            </span>
            <span className="font-mono text-[var(--primary)] font-bold bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md text-[11px]">
              {child.age_formatted}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onSelect(child.id)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 btn-secondary text-xs font-semibold rounded-xl transition cursor-pointer hover:border-[var(--primary)] group-hover:bg-teal-50/50"
      >
        <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
        <span>Open Growth & Milestones</span>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
}
