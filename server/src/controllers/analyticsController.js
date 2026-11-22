import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Helper to check user access to project
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const userIdStr = userId.toString();
  const isOwner = project.owner.toString() === userIdStr;
  const isMember = project.members.some((m) => m.toString() === userIdStr);

  if (!isOwner && !isMember) {
    const error = new Error('Not authorized to access analytics for this project');
    error.statusCode = 403;
    throw error;
  }

  return project;
};

// @desc   Get project analytics
// @route  GET /api/projects/:projectId/analytics
// @access Private
export const getProjectAnalytics = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  await checkProjectAccess(projectId, req.user._id);

  const tasks = await Task.find({ project: projectId })
    .populate('assignee', '_id name email')
    .lean();

  const total = tasks.length;

  const byStatus = {
    'Todo': 0,
    'In Progress': 0,
    'Review': 0,
    'Done': 0
  };

  const byPriority = {
    'Low': 0,
    'Medium': 0,
    'High': 0
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const overdueTasks = [];

  for (const task of tasks) {
    // Count status
    if (byStatus[task.status] !== undefined) {
      byStatus[task.status]++;
    }

    // Count priority
    if (byPriority[task.priority] !== undefined) {
      byPriority[task.priority]++;
    }

    // Check overdue
    if (task.status !== 'Done' && task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      if (taskDueDate < startOfToday) {
        overdueTasks.push({
          _id: task._id,
          title: task.title,
          dueDate: task.dueDate,
          assignee: task.assignee
        });
      }
    }
  }

  res.status(200).json({
    total,
    byStatus,
    byPriority,
    overdue: overdueTasks.length,
    overdueTasks
  });
});
