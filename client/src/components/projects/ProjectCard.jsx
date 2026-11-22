import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Edit3, Trash2, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import Avatar from '../common/Avatar.jsx';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const { user } = useAuth();

  const ownerId = typeof project.owner === 'object' ? project.owner?._id : project.owner;
  const isOwner = user && ownerId === user._id;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <Link
            to={`/projects/${project._id}`}
            className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1.5"
          >
            <span>{project.name}</span>
            <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-600 dark:text-indigo-400" />
          </Link>

          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Edit Project"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-md transition-colors"
                title="Delete Project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 min-h-[2.5rem]">
          {project.description || 'No description provided.'}
        </p>
      </div>

      <div className="px-5 py-3.5 bg-gray-50/70 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
        {/* Members Avatar Stack */}
        <div className="flex items-center">
          <div className="flex -space-x-1.5 overflow-hidden mr-2">
            {project.members && project.members.slice(0, 4).map((member) => (
              <div key={typeof member === 'object' ? member._id : member} className="ring-2 ring-white dark:ring-slate-900 rounded-full">
                <Avatar user={typeof member === 'object' ? member : null} size="xs" />
              </div>
            ))}
          </div>
          {project.members && project.members.length > 4 && (
            <span className="text-[11px] font-medium text-gray-400 dark:text-slate-500">
              +{project.members.length - 4}
            </span>
          )}
        </div>

        {/* Task Count Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full font-medium text-gray-700 dark:text-slate-300 shadow-2xs">
          <CheckCircle className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
          <span>{project.taskCount ?? 0} {project.taskCount === 1 ? 'task' : 'tasks'}</span>
        </div>
      </div>
    </div>
  );
}
