import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';
import ThemeToggle from '../common/ThemeToggle.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400 hover:opacity-90 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-sm">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">ProjectPulse</span>
          </Link>
        </div>

        {/* Right Menu: Theme Toggle & User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle variant="icon" />

          {user && (
            <>
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block" />

              <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
                <Avatar user={user} size="sm" />
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100 leading-none">{user.name}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-none">{user.email}</div>
                </div>
              </div>

              <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden sm:block" />

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
