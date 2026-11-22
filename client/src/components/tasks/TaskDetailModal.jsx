import React, { useState, useEffect } from 'react';
import {
  Calendar,
  AlertCircle,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { STATUSES, PRIORITIES } from '../../utils/constants.js';
import { formatDate, toISODateString, isOverdue } from '../../utils/date.js';
import { updateTaskApi, deleteTaskApi } from '../../api/tasks.js';
import { useToast } from '../common/Toast.jsx';
import Modal from '../common/Modal.jsx';
import { StatusBadge, PriorityBadge } from '../common/Badge.jsx';
import Avatar from '../common/Avatar.jsx';
import Spinner from '../common/Spinner.jsx';
import CommentThread from './CommentThread.jsx';

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  projectMembers = [],
  onTaskUpdated,
  onTaskDeleted
}) {
  const [currentTask, setCurrentTask] = useState(task);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editError, setEditError] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (task) {
      setCurrentTask(task);
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Todo');
      setPriority(task.priority || 'Medium');
      setAssignee(
        task.assignee
          ? typeof task.assignee === 'object'
            ? task.assignee._id
            : task.assignee
          : ''
      );
      setStartDate(toISODateString(task.startDate));
      setDueDate(toISODateString(task.dueDate));
      setIsEditing(false);
      setEditError('');
    }
  }, [task]);

  if (!isOpen || !currentTask) return null;

  const overdue = isOverdue(currentTask.dueDate, currentTask.status);

  const handleSaveEdit = async () => {
    setEditError('');

    if (!title.trim()) {
      setEditError('Task title cannot be empty');
      return;
    }

    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      setEditError('Due date must be on or after start date');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        assignee: assignee || null,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      };

      const updated = await updateTaskApi(currentTask._id, payload);
      setCurrentTask(updated);
      setIsEditing(false);
      showToast('Task updated successfully', 'success');
      if (onTaskUpdated) onTaskUpdated(updated);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      setEditError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    setDeleting(true);
    try {
      await deleteTaskApi(currentTask._id);
      showToast('Task deleted', 'success');
      if (onTaskDeleted) onTaskDeleted(currentTask._id);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task';
      showToast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleCommentCountChanged = (newCount) => {
    const updated = { ...currentTask, commentCount: newCount };
    setCurrentTask(updated);
    if (onTaskUpdated) onTaskUpdated(updated);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task Details' : 'Task Details'}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Header Action Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={currentTask.status} />
            <PriorityBadge priority={currentTask.priority} />
            {overdue && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-3.5 h-3.5" />
                Overdue
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-2xs transition-colors"
                >
                  {saving ? <Spinner size="sm" className="border-white" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {editError && (
          <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 rounded-lg">
            {editError}
          </div>
        )}

        {/* Task Title & Description */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white bg-white dark:bg-slate-800"
                placeholder="Add a detailed description..."
              />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
              {currentTask.title}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {currentTask.description || (
                <span className="italic text-gray-400 dark:text-slate-500">No description provided.</span>
              )}
            </p>
          </div>
        )}

        {/* Task Attributes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gray-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 text-xs">
          {isEditing ? (
            <>
              <div>
                <label className="block font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          {/* Assignee */}
          <div>
            <span className="font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Assignee
            </span>
            {isEditing ? (
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((member) => {
                  const m = typeof member === 'object' ? member : { _id: member, name: member };
                  return (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  );
                })}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                {currentTask.assignee ? (
                  <>
                    <Avatar user={currentTask.assignee} size="xs" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {currentTask.assignee.name}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-slate-500 italic">Unassigned</span>
                )}
              </div>
            )}
          </div>

          {/* Dates */}
          <div>
            <span className="font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Dates
            </span>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 dark:text-slate-400 block">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 dark:text-slate-400 block">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-slate-700 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                  <span>
                    {currentTask.startDate ? formatDate(currentTask.startDate) : 'No start date'}
                    {' → '}
                    <strong className={overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                      {currentTask.dueDate ? formatDate(currentTask.dueDate) : 'No due date'}
                    </strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment Thread Component */}
        <CommentThread
          taskId={currentTask._id}
          onCommentCountChanged={handleCommentCountChanged}
        />
      </div>
    </Modal>
  );
}
