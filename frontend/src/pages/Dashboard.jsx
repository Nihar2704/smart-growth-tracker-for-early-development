import React from 'react';
import { Users, TrendingUp, CheckCircle2, Plus, ArrowRight, ShieldCheck, Brain, ShieldAlert, Sparkles, HeartPulse, Activity } from 'lucide-react';
import ChildCard from '../components/ChildCard';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ children, onSelectChild, onOpenAddChild, onNavigateChildren }) {
  const { user, isAdmin } = useAuth();
  const totalChildren = children.length;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Admin Specific Header Banner */}
      {isAdmin && (
        <div className="bg-purple-50/90 text-purple-950 p-4 sm:p-5 rounded-2xl shadow-xs border border-purple-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-200/70 text-purple-900 border border-purple-300">
                System Admin Scope
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-purple-900 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0" />
              <span>Administrator Multi-Tenant Oversight</span>
            </h2>
            <p className="text-xs text-purple-800 leading-relaxed max-w-2xl">
              Logged in as <strong>{user?.name}</strong>. Global visibility active across all registered parents and child profiles.
            </p>
          </div>

          <div className="bg-white/90 px-4 py-2.5 rounded-xl border border-purple-200 text-left sm:text-right shrink-0 shadow-2xs">
            <p className="text-[11px] text-purple-700 font-medium">System Total</p>
            <p className="text-xl sm:text-2xl font-black text-purple-950">{totalChildren} Children</p>
            <p className="text-[10px] text-purple-600">Cross-parent audit</p>
          </div>
        </div>
      )}

      {/* Hero Welcome & Quick Overview Banner */}
      <div className="bg-gradient-to-br from-white to-teal-50/40 border border-[var(--border-color)] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-[var(--primary)] border border-teal-200">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>WHO & CDC Development Engine</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
              Welcome, {user?.name ? user.name.split(' ')[0] : 'Parent'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Track physical growth trajectories (Height, Weight, BMI) against WHO standards and evaluate age-specific CDC developmental milestones across 5 fundamental domains.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                <span>WHO Standard Curves</span>
              </span>
              <span className="flex items-center gap-1 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>CDC Milestones (2m–5y)</span>
              </span>
              <span className="flex items-center gap-1 bg-white border border-slate-200/90 px-2.5 py-1 rounded-lg shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Gemini Pediatric AI</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAddChild}
              className="w-full sm:w-auto flex items-center justify-center gap-2 btn-primary text-xs sm:text-sm px-4.5 py-2.5 cursor-pointer shadow-xs active:scale-95 transition-all duration-150"
            >
              <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
              <span>Add Child Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Metrics Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4.5 space-y-1 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{isAdmin ? 'System Children' : 'Registered Children'}</span>
            <div className="p-1.5 rounded-xl bg-teal-50 text-[var(--primary)] border border-teal-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-[var(--text-main)] font-mono">{totalChildren}</p>
          <p className="text-[11px] text-slate-500 truncate">
            {isAdmin ? 'System-wide scope' : 'Active family profiles'}
          </p>
        </div>

        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4.5 space-y-1 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Physical Growth</span>
            <div className="p-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--text-main)] mt-0.5">WHO Growth</p>
          <p className="text-[11px] text-slate-500 truncate">Height, Weight, BMI</p>
        </div>

        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4.5 space-y-1 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>CDC Milestones</span>
            <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--text-main)] mt-0.5">5 Core Domains</p>
          <p className="text-[11px] text-slate-500 truncate">Motor, speech, cognitive</p>
        </div>

        <div className="bg-white border border-[var(--border-color)] rounded-2xl p-3.5 sm:p-4.5 space-y-1 shadow-2xs hover:-translate-y-0.5 hover:shadow-sm transition-all duration-150">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>ML Classifier</span>
            <div className="p-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Brain className="w-4 h-4" />
            </div>
          </div>
          <p className="text-sm sm:text-base font-bold text-[var(--text-main)] mt-0.5">Calibrated RF</p>
          <p className="text-[11px] font-bold text-teal-700 font-mono">94.3% F1-Score</p>
        </div>
      </div>

      {/* Children Profiles Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {isAdmin ? `All System Children (${totalChildren})` : `Child Profiles (${totalChildren})`}
            </h2>
          </div>
          {totalChildren > 0 && (
            <button
              onClick={onNavigateChildren}
              className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {totalChildren === 0 ? (
          <div className="bg-white border border-[var(--border-color)] rounded-2xl p-8 sm:p-12 text-center space-y-3.5 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-[var(--primary)] flex items-center justify-center mx-auto border border-teal-200">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[var(--text-main)]">No Child Profiles Created Yet</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Add your child profile to log physical growth measurements, track WHO curves, and assess CDC developmental milestones.
              </p>
            </div>
            <button
              onClick={onOpenAddChild}
              className="inline-flex items-center gap-2 btn-primary text-xs font-semibold px-4 py-2.5 cursor-pointer shadow-xs active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Create First Child Profile</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4.5">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                onSelect={onSelectChild}
              />
            ))}
          </div>
        )}
      </div>

      {/* Non-Diagnostic Clinical Notice */}
      <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-4.5 h-4.5 text-[var(--primary)] shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px] sm:text-xs">
          <strong className="text-slate-800 font-semibold">Educational & Pediatric Decision Support:</strong> GrowSense AI is designed to empower parents with structured growth tracking and milestone visibility. It does not provide medical diagnoses or replace regular pediatrician well-child checkups.
        </p>
      </div>
    </div>
  );
}
