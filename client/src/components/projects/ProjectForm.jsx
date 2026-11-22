import React, { useState, useEffect } from 'react';
import { getUsersApi } from '../../api/auth.js';
import { createProjectApi, updateProjectApi } from '../../api/projects.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../common/Toast.jsx';
import Modal from '../common/Modal.jsx';
import Spinner from '../common/Spinner.jsx';
import ErrorBanner from '../common/ErrorBanner.jsx';
import Avatar from '../common/Avatar.jsx';

export default function ProjectForm({ isOpen, onClose, project, onSuccess }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user } = useAuth();
  const { showToast } = useToast();
  const isEdit = Boolean(project);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (project) {
        setName(project.name || '');
        setDescription(project.description || '');
        setMembers(project.members?.map((m) => (typeof m === 'object' ? m._id : m)) || []);
      } else {
        setName('');
        setDescription('');
        setMembers(user ? [user._id] : []);
      }

      // Load all users for member assignment
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const users = await getUsersApi();
          setAllUsers(users);
        } catch (err) {
          console.error('Failed to load users:', err);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isOpen, project, user]);

  const toggleMember = (userId) => {
    // Owner should stay a member
    if (project && project.owner?._id === userId) return;
    if (!project && user?._id === userId) return;

    setMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2 || name.trim().length > 100) {
      setError('Project name must be between 2 and 100 characters');
      return;
    }

    setSubmitting(true);

    try {
      if (isEdit) {
        const updated = await updateProjectApi(project._id, {
          name: name.trim(),
          description: description.trim(),
          members
        });
        showToast('Project updated successfully', 'success');
        onSuccess(updated);
      } else {
        const created = await createProjectApi({
          name: name.trim(),
          description: description.trim(),
          members
        });
        showToast('Project created successfully', 'success');
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save project';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Project' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <ErrorBanner message={error} />}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            placeholder="e.g. Mobile App Redesign"
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
            placeholder="What is the goal of this project?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Team Members
          </label>
          {loadingUsers ? (
            <div className="py-2 flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
              <Spinner size="sm" /> Loading team members...
            </div>
          ) : (
            <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-slate-800 rounded-lg p-2 divide-y divide-gray-100 dark:divide-slate-800 bg-white dark:bg-slate-800/40">
              {allUsers.map((u) => {
                const isSelected = members.includes(u._id);
                const isCurrentOwner = project
                  ? (typeof project.owner === 'object' ? project.owner._id : project.owner) === u._id
                  : user?._id === u._id;

                return (
                  <div
                    key={u._id}
                    onClick={() => toggleMember(u._id)}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/70 dark:bg-indigo-950/60' : 'hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar user={u} size="xs" />
                      <div>
                        <div className="text-xs font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                          {u.name}
                          {isCurrentOwner && (
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.2 rounded font-semibold">
                              Owner
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-slate-400">{u.email}</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isCurrentOwner}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                  </div>
                );
              })}
            </div>
          )}
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
            <span>{isEdit ? 'Save Changes' : 'Create Project'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
