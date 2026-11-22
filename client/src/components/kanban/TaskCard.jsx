import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Calendar, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { PriorityBadge } from '../common/Badge.jsx';
import Avatar from '../common/Avatar.jsx';
import { formatShortDate, isOverdue } from '../../utils/date.js';

export default function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  isOverlay = false
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task._id,
    data: {
      type: 'Task',
      task
    },
    disabled: isOverlay
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick && onClick(task)}
      className={`group relative bg-white dark:bg-slate-900 p-3.5 rounded-lg border shadow-xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
        overdue
          ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20'
          : 'border-gray-200/90 dark:border-slate-800'
      } ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500 rotate-1 cursor-grabbing' : ''}`}
    >
      {/* Top row: Priority & Actions */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <PriorityBadge priority={task.priority} size="xs" />

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="p-1 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task);
              }}
              className="p-1 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug line-clamp-2 mb-3">
        {task.title}
      </h4>

      {/* Bottom row: Due Date, Comments, Assignee */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 pt-1 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          {/* Due date */}
          {task.dueDate && (
            <div
              className={`inline-flex items-center gap-1 font-medium ${
                overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-gray-500 dark:text-slate-400'
              }`}
              title={overdue ? 'Overdue!' : `Due ${formatShortDate(task.dueDate)}`}
            >
              {overdue ? (
                <AlertCircle className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
              ) : (
                <Calendar className="w-3.5 h-3.5" />
              )}
              <span>{formatShortDate(task.dueDate)}</span>
            </div>
          )}

          {/* Comment Count */}
          {(task.commentCount !== undefined && task.commentCount > 0) ? (
            <div
              className="inline-flex items-center gap-1 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              title={`${task.commentCount} comments`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.commentCount}</span>
            </div>
          ) : null}
        </div>

        {/* Assignee Avatar */}
        <div title={task.assignee ? task.assignee.name : 'Unassigned'}>
          {task.assignee ? (
            <Avatar user={task.assignee} size="xs" />
          ) : (
            <div className="w-6 h-6 rounded-full border border-dashed border-gray-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-gray-400 dark:text-slate-500">
              ?
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
