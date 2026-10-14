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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 border-t border-[var(--border-color)] backdrop-blur-md flex items-center justify-around py-2 px-2 safe-bottom shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
              isActive
                ? 'text-[var(--primary)] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-[var(--status-routine-bg)] text-[var(--primary)]' : ''}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] mt-0.5 tracking-tight font-medium">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
