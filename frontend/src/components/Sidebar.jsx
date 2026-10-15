import React from 'react';
import { LayoutDashboard, Users, TrendingUp, CheckCircle2, Brain, Info } from 'lucide-react';

export default function Sidebar({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'children', label: 'Child Profiles', icon: Users },
    { id: 'growth', label: 'Growth Records', icon: TrendingUp },
    { id: 'milestones', label: 'Milestones & AI Assessment', icon: CheckCircle2 },
  ];

  return (
    <aside className="hidden md:flex w-68 bg-white border-r border-[var(--border-color)] flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4.25rem)]">
      <div className="space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Portal Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[var(--primary)] to-teal-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-white stroke-[2.4]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-100 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900">
            <Brain className="w-4 h-4 text-[var(--primary)]" />
            <span>Calibrated ML Model v2.0</span>
          </div>
          <p className="text-[11px] text-teal-800 leading-relaxed font-normal">
            94.3% F1-Score Random Forest engine integrating WHO growth metrics & CDC milestone observations.
          </p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
          <Info className="w-3.5 h-3.5 text-slate-500" />
          <span>Clinical Decision Support</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-normal">
          Non-diagnostic decision support designed for parent-pediatrician collaborative checkups.
        </p>
      </div>
    </aside>
  );
}
