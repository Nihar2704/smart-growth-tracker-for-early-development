import React, { useState } from 'react';
import { Plus, Search, Users, UserPlus } from 'lucide-react';
import ChildCard from '../components/ChildCard';

export default function ChildrenList({ children, onSelectChild, onOpenAddChild, onEditChild, onDeleteChild }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider panel-card-subtle text-[var(--primary)]">
              Child Directory
            </span>
            <span className="text-xs text-[var(--text-secondary)] font-mono">Total Registered: {children.length}</span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] mt-1 tracking-tight">
            Child Profiles
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Manage profiles, log physical growth measurements, and launch CDC milestone checkups.
          </p>
        </div>

        <button
          onClick={onOpenAddChild}
          className="flex items-center gap-2 btn-primary text-xs px-4 py-2.5 cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Child Profile</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder="Search profile by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg py-2.5 pl-10 pr-4 text-xs text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] transition shadow-xs"
        />
      </div>

      {/* Grid List */}
      {filteredChildren.length === 0 ? (
        <div className="panel-card p-12 text-center flex flex-col items-center justify-center space-y-3">
          <p className="text-[var(--text-secondary)] text-xs font-medium">
            {searchQuery ? `No children found matching "${searchQuery}"` : 'No child profiles registered yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenAddChild}
              className="text-xs font-semibold text-[var(--primary)] hover:underline cursor-pointer"
            >
              + Create your first child profile
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
