import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { getProjectsApi, deleteProjectApi } from '../api/projects.js';
import { useToast } from '../components/common/Toast.jsx';
import ProjectCard from '../components/projects/ProjectCard.jsx';
import ProjectForm from '../components/projects/ProjectForm.jsx';
import Modal from '../components/common/Modal.jsx';
import Spinner from '../components/common/Spinner.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const { showToast } = useToast();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getProjectsApi();
      setProjects(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch projects';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateNew = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeletePrompt = (project) => {
    setDeletingProject(project);
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    setDeleteSubmitting(true);
    try {
      await deleteProjectApi(deletingProject._id);
      showToast('Project deleted successfully', 'success');
      setProjects((prev) => prev.filter((p) => p._id !== deletingProject._id));
      setDeletingProject(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete project';
      showToast(msg, 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleFormSuccess = (savedProject) => {
    if (editingProject) {
      setProjects((prev) =>
        prev.map((p) => (p._id === savedProject._id ? savedProject : p))
      );
    } else {
      setProjects((prev) => [savedProject, ...prev]);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5 transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Manage your workspaces, track tasks, and collaborate with your team.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={fetchProjects} />}

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 transition-colors"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-500 dark:text-slate-400">
          <Spinner size="lg" />
          <p className="mt-3 text-sm">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        searchQuery ? (
          <EmptyState
            title="No matching projects"
            description={`No projects found matching "${searchQuery}". Try a different search.`}
          />
        ) : (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Create your first project to start organizing tasks on Kanban boards and timelines."
            action={
              <button
                type="button"
                onClick={handleCreateNew}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </button>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Project Modal */}
      <ProjectForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        project={editingProject}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        title="Delete Project"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Are you sure you want to delete <strong className="text-gray-900 dark:text-white">{deletingProject?.name}</strong>?
          </p>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs text-rose-800 dark:text-rose-300">
            <strong>Warning:</strong> This will permanently delete this project, along with all of its tasks and comments. This action cannot be undone.
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setDeletingProject(null)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmDelete}
              disabled={deleteSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-2 transition-colors"
            >
              {deleteSubmitting && <Spinner size="sm" className="border-white border-r-transparent" />}
              <span>Delete Project</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
