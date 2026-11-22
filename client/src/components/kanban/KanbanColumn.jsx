import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import TaskCard from './TaskCard.jsx';
import { STATUS_COLORS } from '../../utils/constants.js';

export default function KanbanColumn({
  status,
  tasks = [],
  onTaskClick,
  onAddTask,
  onEditTask,
  onDeleteTask
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'Column',
      status
    }
  });

  const config = STATUS_COLORS[status] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    dot: 'bg-gray-400'
  };

  const taskIds = tasks.map((t) => t._id);

  return (
    <div className="flex flex-col flex-1 min-w-[280px] max-w-xs bg-slate-100/70 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 transition-colors">
      {/* Column Header */}
      <div className="flex items-center justify-between px-1 py-1.5 mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${config.dot}`} />
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-100">{status}</h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 shadow-2xs border border-gray-200 dark:border-slate-700">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onAddTask(status)}
          className="p-1 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-md transition-colors"
          title={`Add task to ${status}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task List / Droppable Area */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-2.5 min-h-[160px] p-1 rounded-lg transition-colors ${
          isOver ? 'bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-300 dark:ring-indigo-700 ring-dashed' : ''
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onClick={onTaskClick}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4 border border-dashed border-gray-300 dark:border-slate-800 rounded-lg text-xs text-gray-400 dark:text-slate-600 select-none">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add Task Button at Column Footer */}
      <button
        type="button"
        onClick={() => onAddTask(status)}
        className="mt-2 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add task</span>
      </button>
    </div>
  );
}
