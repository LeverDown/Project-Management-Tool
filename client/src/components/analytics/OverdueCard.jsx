import React from 'react';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import Avatar from '../common/Avatar.jsx';
import { formatDate } from '../../utils/date.js';

export default function OverdueCard({ overdueTasks = [], onTaskClick }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Overdue Tasks</h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
          {overdueTasks.length} {overdueTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {overdueTasks.length === 0 ? (
        <div className="py-8 flex flex-col items-center justify-center text-center text-gray-400 dark:text-slate-500">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300">All caught up!</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">No tasks are currently past their due date.</p>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {overdueTasks.map((task) => (
            <div
              key={task._id}
              onClick={() => onTaskClick && onTaskClick(task)}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-rose-100 dark:border-rose-950/80 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/90 dark:hover:bg-rose-950/40 transition-colors cursor-pointer group"
            >
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-gray-900 dark:text-slate-100 group-hover:text-rose-700 dark:group-hover:text-rose-400 truncate">
                  {task.title}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>Due {formatDate(task.dueDate)}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                {task.assignee ? (
                  <Avatar user={task.assignee} size="xs" />
                ) : (
                  <span className="text-[10px] text-gray-400 dark:text-slate-500 italic">Unassigned</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
