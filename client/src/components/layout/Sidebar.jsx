import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FolderKanban } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle.jsx';

export default function Sidebar() {
  const location = useLocation();
  const isProjectDetail = location.pathname.startsWith('/projects/');

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 hidden md:flex flex-col flex-shrink-0 transition-colors">
      <div className="p-4 flex-1 space-y-6">
        <div>
          <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
            Workspace
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <FolderKanban className="w-4 h-4 flex-shrink-0" />
              <span>Projects</span>
            </NavLink>
          </nav>
        </div>

        {isProjectDetail && (
          <div>
            <div className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
              Active Project
            </div>
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Viewing Project</span>
            </div>
          </div>
        )}
      </div>

      {/* Theme Toggle in Footer (replaced Antigravity MERN) */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800">
        <ThemeToggle variant="button" />
      </div>
    </aside>
  );
}
