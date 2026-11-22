import React, { useMemo } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../common/Badge.jsx';
import Avatar from '../common/Avatar.jsx';
import { formatShortDate, isOverdue } from '../../utils/date.js';

const STATUS_BAR_COLORS = {
  'Todo': 'bg-slate-400 hover:bg-slate-500 border-slate-500 text-white',
  'In Progress': 'bg-blue-500 hover:bg-blue-600 border-blue-600 text-white',
  'Review': 'bg-amber-500 hover:bg-amber-600 border-amber-600 text-white',
  'Done': 'bg-emerald-500 hover:bg-emerald-600 border-emerald-600 text-white'
};

export default function GanttChart({ tasks = [], onTaskClick }) {
  const { scheduledTasks, unscheduledTasks } = useMemo(() => {
    const scheduled = [];
    const unscheduled = [];

    tasks.forEach((task) => {
      if (task.startDate && task.dueDate) {
        const start = new Date(task.startDate).getTime();
        const end = new Date(task.dueDate).getTime();
        if (!isNaN(start) && !isNaN(end) && end >= start) {
          scheduled.push(task);
          return;
        }
      }
      unscheduled.push(task);
    });

    return { scheduledTasks: scheduled, unscheduledTasks: unscheduled };
  }, [tasks]);

  const timelineData = useMemo(() => {
    if (scheduledTasks.length === 0) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    let minTime = Math.min(...scheduledTasks.map((t) => new Date(t.startDate).getTime()), todayTime);
    let maxTime = Math.max(...scheduledTasks.map((t) => new Date(t.dueDate).getTime()), todayTime);

    const minDate = new Date(minTime);
    minDate.setHours(0, 0, 0, 0);
    minDate.setDate(minDate.getDate() - 3);

    const maxDate = new Date(maxTime);
    maxDate.setHours(0, 0, 0, 0);
    maxDate.setDate(maxDate.getDate() + 4);

    const dayDiff = Math.max(1, Math.round((maxDate - minDate) / (1000 * 60 * 60 * 24)));

    const days = [];
    for (let i = 0; i < dayDiff; i++) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + i);
      const isToday = d.getTime() === today.getTime();
      days.push({
        date: d,
        index: i,
        dayOfMonth: d.getDate(),
        monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
        weekdayShort: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        isToday,
        isWeekend: d.getDay() === 0 || d.getDay() === 6
      });
    }

    const todayIndex = days.findIndex((d) => d.isToday);

    return {
      minDate,
      maxDate,
      totalDays: dayDiff,
      days,
      todayIndex
    };
  }, [scheduledTasks]);

  if (scheduledTasks.length === 0 && unscheduledTasks.length === 0) {
    return (
      <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-8 shadow-xs transition-colors">
        <Calendar className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-800 dark:text-slate-100">No tasks in this project</h3>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Create tasks and specify start and due dates to view timeline.</p>
      </div>
    );
  }

  const columnWidth = 44;

  return (
    <div className="space-y-6">
      {/* Main Gantt Timeline Container */}
      {timelineData ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
          <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50 dark:bg-slate-900/50">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Project Timeline</h3>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                Visualizing {scheduledTasks.length} scheduled {scheduledTasks.length === 1 ? 'task' : 'tasks'}
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="text-gray-600 dark:text-slate-300">Today Marker</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
                <span className="text-gray-600 dark:text-slate-300">Overdue Task</span>
              </div>
            </div>
          </div>

          {/* Scrollable Timeline Grid */}
          <div className="overflow-x-auto relative">
            <div
              className="min-w-full"
              style={{ width: `${260 + timelineData.totalDays * columnWidth}px` }}
            >
              {/* Header: Months & Days */}
              <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/80 sticky top-0 z-30">
                {/* Sticky Left Column Header */}
                <div className="w-[260px] flex-shrink-0 sticky left-0 z-40 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 p-3 text-xs font-semibold text-gray-600 dark:text-slate-300">
                  Task
                </div>

                {/* Day Columns Header */}
                <div className="flex flex-1">
                  {timelineData.days.map((day) => (
                    <div
                      key={day.index}
                      style={{ width: `${columnWidth}px` }}
                      className={`flex-shrink-0 flex flex-col items-center justify-center py-2 border-r border-gray-100 dark:border-slate-800 text-center ${
                        day.isToday
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/60 font-bold text-indigo-700 dark:text-indigo-400'
                          : day.isWeekend
                          ? 'bg-gray-100/40 dark:bg-slate-800/40 text-gray-400 dark:text-slate-500'
                          : 'text-gray-600 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase leading-none">
                        {day.weekdayShort}
                      </span>
                      <span className="text-xs font-semibold mt-0.5 leading-none">
                        {day.dayOfMonth}
                      </span>
                      {day.dayOfMonth === 1 && (
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 uppercase mt-0.5">
                          {day.monthShort}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rows for Scheduled Tasks */}
              <div className="divide-y divide-gray-100 dark:divide-slate-800 relative">
                {/* Vertical "Today" Marker Line */}
                {timelineData.todayIndex >= 0 && (
                  <div
                    style={{
                      left: `${260 + timelineData.todayIndex * columnWidth + columnWidth / 2}px`
                    }}
                    className="absolute top-0 bottom-0 w-0.5 bg-indigo-500 z-10 pointer-events-none"
                  >
                    <span className="sticky top-11 -translate-x-1/2 inline-block px-1.5 py-0.5 bg-indigo-600 text-[10px] font-bold text-white rounded shadow-xs">
                      Today
                    </span>
                  </div>
                )}

                {scheduledTasks.map((task) => {
                  const taskStart = new Date(task.startDate);
                  taskStart.setHours(0, 0, 0, 0);

                  const taskDue = new Date(task.dueDate);
                  taskDue.setHours(0, 0, 0, 0);

                  const startOffsetDays = Math.max(
                    0,
                    Math.round((taskStart - timelineData.minDate) / (1000 * 60 * 60 * 24))
                  );
                  const durationDays = Math.max(
                    1,
                    Math.round((taskDue - taskStart) / (1000 * 60 * 60 * 24)) + 1
                  );

                  const overdue = isOverdue(task.dueDate, task.status);
                  const barColor = overdue
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : STATUS_BAR_COLORS[task.status] || 'bg-indigo-500 text-white';

                  return (
                    <div
                      key={task._id}
                      className="flex items-center hover:bg-gray-50/60 dark:hover:bg-slate-800/40 transition-colors h-12 relative group"
                    >
                      {/* Left sticky task info */}
                      <div
                        onClick={() => onTaskClick && onTaskClick(task)}
                        className="w-[260px] flex-shrink-0 sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-gray-50 dark:group-hover:bg-slate-850 border-r border-gray-200 dark:border-slate-800 px-3 py-2 flex items-center justify-between gap-2 cursor-pointer shadow-[2px_0_4px_-2px_rgba(0,0,0,0.05)]"
                      >
                        <span className="text-xs font-semibold text-gray-800 dark:text-slate-100 truncate" title={task.title}>
                          {task.title}
                        </span>
                        <StatusBadge status={task.status} size="xs" />
                      </div>

                      {/* Right timeline bar track */}
                      <div className="flex-1 h-full relative">
                        {/* Task Horizontal Bar */}
                        <div
                          onClick={() => onTaskClick && onTaskClick(task)}
                          style={{
                            left: `${startOffsetDays * columnWidth}px`,
                            width: `${durationDays * columnWidth - 4}px`
                          }}
                          title={`${task.title}\n${formatShortDate(task.startDate)} - ${formatShortDate(task.dueDate)}\nStatus: ${task.status}\nAssignee: ${task.assignee?.name || 'Unassigned'}`}
                          className={`absolute top-2.5 h-7 rounded-md shadow-xs px-2.5 flex items-center justify-between gap-2 cursor-pointer transition-all ${barColor}`}
                        >
                          <span className="text-xs font-medium truncate select-none">
                            {task.title}
                          </span>
                          {task.assignee && (
                            <div className="hidden sm:block flex-shrink-0">
                              <Avatar user={task.assignee} size="xs" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-6 shadow-xs transition-colors">
          <Clock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100">No tasks with start and due dates</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            Add start and due dates to your tasks to see them on the timeline view.
          </p>
        </div>
      )}

      {/* Unscheduled Tasks Section */}
      {unscheduledTasks.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 p-5 shadow-xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
              Unscheduled Tasks ({unscheduledTasks.length})
            </h3>
            <span className="text-xs text-gray-400 dark:text-slate-500">Missing start date or due date</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unscheduledTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => onTaskClick && onTaskClick(task)}
                className="p-3 rounded-lg border border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/20 cursor-pointer transition-colors flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-slate-100 line-clamp-1 truncate">
                    {task.title}
                  </span>
                  <PriorityBadge priority={task.priority} size="xs" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500 pt-1 border-t border-gray-100 dark:border-slate-800">
                  <StatusBadge status={task.status} size="xs" />
                  <span>Click to schedule</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
