import React from 'react';
import { Activity, Plus, ShieldCheck, User, Sun, Moon } from 'lucide-react';

export default function Navbar({ onOpenAddChild, theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <header className="h-18 panel-card border-x-0 border-t-0 rounded-none px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shrink-0">
          <Activity className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight leading-none text-[var(--text-main)]">
              Smart Growth Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider panel-card-subtle text-[var(--text-secondary)]">
              Prototype
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-normal mt-1">
            Early Childhood Development & Growth Monitoring
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Theme Switcher */}
        <button
          onClick={onToggleTheme}
          className="px-3 py-2 btn-secondary cursor-pointer flex items-center gap-2 text-sm font-medium"
          title={isLight ? 'Switch to Dark Mode' : 'Switch to Guidelines Light Mode'}
        >
          {isLight ? (
            <>
              <Moon className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
              <span className="hidden md:inline font-medium">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="w-4.5 h-4.5 text-[var(--status-caution-text)]" />
              <span className="hidden md:inline font-medium">Light Mode</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenAddChild}
          className="hidden sm:flex items-center gap-2 btn-primary text-sm px-4 py-2.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          <span>Add Child Profile</span>
        </button>

        <div className="h-6 w-px bg-[var(--border-color)] hidden sm:block"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 text-sm">
          <div className="w-9 h-9 rounded-lg panel-card-subtle flex items-center justify-center text-[var(--text-secondary)]">
            <User className="w-5 h-5" />
          </div>
          <div className="hidden md:block text-left leading-tight">
            <p className="font-semibold text-[var(--text-main)]">Parent / Caregiver</p>
            <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
              Non-Diagnostic Portal
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
