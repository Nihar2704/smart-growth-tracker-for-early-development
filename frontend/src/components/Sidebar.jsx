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
    <aside className="w-72 panel-card border-y-0 border-l-0 rounded-none flex flex-col justify-between p-5 shrink-0 min-h-[calc(100vh-4.5rem)]">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <p className="px-3 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  isActive
                    ? 'btn-primary font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[var(--text-secondary)]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-4 panel-card-subtle space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-main)]">
            <Brain className="w-4.5 h-4.5 text-[var(--primary)]" />
            <span>AI Model v2.0.0</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Calibrated Gradient Boosting Classifier active with WHO Z-score features.
          </p>
        </div>
      </div>

      <div className="p-4 panel-card-subtle text-xs space-y-1.5">
        <div className="flex items-center gap-2 font-semibold text-[var(--text-main)] text-sm">
          <Info className="w-4 h-4 text-[var(--text-secondary)]" />
          <span>Educational Support</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Non-diagnostic decision support prototype for parents & caregivers.
        </p>
      </div>
    </aside>
  );
}
