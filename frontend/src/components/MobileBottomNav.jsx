import React from 'react';
import { LayoutDashboard, Users, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function MobileBottomNav({ currentView, setCurrentView }) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'children', label: 'Children', icon: Users },
    { id: 'growth', label: 'Growth', icon: TrendingUp },
    { id: 'milestones', label: 'Milestones', icon: CheckCircle2 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-[var(--border-color)] backdrop-blur-lg flex items-center justify-around py-1.5 px-2 safe-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-2 py-1 rounded-xl transition-all duration-150 cursor-pointer select-none ${
              isActive
                ? 'text-[var(--primary)] font-bold scale-102'
                : 'text-slate-500 hover:text-slate-800 active:scale-95'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${
              isActive ? 'bg-teal-50 text-[var(--primary)] ring-1 ring-teal-200' : 'text-slate-500'
            }`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[var(--primary)]' : 'font-medium text-slate-600'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
