import React, { useState } from 'react';
import { Plus, Search, Users, UserPlus } from 'lucide-react';
import ChildCard from '../components/ChildCard';

export default function ChildrenList({ children, onSelectChild, onOpenAddChild, onEditChild, onDeleteChild }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 sm:space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--primary)] border border-teal-200">
              Child Directory
            </span>
            <span className="text-xs text-slate-500 font-mono font-medium">Total: {children.length}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-main)] mt-1 tracking-tight">
            Child Profiles & Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Select a child profile to review growth curves, log measurements, and conduct CDC milestone checkups.
          </p>
        </div>

        <button
          onClick={onOpenAddChild}
          className="flex items-center gap-2 btn-primary text-xs sm:text-sm font-bold px-4.5 sm:px-5 py-2.5 sm:py-3 cursor-pointer self-start sm:self-auto shadow-sm hover:shadow-md active:scale-95 transition-all rounded-xl"
        >
          <UserPlus className="w-4.5 h-4.5 stroke-[2.8]" />
          <span>Add Child Profile</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search child by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-[var(--border-color)] rounded-xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-[var(--text-main)] placeholder-slate-400 focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10 transition shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid List */}
      {filteredChildren.length === 0 ? (
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-10 sm:p-14 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-200">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-slate-600 text-xs sm:text-sm font-medium max-w-xs">
            {searchQuery ? `No child profiles found matching "${searchQuery}"` : 'No child profiles registered in your account yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenAddChild}
              className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer"
            >
              + Create your first child profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
          {filteredChildren.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onSelect={onSelectChild}
              onEdit={onEditChild}
              onDelete={onDeleteChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
