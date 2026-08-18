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
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/30">
              Child Directory
            </span>
            <span className="text-2xs text-slate-400 font-mono">Total Registered: {children.length}</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2 tracking-tight">
            <span>Child Profiles</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Manage profiles, log physical growth measurements, and launch CDC milestone checkups.
          </p>
        </div>

        <button
          onClick={onOpenAddChild}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-lg shadow-teal-500/20 cursor-pointer self-start sm:self-auto active:scale-95"
        >
          <UserPlus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Child Profile</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search profile by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-inner font-medium"
        />
      </div>

      {/* Grid List */}
      {filteredChildren.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-3 border border-dashed border-slate-800">
          <p className="text-slate-400 text-xs font-medium">
            {searchQuery ? `No children found matching "${searchQuery}"` : 'No child profiles registered yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onOpenAddChild}
              className="text-xs font-extrabold text-teal-400 hover:underline cursor-pointer"
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
