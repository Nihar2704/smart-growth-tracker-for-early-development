import React from 'react';
import { Activity, Plus, ShieldCheck, User, Sun, Moon, LogOut, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAddChild, theme, onToggleTheme }) {
  const isLight = theme === 'light';
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-18 panel-card border-x-0 border-t-0 rounded-none px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-10 h-10 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Activity className="h-6 w-6 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight leading-none text-[var(--text-main)]">
              Smart Growth Tracker
            </h1>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider panel-card-subtle text-[var(--text-secondary)]">
              MVP
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] font-normal mt-1">
            Early Childhood Development & Growth Monitoring
          </p>
        </div>
      </Link>

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

        {isAuthenticated && onOpenAddChild && (
          <button
            onClick={onOpenAddChild}
            className="hidden sm:flex items-center gap-2 btn-primary text-sm px-4 py-2.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            <span>Add Child Profile</span>
          </button>
        )}

        <div className="h-6 w-px bg-[var(--border-color)] hidden sm:block"></div>

        {/* User Profile / Auth State */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <p className="font-semibold text-[var(--text-main)]">{user?.name || 'Parent'}</p>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                  {user?.email || 'Logged In'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="px-3.5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
