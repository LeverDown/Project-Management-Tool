import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function ThemeToggle({ variant = 'icon', className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleTheme();
        }}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
          isDark
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
        } ${className}`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        aria-label="Toggle theme"
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <div
          className={`w-8 h-4 rounded-full p-0.5 transition-colors relative flex items-center ${
            isDark ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-3 h-3 rounded-full bg-white shadow-xs transition-transform duration-200 ${
              isDark ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer ${className}`}
      title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600" />
      )}
    </button>
  );
}
