import React, { useState, useEffect } from 'react';
import { STATUSES, PRIORITIES } from '../../utils/constants.js';
import { toISODateString } from '../../utils/date.js';
import { createTaskApi, updateTaskApi } from '../../api/tasks.js';
import { useToast } from '../common/Toast.jsx';
import Modal from '../common/Modal.jsx';
import Spinner from '../common/Spinner.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';

export default function TaskForm({
  isOpen,
  onClose,
  projectId,
  projectMembers = [],
  task = null,
  initialStatus = 'Todo',
  onSuccess
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();
  const isEdit = Boolean(task);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (task) {
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
      } else {
        setTitle('');
        setDescription('');
        setStatus(initialStatus || 'Todo');
        setPriority('Medium');
        setAssignee('');
        setStartDate('');
        setDueDate('');
      }
    }
  }, [isOpen, task, initialStatus]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    if (startDate && dueDate && new Date(dueDate) < new Date(startDate)) {
      setError('Due date must be on or after start date');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assignee: assignee || null,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null
    };

    try {
      if (isEdit) {
        const updated = await updateTaskApi(task._id, payload);
        showToast('Task updated', 'success');
        onSuccess(updated);
      } else {
        const created = await createTaskApi(projectId, payload);
        showToast('Task created', 'success');
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save task';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            placeholder="e.g. Implement OAuth login"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            placeholder="Detailed task description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Assignee
          </label>
          <select
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          >
            <option value="">Unassigned</option>
            {projectMembers.map((member) => {
              const m = typeof member === 'object' ? member : { _id: member, name: member };
              return (
                <option key={m._id} value={m._id}>
                  {m.name} ({m.email || 'Member'})
                </option>
              );
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-3 border-t border-gray-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
          >
            {submitting && <Spinner size="sm" className="border-white border-r-transparent" />}
            <span>{isEdit ? 'Save Changes' : 'Create Task'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
