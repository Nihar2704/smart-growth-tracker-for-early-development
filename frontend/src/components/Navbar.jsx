import React from 'react';
import { Activity, Plus, ShieldCheck, User, LogOut, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAddChild }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="h-15 sm:h-17 bg-white border-b border-[var(--border-color)] px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs backdrop-blur-md bg-white/95">
      {/* Brand Header */}
      <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group select-none">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-teal-800 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-150">
          <Activity className="h-5 w-5 sm:h-5.5 sm:w-5.5 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base sm:text-lg tracking-tight leading-tight text-[var(--text-main)]">
              GrowSense AI
            </span>
            <span className="hidden lg:inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-teal-50 text-[var(--primary)] border border-teal-200">
              WHO & CDC Aligned
            </span>
          </div>
          <p className="hidden sm:block text-[11px] sm:text-xs text-[var(--text-secondary)] font-normal">
            Early Childhood Physical Growth & CDC Milestone Monitoring
          </p>
        </div>
      </Link>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated && onOpenAddChild && (
          <button
            onClick={onOpenAddChild}
            className="flex items-center gap-1.5 btn-primary text-xs sm:text-sm px-2.5 sm:px-3.5 py-2 cursor-pointer shadow-xs active:scale-95 transition-transform"
            title="Add Child Profile"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Child</span>
          </button>
        )}

        <div className="h-5 w-px bg-[var(--border-color)] hidden sm:block"></div>

        {/* User Profile / Auth State */}
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center font-bold text-xs shadow-2xs ${
                isAdmin ? 'bg-purple-100 text-purple-900 border border-purple-200' : 'bg-teal-50 text-teal-800 border border-teal-200'
              }`}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-[var(--text-main)] truncate max-w-[140px]">{user?.name || 'User'}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                    isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {isAdmin ? 'Admin' : 'Parent'}
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5 truncate max-w-[180px]">
                  <ShieldCheck className="w-3 h-3 text-[var(--primary)] shrink-0" />
                  <span className="truncate">{user?.email || 'Logged In'}</span>
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[var(--primary)] transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </Link>
            <Link
              to="/register"
              className="px-3 py-1.5 text-xs font-semibold btn-primary shadow-xs"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
