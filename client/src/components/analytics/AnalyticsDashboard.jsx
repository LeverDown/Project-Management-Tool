import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban
} from 'lucide-react';
import { getProjectAnalyticsApi } from '../../api/analytics.js';
import StatusChart from './StatusChart.jsx';
import PriorityChart from './PriorityChart.jsx';
import OverdueCard from './OverdueCard.jsx';
import Spinner from '../common/Spinner.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import EmptyState from '../common/EmptyState.jsx';

export default function AnalyticsDashboard({ projectId, onTaskClick }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const result = await getProjectAnalyticsApi(projectId);
      setData(result);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load project analytics';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
        <Spinner size="lg" />
        <p className="mt-3 text-sm">Computing analytics metrics...</p>
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} onRetry={fetchAnalytics} />;
  }

  if (!data || data.total === 0) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="No task analytics available"
        description="Add tasks to this project to visualize progress, status distribution, and priority metrics."
      />
    );
  }

  const { total, byStatus, byPriority, overdue, overdueTasks } = data;
  const completed = byStatus['Done'] || 0;
  const inProgress = byStatus['In Progress'] || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">{total}</div>
          <div className="text-xs text-gray-400 dark:text-slate-500 mt-1">Total items in workspace</div>
        </div>

        {/* Completed */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{completed}</div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-1">
            {completionRate}% completion rate
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              In Progress
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">{inProgress}</div>
          <div className="text-xs text-blue-700 dark:text-blue-400 font-medium mt-1">Active work items</div>
        </div>

        {/* Overdue */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              Overdue
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{overdue}</div>
          <div className="text-xs text-rose-700 dark:text-rose-400 font-medium mt-1">Needs attention</div>
        </div>
      </div>

      {/* Visual Charts & Overdue Panel Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Status Distribution</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Breakdown of tasks across workflow columns</p>
          <StatusChart byStatus={byStatus} />
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5 shadow-2xs transition-colors">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Priority Breakdown</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Task volume categorized by priority tier</p>
          <PriorityChart byPriority={byPriority} />
        </div>

        {/* Overdue Tasks List */}
        <div>
          <OverdueCard overdueTasks={overdueTasks} onTaskClick={onTaskClick} />
        </div>
      </div>
    </div>
  );
}
