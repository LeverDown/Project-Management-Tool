import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';
import { Filter, AlertCircle } from 'lucide-react';
import { STATUSES, PRIORITIES } from '../../utils/constants.js';
import { reorderTasksApi } from '../../api/tasks.js';
import { useToast } from '../common/Toast.jsx';
import KanbanColumn from './KanbanColumn.jsx';
import TaskCard from './TaskCard.jsx';

export default function KanbanBoard({
  projectId,
  tasks = [],
  projectMembers = [],
  onTaskClick,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTasksUpdated
}) {
  const { showToast } = useToast();

  const [columns, setColumns] = useState(() => {
    const initial = {
      'Todo': [],
      'In Progress': [],
      'Review': [],
      'Done': []
    };
    tasks.forEach((t) => {
      if (initial[t.status]) {
        initial[t.status].push(t);
      } else {
        initial['Todo'].push(t);
      }
    });
    STATUSES.forEach((s) => {
      initial[s].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
    return initial;
  });

  useEffect(() => {
    const updated = {
      'Todo': [],
      'In Progress': [],
      'Review': [],
      'Done': []
    };
    tasks.forEach((t) => {
      if (updated[t.status]) {
        updated[t.status].push(t);
      } else {
        updated['Todo'].push(t);
      }
    });
    STATUSES.forEach((s) => {
      updated[s].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    });
    setColumns(updated);
  }, [tasks]);

  const [activeTask, setActiveTask] = useState(null);
  const previousColumnsRef = useRef(null);

  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const isFilterActive = selectedAssignee !== 'all' || selectedPriority !== 'all';

  const visibleColumns = useMemo(() => {
    if (!isFilterActive) return columns;

    const filtered = {};
    STATUSES.forEach((status) => {
      filtered[status] = columns[status].filter((task) => {
        const matchesAssignee =
          selectedAssignee === 'all'
            ? true
            : selectedAssignee === 'unassigned'
            ? !task.assignee
            : (task.assignee?._id || task.assignee) === selectedAssignee;

        const matchesPriority =
          selectedPriority === 'all' ? true : task.priority === selectedPriority;

        return matchesAssignee && matchesPriority;
      });
    });
    return filtered;
  }, [columns, selectedAssignee, selectedPriority, isFilterActive]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const findColumnOfTask = (taskId) => {
    return STATUSES.find((status) =>
      columns[status].some((task) => task._id === taskId)
    );
  };

  const handleDragStart = (event) => {
    if (isFilterActive) {
      showToast('Filters are active. Clear filters to reorder tasks.', 'info');
      return;
    }

    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    if (task) {
      setActiveTask(task);
      previousColumnsRef.current = JSON.parse(JSON.stringify(columns));
    }
  };

  const handleDragOver = (event) => {
    if (isFilterActive) return;

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = STATUSES.includes(overId)
      ? overId
      : findColumnOfTask(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return;
    }

    setColumns((prev) => {
      const activeItems = [...prev[activeColumn]];
      const overItems = [...prev[overColumn]];

      const activeIndex = activeItems.findIndex((t) => t._id === activeId);
      if (activeIndex === -1) return prev;

      const [movedTask] = activeItems.splice(activeIndex, 1);
      const updatedMovedTask = { ...movedTask, status: overColumn };

      const overIndex = overItems.findIndex((t) => t._id === overId);
      if (overIndex >= 0) {
        overItems.splice(overIndex, 0, updatedMovedTask);
      } else {
        overItems.push(updatedMovedTask);
      }

      return {
        ...prev,
        [activeColumn]: activeItems,
        [overColumn]: overItems
      };
    });
  };

  const handleDragEnd = async (event) => {
    if (isFilterActive) {
      setActiveTask(null);
      return;
    }

    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeColumn = findColumnOfTask(activeId);
    const overColumn = STATUSES.includes(overId)
      ? overId
      : findColumnOfTask(overId);

    if (!activeColumn || !overColumn) return;

    let finalColumns = { ...columns };

    if (activeColumn === overColumn) {
      const items = [...columns[activeColumn]];
      const oldIndex = items.findIndex((t) => t._id === activeId);
      const newIndex = items.findIndex((t) => t._id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const reorderedItems = arrayMove(items, oldIndex, newIndex);
        finalColumns = {
          ...columns,
          [activeColumn]: reorderedItems
        };
        setColumns(finalColumns);
      }
    }

    const columnsPayload = {
      'Todo': finalColumns['Todo'].map((t) => t._id),
      'In Progress': finalColumns['In Progress'].map((t) => t._id),
      'Review': finalColumns['Review'].map((t) => t._id),
      'Done': finalColumns['Done'].map((t) => t._id)
    };

    try {
      await reorderTasksApi({
        projectId,
        columns: columnsPayload
      });
      if (onTasksUpdated) {
        onTasksUpdated();
      }
    } catch (err) {
      console.error('Reorder failed:', err);
      if (previousColumnsRef.current) {
        setColumns(previousColumnsRef.current);
      }
      showToast('Failed to update task positions. Changes reverted.', 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Board Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Assignees</option>
            <option value="unassigned">Unassigned</option>
            {projectMembers.map((member) => {
              const m = typeof member === 'object' ? member : { _id: member, name: member };
              return (
                <option key={m._id} value={m._id}>
                  {m.name}
                </option>
              );
            })}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p} Priority
              </option>
            ))}
          </select>

          {isFilterActive && (
            <button
              type="button"
              onClick={() => {
                setSelectedAssignee('all');
                setSelectedPriority('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Reset filters
            </button>
          )}
        </div>

        {isFilterActive && (
          <div className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-md border border-amber-200 dark:border-amber-900 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Visual filter active. Reordering is paused until reset.</span>
          </div>
        )}
      </div>

      {/* Kanban Board Columns Container */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 items-start">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={visibleColumns[status] || []}
              onTaskClick={onTaskClick}
              onAddTask={onAddTask}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
