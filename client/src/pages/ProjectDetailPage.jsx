import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Kanban,
  BarChart2,
  CalendarRange,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { getProjectByIdApi } from '../api/projects.js';
import { getTasksByProjectApi } from '../api/tasks.js';
import KanbanBoard from '../components/kanban/KanbanBoard.jsx';
import TaskForm from '../components/kanban/TaskForm.jsx';
import TaskDetailModal from '../components/tasks/TaskDetailModal.jsx';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard.jsx';
import GanttChart from '../components/gantt/GanttChart.jsx';
import Avatar from '../components/common/Avatar.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function ProjectDetailPage() {
  const { id: projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('board');

  // Modals state
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [selectedColumnStatus, setSelectedColumnStatus] = useState('Todo');
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  const fetchProjectAndTasks = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');

    try {
      const [projectData, tasksData] = await Promise.all([
        getProjectByIdApi(projectId),
        getTasksByProjectApi(projectId)
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load project details';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectAndTasks();
  }, [fetchProjectAndTasks]);

  const handleOpenAddTask = (status = 'Todo') => {
    setEditingTask(null);
    setSelectedColumnStatus(status);
    setIsTaskFormOpen(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setSelectedColumnStatus(task.status);
    setIsTaskFormOpen(true);
  };

  const handleTaskClick = (task) => {
    setDetailTask(task);
  };

  const handleTaskCreated = (newTask) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t))
    );
    if (detailTask && detailTask._id === updatedTask._id) {
      setDetailTask(updatedTask);
    }
  };

  const handleTaskDeleted = (deletedTaskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== deletedTaskId));
    if (detailTask && detailTask._id === deletedTaskId) {
      setDetailTask(null);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-gray-400 dark:text-slate-500">
        <Spinner size="lg" />
        <p className="mt-3 text-sm">Loading project workspace...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
        </Link>
        <ErrorBanner message={error || 'Project not found'} onRetry={fetchProjectAndTasks} />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium mb-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to all projects
          </Link>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {project.name}
          </h1>
          {project.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        {/* Project Meta and New Task Button */}
        <div className="flex items-center gap-4 self-start sm:self-auto">
          {/* Members Avatars */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5 overflow-hidden">
              {project.members?.map((member) => (
                <div
                  key={typeof member === 'object' ? member._id : member}
                  className="ring-2 ring-white dark:ring-slate-900 rounded-full"
                >
                  <Avatar user={typeof member === 'object' ? member : null} size="xs" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleOpenAddTask('Todo')}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="border-b border-gray-200 dark:border-slate-800">
        <nav className="flex space-x-8 -mb-px" aria-label="Tabs">
          <button
            type="button"
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'board'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <Kanban className="w-4 h-4" />
            <span>Board</span>
            <span className="ml-1 px-1.5 py-0.5 text-[11px] rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'timeline'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:border-gray-300 dark:hover:border-slate-700'
            }`}
          >
            <CalendarRange className="w-4 h-4" />
            <span>Timeline</span>
          </button>
        </nav>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'board' && (
          <KanbanBoard
            projectId={projectId}
            tasks={tasks}
            projectMembers={project.members || []}
            onTaskClick={handleTaskClick}
            onAddTask={handleOpenAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleTaskDeleted}
            onTasksUpdated={fetchProjectAndTasks}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            projectId={projectId}
            onTaskClick={handleTaskClick}
          />
        )}

        {activeTab === 'timeline' && (
          <GanttChart
            tasks={tasks}
            onTaskClick={handleTaskClick}
          />
        )}
      </div>

      {/* Task Create / Edit Modal */}
      <TaskForm
        isOpen={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        projectId={projectId}
        projectMembers={project.members || []}
        task={editingTask}
        initialStatus={selectedColumnStatus}
        onSuccess={(task) => {
          if (editingTask) {
            handleTaskUpdated(task);
          } else {
            handleTaskCreated(task);
          }
        }}
      />

      {/* Task Detail & Comments Modal */}
      {detailTask && (
        <TaskDetailModal
          isOpen={Boolean(detailTask)}
          onClose={() => setDetailTask(null)}
          task={detailTask}
          projectMembers={project.members || []}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}
